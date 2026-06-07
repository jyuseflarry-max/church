import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildCollections, formatDate, getAllLessons } from "../data";

export const metadata: Metadata = {
  title: "Teaching Collections",
  description:
    "Browse sermon series, Wednesday lessons, Bible classes, years, and grouped teaching collections from Fulshear Church of Christ.",
};

export const revalidate = 3600;

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

export default async function CollectionsPage() {
  const lessons = await getAllLessons();
  const collections = buildCollections(lessons);

  return (
    <>
      <section className="section-pad bg-sage-deep text-white">
        <div className="container-wide max-w-4xl">
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Teaching Collections
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/76">
            Follow a sermon series, Wednesday study, service stream, or year of
            teaching in one place.
          </p>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.slug}
                href={`/sermons/collections/${collection.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-ring"
              >
                <div className="relative aspect-video">
                  <Image
                    src={collection.artwork}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/74 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-light">
                      {collection.type}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold leading-tight text-white">
                      {collection.title}
                    </h2>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-muted">{collection.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-sage-deep">
                      {collection.lessonCount} lessons
                    </p>
                    <p className="text-xs font-semibold text-muted">
                      Updated {formatDate(collection.latestDate)}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose group-hover:text-rose-dark">
                    Open collection
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
