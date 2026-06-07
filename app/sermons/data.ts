/**
 * Teaching library data.
 *
 * Public lesson metadata is pulled from the Congregate RSS podcast feed. The
 * public pages use this data now; the AI-assisted approval workflow can later
 * persist enriched records with clipped media, transcripts, artwork, and
 * approved metadata.
 */

export const FEED_URL =
  "https://westparkchurchofchrist.congregatecloud.com/lessons/all-lessons/podcast";

export type LessonStatus = "imported" | "ai-review" | "approved" | "published";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  date: string;
  year: string;
  series: string | null;
  service: string;
  type: string;
  link: string;
  audioUrl: string | null;
  videoUrl: string | null;
  vimeoId: string | null;
  durationSeconds: number | null;
  artwork: string;
  summary: string;
  scripture: string | null;
  transcript: string | null;
  status: LessonStatus;
  ai: {
    suggestedClipStart: string | null;
    suggestedClipEnd: string | null;
    artworkPrompt: string;
    needsApproval: boolean;
  };
};

export type TeachingCollection = {
  slug: string;
  title: string;
  description: string;
  artwork: string;
  type: "series" | "service" | "year" | "topic";
  lessonCount: number;
  latestDate: string;
  lessons: Lesson[];
};

export type LessonFilters = {
  q?: string;
  type?: string;
  service?: string;
  speaker?: string;
  series?: string;
  year?: string;
  sort?: "newest" | "oldest";
};

const DEFAULT_ARTWORK = "/sermons/artwork/teaching-library-default.png";
const SUMMER_ARTWORK = "/sermons/artwork/wednesday-summer-series.png";
const PATH_ARTWORK = "/sermons/artwork/following-jesus-path.png";

export async function getAllLessons(): Promise<Lesson[]> {
  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  return parseFeed(xml).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export async function getFeaturedLesson(): Promise<Lesson | null> {
  const lessons = await getAllLessons();
  return lessons[0] ?? null;
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const lessons = await getAllLessons();
  return lessons.find((lesson) => lesson.slug === slug || lesson.id === slug) ?? null;
}

export async function getRecentSermons(limit = 9): Promise<Lesson[]> {
  const lessons = await getAllLessons();
  return lessons.filter((s) => normalize(s.type) === "sermon").slice(0, limit);
}

export function filterLessons(lessons: Lesson[], filters: LessonFilters): Lesson[] {
  let filtered = [...lessons];

  if (filters.q) {
    const q = normalize(filters.q);
    filtered = filtered.filter((lesson) =>
      [
        lesson.title,
        lesson.speaker,
        lesson.series ?? "",
        lesson.service,
        lesson.type,
        lesson.scripture ?? "",
        lesson.summary,
      ]
        .map(normalize)
        .some((value) => value.includes(q)),
    );
  }

  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((lesson) => slugify(lesson.type) === filters.type);
  }

  if (filters.service && filters.service !== "all") {
    filtered = filtered.filter((lesson) => slugify(lesson.service) === filters.service);
  }

  if (filters.speaker && filters.speaker !== "all") {
    filtered = filtered.filter((lesson) => slugify(lesson.speaker) === filters.speaker);
  }

  if (filters.series && filters.series !== "all") {
    filtered = filtered.filter((lesson) => slugify(lesson.series ?? "Standalone Lessons") === filters.series);
  }

  if (filters.year && filters.year !== "all") {
    filtered = filtered.filter((lesson) => lesson.year === filters.year);
  }

  return filtered.sort((a, b) => {
    const diff = Date.parse(a.date) - Date.parse(b.date);
    return filters.sort === "oldest" ? diff : -diff;
  });
}

export function getFilterOptions(lessons: Lesson[]) {
  return {
    types: uniqueOptions(lessons.map((lesson) => lesson.type)),
    services: uniqueOptions(lessons.map((lesson) => lesson.service).filter(Boolean)),
    speakers: uniqueOptions(lessons.map((lesson) => lesson.speaker)),
    series: uniqueOptions(lessons.map((lesson) => lesson.series ?? "Standalone Lessons")),
    years: [...new Set(lessons.map((lesson) => lesson.year))].sort((a, b) => Number(b) - Number(a)),
  };
}

export function buildCollections(lessons: Lesson[]): TeachingCollection[] {
  const seriesCollections = groupLessons(
    lessons.filter((lesson) => lesson.series),
    (lesson) => lesson.series ?? "Standalone Lessons",
    "series",
  );

  const serviceCollections = groupLessons(
    lessons.filter((lesson) => lesson.service),
    (lesson) => lesson.service,
    "service",
  ).filter((collection) => collection.lessonCount >= 3);

  const yearCollections = groupLessons(lessons, (lesson) => lesson.year, "year");

  return [...seriesCollections, ...serviceCollections, ...yearCollections].sort(
    (a, b) => Date.parse(b.latestDate) - Date.parse(a.latestDate),
  );
}

export function getCollectionBySlug(lessons: Lesson[], slug: string): TeachingCollection | null {
  return buildCollections(lessons).find((collection) => collection.slug === slug) ?? null;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseFeed(xml: string): Lesson[] {
  const chunks = xml.split(/<item\b[^>]*>/i);
  chunks.shift();
  const lessons: Lesson[] = [];
  for (const chunk of chunks) {
    const itemXml = chunk.split(/<\/item>/i)[0];
    const lesson = parseItem(itemXml);
    if (lesson) lessons.push(lesson);
  }
  return lessons;
}

function parseItem(itemXml: string): Lesson | null {
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

  const series = pickField(description, "Series");
  const service = pickField(description, "Service");
  const type = pickField(description, "Type");
  const speaker = pickField(description, "Speaker") || author || "Guest Speaker";
  const scripture = pickField(description, "Scripture") || inferScripture(title);

  const vimeoMatch = contentEncoded.match(/player\.vimeo\.com\/video\/(\d+)/);
  const vimeoId = vimeoMatch?.[1] ?? null;
  const videoUrl = vimeoId ? `https://vimeo.com/${vimeoId}` : null;

  const id =
    link
      .replace(/[?#].*$/, "")
      .split("/")
      .filter(Boolean)
      .pop() || slugify(title);

  const parsed = new Date(pubDate);
  const dateIso = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  const cleanSeries = series && series !== "N/A" ? series : null;
  const cleanType = type || "Lesson";
  const cleanService = service ?? "";
  const slug = `${dateIso.slice(0, 10)}-${slugify(title)}`;
  const artwork = artworkFor(cleanSeries, cleanService, cleanType, title);

  return {
    id,
    slug,
    title,
    speaker,
    date: dateIso,
    year: String(new Date(dateIso).getFullYear()),
    series: cleanSeries,
    service: cleanService,
    type: cleanType,
    link,
    audioUrl: enclosureUrl,
    videoUrl,
    vimeoId,
    durationSeconds: parseDuration(duration),
    artwork,
    summary: buildSummary(title, speaker, cleanSeries, cleanType),
    scripture,
    transcript: null,
    status: "imported",
    ai: {
      suggestedClipStart: null,
      suggestedClipEnd: null,
      artworkPrompt: artworkPromptFor(title, cleanSeries, cleanType),
      needsApproval: true,
    },
  };
}

function groupLessons(
  lessons: Lesson[],
  titleFor: (lesson: Lesson) => string,
  type: TeachingCollection["type"],
): TeachingCollection[] {
  const map = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const title = titleFor(lesson);
    const key = slugify(`${type}-${title}`);
    map.set(key, [...(map.get(key) ?? []), lesson]);
  }

  return Array.from(map.entries()).map(([slug, collectionLessons]) => {
    const sorted = collectionLessons.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const title = titleFor(sorted[0]);
    return {
      slug,
      title,
      description: collectionDescription(title, type, sorted.length),
      artwork: artworkFor(title, title, type, title),
      type,
      lessonCount: sorted.length,
      latestDate: sorted[0].date,
      lessons: sorted,
    };
  });
}

function uniqueOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value: slugify(value) }));
}

function artworkFor(series: string | null, service: string, type: string, title: string): string {
  const text = normalize([series, service, type, title].filter(Boolean).join(" "));
  if (text.includes("summer") || text.includes("wednesday")) return SUMMER_ARTWORK;
  if (text.includes("faith") || text.includes("jesus") || text.includes("discipleship")) {
    return PATH_ARTWORK;
  }
  return DEFAULT_ARTWORK;
}

function artworkPromptFor(title: string, series: string | null, type: string): string {
  const seriesNote = series
    ? `Match the existing visual family for the "${series}" series.`
    : "Use the default Fulshear Church of Christ Teaching Library visual style.";
  return [
    "Create a restrained, Scripture-centered sermon artwork image with no readable text.",
    seriesNote,
    `Lesson title: ${title}. Type: ${type}.`,
    "Use warm whites, sage green, muted gold, natural light, and quiet symbolic imagery.",
    "Do not include text in the image; titles will be rendered as HTML.",
  ].join(" ");
}

function collectionDescription(title: string, type: TeachingCollection["type"], count: number): string {
  if (type === "series") {
    return `${count} lessons gathered from the "${title}" series.`;
  }
  if (type === "service") {
    return `${count} lessons from ${title}, grouped so you can follow this teaching stream over time.`;
  }
  if (type === "year") {
    return `${count} lessons from ${title}, sorted by date.`;
  }
  return `${count} related lessons from the teaching library.`;
}

function buildSummary(title: string, speaker: string, series: string | null, type: string): string {
  if (series) {
    return `${speaker} teaches "${title}" as part of the ${series} series.`;
  }
  return `${speaker} teaches "${title}" from the Fulshear Church of Christ ${type.toLowerCase()} archive.`;
}

function inferScripture(title: string): string | null {
  const match = title.match(/\b(?:[1-3]\s*)?[A-Z][a-z]+\s+\d{1,3}:\d{1,3}(?:-\d{1,3})?/);
  return match?.[0] ?? null;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().trim();
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
  const re = new RegExp(`${escapeReg(label)}:\\s*([^]*?)(?=\\s+(?:Series|Service|Type|Speaker|Scripture):|$)`, "i");
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
