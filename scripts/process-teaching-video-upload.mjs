import { createWriteStream, promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";

const SUPABASE_URL = cleanUrl(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
const YOUTUBE_DEFAULT_PRIVACY = process.env.YOUTUBE_DEFAULT_PRIVACY ?? "private";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TRANSCRIPTION_MODEL = process.env.OPENAI_VIDEO_TRANSCRIPTION_MODEL ?? "whisper-1";
const OPENAI_BREAKDOWN_MODEL = process.env.OPENAI_LESSON_BREAKDOWN_MODEL ?? "gpt-4o";
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_TEACHING_MEDIA_BUCKET;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  requireEnv("SUPABASE_URL", SUPABASE_URL);
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY);
  requireEnv("YOUTUBE_CLIENT_ID", YOUTUBE_CLIENT_ID);
  requireEnv("YOUTUBE_CLIENT_SECRET", YOUTUBE_CLIENT_SECRET);
  requireEnv("YOUTUBE_REFRESH_TOKEN", YOUTUBE_REFRESH_TOKEN);

  const lesson = await claimNextQueuedLesson();
  if (!lesson) {
    console.log("No queued teaching video uploads.");
    return;
  }

  const workDir = await fs.mkdtemp(path.join(tmpdir(), "teaching-video-"));
  const inputPath = path.join(workDir, "source.mp4");
  const outputPath = path.join(workDir, "clip.mp4");
  const fullAudioPath = path.join(workDir, "full-clean-audio.mp3");
  const clipAudioPath = path.join(workDir, "clip-clean-audio.mp3");

  try {
    if (!lesson.source_video_url) {
      throw new Error("Lesson does not have a Vimeo/source video URL.");
    }

    const sourceDownloadUrl = await resolveVideoDownloadUrl(lesson.source_video_url);
    await downloadFile(sourceDownloadUrl, inputPath);

    if (lesson.clip_start_seconds === null || lesson.clip_end_seconds === null || !lesson.transcript) {
      requireEnv("OPENAI_API_KEY", OPENAI_API_KEY);
      await extractCleanMp3({
        inputPath,
        outputPath: fullAudioPath,
      });
      const transcript = lesson.transcript ?? (await transcribeAudioFile(fullAudioPath));
      const breakdown =
        lesson.clip_start_seconds !== null && lesson.clip_end_seconds !== null
          ? null
          : await createLessonBreakdown(lesson, transcript);

      if (breakdown) {
        lesson.clip_start_seconds = breakdown.clipStartSeconds;
        lesson.clip_end_seconds = breakdown.clipEndSeconds;
        lesson.title = breakdown.title || lesson.title;
        lesson.speaker = breakdown.speaker || lesson.speaker;
        lesson.series = breakdown.series;
        lesson.service = breakdown.serviceType || lesson.service;
        lesson.lesson_type = breakdown.lessonType || lesson.lesson_type;
        lesson.summary = breakdown.summary || lesson.summary;
      }

      await patchLesson(lesson.id, {
        ...(breakdown
          ? {
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
              artwork_prompt: breakdown.artworkPrompt,
              approval_status: "needs_changes",
              ai_breakdown: {
                status: "completed",
                completedAt: new Date().toISOString(),
                source: "github_actions_video_worker",
                confidence: breakdown.confidence,
                reviewNotes: breakdown.reviewNotes,
                suggested: breakdown,
              },
            }
          : {}),
        transcript,
        transcript_status: "generated",
        updated_at: new Date().toISOString(),
      });
    }

    if (lesson.clip_start_seconds === null || lesson.clip_end_seconds === null) {
      throw new Error("AI review did not produce clip start and end seconds.");
    }

    await trimVideo({
      inputPath,
      outputPath,
      startSeconds: lesson.clip_start_seconds,
      endSeconds: lesson.clip_end_seconds,
    });
    await extractCleanMp3({
      inputPath: outputPath,
      outputPath: clipAudioPath,
    });
    const clippedAudioUrl = await maybeUploadTeachingMedia({
      filePath: clipAudioPath,
      lesson,
      extension: "mp3",
      contentType: "audio/mpeg",
    });

    const accessToken = await getYouTubeAccessToken();
    const videoId = await uploadToYouTube(accessToken, outputPath, lesson);
    const now = new Date().toISOString();
    await patchLesson(lesson.id, {
      ...(clippedAudioUrl
        ? {
            clipped_audio_url: clippedAudioUrl,
            cleaned_clip_audio_url: clippedAudioUrl,
            audio_cleanup_status: "processed",
            audio_cleanup_provider: "github_actions_ffmpeg",
            audio_cleanup_completed_at: now,
          }
        : {}),
      youtube_video_id: videoId,
      youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
      youtube_visibility: YOUTUBE_DEFAULT_PRIVACY,
      youtube_upload_status: YOUTUBE_DEFAULT_PRIVACY === "public" ? "published" : "uploaded_private",
      youtube_uploaded_at: now,
      youtube_published_at: YOUTUBE_DEFAULT_PRIVACY === "public" ? now : null,
      youtube_metadata: {
        status: "uploaded",
        uploadedAt: now,
        source: "github_actions_video_worker",
        clipStartSeconds: lesson.clip_start_seconds,
        clipEndSeconds: lesson.clip_end_seconds,
      },
      updated_at: now,
    });

    console.log(`Uploaded "${lesson.title}" to YouTube video ${videoId}.`);
  } catch (error) {
    await patchLesson(lesson.id, {
      youtube_upload_status: "failed",
      youtube_metadata: {
        status: "failed",
        failedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      },
      updated_at: new Date().toISOString(),
    });
    throw error;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function claimNextQueuedLesson() {
  const params = new URLSearchParams({
    select:
      "id,slug,title,speaker,lesson_date,service,lesson_type,series,summary,source_audio_url,source_video_url,clip_start_seconds,clip_end_seconds,transcript,youtube_metadata",
    youtube_upload_status: "eq.queued",
    order: "lesson_date.desc",
    limit: "1",
  });
  const lessons = await supabaseFetch(`/rest/v1/teaching_lessons?${params}`);
  const lesson = lessons[0];
  if (!lesson) return null;

  await patchLesson(lesson.id, {
    youtube_upload_status: "uploading",
    youtube_metadata: {
      ...(lesson.youtube_metadata ?? {}),
      status: "uploading",
      startedAt: new Date().toISOString(),
      source: "github_actions_video_worker",
    },
    updated_at: new Date().toISOString(),
  });

  return lesson;
}

async function resolveVideoDownloadUrl(sourceUrl) {
  const vimeoId = extractVimeoId(sourceUrl);
  if (!vimeoId) return sourceUrl;
  requireEnv("VIMEO_ACCESS_TOKEN", VIMEO_ACCESS_TOKEN);

  const fields = "download,files,play";
  const res = await fetch(`https://api.vimeo.com/videos/${vimeoId}?fields=${encodeURIComponent(fields)}`, {
    headers: {
      Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vimeo file lookup failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const candidates = [
    ...(Array.isArray(json.download) ? json.download : []),
    ...(Array.isArray(json.files) ? json.files : []),
    ...(Array.isArray(json.play?.progressive) ? json.play.progressive : []),
  ]
    .filter((file) => typeof file?.link === "string")
    .sort((a, b) => Number(b.height ?? b.size ?? 0) - Number(a.height ?? a.size ?? 0));

  const link = candidates[0]?.link;
  if (!link) {
    throw new Error("Vimeo did not return a downloadable video file. Check Vimeo plan, download setting, and token scopes.");
  }
  return link;
}

async function downloadFile(url, destination) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Video download failed: ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(destination));
}

async function trimVideo({ inputPath, outputPath, startSeconds, endSeconds }) {
  const duration = Math.max(1, endSeconds - startSeconds);

  await run("ffmpeg", [
    "-y",
    "-ss",
    String(startSeconds),
    "-i",
    inputPath,
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-af",
    audioCleanupFilter(),
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function extractCleanMp3({ inputPath, outputPath, startSeconds = null, durationSeconds = null }) {
  const args = ["-y"];
  if (startSeconds !== null) args.push("-ss", String(startSeconds));
  args.push("-i", inputPath);
  if (durationSeconds !== null) args.push("-t", String(durationSeconds));
  args.push(
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-af",
    audioCleanupFilter(),
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "64k",
    outputPath,
  );
  await run("ffmpeg", args);
}

function audioCleanupFilter() {
  return [
    "highpass=f=80",
    "lowpass=f=12000",
    "afftdn=nf=-25",
    "equalizer=f=60:t=q:w=12:g=-18",
    "equalizer=f=120:t=q:w=12:g=-12",
    "acompressor=threshold=-20dB:ratio=2.5:attack=20:release=250:makeup=2",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
  ].join(",");
}

async function transcribeAudioFile(audioPath) {
  const duration = await mediaDurationSeconds(audioPath);
  const chunkSeconds = 20 * 60;
  if (duration <= chunkSeconds) {
    return transcribeSingleAudioFile(audioPath);
  }

  const dir = path.dirname(audioPath);
  const parts = [];
  for (let start = 0; start < duration; start += chunkSeconds) {
    const chunkPath = path.join(dir, `transcript-${String(parts.length + 1).padStart(3, "0")}.mp3`);
    await extractCleanMp3({
      inputPath: audioPath,
      outputPath: chunkPath,
      startSeconds: start,
      durationSeconds: Math.min(chunkSeconds, duration - start),
    });
    const text = await transcribeSingleAudioFile(chunkPath);
    parts.push(`[${secondsToTimestamp(start)}]\n${text}`);
  }
  return parts.join("\n\n");
}

async function transcribeSingleAudioFile(audioPath) {
  const audio = await fs.readFile(audioPath);
  const form = new FormData();
  form.append("model", OPENAI_TRANSCRIPTION_MODEL);
  form.append("response_format", "json");
  form.append(
    "prompt",
    [
      "This is a sermon or Bible class from Fulshear Church of Christ.",
      "Preserve Scripture references, speaker names, and theological terms.",
      "Do not summarize; transcribe the spoken content accurately.",
    ].join(" "),
  );
  form.append("file", new Blob([audio], { type: "audio/mpeg" }), path.basename(audioPath));

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI video transcription failed: ${res.status} ${body}`);
  }
  const json = await res.json();
  if (!json.text) throw new Error("OpenAI video transcription returned no text.");
  return json.text;
}

async function createLessonBreakdown(lesson, transcript) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_BREAKDOWN_MODEL,
      input: [
        {
          role: "system",
          content:
            "You prepare sermon records for a Churches of Christ teaching library. Return faithful, non-hype, visitor-friendly metadata.",
        },
        {
          role: "user",
          content: buildLessonBreakdownPrompt(lesson, transcript),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lesson_breakdown",
          strict: true,
          schema: lessonBreakdownSchema,
        },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI video lesson breakdown failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const outputText = extractOutputText(json);
  if (!outputText) throw new Error("OpenAI video lesson breakdown returned no text.");
  return normalizeBreakdown(JSON.parse(outputText));
}

async function maybeUploadTeachingMedia({ filePath, lesson, extension, contentType }) {
  if (!SUPABASE_STORAGE_BUCKET) return null;

  const objectPath = `lessons/${lesson.slug}/${path.basename(filePath, path.extname(filePath))}.${extension}`;
  const body = await fs.readFile(filePath);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase media upload failed: ${res.status} ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath}`;
}

async function getYouTubeAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube token refresh failed: ${res.status} ${body}`);
  }
  const json = await res.json();
  if (!json.access_token) throw new Error("YouTube token refresh returned no access token.");
  return json.access_token;
}

async function uploadToYouTube(accessToken, videoPath, lesson) {
  const metadata = {
    snippet: {
      title: youtubeTitle(lesson),
      description: youtubeDescription(lesson),
      categoryId: "27",
    },
    status: {
      privacyStatus: YOUTUBE_DEFAULT_PRIVACY,
      selfDeclaredMadeForKids: false,
    },
  };

  const startRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    },
  );
  if (!startRes.ok) {
    const body = await startRes.text();
    throw new Error(`YouTube upload session failed: ${startRes.status} ${body}`);
  }

  const uploadUrl = startRes.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return a resumable upload URL.");

  const result = await uploadFileInChunks(uploadUrl, videoPath);
  if (!result.id) throw new Error("YouTube upload completed without a video id.");
  return result.id;
}

async function uploadFileInChunks(uploadUrl, videoPath) {
  const stat = await fs.stat(videoPath);
  const file = await fs.open(videoPath, "r");
  const chunkSize = 8 * 1024 * 1024;
  let offset = 0;

  try {
    while (offset < stat.size) {
      const remaining = stat.size - offset;
      const size = Math.min(chunkSize, remaining);
      const buffer = Buffer.alloc(size);
      await file.read(buffer, 0, size, offset);
      const end = offset + size - 1;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": String(size),
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${offset}-${end}/${stat.size}`,
        },
        body: buffer,
      });

      if (res.status === 308) {
        offset = end + 1;
        continue;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`YouTube upload failed: ${res.status} ${body}`);
      }
      return await res.json();
    }
  } finally {
    await file.close();
  }

  throw new Error("YouTube upload ended before completion.");
}

async function patchLesson(lessonId, payload) {
  const params = new URLSearchParams({ id: `eq.${lessonId}` });
  await supabaseFetch(`/rest/v1/teaching_lessons?${params}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      Prefer: "return=minimal",
      "Content-Type": "application/json",
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

function youtubeTitle(lesson) {
  const date = lesson.lesson_date ? ` (${lesson.lesson_date})` : "";
  return `${lesson.title}${date}`.slice(0, 100);
}

function youtubeDescription(lesson) {
  return [
    lesson.summary || `${lesson.speaker ?? "A teacher"} from Fulshear Church of Christ.`,
    "",
    `Speaker: ${lesson.speaker ?? "Not listed"}`,
    `Date: ${lesson.lesson_date}`,
    lesson.series ? `Series: ${lesson.series}` : "",
    lesson.service ? `Service: ${lesson.service}` : "",
    "",
    "Fulshear Church of Christ",
    "https://fulshearcoc.org",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 5000);
}

function buildLessonBreakdownPrompt(lesson, transcript) {
  return [
    "You are helping Fulshear Church of Christ prepare a public Teaching Library item.",
    "The public site should publish only the sermon or lesson portion, not announcements, prayers, songs, communion, or full-service material.",
    "Analyze the transcript and return structured JSON only.",
    "",
    "Find:",
    "- Sermon or lesson start and end times in seconds.",
    "- Clean public title.",
    "- Speaker.",
    "- Scripture references.",
    "- Short summary in warm, plain language.",
    "- Topics/tags.",
    "- Series or collection.",
    "- Service type such as Sunday AM, Sunday PM, Wednesday, Bible Class, Summer Series.",
    "- Artwork prompt with no text inside the image.",
    "- Confidence and review notes.",
    "",
    "When the transcript includes timestamps like [20:00], use those timestamps to calculate clipStartSeconds and clipEndSeconds relative to the full recording.",
    "Do not include songs, prayers, communion comments, invitation songs, announcements, or full-service material in the public clip.",
    "Keep the tone sincere, biblical, and visitor-friendly.",
    "",
    `Source title: ${lesson.title}`,
    `Source date: ${lesson.lesson_date}`,
    `Source speaker: ${lesson.speaker ?? "Unknown"}`,
    `Source service: ${lesson.service ?? "Unknown"}`,
    `Existing series: ${lesson.series ?? "None"}`,
    "",
    "Transcript:",
    transcript.slice(0, 90000),
  ].join("\n");
}

function extractOutputText(response) {
  if (typeof response?.output_text === "string") return response.output_text;
  if (!Array.isArray(response?.output)) return null;

  for (const item of response.output) {
    if (!Array.isArray(item?.content)) continue;
    for (const part of item.content) {
      if (typeof part?.text === "string") return part.text;
    }
  }
  return null;
}

function normalizeBreakdown(value) {
  return {
    clipStartSeconds: nullableNumber(value.clipStartSeconds),
    clipEndSeconds: nullableNumber(value.clipEndSeconds),
    title: value.title || "Untitled Lesson",
    speaker: value.speaker || "Guest Speaker",
    scripture: Array.isArray(value.scripture) ? value.scripture.filter(Boolean) : [],
    summary: value.summary || "",
    topics: Array.isArray(value.topics) ? value.topics.filter(Boolean) : [],
    series: value.series || null,
    serviceType: value.serviceType || "Lesson",
    lessonType: value.lessonType || "Lesson",
    artworkPrompt: value.artworkPrompt || "",
    confidence: {
      clip: normalizeConfidence(value.confidence?.clip),
      metadata: normalizeConfidence(value.confidence?.metadata),
    },
    reviewNotes: Array.isArray(value.reviewNotes) ? value.reviewNotes.filter(Boolean) : [],
  };
}

function nullableNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeConfidence(value) {
  if (value === "low" || value === "high") return value;
  return "medium";
}

const lessonBreakdownSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "clipStartSeconds",
    "clipEndSeconds",
    "title",
    "speaker",
    "scripture",
    "summary",
    "topics",
    "series",
    "serviceType",
    "lessonType",
    "artworkPrompt",
    "confidence",
    "reviewNotes",
  ],
  properties: {
    clipStartSeconds: { anyOf: [{ type: "integer" }, { type: "null" }] },
    clipEndSeconds: { anyOf: [{ type: "integer" }, { type: "null" }] },
    title: { type: "string" },
    speaker: { type: "string" },
    scripture: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    topics: { type: "array", items: { type: "string" } },
    series: { anyOf: [{ type: "string" }, { type: "null" }] },
    serviceType: { type: "string" },
    lessonType: { type: "string" },
    artworkPrompt: { type: "string" },
    confidence: {
      type: "object",
      additionalProperties: false,
      required: ["clip", "metadata"],
      properties: {
        clip: { type: "string", enum: ["low", "medium", "high"] },
        metadata: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
    reviewNotes: { type: "array", items: { type: "string" } },
  },
};

function extractVimeoId(url) {
  return url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d+)/i)?.[1] ?? null;
}

async function mediaDurationSeconds(filePath) {
  const output = await capture("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const duration = Number(output.trim());
  return Number.isFinite(duration) ? duration : 0;
}

function secondsToTimestamp(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function cleanUrl(url) {
  return url?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function requireEnv(name, value) {
  if (!value) throw new Error(`${name} is not configured.`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function capture(command, args) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited with code ${code}: ${stderr}`));
    });
  });
}
