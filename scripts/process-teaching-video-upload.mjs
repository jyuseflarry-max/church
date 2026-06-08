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

  try {
    if (!lesson.source_video_url) {
      throw new Error("Lesson does not have a Vimeo/source video URL.");
    }
    if (lesson.clip_start_seconds === null || lesson.clip_end_seconds === null) {
      throw new Error("Lesson must have approved clip start and end seconds before video upload.");
    }

    const sourceDownloadUrl = await resolveVideoDownloadUrl(lesson.source_video_url);
    await downloadFile(sourceDownloadUrl, inputPath);
    await trimVideo({
      inputPath,
      outputPath,
      startSeconds: lesson.clip_start_seconds,
      endSeconds: lesson.clip_end_seconds,
    });

    const accessToken = await getYouTubeAccessToken();
    const videoId = await uploadToYouTube(accessToken, outputPath, lesson);
    const now = new Date().toISOString();
    await patchLesson(lesson.id, {
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
      "id,slug,title,speaker,lesson_date,service,lesson_type,series,summary,source_audio_url,source_video_url,clip_start_seconds,clip_end_seconds,youtube_metadata",
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
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
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

function extractVimeoId(url) {
  return url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d+)/i)?.[1] ?? null;
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
