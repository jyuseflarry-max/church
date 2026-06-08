import { getCongregateLessonBatch } from "../../../sermons/data";
import {
  getTeachingDatabaseStatus,
  importFeedLessonsToDatabase,
  markNextQueuedAudioCleanupProcessing,
  processNextAiReviewLesson,
} from "../../../sermons/database";

export const dynamic = "force-dynamic";

type WorkerAction = "health" | "import-feed" | "start-audio-cleanup" | "process-ai-review";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJson(request);
  const action = normalizeAction(body.action);

  if (action === "health") {
    return Response.json({
      ok: true,
      database: getTeachingDatabaseStatus(),
      workerConfigured: Boolean(process.env.TEACHING_WORKER_SECRET),
    });
  }

  if (action === "import-feed") {
    const lessons = await getCongregateLessonBatch();
    const imported = await importFeedLessonsToDatabase(lessons);
    return Response.json({ ok: true, imported });
  }

  if (action === "start-audio-cleanup") {
    const lesson = await markNextQueuedAudioCleanupProcessing();
    if (!lesson) return Response.json({ ok: true, lesson: null });

    return Response.json({
      ok: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        sourceAudioUrl: lesson.audioUrl,
        audioCleanupStatus: lesson.audioCleanupStatus,
        provider: process.env.AUDIO_CLEANUP_PROVIDER ?? "manual",
        suggestedSettings: {
          humNotchHz: 60,
          harmonicNotchHz: 120,
          highPassHz: 80,
          denoise: "light",
          loudnessTarget: "-16 LUFS",
        },
      },
    });
  }

  if (action === "process-ai-review") {
    const result = await processNextAiReviewLesson();
    return Response.json({
      ok: true,
      lesson: result.lesson
        ? {
            id: result.lesson.id,
            title: result.lesson.title,
            transcriptCreated: result.transcriptCreated,
            breakdownCreated: result.breakdownCreated,
          }
        : null,
    });
  }

  return Response.json({ error: "Unknown worker action." }, { status: 400 });
}

function isAuthorized(request: Request) {
  const secret = process.env.TEACHING_WORKER_SECRET;
  if (!secret) return false;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-teaching-worker-secret");
  return bearer === secret || headerSecret === secret;
}

async function readJson(request: Request): Promise<{ action?: unknown }> {
  try {
    return (await request.json()) as { action?: unknown };
  } catch {
    return {};
  }
}

function normalizeAction(action: unknown): WorkerAction | null {
  if (
    action === "health" ||
    action === "import-feed" ||
    action === "start-audio-cleanup" ||
    action === "process-ai-review"
  ) {
    return action;
  }
  return null;
}
