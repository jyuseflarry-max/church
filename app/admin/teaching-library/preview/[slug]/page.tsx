import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDuration } from "../../../../sermons/data";
import { getTeachingAdminLessonBySlug } from "../../../../sermons/database";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeachingLessonPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = await getTeachingAdminLessonBySlug(slug);
  if (!lesson) notFound();

  const duration = formatDuration(lesson.durationSeconds);

  return (
    <main className="section-pad bg-cream">
      <div className="container-wide">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/teaching-library"
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-sage-deep hover:bg-sage-muted focus-ring"
          >
            Back to review queue
          </Link>
          {lesson.approvalStatus === "published" && (
            <Link
              href={`/sermons/${lesson.slug}`}
              className="rounded-full bg-sage-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
            >
              Open public page
            </Link>
          )}
        </div>

        <section className="overflow-hidden rounded-[1.75rem] border border-line bg-white soft-shadow">
          <div className="relative aspect-[16/7] min-h-[320px] bg-sage-deep">
            <Image src={lesson.artwork} alt="" fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/85 via-sage-deep/25 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
                Admin preview
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
                {lesson.title}
              </h1>
              <p className="mt-3 text-lg font-semibold text-white/82">
                {lesson.speaker} | {formatDate(lesson.date)}
                {lesson.service ? ` | ${lesson.service}` : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-bold text-sage-deep">Listen</h2>
              {lesson.audioUrl ? (
                <audio controls src={lesson.audioUrl} className="mt-4 w-full">
                  <a href={lesson.audioUrl}>Download audio</a>
                </audio>
              ) : (
                <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-muted">
                  Audio has not been attached yet.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-deep">Watch</h2>
              {lesson.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
                  title={lesson.title}
                  className="mt-4 aspect-video w-full rounded-xl bg-sage-deep"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : lesson.vimeoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${lesson.vimeoId}`}
                  title={lesson.title}
                  className="mt-4 aspect-video w-full rounded-xl bg-sage-deep"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  allowFullScreen
                />
              ) : (
                <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-muted">
                  Video has not been attached yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Status", lesson.approvalStatus],
            ["Type", lesson.type],
            ["Duration", duration || "Pending clip"],
            ["Published", lesson.publishedAt ? formatDate(lesson.publishedAt) : "No"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">{label}</p>
              <p className="mt-2 text-lg font-bold text-sage-deep">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-line bg-white p-6 md:p-8">
          <h2 className="text-3xl font-bold text-sage-deep">Transcript</h2>
          {lesson.transcript ? (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-charcoal/82">
              {lesson.transcript}
            </p>
          ) : (
            <p className="mt-4 rounded-xl bg-cream p-4 text-sm leading-6 text-muted">
              Transcript pending.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
