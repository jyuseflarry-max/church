import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllLessons } from "../../sermons/data";

export const metadata: Metadata = {
  title: "Teaching Library Review",
  description:
    "AI-assisted review workflow for sermon clips, transcripts, metadata, and artwork.",
};

export const revalidate = 3600;

const workflowSteps = [
  {
    title: "Import from Congregate",
    body: "Pull new full-service or lesson media, source links, titles, speakers, dates, and available audio/video URLs.",
  },
  {
    title: "AI breakdown",
    body: "Transcribe the full recording, suggest sermon boundaries, title, Scripture, summary, topics, collection, and artwork prompt.",
  },
  {
    title: "Your approval",
    body: "Preview the suggested clip, adjust start/end times, edit transcript and metadata, approve artwork, then publish.",
  },
  {
    title: "Public release",
    body: "Generate the clipped audio/video, final transcript, artwork, lesson page, and collection placement automatically after approval.",
  },
];

export default async function TeachingLibraryAdminPage() {
  const lessons = await getAllLessons();
  const pending = lessons.slice(0, 8);

  return (
    <>
      <section className="section-pad bg-sage-deep text-white">
        <div className="container-wide max-w-4xl">
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Teaching Library Review
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/76">
            This is the approval workflow for AI-assisted sermon clipping,
            transcripts, metadata, and artwork. It should be protected by
            authentication before being linked publicly.
          </p>
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
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-sage-deep md:text-5xl">
              Pending AI review
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-charcoal/76">
              These are sample imported lessons from Congregate. The next
              backend layer will attach real AI-generated clip boundaries,
              transcripts, and generated artwork variants to this review screen.
            </p>
          </div>

          <div className="grid gap-5">
            {pending.map((lesson) => (
              <article key={lesson.id} className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm lg:grid-cols-[220px_1fr_280px]">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-sage-muted">
                  <Image src={lesson.artwork} alt="" fill sizes="220px" className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose">
                    {lesson.status} · needs approval
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-sage-deep">{lesson.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-muted">
                    {lesson.speaker} · {lesson.type}
                    {lesson.service ? ` · ${lesson.service}` : ""}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-charcoal/72">
                    {lesson.summary}
                  </p>
                </div>
                <div className="rounded-2xl bg-cream p-5">
                  <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-sage-deep">
                    AI package
                  </h4>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    <li>Clip start/end: pending</li>
                    <li>Transcript: pending</li>
                    <li>Artwork prompt: ready</li>
                    <li>Collection: suggested from series/service</li>
                  </ul>
                  <Link
                    href={`/sermons/${lesson.slug}`}
                    className="mt-5 inline-flex rounded-full bg-sage-deep px-4 py-2 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
                  >
                    Preview page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
