import { getFeedLessons } from "../../../sermons/data";
import {
  getTeachingDatabaseStatus,
  importFeedLessonsToDatabase,
} from "../../../sermons/database";

export const dynamic = "force-dynamic";

type WorkerAction = "health" | "import-feed";

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
    const lessons = await getFeedLessons();
    const imported = await importFeedLessonsToDatabase(lessons);
    return Response.json({ ok: true, imported });
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
  if (action === "health" || action === "import-feed") return action;
  return null;
}
