import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getFeedLessons, type Lesson } from "../../sermons/data";
import {
  getTeachingAdminLessons,
  getTeachingDatabaseStatus,
  type TeachingAdminLesson,
  type TeachingApprovalStatus,
} from "../../sermons/database";
import { logoutTeachingAdminAction } from "../login/actions";
import {
  approveLessonAction,
  archiveLessonAction,
  importCongregateLessonsAction,
  markYoutubePublishedAction,
  markYoutubeUploadedAction,
  prepareAiReviewAction,
  publishLessonAction,
  queueYoutubeUploadAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Teaching Library Review",
  description:
    "AI-assisted review workflow for sermon clips, transcripts, metadata, and artwork.",
};

export const dynamic = "force-dynamic";

const workflowSteps = [
  {
    title: "Import",
    body: "Pull new Congregate media into the teaching database as private imported records.",
  },
  {
    title: "Prepare",
    body: "Mark an item for AI transcription, clip detection, transcript cleanup, metadata, and artwork.",
  },
  {
    title: "Approve",
    body: "Review the suggested lesson, make edits, then approve it for clipping and publishing.",
  },
  {
    title: "YouTube",
    body: "Upload approved clips privately first, then publish to YouTube after final review.",
  },
];

const statusLabels: Record<TeachingApprovalStatus, string> = {
  imported: "Imported",
  ai_review: "AI review",
  needs_changes: "Needs changes",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

const statusClasses: Record<TeachingApprovalStatus, string> = {
  imported: "bg-gold-muted text-sage-deep",
  ai_review: "bg-sage-muted text-sage-deep",
  needs_changes: "bg-rose-muted text-rose-dark",
  approved: "bg-sage-light/30 text-sage-deep",
  published: "bg-sage-deep text-white",
  archived: "bg-line text-muted",
};

const youtubeStatusLabels = {
  not_requested: "Not requested",
  queued: "Queued",
  uploading: "Uploading",
  uploaded_private: "Private upload",
  published: "Public",
  failed: "Failed",
  skipped: "Skipped",
};

export default async function TeachingLibraryAdminPage() {
  const databaseStatus = getTeachingDatabaseStatus();
  const dbLessons = await getTeachingAdminLessons();
  const feedLessons = dbLessons ? [] : await getFeedLessons();
  const lessons = dbLessons ?? feedLessons.map(toPreviewLesson);

  return (
    <>
      <section className="section-pad bg-sage-deep text-white">
        <div className="container-wide max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
            Admin workflow
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-7xl">
            Teaching Library Review
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/76">
            Import Congregate lessons, prepare them for AI-assisted breakdown,
            approve the public sermon clip, and publish only what is ready for
            visitors.
          </p>
          <form action={logoutTeachingAdminAction} className="mt-8">
            <button className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 focus-ring">
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section className="section-pad bg-warm-white">
        <div className="container-wide">
          <div className="grid gap-5 md:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-line bg-white p-6">
                <p className="font-serif text-4xl font-bold text-rose-light">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-5 text-2xl font-bold text-sage-deep">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-3xl font-bold text-sage-deep">Database status</h2>
              <p className="mt-3 text-sm leading-6 text-charcoal/72">
                The public site reads only published records. This admin screen
                writes with the server-only Supabase service role key.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <StatusPill active={databaseStatus.configured} label="Read configured" />
                <StatusPill active={databaseStatus.writable} label="Write configured" />
              </div>
              {databaseStatus.missing.length > 0 && (
                <p className="mt-5 rounded-xl bg-cream p-4 text-sm leading-6 text-muted">
                  Missing: {databaseStatus.missing.join(", ")}. Add these before
                  importing or publishing from the admin workflow.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-sage-deep p-6 text-white">
              <h2 className="text-3xl font-bold">Import from Congregate</h2>
              <p className="mt-3 text-sm leading-6 text-white/72">
                This pulls the current feed into the database as private imported
                records. Re-running it updates matching lessons by slug.
              </p>
              <form action={importCongregateLessonsAction}>
                <button
                  disabled={!databaseStatus.writable}
                  className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-sage-deep hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
                >
                  Import latest lessons
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-sage-deep md:text-5xl">
                Review queue
              </h2>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-charcoal/76">
                These records are private until they are published. The AI and
                YouTube workers will attach transcripts, clip boundaries,
                generated artwork, and public video links to this same queue.
              </p>
            </div>
            <p className="text-sm font-bold text-muted">{lessons.length} lessons</p>
          </div>

          <div className="grid gap-5">
            {lessons.map((lesson) => (
              <ReviewCard
                key={lesson.id}
                lesson={lesson}
                writable={databaseStatus.writable && Boolean(dbLessons)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
        active ? "bg-sage-muted text-sage-deep" : "bg-rose-muted text-rose-dark"
      }`}
    >
      {active ? "Ready" : "Missing"}: {label}
    </span>
  );
}

function ReviewCard({
  lesson,
  writable,
}: {
  lesson: TeachingAdminLesson;
  writable: boolean;
}) {
  return (
    <article className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm lg:grid-cols-[220px_1fr_320px]">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-sage-muted">
        <Image src={lesson.artwork} alt="" fill sizes="220px" className="object-cover" />
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
              statusClasses[lesson.approvalStatus]
            }`}
          >
            {statusLabels[lesson.approvalStatus]}
          </span>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
            {lesson.type}
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-bold text-sage-deep">{lesson.title}</h3>
        <p className="mt-2 text-sm font-semibold text-muted">
          {lesson.speaker} | {formatDate(lesson.date)}
          {lesson.service ? ` | ${lesson.service}` : ""}
        </p>
        <p className="mt-3 text-sm leading-6 text-charcoal/72">{lesson.summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
          <Link href={`/sermons/${lesson.slug}`} className="text-rose hover:text-rose-dark">
            Preview public page
          </Link>
          <a
            href={lesson.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-deep hover:text-sage-dark"
          >
            Open source
          </a>
        </div>
      </div>
      <div className="rounded-2xl bg-cream p-5">
        <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-sage-deep">
          Review actions
        </h4>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>Transcript: {lesson.transcript ? "attached" : "pending"}</li>
          <li>Clip: {lesson.durationSeconds ? "timed" : "pending"}</li>
          <li>Artwork prompt: {lesson.ai.artworkPrompt ? "ready" : "pending"}</li>
          <li>YouTube: {youtubeStatusLabels[lesson.youtubeUploadStatus]}</li>
          <li>Published: {lesson.publishedAt ? formatDate(lesson.publishedAt) : "no"}</li>
        </ul>
        <div className="mt-5 grid gap-2">
          <ActionForm
            action={prepareAiReviewAction}
            lessonId={lesson.id}
            label="Prepare AI review"
            disabled={!writable || lesson.approvalStatus === "published"}
          />
          <ActionForm
            action={approveLessonAction}
            lessonId={lesson.id}
            label="Approve"
            disabled={!writable || lesson.approvalStatus === "published"}
          />
          <ActionForm
            action={publishLessonAction}
            lessonId={lesson.id}
            label="Publish"
            primary
            disabled={!writable || lesson.approvalStatus === "published"}
          />
          <ActionForm
            action={queueYoutubeUploadAction}
            lessonId={lesson.id}
            label="Queue YouTube upload"
            disabled={
              !writable ||
              lesson.youtubeUploadStatus === "queued" ||
              lesson.youtubeUploadStatus === "uploaded_private" ||
              lesson.youtubeUploadStatus === "published"
            }
          />
          <YoutubeVideoIdForm
            lessonId={lesson.id}
            disabled={!writable || lesson.youtubeUploadStatus === "published"}
            defaultValue={lesson.youtubeVideoId ?? ""}
          />
          <ActionForm
            action={markYoutubePublishedAction}
            lessonId={lesson.id}
            label="Mark YouTube public"
            disabled={
              !writable ||
              !lesson.youtubeVideoId ||
              lesson.youtubeUploadStatus === "published"
            }
          />
          <ActionForm
            action={archiveLessonAction}
            lessonId={lesson.id}
            label="Archive"
            disabled={!writable || lesson.approvalStatus === "archived"}
          />
        </div>
      </div>
    </article>
  );
}

function YoutubeVideoIdForm({
  lessonId,
  defaultValue,
  disabled,
}: {
  lessonId: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <form action={markYoutubeUploadedAction} className="rounded-xl border border-line bg-white p-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
        YouTube video ID
        <input
          name="youtubeVideoId"
          defaultValue={defaultValue}
          placeholder="abc123XYZ"
          disabled={disabled}
          className="mt-2 min-h-10 w-full rounded-lg border border-line bg-cream px-3 text-sm font-medium text-charcoal outline-none focus:border-sage disabled:opacity-50"
        />
      </label>
      <button
        disabled={disabled}
        className="mt-2 w-full rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-sage-deep hover:bg-sage-muted disabled:cursor-not-allowed disabled:opacity-45 focus-ring"
      >
        Save private upload
      </button>
    </form>
  );
}

function ActionForm({
  action,
  lessonId,
  label,
  primary = false,
  disabled,
}: {
  action: (formData: FormData) => Promise<void>;
  lessonId: string;
  label: string;
  primary?: boolean;
  disabled: boolean;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        disabled={disabled}
        className={`w-full rounded-full px-4 py-2.5 text-sm font-bold focus-ring disabled:cursor-not-allowed disabled:opacity-45 ${
          primary
            ? "bg-sage-deep text-white hover:bg-sage-dark"
            : "border border-line bg-white text-sage-deep hover:bg-sage-muted"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function toPreviewLesson(lesson: Lesson): TeachingAdminLesson {
  return {
    ...lesson,
    approvalStatus: "imported",
    youtubeUploadStatus: "not_requested",
    youtubeVisibility: null,
    youtubeUrl: lesson.youtubeVideoId ? `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}` : null,
    youtubeUploadedAt: null,
    youtubePublishedAt: null,
    updatedAt: null,
    publishedAt: null,
  };
}
