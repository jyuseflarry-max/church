import { church } from "../site-content";
import { getAllLessons, type Lesson } from "../sermons/data";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function GET() {
  const lessons = (await getAllLessons()).filter((lesson) => lesson.audioUrl);
  const items = await Promise.all(lessons.slice(0, 200).map(podcastItemXml));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(church.name)} Teaching</title>
    <link>${SITE_URL}/sermons</link>
    <atom:link href="${SITE_URL}/podcast.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml("Sermons and Bible classes from Fulshear Church of Christ.")}</description>
    <language>en-us</language>
    <copyright>${new Date().getFullYear()} ${escapeXml(church.name)}</copyright>
    <itunes:author>${escapeXml(church.name)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escapeXml(church.name)}</itunes:name>
      <itunes:email>${escapeXml(church.email)}</itunes:email>
    </itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity" />
    </itunes:category>
    <itunes:image href="${SITE_URL}/logo.png" />
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}

async function podcastItemXml(lesson: Lesson) {
  const audioUrl = lesson.audioUrl ?? "";
  const length = await audioLength(audioUrl);
  const duration = podcastDuration(lesson.durationSeconds);
  const pageUrl = `${SITE_URL}/sermons/${lesson.slug}`;
  const pubDate = new Date(lesson.date).toUTCString();

  return `<item>
      <title>${escapeXml(lesson.title)}</title>
      <link>${pageUrl}</link>
      <guid isPermaLink="false">${escapeXml(lesson.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(lesson.summary)}</description>
      <content:encoded><![CDATA[${lesson.summary}]]></content:encoded>
      <itunes:author>${escapeXml(lesson.speaker)}</itunes:author>
      <itunes:explicit>false</itunes:explicit>
      ${duration ? `<itunes:duration>${escapeXml(duration)}</itunes:duration>` : ""}
      <enclosure url="${escapeXml(audioUrl)}" length="${length}" type="audio/mpeg" />
    </item>`;
}

async function audioLength(url: string) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.headers.get("content-length") ?? "0";
  } catch {
    return "0";
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function podcastDuration(seconds: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
