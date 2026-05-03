import type { Metadata } from "next";
import Link from "next/link";
import { getRecentSermons, type Sermon } from "./data";

export const metadata: Metadata = {
  title: "Sermons",
  description:
    "Recent sermons from Fulshear Church of Christ — watch or listen to messages preached at our gatherings.",
};

// ISR: regenerate this page at most once an hour.
export const revalidate = 3600;

const SHOWCASE_LIMIT = 9;
const ARCHIVE_URL = "https://fulshearcoc-org.us.stackstaging.com/sermons/";
const PODCAST_URL =
  "https://westparkchurchofchrist.congregatecloud.com/lessons/all-lessons/podcast";

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function PageHero() {
  return (
    <section className="relative overflow-hidden bg-sage-deep py-20 md:py-28">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #2F5247 0%, #4D7770 50%, #C97A7C 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          Recent Messages
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Sermons
        </h1>
        <p className="font-serif text-white text-xl md:text-2xl italic leading-relaxed max-w-2xl mx-auto">
          Catch up on what we&apos;ve been studying together.
        </p>
      </div>
    </section>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function SermonCard({ sermon }: { sermon: Sermon }) {
  const watchUrl = sermon.vimeoId
    ? `https://vimeo.com/${sermon.vimeoId}`
    : sermon.link;
  const duration = formatDuration(sermon.durationSeconds);

  return (
    <article className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-sage-muted shadow-sm hover:shadow-lg hover:border-sage-light transition-all">
      {/* Thumbnail / gradient placeholder */}
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-video overflow-hidden"
        aria-label={`Watch ${sermon.title}`}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #2F5247 0%, #4D7770 55%, #C97A7C 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 65% 50%, rgba(228,168,170,0.25) 0%, transparent 65%)",
          }}
        />
        {sermon.series && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 text-rose-light text-[10px] font-semibold tracking-[0.2em] uppercase">
              <span aria-hidden className="inline-block w-4 h-px bg-rose-light/60" />
              {sermon.series}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-sage-deep rounded-full w-14 h-14 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </a>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-serif font-bold text-sage-deep text-lg leading-snug mb-2 group-hover:text-rose transition-colors">
          <a href={watchUrl} target="_blank" rel="noopener noreferrer">
            {sermon.title}
          </a>
        </h2>

        <div className="text-sm text-charcoal mb-1">
          <span className="font-medium">{sermon.speaker}</span>
        </div>

        <div className="text-xs text-muted mb-4 flex flex-wrap gap-x-2 gap-y-0.5">
          <span>{formatDate(sermon.date)}</span>
          {sermon.service && (
            <>
              <span aria-hidden>·</span>
              <span>{sermon.service}</span>
            </>
          )}
          {duration && (
            <>
              <span aria-hidden>·</span>
              <span>{duration}</span>
            </>
          )}
        </div>

        {/* Action pills */}
        <div className="mt-auto flex flex-wrap gap-2">
          {sermon.vimeoId && (
            <a
              href={`https://vimeo.com/${sermon.vimeoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-sage text-white hover:bg-sage-dark transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch
            </a>
          )}
          {sermon.audioUrl && (
            <a
              href={sermon.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-sage-muted text-sage-dark hover:bg-sage hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z" />
              </svg>
              Listen
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Empty state ───────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-10 text-center border border-sage-muted">
      <p className="font-serif text-sage-deep text-xl mb-2">
        Sermons aren&apos;t loading right now.
      </p>
      <p className="text-muted text-sm mb-6">
        You can still browse the full archive on our legacy site.
      </p>
      <a
        href={ARCHIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-rose text-white font-semibold px-6 py-3 rounded-full hover:bg-rose-dark transition-colors"
      >
        Open the Sermon Archive
      </a>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default async function SermonsPage() {
  const sermons = await getRecentSermons(SHOWCASE_LIMIT);

  return (
    <>
      <PageHero />

      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {sermons.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sermons.map((s) => (
                  <SermonCard key={s.id} sermon={s} />
                ))}
              </div>

              <p className="text-xs text-muted text-center mt-10">
                Showing the {sermons.length} most recent sermons. Updated hourly.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Subscribe + members archive callout */}
      <section className="bg-warm-white py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-7 border border-sage-muted">
            <p className="text-rose text-xs font-semibold tracking-widest uppercase mb-2">
              Subscribe
            </p>
            <h3 className="font-serif text-sage-deep text-xl font-bold mb-3">
              Listen on Your Favorite Podcast App
            </h3>
            <p className="text-sm text-charcoal mb-4 leading-relaxed">
              New sermons land in our podcast feed automatically.
            </p>
            <a
              href={PODCAST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sage font-semibold text-sm hover:text-sage-dark transition-colors"
            >
              Get the RSS feed
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.75 3a.75.75 0 0 0 0 1.5c7.18 0 13 5.82 13 13a.75.75 0 0 0 1.5 0C18.25 9.582 11.668 3 3.75 3Z" />
                <path d="M3 9.75A.75.75 0 0 1 3.75 9c4.832 0 8.75 3.918 8.75 8.75a.75.75 0 0 1-1.5 0A7.25 7.25 0 0 0 3.75 10.5.75.75 0 0 1 3 9.75ZM5.5 16a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </a>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-sage-muted">
            <p className="text-rose text-xs font-semibold tracking-widest uppercase mb-2">
              Looking for Older Sermons?
            </p>
            <h3 className="font-serif text-sage-deep text-xl font-bold mb-3">
              The Full Archive Is in the Member Portal
            </h3>
            <p className="text-sm text-charcoal mb-4 leading-relaxed">
              Members can search every sermon by speaker, series, or year. In
              the meantime, you can browse the public archive here.
            </p>
            <a
              href={ARCHIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sage font-semibold text-sm hover:text-sage-dark transition-colors"
            >
              Browse the public archive
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
