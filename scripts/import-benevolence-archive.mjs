import { createClient } from "@supabase/supabase-js";
import { PDFCheckBox, PDFDocument, PDFTextField } from "pdf-lib";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const archiveDir = path.join(rootDir, "public", "archive");
const outputDir = path.join(rootDir, "tmp", "benevolence-import");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const removeDemo = args.has("--remove-demo") || apply;

const skipRules = [
  ["receipt", "receipt"],
  ["receipts", "receipt"],
  ["email", "email"],
  ["legal docs", "legal document"],
  ["notarized", "legal document"],
  ["affidavit", "legal document"],
  ["oath", "legal document"],
  ["cover letter", "legal document"],
  ["proof of letters", "legal document"],
  ["resume", "not an assistance request"],
  ["banking", "financial document"],
  ["direct deposit", "financial document"],
  ["invoice", "invoice"],
  ["summary", "summary document"],
  ["support letter", "support letter"],
];

const needRules = [
  ["rent", "Rent / Mortgage"],
  ["mortgage", "Rent / Mortgage"],
  ["hotel", "Hotel"],
  ["motel", "Hotel"],
  ["suite", "Hotel"],
  ["utility", "Utility Bill"],
  ["electric", "Utility Bill"],
  ["water", "Utility Bill"],
  ["cell bill", "Utility Bill"],
  ["medical", "Medical Expenses"],
  ["auto", "Auto Repair"],
  ["car insurance", "Auto Repair"],
  ["repair", "Auto Repair"],
  ["food", "Food"],
  ["grocery", "Food"],
  ["walmart", "Food"],
  ["gift card", "Food"],
  ["gas", "Gas"],
  ["clothes", "Clothing"],
  ["camp", "Camp"],
  ["plumbing", "Home Repair"],
];

const requestedNeedFields = [
  ["Food", "Food"],
  ["REQfood", "Food"],
  ["Rent / Mortgage", "Rent / Mortgage"],
  ["RentMort", "Rent / Mortgage"],
  ["REQrent_mortg", "Rent / Mortgage"],
  ["Hotel", "Hotel"],
  ["REQhotel", "Hotel"],
  ["Gas", "Gas"],
  ["REQgas", "Gas"],
  ["Auto Repair", "Auto Repair"],
  ["AutoRepair", "Auto Repair"],
  ["REQauto_rep", "Auto Repair"],
  ["Medicine", "Medicine"],
  ["Meds", "Medicine"],
  ["REQmeds", "Medicine"],
  ["Medical Expenses", "Medical Expenses"],
  ["MedExp", "Medical Expenses"],
  ["REQmedExp", "Medical Expenses"],
  ["Auto Payment", "Auto Payment"],
  ["AutoPymt", "Auto Payment"],
  ["REQautoPymnt", "Auto Payment"],
  ["Prayers", "Prayers"],
  ["REQprayers", "Prayers"],
  ["Budget Training", "Budget Training"],
  ["BudgetTraining", "Budget Training"],
  ["REQbudget_training", "Budget Training"],
  ["Utility Bill", "Utility Bill"],
  ["Utility Payment", "Utility Bill"],
  ["Utility", "Utility Bill"],
  ["REQutilityBill", "Utility Bill"],
];

const providedNeedFields = [
  ...requestedNeedFields.map(([field, need]) => [`${field} 2`, need]),
  ["PROfood", "Food"],
  ["PROrent_mort", "Rent / Mortgage"],
  ["PROhotel", "Hotel"],
  ["PROgas", "Gas"],
  ["PROauto_repair", "Auto Repair"],
  ["PROmeds", "Medicine"],
  ["PROmedExpenses", "Medical Expenses"],
  ["PROauto_pymnt", "Auto Payment"],
  ["PROprayers", "Prayers"],
  ["PRObudget_training", "Budget Training"],
  ["PROutility_bill", "Utility Bill"],
];

const amountRequestedFields = ["$ Requested", "REQUESTED"];
const amountProvidedFields = ["$ Provided", "PROVIDED"];

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function displayNameFromFolder(folder) {
  return folder
    .replace(/\s+-\s+NO.*$/i, "")
    .replace(/\s+NO\s+assistance.*$/i, "")
    .replace(/_No More.*$/i, "")
    .replace(/_Family$/i, " Family")
    .replace(/_Austin$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function personFolder(parts) {
  if (parts[0] === "Hurricane Harvey Assistance" && parts[1]) {
    return parts[1];
  }

  return parts[0];
}

function publicPath(filePath) {
  const relative = path.relative(path.join(rootDir, "public"), filePath);
  return `/${relative.split(path.sep).map(encodeURIComponent).join("/")}`;
}

function skipReason(relativePath) {
  const lower = relativePath.toLowerCase();
  const base = path.basename(relativePath).toLowerCase();
  if (base.startsWith("re ") || base.startsWith("re_")) {
    return "email";
  }
  for (const [needle, reason] of skipRules) {
    if (lower.includes(needle)) {
      return reason;
    }
  }
  return "";
}

function sourceKey(row) {
  const datePart =
    row.requestDate ??
    row.relative
      .toLowerCase()
      .replace(/\bread\s*only\b/g, "")
      .replace(/\(\d+\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return `${row.normalizedName}|${datePart}`;
}

function inferNeeds(relativePath) {
  const lower = relativePath.toLowerCase();
  const needs = new Set();
  for (const [needle, need] of needRules) {
    if (lower.includes(needle)) {
      needs.add(need);
    }
  }
  return [...needs];
}

function parseMoney(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const cleaned = String(value).replace(/[$,\s]/g, "");
  if (!cleaned || !/^-?\d*(?:\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount.toFixed(2) : null;
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return null;
}

function mergeUnique(...arrays) {
  return [...new Set(arrays.flat().filter(Boolean))];
}

function checkedNeeds(fieldValues, fields) {
  const needs = [];
  for (const [fieldName, need] of fields) {
    if (fieldValues.get(fieldName) === true) {
      needs.push(need);
    }
  }
  return needs;
}

function moneyField(fieldValues, fields) {
  for (const field of fields) {
    const amount = parseMoney(fieldValues.get(field));
    if (amount !== null) {
      return amount;
    }
  }
  return null;
}

async function readPdfFormData(filePath) {
  try {
    const pdf = await PDFDocument.load(await readFile(filePath), { ignoreEncryption: true });
    const form = pdf.getForm();
    const values = new Map();

    for (const field of form.getFields()) {
      if (field instanceof PDFTextField) {
        values.set(field.getName(), field.getText());
      } else if (field instanceof PDFCheckBox) {
        values.set(field.getName(), field.isChecked());
      }
    }

    return {
      amountRequested: moneyField(values, amountRequestedFields),
      amountProvided: moneyField(values, amountProvidedFields),
      requestedNeeds: checkedNeeds(values, requestedNeedFields),
      providedNeeds: checkedNeeds(values, providedNeedFields),
    };
  } catch {
    return {
      amountRequested: null,
      amountProvided: null,
      requestedNeeds: [],
      providedNeeds: [],
    };
  }
}

function inferDecisionStatus(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes("no assistance") || lower.includes("no support") || lower.includes("no more")) {
    return "declined";
  }
  if (lower.includes("approved")) {
    return "approved";
  }
  return "approved";
}

function parseDateFromName(value) {
  const normalized = value.replace(/[_-]/g, " ");
  const yearFirst = normalized.match(/\b(20\d{2}|19\d{2})\s+(\d{1,2})(?:\s+(\d{1,2}))?(?=\D|$)/);
  if (yearFirst) {
    const [, year, month, day = "1"] = yearFirst;
    return isoDate(year, month, day);
  }

  const monthFirst = normalized.match(/\b(\d{1,2})\s+(\d{1,2})\s+(20\d{2}|19\d{2}|\d{2})(?=\D|$)/);
  if (monthFirst) {
    const [, month, day, rawYear] = monthFirst;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return isoDate(year, month, day);
  }

  const monthYear = normalized.match(/\b(\d{1,2})\s+(20\d{2}|19\d{2})(?=\D|$)/);
  if (monthYear) {
    const [, month, year] = monthYear;
    return isoDate(year, month, "1");
  }

  return null;
}

function isoDate(year, month, day) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
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

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildPlan() {
  const allFiles = await walk(archiveDir);
  const pdfFiles = allFiles.filter((file) => file.toLowerCase().endsWith(".pdf"));
  const rowMap = new Map();
  const skipped = [];

  for (const filePath of pdfFiles) {
    const relative = path.relative(archiveDir, filePath);
    const reason = skipReason(relative);
    const parts = relative.split(path.sep);
    const folder = personFolder(parts);
    const personName = displayNameFromFolder(folder);

    if (!personName) {
      skipped.push({ relative, reason: "missing person folder" });
      continue;
    }

    if (reason) {
      skipped.push({ relative, reason });
      continue;
    }

    const requestDate = parseDateFromName(relative);
    const formData = await readPdfFormData(filePath);
    const requestedNeeds = mergeUnique(formData.requestedNeeds, inferNeeds(relative));
    const providedNeeds = formData.providedNeeds;
    const row = {
      personName,
      normalizedName: normalizeName(personName),
      requestDate,
      decisionStatus: inferDecisionStatus(relative),
      needs: requestedNeeds,
      providedNeeds,
      amountRequested: formData.amountRequested,
      amountProvided: formData.amountProvided,
      relative,
      publicPath: publicPath(filePath),
    };
    const key = sourceKey(row);
    const existing = rowMap.get(key);

    if (existing) {
      existing.needs = mergeUnique(existing.needs, row.needs);
      existing.providedNeeds = mergeUnique(existing.providedNeeds, row.providedNeeds);
      existing.amountRequested = firstValue(existing.amountRequested, row.amountRequested);
      existing.amountProvided = firstValue(existing.amountProvided, row.amountProvided);
      existing.documents.push({ relative: row.relative, publicPath: row.publicPath });
      if (row.decisionStatus === "declined") {
        existing.decisionStatus = "declined";
      }
    } else {
      rowMap.set(key, {
        ...row,
        sourceKey: key,
        documents: [{ relative: row.relative, publicPath: row.publicPath }],
      });
    }
  }

  const rows = [...rowMap.values()].sort((a, b) =>
    a.personName.localeCompare(b.personName) ||
    (a.requestDate ?? "").localeCompare(b.requestDate ?? "") ||
    a.relative.localeCompare(b.relative)
  );

  return { pdfFiles, rows, skipped };
}

async function writeCsv(name, rows, headers) {
  await mkdir(outputDir, { recursive: true });
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\r\n");
  const filePath = path.join(outputDir, name);
  await writeFile(filePath, csv, "utf8");
  return filePath;
}

async function removeDemoData(supabase) {
  const { error: requestError, count: requestCount } = await supabase
    .from("benevolence_requests")
    .delete({ count: "exact" })
    .eq("is_demo_data", true);
  if (requestError) {
    throw requestError;
  }

  const { error: peopleError, count: peopleCount } = await supabase
    .from("benevolence_people")
    .delete({ count: "exact" })
    .eq("is_demo_data", true);
  if (peopleError) {
    throw peopleError;
  }

  return {
    requests: requestCount ?? 0,
    people: peopleCount ?? 0,
  };
}

async function importRows(supabase, rows) {
  const people = [...new Map(rows.map((row) => [row.normalizedName, row])).values()];
  const { data: upsertedPeople, error: peopleError } = await supabase
    .from("benevolence_people")
    .upsert(
      people.map((person) => ({
        normalized_name: person.normalizedName,
        full_name: person.personName,
        is_demo_data: false,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "normalized_name" },
    )
    .select("id, normalized_name");

  if (peopleError) {
    throw peopleError;
  }

  const peopleByName = new Map(upsertedPeople.map((person) => [person.normalized_name, person.id]));
  let inserted = 0;
  let duplicates = 0;
  let updated = 0;

  for (const row of rows) {
    const { data: existing, error: existingError } = await supabase
      .from("benevolence_requests")
      .select("id, amount_requested, amount_provided")
      .filter("raw_form_data->archiveImport->>sourceKey", "eq", row.sourceKey)
      .maybeSingle();
    if (existingError) {
      throw existingError;
    }
    if (existing) {
      duplicates += 1;
      const updates = {
        amount_requested: row.amountRequested ?? existing.amount_requested,
        amount_provided: row.amountProvided ?? existing.amount_provided,
        requested_needs: row.needs,
        provided_needs: row.decisionStatus === "approved" ? mergeUnique(row.providedNeeds, row.needs) : row.providedNeeds,
      };
      const { error: updateError } = await supabase
        .from("benevolence_requests")
        .update(updates)
        .eq("id", existing.id);
      if (updateError) {
        throw updateError;
      }
      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("benevolence_requests").insert({
      person_id: peopleByName.get(row.normalizedName),
      entered_by_name: "Archive import",
      request_made_date: row.requestDate,
      amount_requested: row.amountRequested,
      requested_needs: row.needs,
      amount_provided: row.amountProvided,
      provided_needs: row.decisionStatus === "approved" ? mergeUnique(row.providedNeeds, row.needs) : row.providedNeeds,
      comments: "Imported from public benevolence PDF archive. Detailed form fields may require manual review.",
      raw_form_data: {
        archiveImport: {
          importedAt: new Date().toISOString(),
          sourceKey: row.sourceKey,
          amountRequested: row.amountRequested,
          amountProvided: row.amountProvided,
          publicPath: row.publicPath,
          publicPaths: row.documents.map((document) => document.publicPath),
          originalPath: row.relative,
          originalPaths: row.documents.map((document) => document.relative),
          source: "public/archive",
        },
      },
      is_demo_data: false,
      decision_status: row.decisionStatus,
      follow_up_status: "not_needed",
    });

    if (insertError) {
      throw insertError;
    }
    inserted += 1;
  }

  return { inserted, duplicates, updated, people: people.length };
}

const { pdfFiles, rows, skipped } = await buildPlan();
const importCsv = await writeCsv(
  "planned-import.csv",
  rows.map((row) => ({
      personName: row.personName,
      requestDate: row.requestDate ?? "",
      decisionStatus: row.decisionStatus,
      needs: row.needs.join("; "),
      amountRequested: row.amountRequested ?? "",
      amountProvided: row.amountProvided ?? "",
      publicPath: row.publicPath,
      documentCount: row.documents.length,
      documents: row.documents.map((document) => document.relative).join("; "),
      relative: row.relative,
    })),
  [
    "personName",
    "requestDate",
    "decisionStatus",
    "needs",
    "amountRequested",
    "amountProvided",
    "publicPath",
    "documentCount",
    "documents",
    "relative",
  ],
);
const skippedCsv = await writeCsv("skipped-pdfs.csv", skipped, ["relative", "reason"]);

console.log(`PDFs found: ${pdfFiles.length}`);
console.log(`Planned request imports: ${rows.length}`);
console.log(`Skipped PDFs: ${skipped.length}`);
console.log(`Planned import CSV: ${importCsv}`);
console.log(`Skipped PDF CSV: ${skippedCsv}`);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to remove demo data and import planned rows.");
  process.exit(0);
}

await loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration.");
}

const supabase = createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey, {
  auth: { persistSession: false },
});

let removed = { requests: 0, people: 0 };
if (removeDemo) {
  removed = await removeDemoData(supabase);
}
const imported = await importRows(supabase, rows);

console.log(`Demo requests removed: ${removed.requests}`);
console.log(`Demo people removed: ${removed.people}`);
console.log(`People upserted: ${imported.people}`);
console.log(`Requests inserted: ${imported.inserted}`);
console.log(`Existing archive rows updated: ${imported.updated}`);
console.log(`Duplicate archive rows skipped: ${imported.duplicates}`);
