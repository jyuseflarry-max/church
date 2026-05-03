/**
 * Sermon data — pulled from the public Congregate RSS podcast feed.
 *
 * The feed contains the ~300 most recent sermons from the church's
 * Congregate-hosted site. We fetch with ISR (revalidate every hour),
 * so the page is statically generated at build time and refreshed
 * automatically without any client-side fetching.
 */

const FEED_URL =
  "https://westparkchurchofchrist.congregatecloud.com/lessons/all-lessons/podcast";

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  date: string;        // ISO 8601
  series: string | null;
  service: string;     // e.g. "Sun AM"
  type: string;        // e.g. "Sermon", "Bible Class"
  link: string;        // detail page on the Congregate site
  audioUrl: string | null;
  vimeoId: string | null;
  durationSeconds: number | null;
};

export async function getRecentSermons(limit = 9): Promise<Sermon[]> {
  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  return parseFeed(xml)
    .filter((s) => s.type === "Sermon")
    .slice(0, limit);
}

/* ─── Parser ────────────────────────────────────────────────────────────── */

function parseFeed(xml: string): Sermon[] {
  // Split on <item> boundaries; first chunk is the channel header.
  const chunks = xml.split(/<item\b[^>]*>/i);
  chunks.shift();
  const sermons: Sermon[] = [];
  for (const chunk of chunks) {
    const itemXml = chunk.split(/<\/item>/i)[0];
    const sermon = parseItem(itemXml);
    if (sermon) sermons.push(sermon);
  }
  return sermons;
}

function parseItem(itemXml: string): Sermon | null {
  const title = decodeEntities(extractTag(itemXml, "title"));
  const link = decodeEntities(extractTag(itemXml, "link"));
  const pubDate = extractTag(itemXml, "pubDate");
  const author =
    decodeEntities(extractTag(itemXml, "author")) ||
    decodeEntities(extractTag(itemXml, "dc:creator"));
  const description = stripHtml(decodeEntities(extractTag(itemXml, "description")));
  const contentEncoded = decodeEntities(extractTag(itemXml, "content:encoded"));
  const duration = extractTag(itemXml, "itunes:duration");
  const enclosureUrl = extractAttr(itemXml, "enclosure", "url");

  if (!title || !link) return null;

  // From description: "Series: X | Service: Y | Type: Z | Speaker: W" etc.
  const series = pickField(description, "Series");
  const service = pickField(description, "Service");
  const type = pickField(description, "Type");
  const speaker = pickField(description, "Speaker") || author || "Guest Speaker";

  const vimeoMatch = contentEncoded.match(/player\.vimeo\.com\/video\/(\d+)/);
  const vimeoId = vimeoMatch?.[1] ?? null;

  // Stable ID from the link's last segment.
  const id =
    link
      .replace(/[?#].*$/, "")
      .split("/")
      .filter(Boolean)
      .pop() || link;

  let dateIso: string;
  const parsed = new Date(pubDate);
  dateIso = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();

  return {
    id,
    title,
    speaker,
    date: dateIso,
    series: series && series !== "N/A" ? series : null,
    service: service ?? "",
    type: type || "Sermon",
    link,
    audioUrl: enclosureUrl,
    vimeoId,
    durationSeconds: parseDuration(duration),
  };
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${escapeReg(tag)}\\b[^>]*>([\\s\\S]*?)</${escapeReg(tag)}>`, "i");
  const m = xml.match(re);
  if (!m) return "";
  return stripCdata(m[1]).trim();
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${escapeReg(tag)}\\b[^>]*\\b${escapeReg(attr)}\\s*=\\s*"([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? decodeEntities(m[1]) : null;
}

function pickField(text: string, label: string): string | null {
  // Description after stripHtml looks like:
  //   "Series: Romans Service: Sun Bible Study Type: Bible Class Speaker: Eric Hall"
  const re = new RegExp(`${escapeReg(label)}:\\s*([^]*?)(?=\\s+(?:Series|Service|Type|Speaker):|$)`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function parseDuration(hms: string): number | null {
  if (!hms) return null;
  const parts = hms.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

function stripCdata(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(s: string): string {
  if (!s) return "";
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}
