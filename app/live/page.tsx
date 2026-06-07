import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { church, images, serviceTimes } from "../site-content";
import { formatDate, getFeaturedLesson } from "../sermons/data";

export const metadata: Metadata = {
  title: "Livestream",
  description:
    "Watch the Sunday worship livestream from Fulshear Church of Christ, or catch up with recent Bible teaching.",
};

export const revalidate = 3600;

const embedUrl = process.env.NEXT_PUBLIC_LIVESTREAM_EMBED_URL;
const watchUrl = process.env.NEXT_PUBLIC_LIVESTREAM_WATCH_URL ?? "/sermons";

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

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.75v12.5L18.5 12 8 5.75Z" />
    </svg>
  );
}

function LivestreamFrame() {
  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-black shadow-2xl">
        <iframe
          src={embedUrl}
          title={`${church.name} livestream`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-sage-deep shadow-2xl">
      <div className="relative aspect-[4/5] sm:aspect-video">
        <Image
          src={images.worship}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-deep via-sage-deep/58 to-sage-deep/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sage-deep shadow-xl">
            <PlayIcon className="h-8 w-8 translate-x-0.5" />
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:mt-6 md:text-6xl">
            Worship with us live on Sunday.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/74 sm:mt-4 md:text-lg">
            The livestream is the online front door for Sunday worship at 10:00 AM.
            If the stream is not active yet, recent teaching is ready below.
          </p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-sage-deep py-12 text-white md:py-[4.5rem]">
      <div className="container-wide grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
        <div>
          <LivestreamFrame />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={watchUrl}
              target={watchUrl.startsWith("/") ? undefined : "_blank"}
              rel={watchUrl.startsWith("/") ? undefined : "noopener noreferrer"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-sage-deep hover:bg-cream focus-ring"
            >
              Open Stream
              <ArrowIcon />
            </a>
            <Link
              href="/sermons"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 focus-ring"
            >
              Teaching Library
            </Link>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-white/12 bg-white/[0.07] p-6">
          <h2 className="text-3xl font-bold leading-tight">Sunday online</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Join worship from home, while traveling, or as a first step before
            visiting in person.
          </p>
          <div className="mt-7 space-y-3">
            {serviceTimes.slice(0, 2).map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/[0.08] p-4">
                <p className="text-2xl font-bold">{item.time}</p>
                <p className="mt-1 text-sm font-semibold text-white/68">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 border-t border-white/12 pt-6">
            <h3 className="font-sans text-sm font-bold uppercase tracking-[0.16em]">
              Need help?
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              If the stream does not start, refresh the page near 10:00 AM or
              open the teaching library to watch the latest message.
            </p>
            <a
              href={`mailto:${church.email}`}
              className="mt-4 inline-flex text-sm font-bold text-rose-light hover:text-white"
            >
              {church.email}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

async function LatestTeaching() {
  const lesson = await getFeaturedLesson();

  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            When we are not live, start with the latest lesson.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Our teaching library keeps recent sermons, Bible classes, and study
            series available throughout the week.
          </p>
          <Link
            href="/sermons"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
          >
            Browse all teaching
            <ArrowIcon />
          </Link>
        </div>

        {lesson ? (
          <article className="overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-sm">
            <Link href={`/sermons/${lesson.slug}`} className="relative block aspect-video bg-sage-muted focus-ring">
              <Image
                src={lesson.artwork}
                alt=""
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/72 to-transparent" />
              <div className="absolute bottom-5 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sage-deep">
                <PlayIcon />
              </div>
            </Link>
            <div className="p-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-rose">
                Latest lesson
              </p>
              <h3 className="mt-2 text-3xl font-bold leading-tight text-sage-deep">
                <Link href={`/sermons/${lesson.slug}`} className="hover:text-rose">
                  {lesson.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm font-semibold text-muted">
                {lesson.speaker} <span aria-hidden="true">&middot;</span> {formatDate(lesson.date)}
              </p>
              <p className="mt-4 text-sm leading-6 text-charcoal/72">{lesson.summary}</p>
            </div>
          </article>
        ) : (
          <div className="rounded-[1.75rem] border border-line bg-white p-8 shadow-sm">
            <h3 className="text-3xl font-bold text-sage-deep">Teaching is coming soon.</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              The teaching library will appear here once lessons are published.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function VisitInvite() {
  return (
    <section className="bg-cream py-14">
      <div className="container-wide grid gap-6 rounded-[1.5rem] border border-line bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <h2 className="text-3xl font-bold text-sage-deep">Ready to come in person?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            If watching online helps you take the first step, we would be glad
            to welcome you on campus whenever you are ready.
          </p>
        </div>
        <Link
          href="/plan-a-visit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark focus-ring"
        >
          Plan your visit
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

export default function LivePage() {
  return (
    <>
      <Hero />
      <LatestTeaching />
      <VisitInvite />
    </>
  );
}
