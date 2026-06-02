import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { createClient } from "@supabase/supabase-js";
import { createWorker } from "tesseract.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

globalThis.DOMMatrix = DOMMatrix;
globalThis.ImageData = ImageData;
globalThis.Path2D = Path2D;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const archiveDir = path.join(rootDir, "public", "archive");
const importDir = path.join(rootDir, "tmp", "benevolence-import");
const tesseractCacheDir = path.join(rootDir, "tmp", "tesseract-cache");
const inputCsv = path.join(importDir, "planned-import.csv");
const outputCsv = path.join(importDir, "ocr-amount-candidates.csv");
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const applyExisting = args.has("--apply-existing");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
const standardFontDataUrl = `${pathToFileURL(path.join(rootDir, "node_modules", "pdfjs-dist", "standard_fonts")).href}/`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])),
  );
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function writeCsv(filePath, rows, headers) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\r\n");
  await writeFile(filePath, csv, "utf8");
}

function parseMoney(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[$,\s]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned || !/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount.toFixed(2) : null;
}

function extractAmount(text, labelPattern, options = {}) {
  const { requireUppercaseLabel = false } = options;
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[|_[\](){}]/g, " ")
    .replace(/\bS\s+(?=\d)/g, "$ ")
    .replace(/\s+/g, " ");
  const lines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[|_[\](){}]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const moneyPattern = String.raw`(?:\$|S|§)?\s*(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?`;

  for (const line of lines) {
    if (requireUppercaseLabel && !/\b(?:PROVIDED|AMOUNT\s*PROVIDED)\b/.test(line)) {
      continue;
    }
    if (/\brequest\s*(?:approved|made|completed|response|call)\b/i.test(line)) {
      continue;
    }
    const match = line.match(new RegExp(`${labelPattern}.{0,35}?(${moneyPattern})`, "i"));
    if (match) {
      const amount = parseMoney(match[1]);
      return {
        amount,
        snippet: line,
        confidence: autoApplySafeAmount(amount) ? "high" : "review",
      };
    }
  }

  if (requireUppercaseLabel && !/\b(?:PROVIDED|AMOUNT\s*PROVIDED)\b/.test(normalized)) {
    return { amount: null, snippet: "", confidence: "" };
  }

  const match = normalized.match(new RegExp(`${labelPattern}.{0,45}?(${moneyPattern})`, "i"));
  if (match) {
    const amount = parseMoney(match[1]);
    return {
      amount,
      snippet: match[0],
      confidence: autoApplySafeAmount(amount) ? "medium" : "review",
    };
  }

  return { amount: null, snippet: "", confidence: "" };
}

function autoApplySafeAmount(amount) {
  const value = Number(amount);
  return Number.isFinite(value) && value > 0 && value <= 5000;
}

function sourceKey(row) {
  if (row.sourceKey) return row.sourceKey;
  const datePart =
    row.requestDate ||
    row.relative
      ?.toLowerCase()
      .replace(/\bread\s*only\b/g, "")
      .replace(/\(\d+\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return `${row.personName.trim().replace(/\s+/g, " ").toLowerCase()}|${datePart}`;
}

async function renderFirstPage(filePath) {
  const data = new Uint8Array(await readFile(filePath));
  const doc = await getDocument({ data, disableWorker: true, standardFontDataUrl }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const canvasContext = canvas.getContext("2d");
  await page.render({ canvasContext, viewport }).promise;
  return canvas.encode("png");
}

async function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  const text = await readFile(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

function normalizeSupabaseUrl(url) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

async function applyCandidates(candidates) {
  await loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration.");
  }

  const supabase = createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey, {
    auth: { persistSession: false },
  });
  let updated = 0;

  for (const candidate of candidates) {
    const requestedConfidence = candidate.requestedConfidence || candidate.confidence;
    const providedConfidence = candidate.providedConfidence;
    const hasRequestedUpdate = candidate.amountRequested && requestedConfidence === "high";
    const hasProvidedUpdate = candidate.amountProvided && providedConfidence === "high";
    if (!hasRequestedUpdate && !hasProvidedUpdate) continue;

    const { data: existing, error: existingError } = await supabase
      .from("benevolence_requests")
      .select("id, amount_requested, amount_provided, raw_form_data")
      .filter("raw_form_data->archiveImport->>sourceKey", "eq", candidate.sourceKey)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) continue;

    const updateFields = {};
    if (hasRequestedUpdate && existing.amount_requested === null) {
      updateFields.amount_requested = candidate.amountRequested;
    }
    if (hasProvidedUpdate && existing.amount_provided === null) {
      updateFields.amount_provided = candidate.amountProvided;
    }
    if (!Object.keys(updateFields).length) continue;

    const rawFormData = existing.raw_form_data ?? {};
    const archiveImport = rawFormData.archiveImport ?? {};
    const ocrAmountExtraction = archiveImport.ocrAmountExtraction ?? {};
    const { error } = await supabase
      .from("benevolence_requests")
      .update({
        ...updateFields,
        raw_form_data: {
          ...rawFormData,
          archiveImport: {
            ...archiveImport,
            ocrAmountExtraction: {
              ...ocrAmountExtraction,
              ...(updateFields.amount_requested
                ? {
                    amountRequested: candidate.amountRequested,
                    requestedSnippet: candidate.requestedSnippet,
                    requestedConfidence,
                  }
                : {}),
              ...(updateFields.amount_provided
                ? {
                    amountProvided: candidate.amountProvided,
                    providedSnippet: candidate.providedSnippet,
                    providedConfidence,
                  }
                : {}),
              document: candidate.document,
              appliedAt: new Date().toISOString(),
            },
          },
        },
      })
      .eq("id", existing.id);
    if (error) throw error;
    updated += 1;
  }

  return updated;
}

if (applyExisting) {
  const existingCandidates = parseCsv(await readFile(outputCsv, "utf8"));
  const updated = await applyCandidates(existingCandidates);
  console.log(`Supabase rows updated from high-confidence OCR: ${updated}`);
  process.exit(0);
}

const rows = parseCsv(await readFile(inputCsv, "utf8"))
  .filter((row) => !row.amountRequested || !row.amountProvided)
  .slice(0, limit && Number.isFinite(limit) ? limit : undefined);
await mkdir(tesseractCacheDir, { recursive: true });
const worker = await createWorker("eng", 1, { cachePath: tesseractCacheDir });
const candidates = [];
let scanned = 0;

for (const [index, row] of rows.entries()) {
  if (index % 10 === 0) {
    console.log(`OCR progress: ${index + 1}/${rows.length} rows, ${candidates.length} candidates`);
  }
  const documents = row.documents.split("; ").filter(Boolean);
  let best = null;

  for (const document of documents) {
    const filePath = path.join(archiveDir, document);
    try {
      const image = await renderFirstPage(filePath);
      const result = await worker.recognize(image);
      const text = result.data.text;
      const requested = extractAmount(
        text,
        String.raw`(?:REQUESTED'?S?|REQUEST\s*FOR|TOTAL\s+REQUESTED|REQUEST\s+REIMBURSEMENT\s+FOR)`,
      );
      const provided = extractAmount(text, String.raw`(?:PROVIDED|AMOUNT\s*PROVIDED)`, {
        requireUppercaseLabel: true,
      });
      scanned += 1;

      if (requested.amount || provided.amount) {
        best = {
          personName: row.personName,
          requestDate: row.requestDate,
          sourceKey: sourceKey(row),
          amountRequested: requested.amount ?? "",
          amountProvided: provided.amount ?? "",
          confidence: requested.confidence || provided.confidence,
          requestedConfidence: requested.confidence,
          providedConfidence: provided.confidence,
          requestedSnippet: requested.snippet,
          providedSnippet: provided.snippet,
          document,
          documents: row.documents,
        };
        break;
      }
    } catch (error) {
      console.log(`OCR skipped: ${document} (${error.message})`);
      // Some PDFs are not renderable by PDF.js; leave them for manual review.
    }
  }

  if (best) {
    candidates.push(best);
  }
}

await worker.terminate();
await writeCsv(outputCsv, candidates, [
  "personName",
  "requestDate",
  "sourceKey",
  "amountRequested",
  "amountProvided",
  "confidence",
  "requestedConfidence",
  "providedConfidence",
  "requestedSnippet",
  "providedSnippet",
  "document",
  "documents",
]);

console.log(`Rows missing requested or provided amount: ${rows.length}`);
console.log(`PDFs OCR scanned: ${scanned}`);
console.log(`OCR amount candidates: ${candidates.length}`);
console.log(`High-confidence requested candidates: ${candidates.filter((row) => row.requestedConfidence === "high").length}`);
console.log(`High-confidence provided candidates: ${candidates.filter((row) => row.providedConfidence === "high").length}`);
console.log(`Candidate CSV: ${outputCsv}`);

if (apply) {
  const updated = await applyCandidates(candidates);
  console.log(`Supabase rows updated from high-confidence OCR: ${updated}`);
}
