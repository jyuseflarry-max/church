import type { Lesson, LessonStatus } from "./data";
import {
  createLessonBreakdown,
  isOpenAiConfigured,
  transcribeLessonAudio,
  type LessonBreakdownResult,
} from "./openai-worker";

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

export type AudioCleanupStatus =
  | "not_requested"
  | "queued"
  | "processing"
  | "processed"
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
  audio_cleanup_status: string;
  audio_cleanup_provider: string | null;
  cleaned_source_audio_url: string | null;
  cleaned_clip_audio_url: string | null;
  audio_cleanup_settings: Record<string, unknown> | null;
  audio_cleanup_notes: string | null;
  audio_cleanup_completed_at: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  youtube_visibility: "private" | "unlisted" | "public" | null;
  youtube_upload_status: string;
  youtube_uploaded_at: string | null;
  youtube_published_at: string | null;
  youtube_metadata: Record<string, unknown> | null;
  transcript: string | null;
  transcript_status?: string;
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
  "id,slug,title,speaker,lesson_date,service,lesson_type,series,scripture,summary,topics,source_url,source_audio_url,source_video_url,clipped_audio_url,clipped_video_url,audio_cleanup_status,audio_cleanup_provider,cleaned_source_audio_url,cleaned_clip_audio_url,audio_cleanup_settings,audio_cleanup_notes,audio_cleanup_completed_at,youtube_video_id,youtube_url,youtube_visibility,youtube_upload_status,youtube_uploaded_at,youtube_published_at,youtube_metadata,transcript,artwork_url,artwork_prompt,approval_status,clip_start_seconds,clip_end_seconds,published_at,created_at,updated_at";

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
  audio_cleanup_status: AudioCleanupStatus;
  artwork_url: string | null;
  artwork_prompt: string;
  approval_status: TeachingApprovalStatus;
};

export type TeachingDatabaseStatus = {
  configured: boolean;
  writable: boolean;
  openAiConfigured: boolean;
  missing: string[];
};

export type TeachingAdminLessonResult =
  | { lessons: TeachingAdminLesson[]; error: null }
  | { lessons: null; error: string };

export type TeachingAdminLesson = Lesson & {
  approvalStatus: TeachingApprovalStatus;
  audioCleanupStatus: AudioCleanupStatus;
  audioCleanupProvider: string | null;
  cleanedSourceAudioUrl: string | null;
  cleanedClipAudioUrl: string | null;
  audioCleanupNotes: string | null;
  audioCleanupCompletedAt: string | null;
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
  return { url: normalizeSupabaseUrl(url), key };
}

function getServiceConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: normalizeSupabaseUrl(url), key };
}

function normalizeSupabaseUrl(url: string) {
  return url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "");
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
  if (!process.env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY");
  }

  return {
    configured: Boolean(getReadConfig()),
    writable: Boolean(getServiceConfig()),
    openAiConfigured: isOpenAiConfigured(),
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
  const result = await getTeachingAdminLessonResult();
  return result.lessons;
}

export async function getTeachingAdminLessonResult(): Promise<TeachingAdminLessonResult> {
  const config = getServiceConfig();
  if (!config) return { lessons: null, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };

  const params = new URLSearchParams({
    select: LESSON_SELECT,
    order: "lesson_date.desc",
    limit: "80",
  });

  try {
    const rows = await supabaseFetch<SupabaseLessonRow[]>(config, `/rest/v1/teaching_lessons?${params}`);
    return { lessons: rows.map(toTeachingAdminLesson), error: null };
  } catch (error) {
    return { lessons: null, error: error instanceof Error ? error.message : "Unknown database error." };
  }
}

export async function importFeedLessonsToDatabase(
  lessons: Lesson[],
  options: { offset?: number; limit?: number } = {},
): Promise<number> {
  const config = getServiceConfig();
  if (!config) return 0;

  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.min(100, Math.max(1, options.limit ?? 50));
  const importBatch = lessons.slice(offset, offset + limit);
  const sourcePayloads = uniqueBy(
    importBatch.map(toSourcePayload),
    (source) => `${source.provider}:${source.provider_item_id}`,
  );
  const lessonPayloads = await reuseExistingLessonSlugs(
    config,
    uniqueBy(importBatch.map(toLessonPayload), semanticLessonKey),
  );

  await upsertRows(config, "teaching_sources", sourcePayloads, "provider,provider_item_id");
  await upsertRows(config, "teaching_lessons", lessonPayloads, "slug");
  return lessonPayloads.length;
}

async function reuseExistingLessonSlugs(
  config: SupabaseConfig,
  payloads: SupabaseLessonPayload[],
): Promise<SupabaseLessonPayload[]> {
  if (payloads.length === 0) return payloads;

  const dates = [...new Set(payloads.map((lesson) => lesson.lesson_date))];
  const params = new URLSearchParams({
    select: "slug,title,speaker,lesson_date,service",
    lesson_date: `in.(${dates.join(",")})`,
  });
  const rows = await supabaseFetch<
    Pick<SupabaseLessonRow, "slug" | "title" | "speaker" | "lesson_date" | "service">[]
  >(config, `/rest/v1/teaching_lessons?${params}`);

  const existingByKey = new Map<string, string>();
  for (const row of rows) {
    existingByKey.set(
      semanticLessonKey({
        lesson_date: row.lesson_date,
        title: row.title,
        speaker: row.speaker ?? "",
        service: row.service ?? "",
      }),
      row.slug,
    );
  }

  return payloads.map((payload) => ({
    ...payload,
    slug: existingByKey.get(semanticLessonKey(payload)) ?? payload.slug,
  }));
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

export async function queueLessonAudioCleanup(lessonId: string): Promise<void> {
  await patchLesson(lessonId, {
    audio_cleanup_status: "queued",
    audio_cleanup_provider: process.env.AUDIO_CLEANUP_PROVIDER ?? "manual",
    audio_cleanup_settings: defaultAudioCleanupSettings(),
    audio_cleanup_notes:
      "Queued for hum/buzz reduction, voice leveling, and final loudness normalization before public publishing.",
    updated_at: new Date().toISOString(),
  });
}

export async function markLessonAudioCleaned(
  lessonId: string,
  cleanedAudioUrl: string,
  target: "source" | "clip" = "clip",
): Promise<void> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    audio_cleanup_status: "processed",
    audio_cleanup_completed_at: now,
    updated_at: now,
  };

  if (target === "source") {
    payload.cleaned_source_audio_url = cleanedAudioUrl.trim();
  } else {
    payload.cleaned_clip_audio_url = cleanedAudioUrl.trim();
    payload.clipped_audio_url = cleanedAudioUrl.trim();
  }

  await patchLesson(lessonId, payload);
}

export async function markNextQueuedAudioCleanupProcessing(): Promise<TeachingAdminLesson | null> {
  const config = getServiceConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    select: LESSON_SELECT,
    audio_cleanup_status: "eq.queued",
    order: "lesson_date.desc",
    limit: "1",
  });
  const rows = await supabaseFetch<SupabaseLessonRow[]>(config, `/rest/v1/teaching_lessons?${params}`);
  const row = rows[0];
  if (!row) return null;

  await patchLesson(row.id, {
    audio_cleanup_status: "processing",
    audio_cleanup_notes:
      "Processing started. Worker should run hum removal, light denoise, leveling, and loudness normalization.",
    updated_at: new Date().toISOString(),
  });

  return {
    ...toTeachingAdminLesson(row),
    audioCleanupStatus: "processing",
  };
}

export async function processNextAiReviewLesson(): Promise<{
  lesson: TeachingAdminLesson | null;
  transcriptCreated: boolean;
  breakdownCreated: boolean;
}> {
  const lesson = await markNextAiReviewLessonProcessing();
  if (!lesson) {
    return { lesson: null, transcriptCreated: false, breakdownCreated: false };
  }

  let transcript = lesson.transcript;
  let transcriptCreated = false;

  if (!transcript) {
    transcript = await transcribeLessonAudio(lesson);
    transcriptCreated = true;
  }

  const breakdown = await createLessonBreakdown(lesson, transcript);
  await saveLessonAiBreakdown(lesson.id, transcript, breakdown);

  return {
    lesson,
    transcriptCreated,
    breakdownCreated: true,
  };
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
  const audioUrl =
    row.cleaned_clip_audio_url ??
    row.clipped_audio_url ??
    row.cleaned_source_audio_url ??
    row.source_audio_url;
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

function toTeachingAdminLesson(row: SupabaseLessonRow): TeachingAdminLesson {
  return {
    ...mapLessonRow(row),
    approvalStatus: normalizeApprovalStatus(row.approval_status),
    audioCleanupStatus: normalizeAudioCleanupStatus(row.audio_cleanup_status),
    audioCleanupProvider: row.audio_cleanup_provider,
    cleanedSourceAudioUrl: row.cleaned_source_audio_url,
    cleanedClipAudioUrl: row.cleaned_clip_audio_url,
    audioCleanupNotes: row.audio_cleanup_notes,
    audioCleanupCompletedAt: row.audio_cleanup_completed_at,
    youtubeUploadStatus: normalizeYoutubeUploadStatus(row.youtube_upload_status),
    youtubeVisibility: row.youtube_visibility,
    youtubeUrl: row.youtube_url,
    youtubeUploadedAt: row.youtube_uploaded_at,
    youtubePublishedAt: row.youtube_published_at,
    updatedAt: row.updated_at ?? null,
    publishedAt: row.published_at,
  };
}

async function markNextAiReviewLessonProcessing(): Promise<TeachingAdminLesson | null> {
  const config = getServiceConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    select: LESSON_SELECT,
    approval_status: "eq.ai_review",
    order: "lesson_date.desc",
    limit: "1",
  });
  const rows = await supabaseFetch<SupabaseLessonRow[]>(config, `/rest/v1/teaching_lessons?${params}`);
  const row = rows[0];
  if (!row) return null;

  await patchLesson(row.id, {
    ai_breakdown: {
      status: "processing",
      startedAt: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  });

  return toTeachingAdminLesson(row);
}

async function saveLessonAiBreakdown(
  lessonId: string,
  transcript: string,
  breakdown: LessonBreakdownResult,
) {
  await patchLesson(lessonId, {
    title: breakdown.title,
    speaker: breakdown.speaker,
    scripture: breakdown.scripture,
    summary: breakdown.summary,
    topics: breakdown.topics,
    series: breakdown.series,
    service: breakdown.serviceType,
    lesson_type: breakdown.lessonType,
    clip_start_seconds: breakdown.clipStartSeconds,
    clip_end_seconds: breakdown.clipEndSeconds,
    transcript,
    transcript_status: "generated",
    artwork_prompt: breakdown.artworkPrompt,
    approval_status: "needs_changes",
    ai_breakdown: {
      status: "completed",
      completedAt: new Date().toISOString(),
      confidence: breakdown.confidence,
      reviewNotes: breakdown.reviewNotes,
      suggested: breakdown,
    },
    updated_at: new Date().toISOString(),
  });
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

async function upsertRows(
  config: SupabaseConfig,
  table: string,
  rows: unknown[],
  onConflict: string,
): Promise<void> {
  if (rows.length === 0) return;

  const chunks = chunk(rows, 25);
  for (const batch of chunks) {
    const params = new URLSearchParams({ on_conflict: onConflict });
    await supabaseFetch(config, `/rest/v1/${table}?${params}`, {
      method: "POST",
      body: JSON.stringify(batch),
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
        "Content-Type": "application/json",
      },
    });
  }
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

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
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
    audio_cleanup_status: "not_requested",
    artwork_url: lesson.artwork,
    artwork_prompt: lesson.ai.artworkPrompt,
    approval_status: "imported",
  };
}

function extractVimeoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d+)/i);
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

function normalizeAudioCleanupStatus(status: string): AudioCleanupStatus {
  if (
    status === "queued" ||
    status === "processing" ||
    status === "processed" ||
    status === "failed" ||
    status === "skipped"
  ) {
    return status;
  }
  return "not_requested";
}

function defaultAudioCleanupSettings() {
  return {
    humNotchHz: 60,
    harmonicNotchHz: 120,
    highPassHz: 80,
    loudnessTarget: "-16 LUFS",
    truePeakLimit: "-1.5 dBTP",
    denoise: "light",
    preserveOriginal: true,
  };
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

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function uniqueBy<T>(values: T[], keyFor: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = keyFor(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function semanticLessonKey(value: {
  lesson_date: string;
  title: string;
  speaker: string;
  service: string;
}) {
  return [
    value.lesson_date,
    slugify(value.title),
    slugify(value.speaker),
    slugify(value.service),
  ].join("|");
}
