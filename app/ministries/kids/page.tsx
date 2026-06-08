import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { church, images } from "../../site-content";

export const metadata: Metadata = {
  title: "Kids Ministry",
  description:
    "Kids Ministry at Fulshear Church of Christ: age-grouped Bible classes from nursery through 5th grade, plus VBS, Trunk or Treat, and Easter egg hunts.",
};

const ageGroups = [
  {
    range: "Nursery",
    ages: "0-2 years",
    body: "A safe, loving space for our littlest ones with gentle care, soft songs, and simple reminders that God made them and loves them.",
  },
  {
    range: "Pre-K",
    ages: "3-5 years",
    body: "Big Bible stories told in small, hands-on ways through songs, simple crafts, and the basics of who God is.",
  },
  {
    range: "K-2nd Grade",
    ages: "Early elementary",
    body: "Children begin connecting the people, places, and promises of Scripture as they learn the story God is telling.",
  },
  {
    range: "3rd-5th Grade",
    ages: "Older elementary",
    body: "Deeper Bible study, honest questions, and real friendships as kids start growing into a faith they can carry with them.",
  },
];

const events = [
  {
    title: "Vacation Bible School",
    body: "A full week of Scripture, songs, games, crafts, and friends for kids across our church and community.",
  },
  {
    title: "Trunk or Treat",
    body: "An easy October evening with decorated trunks, candy, and a warm invitation for neighbors and friends.",
  },
  {
    title: "Easter Egg Hunts",
    body: "A joyful spring gathering with snacks, hundreds of eggs, and the hope of the resurrection at the center.",
  },
];

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

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sage-deep text-white">
      <div className="container-wide grid gap-10 py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-light">
            Nursery through 5th grade
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
            A steady place for kids to know Jesus.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
            We want every child to be safe, known, loved, and rooted in the
            story of Scripture. Kids classes meet while adults study, so the
            whole family can grow together.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/plan-a-visit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-sage-deep hover:bg-cream focus-ring"
            >
              Plan Your Visit
              <ArrowIcon />
            </Link>
            <a
              href={`mailto:${church.email}?subject=Kids%20Ministry`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 focus-ring"
            >
              Ask a Question
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.kids}
            alt="Children learning in a supervised Bible class"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function MeetingTimes() {
  return (
    <section className="-mt-8 relative z-10">
      <div className="container-wide rounded-[1.5rem] border border-line bg-white p-5 shadow-xl">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Sunday Bible Class", "9:00 AM"],
            ["Wednesday Bible Class", "7:00 PM"],
          ].map(([label, time]) => (
            <div key={label} className="rounded-2xl bg-cream p-5">
              <p className="text-2xl font-bold text-sage-deep">{time}</p>
              <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Heart() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            More than childcare. A real beginning.
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-8 text-charcoal/76">
          <p>
            Childhood is when faith begins to take root. Our volunteers build
            classes around Scripture itself: stories, songs, crafts, and
            conversations that help children see God, trust Jesus, and know
            they belong in the church family.
          </p>
          <p>
            Parents are welcome to ask questions, meet teachers, and walk a
            child to class. We want your first Sunday to feel calm and clear.
          </p>
        </div>
      </div>
    </section>
  );
}

function AgeGroups() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Classes for every age.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Children are grouped by age and grade so they can learn at a pace
            that fits the way they grow.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {ageGroups.map((group, index) => (
            <article key={group.range} className="rounded-2xl border border-line bg-white p-6">
              <p className="font-serif text-4xl font-bold text-rose-light">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-bold text-sage-deep">{group.range}</h3>
                <p className="shrink-0 text-sm font-bold text-sage">{group.ages}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{group.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeyondSunday() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.fellowship}
            alt="People visiting together after worship in a church lobby"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Big moments kids remember.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/76">
            Throughout the year, we make room for the kinds of simple,
            joyful gatherings that help children invite friends and feel at
            home with the church family.
          </p>
          <div className="mt-8 grid gap-4">
            {events.map((event) => (
              <article key={event.title} className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-xl font-bold text-sage-deep">{event.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{event.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="bg-sage-deep py-14 text-center text-white">
      <div className="container-wide">
        <h2 className="text-3xl font-bold md:text-4xl">
          We would love to help your family visit.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/72">
          Send a question or let us know you are coming, and someone will help
          you find the right class when you arrive.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/plan-a-visit" className="rounded-full bg-white px-6 py-3 font-bold text-sage-deep hover:bg-cream focus-ring">
            Plan Your Visit
          </Link>
          <a href={`mailto:${church.email}?subject=Kids%20Ministry`} className="rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10 focus-ring">
            Email Kids Ministry
          </a>
        </div>
      </div>
    </section>
  );
}

export default function KidsMinistryPage() {
  return (
    <>
      <Hero />
      <MeetingTimes />
      <Heart />
      <AgeGroups />
      <BeyondSunday />
      <ClosingCTA />
    </>
  );
}
