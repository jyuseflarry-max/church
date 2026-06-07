import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buildCollections,
  formatDate,
  formatDuration,
  getAllLessons,
  getLessonBySlug,
  type Lesson,
} from "../data";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return { title: "Lesson Not Found" };

  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function MediaPanel({ lesson }: { lesson: Lesson }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white soft-shadow">
      <div className="relative aspect-video bg-sage-deep">
        <Image src={lesson.artwork} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/80 via-sage-deep/15 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
            Public sermon clip
          </p>
          <h1 className="mt-2 max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
            {lesson.title}
          </h1>
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <h2 className="text-2xl font-bold text-sage-deep">Listen</h2>
          {lesson.audioUrl ? (
            <audio controls src={lesson.audioUrl} className="mt-4 w-full">
              <a href={lesson.audioUrl}>Download audio</a>
            </audio>
          ) : (
            <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-muted">
              Audio will appear here after the lesson is approved and clipped.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-sage-deep">Watch</h2>
          {lesson.youtubeVideoId ? (
            <div className="mt-4 overflow-hidden rounded-xl bg-sage-deep">
              <iframe
                src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
                title={lesson.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : lesson.videoUrl ? (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-deep px-5 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
            >
              <PlayIcon />
              Open video
            </a>
          ) : (
            <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-muted">
              Video clip will appear here after approval. The full service stays
              in the member archive.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetadataGrid({ lesson }: { lesson: Lesson }) {
  const duration = formatDuration(lesson.durationSeconds);
  const facts = [
    ["Speaker", lesson.speaker],
    ["Date", formatDate(lesson.date)],
    ["Type", lesson.type],
    ["Service", lesson.service || "Not listed"],
    ["Scripture", lesson.scripture || "Pending review"],
    ["Duration", duration || "Pending clip"],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">{label}</p>
          <p className="mt-2 text-lg font-bold text-sage-deep">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Transcript({ lesson }: { lesson: Lesson }) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-white p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-sage-deep">Transcript</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Every public lesson will include an AI-generated transcript after
            approval.
          </p>
        </div>
        <span className="w-fit rounded-full bg-gold-muted px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-sage-deep">
          AI assisted
        </span>
      </div>

      {lesson.transcript ? (
        <div className="prose mt-6 max-w-none text-charcoal">
          <p>{lesson.transcript}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-cream p-6 text-sm leading-7 text-charcoal/76">
          Transcript pending. In the publishing workflow, AI will transcribe the
          full Congregate recording, suggest sermon boundaries, then generate a
          final transcript from the approved public clip.
        </div>
      )}
    </section>
  );
}

function RelatedCollections({ lesson }: { lesson: Lesson }) {
  if (!lesson.series && !lesson.service) return null;

  return (
    <div className="rounded-[1.5rem] border border-line bg-white p-6">
      <h2 className="text-2xl font-bold text-sage-deep">Keep listening</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        {lesson.series && (
          <Link
            href={`/sermons/collections/series-${lesson.series.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
            className="rounded-full bg-sage-muted px-4 py-2 text-sm font-bold text-sage-deep hover:bg-sage-light/40 focus-ring"
          >
            {lesson.series}
          </Link>
        )}
        {lesson.service && (
          <Link
            href={`/sermons/collections/service-${lesson.service.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
            className="rounded-full bg-sage-muted px-4 py-2 text-sm font-bold text-sage-deep hover:bg-sage-light/40 focus-ring"
          >
            {lesson.service}
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();

  const lessons = await getAllLessons();
  const collections = buildCollections(lessons);
  const currentCollection = collections.find(
    (collection) =>
      (lesson.series && collection.title === lesson.series) ||
      (lesson.service && collection.title === lesson.service),
  );
  const collectionLessons = currentCollection?.lessons ?? [];
  const currentIndex = collectionLessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentIndex >= 0 ? collectionLessons[currentIndex + 1] : null;
  const nextLesson = currentIndex > 0 ? collectionLessons[currentIndex - 1] : null;

  return (
    <>
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <MediaPanel lesson={lesson} />

          <div className="mt-8">
            <MetadataGrid lesson={lesson} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <Transcript lesson={lesson} />
            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-line bg-white p-6">
                <h2 className="text-2xl font-bold text-sage-deep">About this lesson</h2>
                <p className="mt-3 text-sm leading-7 text-charcoal/76">{lesson.summary}</p>
                <a
                  href={lesson.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-bold text-rose hover:text-rose-dark"
                >
                  Full source on Congregate
                </a>
              </div>
              <RelatedCollections lesson={lesson} />
              {(previousLesson || nextLesson) && (
                <div className="rounded-[1.5rem] border border-line bg-white p-6">
                  <h2 className="text-2xl font-bold text-sage-deep">Series navigation</h2>
                  <div className="mt-5 space-y-3">
                    {previousLesson && (
                      <Link href={`/sermons/${previousLesson.slug}`} className="block rounded-xl bg-cream p-4 text-sm font-bold text-sage-deep hover:bg-sage-muted">
                        Previous: {previousLesson.title}
                      </Link>
                    )}
                    {nextLesson && (
                      <Link href={`/sermons/${nextLesson.slug}`} className="block rounded-xl bg-cream p-4 text-sm font-bold text-sage-deep hover:bg-sage-muted">
                        Next: {nextLesson.title}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
