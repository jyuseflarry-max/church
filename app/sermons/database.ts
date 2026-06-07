import type { Lesson, LessonStatus } from "./data";

export type TeachingApprovalStatus =
  | "imported"
  | "ai_review"
  | "needs_changes"
  | "approved"
  | "published"
  | "archived";

export type YoutubeUploadStatus =
  | "not_requested"
  | "queued"
  | "uploading"
  | "uploaded_private"
  | "published"
  | "failed"
  | "skipped";

type SupabaseLessonRow = {
  id: string;
  slug: string;
  title: string;
  speaker: string | null;
  lesson_date: string;
  service: string | null;
  lesson_type: string | null;
  series: string | null;
  scripture: string[] | null;
  summary: string | null;
  topics: string[] | null;
  source_url: string;
  source_audio_url: string | null;
  source_video_url: string | null;
  clipped_audio_url: string | null;
  clipped_video_url: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  youtube_visibility: "private" | "unlisted" | "public" | null;
  youtube_upload_status: string;
  youtube_uploaded_at: string | null;
  youtube_published_at: string | null;
  youtube_metadata: Record<string, unknown> | null;
  transcript: string | null;
  artwork_url: string | null;
  artwork_prompt: string | null;
  approval_status: string;
  clip_start_seconds: number | null;
  clip_end_seconds: number | null;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_ARTWORK = "/sermons/artwork/teaching-library-default.png";
const LESSON_SELECT =
  "id,slug,title,speaker,lesson_date,service,lesson_type,series,scripture,summary,topics,source_url,source_audio_url,source_video_url,clipped_audio_url,clipped_video_url,youtube_video_id,youtube_url,youtube_visibility,youtube_upload_status,youtube_uploaded_at,youtube_published_at,youtube_metadata,transcript,artwork_url,artwork_prompt,approval_status,clip_start_seconds,clip_end_seconds,published_at,created_at,updated_at";

type SupabaseConfig = {
  url: string;
  key: string;
};

type SupabaseSourcePayload = {
  provider: "congregate";
  provider_item_id: string;
  source_url: string;
  source_audio_url: string | null;
  source_video_url: string | null;
  raw_title: string;
  raw_speaker: string | null;
  raw_service: string | null;
  raw_type: string | null;
  raw_series: string | null;
  raw_published_at: string;
  raw_payload: Record<string, unknown>;
};

type SupabaseLessonPayload = {
  slug: string;
  title: string;
  speaker: string;
  lesson_date: string;
  service: string;
  lesson_type: string;
  series: string | null;
  scripture: string[];
  summary: string;
  topics: string[];
  source_url: string;
  source_audio_url: string | null;
  source_video_url: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  youtube_upload_status: YoutubeUploadStatus;
  artwork_url: string | null;
  artwork_prompt: string;
  approval_status: TeachingApprovalStatus;
};

export type TeachingDatabaseStatus = {
  configured: boolean;
  writable: boolean;
  missing: string[];
};

export type TeachingAdminLesson = Lesson & {
  approvalStatus: TeachingApprovalStatus;
  youtubeUploadStatus: YoutubeUploadStatus;
  youtubeVisibility: "private" | "unlisted" | "public" | null;
  youtubeUrl: string | null;
  youtubeUploadedAt: string | null;
  youtubePublishedAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

function getReadConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function getServiceConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function getTeachingDatabaseStatus(): TeachingDatabaseStatus {
  const missing: string[] = [];
  if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    configured: Boolean(getReadConfig()),
    writable: Boolean(getServiceConfig()),
    missing,
  };
}

export async function getPublishedLessonsFromDatabase(): Promise<Lesson[] | null> {
  const config = getReadConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    select: LESSON_SELECT,
    approval_status: "eq.published",
    order: "lesson_date.desc",
  });

  const res = await fetch(`${config.url}/rest/v1/teaching_lessons?${params}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const rows = (await res.json()) as SupabaseLessonRow[];
  return rows.map(mapLessonRow);
}

export async function getTeachingAdminLessons(): Promise<TeachingAdminLesson[] | null> {
  const config = getServiceConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    select: LESSON_SELECT,
    order: "lesson_date.desc",
    limit: "80",
  });

  const rows = await supabaseFetch<SupabaseLessonRow[]>(config, `/rest/v1/teaching_lessons?${params}`);
  return rows.map((row) => ({
    ...mapLessonRow(row),
    approvalStatus: normalizeApprovalStatus(row.approval_status),
    youtubeUploadStatus: normalizeYoutubeUploadStatus(row.youtube_upload_status),
    youtubeVisibility: row.youtube_visibility,
    youtubeUrl: row.youtube_url,
    youtubeUploadedAt: row.youtube_uploaded_at,
    youtubePublishedAt: row.youtube_published_at,
    updatedAt: row.updated_at ?? null,
    publishedAt: row.published_at,
  }));
}

export async function importFeedLessonsToDatabase(lessons: Lesson[]): Promise<number> {
  const config = getServiceConfig();
  if (!config) return 0;

  const sourcePayloads = lessons.map(toSourcePayload);
  const lessonPayloads = lessons.map(toLessonPayload);

  await upsertRows(config, "teaching_sources", sourcePayloads, "provider,provider_item_id");
  const rows = await upsertRows<SupabaseLessonRow>(config, "teaching_lessons", lessonPayloads, "slug");
  return rows.length;
}

export async function prepareLessonAiReview(lessonId: string): Promise<void> {
  await patchLesson(lessonId, {
    approval_status: "ai_review",
    transcript_status: "pending",
    artwork_status: "pending",
    ai_breakdown: {
      status: "ready_for_worker",
      next: "Transcribe source media, suggest clip boundaries, create transcript, and generate artwork prompt.",
    },
    updated_at: new Date().toISOString(),
  });
}

export async function updateLessonStatus(
  lessonId: string,
  status: TeachingApprovalStatus,
): Promise<void> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    approval_status: status,
    updated_at: now,
  };

  if (status === "approved") {
    payload.approved_at = now;
  }
  if (status === "published") {
    payload.published_at = now;
  }

  await patchLesson(lessonId, payload);
}

export async function queueLessonYoutubeUpload(lessonId: string): Promise<void> {
  await patchLesson(lessonId, {
    youtube_upload_status: "queued",
    youtube_visibility: "private",
    youtube_metadata: {
      status: "ready_for_worker",
      next: "Clip the approved lesson, upload to YouTube as private, then store the YouTube video id.",
    },
    updated_at: new Date().toISOString(),
  });
}

export async function markLessonYoutubeUploaded(
  lessonId: string,
  youtubeVideoId: string,
): Promise<void> {
  const cleanId = youtubeVideoId.trim();
  const now = new Date().toISOString();
  await patchLesson(lessonId, {
    youtube_video_id: cleanId,
    youtube_url: `https://www.youtube.com/watch?v=${cleanId}`,
    youtube_visibility: "private",
    youtube_upload_status: "uploaded_private",
    youtube_uploaded_at: now,
    updated_at: now,
  });
}

export async function markLessonYoutubePublished(lessonId: string): Promise<void> {
  const now = new Date().toISOString();
  await patchLesson(lessonId, {
    youtube_visibility: "public",
    youtube_upload_status: "published",
    youtube_published_at: now,
    updated_at: now,
  });
}

function mapLessonRow(row: SupabaseLessonRow): Lesson {
  const date = new Date(row.lesson_date);
  const iso = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  const title = row.title || "Untitled Lesson";
  const speaker = row.speaker || "Guest Speaker";
  const type = row.lesson_type || "Lesson";
  const service = row.service || "";
  const audioUrl = row.clipped_audio_url ?? row.source_audio_url;
  const videoUrl = row.youtube_url ?? row.clipped_video_url ?? row.source_video_url;

  return {
    id: row.id,
    slug: row.slug || `${row.lesson_date}-${slugify(title)}`,
    title,
    speaker,
    date: iso,
    year: String(new Date(iso).getFullYear()),
    series: row.series,
    service,
    type,
    link: row.source_url,
    audioUrl,
    videoUrl,
    vimeoId: extractVimeoId(videoUrl),
    youtubeVideoId: row.youtube_video_id ?? extractYouTubeId(videoUrl),
    durationSeconds:
      row.clip_start_seconds !== null && row.clip_end_seconds !== null
        ? row.clip_end_seconds - row.clip_start_seconds
        : null,
    artwork: row.artwork_url || DEFAULT_ARTWORK,
    summary: row.summary || `${speaker} teaches "${title}" from the Fulshear Church of Christ teaching library.`,
    scripture: row.scripture?.join(", ") || null,
    transcript: row.transcript,
    status: normalizeStatus(row.approval_status),
    ai: {
      suggestedClipStart: secondsToTimestamp(row.clip_start_seconds),
      suggestedClipEnd: secondsToTimestamp(row.clip_end_seconds),
      artworkPrompt: row.artwork_prompt || "",
      needsApproval: row.approval_status !== "published",
    },
  };
}

async function patchLesson(lessonId: string, payload: Record<string, unknown>): Promise<void> {
  const config = getServiceConfig();
  if (!config) return;

  const params = new URLSearchParams({ id: `eq.${lessonId}` });
  await supabaseFetch(config, `/rest/v1/teaching_lessons?${params}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    },
  });
}

async function upsertRows<T>(
  config: SupabaseConfig,
  table: string,
  rows: unknown[],
  onConflict: string,
): Promise<T[]> {
  if (rows.length === 0) return [];

  const params = new URLSearchParams({ on_conflict: onConflict });
  return supabaseFetch<T[]>(config, `/rest/v1/${table}?${params}`, {
    method: "POST",
    body: JSON.stringify(rows),
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
      "Content-Type": "application/json",
    },
  });
}

async function supabaseFetch<T>(
  config: SupabaseConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${config.url}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase request failed: ${res.status} ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function toSourcePayload(lesson: Lesson): SupabaseSourcePayload {
  return {
    provider: "congregate",
    provider_item_id: lesson.id,
    source_url: lesson.link,
    source_audio_url: lesson.audioUrl,
    source_video_url: lesson.videoUrl,
    raw_title: lesson.title,
    raw_speaker: lesson.speaker,
    raw_service: lesson.service || null,
    raw_type: lesson.type || null,
    raw_series: lesson.series,
    raw_published_at: lesson.date,
    raw_payload: {
      slug: lesson.slug,
      scripture: lesson.scripture,
      durationSeconds: lesson.durationSeconds,
      vimeoId: lesson.vimeoId,
    },
  };
}

function toLessonPayload(lesson: Lesson): SupabaseLessonPayload {
  return {
    slug: lesson.slug,
    title: lesson.title,
    speaker: lesson.speaker,
    lesson_date: lesson.date.slice(0, 10),
    service: lesson.service,
    lesson_type: lesson.type,
    series: lesson.series,
    scripture: lesson.scripture ? [lesson.scripture] : [],
    summary: lesson.summary,
    topics: lesson.series ? [lesson.series] : [],
    source_url: lesson.link,
    source_audio_url: lesson.audioUrl,
    source_video_url: lesson.videoUrl,
    youtube_video_id: lesson.youtubeVideoId,
    youtube_url: lesson.youtubeVideoId ? `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}` : null,
    youtube_upload_status: "not_requested",
    artwork_url: lesson.artwork,
    artwork_prompt: lesson.ai.artworkPrompt,
    approval_status: "imported",
  };
}

function extractVimeoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function extractYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
  return match?.[1] ?? null;
}

function normalizeStatus(status: string): LessonStatus {
  if (status === "published") return "published";
  if (status === "approved") return "approved";
  if (status === "ai_review") return "ai-review";
  return "imported";
}

function normalizeApprovalStatus(status: string): TeachingApprovalStatus {
  if (
    status === "ai_review" ||
    status === "needs_changes" ||
    status === "approved" ||
    status === "published" ||
    status === "archived"
  ) {
    return status;
  }
  return "imported";
}

function normalizeYoutubeUploadStatus(status: string): YoutubeUploadStatus {
  if (
    status === "queued" ||
    status === "uploading" ||
    status === "uploaded_private" ||
    status === "published" ||
    status === "failed" ||
    status === "skipped"
  ) {
    return status;
  }
  return "not_requested";
}

function secondsToTimestamp(seconds: number | null): string | null {
  if (seconds === null) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
