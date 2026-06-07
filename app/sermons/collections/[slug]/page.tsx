import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  formatDuration,
  getAllLessons,
  getCollectionBySlug,
  type Lesson,
} from "../../data";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lessons = await getAllLessons();
  const collection = getCollectionBySlug(lessons, slug);
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.title,
    description: collection.description,
  };
}

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const duration = formatDuration(lesson.durationSeconds);
  return (
    <article className="grid gap-5 rounded-2xl border border-line bg-white p-4 shadow-sm md:grid-cols-[72px_180px_1fr_auto] md:items-center">
      <div className="font-serif text-4xl font-bold text-rose-light">
        {String(index + 1).padStart(2, "0")}
      </div>
      <Link href={`/sermons/${lesson.slug}`} className="relative aspect-video overflow-hidden rounded-xl bg-sage-muted focus-ring">
        <Image src={lesson.artwork} alt="" fill sizes="180px" className="object-cover" />
      </Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose">
          {lesson.type}
          {lesson.service ? ` · ${lesson.service}` : ""}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-sage-deep">
          <Link href={`/sermons/${lesson.slug}`} className="hover:text-rose">
            {lesson.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted">
          {lesson.speaker} · {formatDate(lesson.date)}
          {duration ? ` · ${duration}` : ""}
        </p>
      </div>
      <Link
        href={`/sermons/${lesson.slug}`}
        className="rounded-full bg-sage-deep px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-sage-dark focus-ring"
      >
        Open
      </Link>
    </article>
  );
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const lessons = await getAllLessons();
  const collection = getCollectionBySlug(lessons, slug);
  if (!collection) notFound();

  const orderedLessons =
    collection.type === "series"
      ? [...collection.lessons].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
      : collection.lessons;

  return (
    <>
      <section className="relative overflow-hidden bg-sage-deep text-white">
        <div className="absolute inset-0">
          <Image src={collection.artwork} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-sage-deep/70" />
        </div>
        <div className="container-wide relative z-10 py-20 md:py-28">
          <Link href="/sermons/collections" className="text-sm font-bold text-rose-light hover:text-white">
            Back to collections
          </Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
            {collection.type} collection
          </p>
          <h1 className="mt-3 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            {collection.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/76">
            {collection.description}
          </p>
          <p className="mt-6 text-sm font-bold text-white/80">
            {collection.lessonCount} lessons · Updated {formatDate(collection.latestDate)}
          </p>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="grid gap-4">
            {orderedLessons.map((lesson, index) => (
              <LessonRow key={lesson.id} lesson={lesson} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
