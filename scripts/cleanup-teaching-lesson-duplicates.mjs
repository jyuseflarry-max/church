import { readFileSync } from "node:fs";

loadLocalEnv();

const SUPABASE_URL = cleanUrl(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SELECT_COLUMNS = [
  "id",
  "slug",
  "title",
  "speaker",
  "lesson_date",
  "service",
  "lesson_type",
  "series",
  "scripture",
  "summary",
  "topics",
  "source_url",
  "source_audio_url",
  "source_video_url",
  "clipped_audio_url",
  "clipped_video_url",
  "cleaned_source_audio_url",
  "cleaned_clip_audio_url",
  "audio_cleanup_status",
  "audio_cleanup_provider",
  "audio_cleanup_settings",
  "audio_cleanup_notes",
  "audio_cleanup_completed_at",
  "youtube_video_id",
  "youtube_url",
  "youtube_visibility",
  "youtube_upload_status",
  "youtube_uploaded_at",
  "youtube_published_at",
  "youtube_metadata",
  "transcript",
  "transcript_status",
  "artwork_url",
  "artwork_prompt",
  "approval_status",
  "clip_start_seconds",
  "clip_end_seconds",
  "published_at",
  "updated_at",
].join(",");

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  requireEnv("SUPABASE_URL", SUPABASE_URL);
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY);

  const lessons = await fetchAllLessons();
  const groups = groupBy(lessons, semanticKey);
  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1);

  if (duplicateGroups.length === 0) {
    console.log("No duplicate teaching lessons found.");
    return;
  }

  let deleted = 0;
  for (const group of duplicateGroups) {
    const sorted = group.toSorted((a, b) => lessonScore(b) - lessonScore(a));
    const keeper = sorted[0];
    const duplicates = sorted.slice(1);
    const merged = mergeLessons(keeper, duplicates);

    await patchLesson(keeper.id, merged);
    for (const duplicate of duplicates) {
      await deleteLesson(duplicate.id);
      deleted += 1;
    }

    console.log(
      `Merged ${duplicates.length} duplicate(s) into "${keeper.title}" (${keeper.lesson_date})`,
    );
  }

  console.log(`Cleanup complete. Removed ${deleted} duplicate lesson row(s).`);
}

async function fetchAllLessons() {
  const lessons = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const params = new URLSearchParams({
      select: SELECT_COLUMNS,
      order: "lesson_date.desc",
    });
    const batch = await supabaseFetch(`/rest/v1/teaching_lessons?${params}`, {
      headers: {
        Range: `${from}-${from + pageSize - 1}`,
      },
    });
    lessons.push(...batch);
    if (batch.length < pageSize) break;
  }
  return lessons;
}

function mergeLessons(keeper, duplicates) {
  const rows = [keeper, ...duplicates];
  const best = (field) => rows.find((row) => hasValue(row[field]))?.[field] ?? null;
  const bestText = (field) =>
    rows
      .map((row) => row[field])
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .toSorted((a, b) => b.length - a.length)[0] ?? null;

  const merged = {
    source_audio_url: best("source_audio_url"),
    source_video_url: best("source_video_url"),
    clipped_audio_url: best("clipped_audio_url"),
    clipped_video_url: best("clipped_video_url"),
    cleaned_source_audio_url: best("cleaned_source_audio_url"),
    cleaned_clip_audio_url: best("cleaned_clip_audio_url"),
    audio_cleanup_provider: best("audio_cleanup_provider"),
    audio_cleanup_settings: mergeObjects(rows.map((row) => row.audio_cleanup_settings)),
    audio_cleanup_notes: bestText("audio_cleanup_notes"),
    audio_cleanup_completed_at: best("audio_cleanup_completed_at"),
    youtube_video_id: best("youtube_video_id"),
    youtube_url: best("youtube_url"),
    youtube_visibility: best("youtube_visibility"),
    youtube_uploaded_at: best("youtube_uploaded_at"),
    youtube_published_at: best("youtube_published_at"),
    youtube_metadata: mergeObjects(rows.map((row) => row.youtube_metadata)),
    transcript: bestText("transcript"),
    artwork_url: best("artwork_url"),
    artwork_prompt: bestText("artwork_prompt"),
    clip_start_seconds: best("clip_start_seconds"),
    clip_end_seconds: best("clip_end_seconds"),
    published_at: best("published_at"),
    updated_at: new Date().toISOString(),
  };

  const series = best("series");
  if (series) merged.series = series;
  const summary = bestText("summary");
  if (summary) merged.summary = summary;
  const scripture = bestArray("scripture", rows);
  if (scripture.length > 0) merged.scripture = scripture;
  const topics = bestArray("topics", rows);
  if (topics.length > 0) merged.topics = topics;
  merged.approval_status = bestRanked(rows, "approval_status", {
    archived: 0,
    imported: 1,
    ai_review: 2,
    needs_changes: 3,
    approved: 4,
    published: 5,
  });
  merged.audio_cleanup_status = bestRanked(rows, "audio_cleanup_status", {
    not_requested: 0,
    skipped: 0,
    failed: 1,
    queued: 2,
    processing: 3,
    processed: 4,
  });
  merged.youtube_upload_status = bestRanked(rows, "youtube_upload_status", {
    not_requested: 0,
    skipped: 0,
    failed: 1,
    queued: 2,
    uploading: 3,
    uploaded_private: 4,
    published: 5,
  });
  merged.transcript_status = bestRanked(rows, "transcript_status", {
    pending: 0,
    generated: 1,
    edited: 2,
    approved: 3,
  });

  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== null && value !== undefined),
  );
}

function lessonScore(row) {
  return [
    row.approval_status === "published" ? 500 : 0,
    row.approval_status === "approved" ? 300 : 0,
    row.source_video_url ? 120 : 0,
    row.source_audio_url ? 100 : 0,
    row.youtube_video_id ? 100 : 0,
    row.transcript ? 60 : 0,
    row.clip_start_seconds !== null && row.clip_end_seconds !== null ? 50 : 0,
    row.cleaned_clip_audio_url || row.cleaned_source_audio_url ? 40 : 0,
    row.updated_at ? Date.parse(row.updated_at) / 100000000000 : 0,
  ].reduce((sum, value) => sum + value, 0);
}

async function patchLesson(id, payload) {
  const params = new URLSearchParams({ id: `eq.${id}` });
  await supabaseFetch(`/rest/v1/teaching_lessons?${params}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    },
  });
}

async function deleteLesson(id) {
  const params = new URLSearchParams({ id: `eq.${id}` });
  await supabaseFetch(`/rest/v1/teaching_lessons?${params}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

async function supabaseFetch(pathname, init = {}) {
  const res = await fetch(`${SUPABASE_URL}${pathname}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase request failed: ${res.status} ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

function semanticKey(row) {
  return [
    row.lesson_date,
    slugify(row.title),
    slugify(row.speaker ?? ""),
    slugify(row.service ?? ""),
  ].join("|");
}

function groupBy(values, keyFor) {
  const map = new Map();
  for (const value of values) {
    const key = keyFor(value);
    map.set(key, [...(map.get(key) ?? []), value]);
  }
  return map;
}

function bestRanked(rows, field, rank) {
  return rows
    .map((row) => row[field])
    .filter(Boolean)
    .toSorted((a, b) => (rank[b] ?? 0) - (rank[a] ?? 0))[0];
}

function bestArray(field, rows) {
  return [
    ...new Set(
      rows
        .flatMap((row) => (Array.isArray(row[field]) ? row[field] : []))
        .filter(Boolean),
    ),
  ];
}

function mergeObjects(objects) {
  return Object.assign(
    {},
    ...objects.filter((value) => value && typeof value === "object" && !Array.isArray(value)),
  );
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanUrl(url) {
  return url?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function requireEnv(name, value) {
  if (!value) throw new Error(`${name} is not configured.`);
}

function loadLocalEnv() {
  try {
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // Environment variables may already be provided by the shell or GitHub Actions.
  }
}
