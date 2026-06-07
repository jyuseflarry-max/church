import Image from "next/image";
import Link from "next/link";
import { church, distinctives, images, nextSteps, serviceTimes } from "./site-content";

const visitHighlights = [
  "Come as you are",
  "Kids classes at 9:00 AM",
  "A cappella worship",
  "Communion every Sunday",
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
    <section className="relative overflow-hidden">
      <div className="container-wide grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 md:grid-cols-[0.95fr_1.05fr] md:py-16">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold leading-[1.03] text-sage-deep sm:text-5xl md:text-7xl md:leading-[0.98]">
            A church family in the Fulshear area learning to follow Jesus together.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/78">
            Simple worship. Bible-centered teaching. Real community. You are
            welcome here, whether you have followed Jesus for years or are just
            beginning to ask questions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/plan-a-visit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-deep px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-sage-dark focus-ring"
            >
              Plan Your Visit
              <ArrowIcon />
            </Link>
            <Link
              href={church.livestreamUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-base font-bold text-sage-deep transition-colors hover:border-sage-light hover:bg-sage-muted focus-ring"
            >
              Watch Online
            </Link>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-line bg-white/88 p-4 shadow-sm sm:grid-cols-2">
            {serviceTimes.slice(0, 2).map((item) => (
              <div key={item.label}>
                <div className="text-2xl font-bold text-sage-deep">{item.time}</div>
                <div className="text-sm font-semibold text-muted">{item.label}</div>
              </div>
            ))}
            <a
              href={church.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-2 text-sm font-semibold text-sage-deep underline decoration-sage-light/60 hover:text-rose"
            >
              {church.address}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage-muted soft-shadow md:aspect-[5/6]">
            <Image
              src={images.arrival}
              alt="Families arriving at church on Sunday morning"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-line md:left-auto md:w-72">
            <p className="font-serif text-2xl font-bold leading-tight text-sage-deep">
              You will know what to expect before you arrive.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              No pressure, no spotlight, and no need to know the rules first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickVisit() {
  return (
    <section className="border-y border-line bg-white">
      <div className="container-wide grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          {visitHighlights.map((item) => (
            <span key={item} className="rounded-full bg-cream px-4 py-2 text-sm font-semibold text-sage-deep">
              {item}
            </span>
          ))}
        </div>
        <Link
          href="/plan-a-visit#first-sunday"
          className="inline-flex items-center gap-2 text-sm font-bold text-rose hover:text-rose-dark"
        >
          See what happens Sunday
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function ExpectSection() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.worship}
            alt="A congregation singing together during simple Sunday worship"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Simple worship centered on Jesus.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/78">
            Our Sunday gathering is simple on purpose. We sing together, pray,
            share communion, and hear a message from Scripture. You are welcome
            to participate as much or as little as you feel comfortable.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {distinctives.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-xl font-bold text-sage-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilySection() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide grid gap-12 md:grid-cols-[1fr_0.95fr] md:items-center">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            A steady place for your family to grow.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/78">
            We know parents want more than a program. They want their children
            to be safe, known, and rooted in Scripture. Kids and students have
            age-appropriate Bible classes with caring volunteers who are glad
            to help your first Sunday feel easy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ministries/kids" className="rounded-full bg-sage-deep px-5 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring">
              Kids Ministry
            </Link>
            <Link href="/ministries/youth" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-sage-deep hover:bg-sage-muted focus-ring">
              Youth Ministry
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.kids}
            alt="Children learning in a supervised Bible class"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function NextSteps() {
  return (
    <section className="section-pad bg-sage-deep text-white">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Start where you are.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/72">
            You do not have to figure everything out before you come near. Pick
            the next step that makes sense, and we will meet you there.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-2xl border border-white/12 bg-white/[0.06] p-6 transition-colors hover:bg-white/[0.1] focus-ring"
            >
              <h3 className="text-2xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{step.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-rose-light group-hover:text-white">
                {step.cta}
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center">
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
            In a fast-growing area, people still need something steady.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/78">
            Fulshear and Katy are growing quickly. We believe people still need
            Jesus, Scripture, and a church family that knows their name. We are
            here for neighbors in Fulshear, Katy, Brookshire, Simonton,
            Richmond, and west Houston.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark focus-ring"
          >
            Learn who we are
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickVisit />
      <ExpectSection />
      <FamilySection />
      <NextSteps />
      <LocalSection />
    </>
  );
}
