import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  buildCollections,
  filterLessons,
  formatDate,
  formatDuration,
  getAllLessons,
  getFilterOptions,
  type Lesson,
  type LessonFilters,
} from "./data";

export const metadata: Metadata = {
  title: "Teaching Library",
  description:
    "Listen to sermons, Bible classes, Wednesday lessons, and teaching series from Fulshear Church of Christ.",
};

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function stringParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function lessonBlurb(lesson: Lesson) {
  const summary = lesson.summary.replace(/\s+/g, " ").trim();
  if (summary.length <= 180) return summary;
  return `${summary.slice(0, 177).replace(/\s+\S*$/, "")}...`;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.64l-4.16-3.96a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.16-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LessonArtwork({ lesson, priority = false }: { lesson: Lesson; priority?: boolean }) {
  return (
    <Image
      src={lesson.artwork}
      alt=""
      fill
      priority={priority}
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  );
}

function Hero({ featured }: { featured: Lesson | null }) {
  return (
    <section className="section-pad bg-sage-deep text-white">
      <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Teaching Library
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/76">
            Listen to recent sermons, Bible classes, Wednesday lessons, and study
            series from Fulshear Church of Christ.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-sage-deep hover:bg-cream focus-ring"
            >
              Browse lessons
              <ArrowIcon />
            </a>
            <Link
              href="/sermons/collections"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10 focus-ring"
            >
              View collections
            </Link>
          </div>
        </div>

        {featured && (
          <article className="overflow-hidden rounded-[1.75rem] bg-white text-charcoal soft-shadow">
            <div className="relative aspect-video">
              <LessonArtwork lesson={featured} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/75 via-sage-deep/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
                  Latest lesson
                </p>
                <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl">
                  {featured.title}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-muted">
                {featured.speaker} · {formatDate(featured.date)}
                {featured.scripture ? ` · ${featured.scripture}` : ""}
              </p>
              <p className="mt-3 text-sm leading-6 text-charcoal/76">
                {featured.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/sermons/${featured.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-sage-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
                >
                  <PlayIcon />
                  Open lesson
                </Link>
                {featured.audioUrl && (
                  <a
                    href={featured.audioUrl}
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-sage-deep hover:bg-sage-muted focus-ring"
                  >
                    Listen
                  </a>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function CollectionsPreview({ lessons }: { lessons: Lesson[] }) {
  const collections = buildCollections(lessons).slice(0, 3);
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-bold text-sage-deep md:text-5xl">
              Collections
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-charcoal/76">
              Follow a series, study stream, or year without having to piece the
              lessons together yourself.
            </p>
          </div>
          <Link href="/sermons/collections" className="inline-flex items-center gap-2 font-bold text-rose hover:text-rose-dark">
            All collections
            <ArrowIcon />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/sermons/collections/${collection.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-ring"
            >
              <div className="relative aspect-video">
                <Image src={collection.artwork} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold leading-tight text-white">{collection.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-muted">{collection.description}</p>
                <p className="mt-4 text-sm font-bold text-sage-deep">
                  {collection.lessonCount} lessons
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterForm({
  filters,
  options,
}: {
  filters: LessonFilters;
  options: ReturnType<typeof getFilterOptions>;
}) {
  return (
    <form id="browse" className="rounded-[1.5rem] border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(5,1fr)_0.8fr]">
        <label className="flex flex-col gap-2 text-sm font-bold text-sage-deep">
          Search
          <input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Title, speaker, scripture, topic"
            className="min-h-11 rounded-xl border border-line bg-cream px-4 text-sm font-medium text-charcoal outline-none focus:border-sage"
          />
        </label>
        <Select label="Type" name="type" value={filters.type} options={options.types} />
        <Select label="Service" name="service" value={filters.service} options={options.services} />
        <Select label="Speaker" name="speaker" value={filters.speaker} options={options.speakers} />
        <Select label="Series" name="series" value={filters.series} options={options.series} />
        <Select label="Year" name="year" value={filters.year} options={options.years.map((year) => ({ label: year, value: year }))} />
        <label className="flex flex-col gap-2 text-sm font-bold text-sage-deep">
          Sort
          <select
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className="min-h-11 rounded-xl border border-line bg-cream px-3 text-sm font-medium text-charcoal outline-none focus:border-sage"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-sm font-bold text-sage-deep">
            <input
              type="radio"
              name="view"
              value="cards"
              defaultChecked={(filters.view ?? "cards") === "cards"}
              className="accent-sage-deep"
            />
            Cards
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-sm font-bold text-sage-deep">
            <input
              type="radio"
              name="view"
              value="list"
              defaultChecked={filters.view === "list"}
              className="accent-sage-deep"
            />
            List
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-sage-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-sage-dark focus-ring">
            Apply filters
          </button>
          <Link href="/sermons#browse" className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-sage-deep hover:bg-sage-muted focus-ring">
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function Select({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-sage-deep">
      {label}
      <select
        name={name}
        defaultValue={value ?? "all"}
        className="min-h-11 rounded-xl border border-line bg-cream px-3 text-sm font-medium text-charcoal outline-none focus:border-sage"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LessonList({ lessons, view }: { lessons: Lesson[]; view: "cards" | "list" }) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-sage-deep">No lessons matched those filters.</h2>
        <p className="mt-2 text-muted">Try a broader search or reset the filters.</p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {lessons.map((lesson) => {
          const duration = formatDuration(lesson.durationSeconds);
          return (
            <Link
              key={lesson.id}
              href={`/sermons/${lesson.slug}`}
              className="grid gap-3 border-b border-line p-4 last:border-b-0 hover:bg-cream focus-ring md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-rose">
                  <span>{lesson.type}</span>
                  {lesson.service && <span>{lesson.service}</span>}
                  {lesson.series && <span>{lesson.series}</span>}
                </div>
                <h2 className="mt-1 text-xl font-bold leading-tight text-sage-deep">{lesson.title}</h2>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {lesson.speaker} | {formatDate(lesson.date)}
                  {duration ? ` | ${duration}` : ""}
                </p>
                <p className="mt-2 text-sm leading-6 text-charcoal/72">{lessonBlurb(lesson)}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-sage-deep">
                Open <ArrowIcon />
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {lessons.map((lesson) => {
        const duration = formatDuration(lesson.durationSeconds);
        return (
          <article key={lesson.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <Link href={`/sermons/${lesson.slug}`} className="relative block aspect-video bg-sage-muted focus-ring">
              <LessonArtwork lesson={lesson} />
            </Link>
            <div className="p-5">
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-rose">
                <span>{lesson.type}</span>
                {lesson.service && <span>{lesson.service}</span>}
                {lesson.series && <span>{lesson.series}</span>}
              </div>
              <h2 className="mt-2 text-xl font-bold leading-tight text-sage-deep">
                <Link href={`/sermons/${lesson.slug}`} className="hover:text-rose">
                  {lesson.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted">
                {lesson.speaker} | {formatDate(lesson.date)}
                {duration ? ` | ${duration}` : ""}
              </p>
              <p className="mt-3 text-sm leading-6 text-charcoal/72">{lessonBlurb(lesson)}</p>
              <Link
                href={`/sermons/${lesson.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sage-deep hover:text-rose"
              >
                Open lesson
                <ArrowIcon />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
export default async function SermonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: LessonFilters = {
    q: stringParam(params.q),
    type: stringParam(params.type),
    service: stringParam(params.service),
    speaker: stringParam(params.speaker),
    series: stringParam(params.series),
    year: stringParam(params.year),
    sort: stringParam(params.sort) === "oldest" ? "oldest" : "newest",
    view: stringParam(params.view) === "list" ? "list" : "cards",
  };

  const lessons = await getAllLessons();
  const featured = lessons[0] ?? null;
  const visibleLessons = filterLessons(lessons, filters);
  const options = getFilterOptions(lessons);

  return (
    <>
      <Hero featured={featured} />
      <CollectionsPreview lessons={lessons} />
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-sage-deep md:text-5xl">
                Browse all lessons
              </h2>
              <p className="mt-3 text-lg leading-8 text-charcoal/76">
                Search by date, speaker, scripture, topic, type, or series.
              </p>
            </div>
            <p className="text-sm font-bold text-muted">
              Showing {visibleLessons.length} of {lessons.length}
            </p>
          </div>
          <FilterForm filters={filters} options={options} />
          <div className="mt-8">
            <LessonList lessons={visibleLessons.slice(0, 60)} view={filters.view ?? "cards"} />
          </div>
        </div>
      </section>
    </>
  );
}

