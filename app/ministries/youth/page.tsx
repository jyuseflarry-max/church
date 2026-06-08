import type { Metadata } from "next";
import Image from "next/image";
import { church } from "../../site-content";

export const metadata: Metadata = {
  title: "Youth Ministry",
  description:
    "Youth Ministry at Fulshear Church of Christ: Sunday and Wednesday Bible classes, monthly activities, Camp Bandina, area-wide youth meetings, retreats, and leadership conferences.",
};

const weeklyRhythms = [
  {
    day: "Sunday Mornings",
    time: "9:00 AM",
    body: "Bible class with their peers during the same hour as adult classes.",
  },
  {
    day: "Wednesday Evenings",
    time: "7:00 PM",
    body: "A mid-week class that connects real questions, real life, and Scripture.",
  },
];

const bigMoments = [
  {
    title: "Camp Bandina",
    body: "A week away in the Hill Country with Bible study, worship, shared meals, and friendships that often last long after camp ends.",
  },
  {
    title: "Area-Wide Youth Meetings",
    body: "Summer gatherings with other youth groups from Churches of Christ across the region.",
  },
  {
    title: "Youth Retreats",
    body: "Weekend getaways that create space for deeper faith, honest conversation, and time together.",
  },
  {
    title: "Leadership Conferences",
    body: "Training and challenge for students learning to serve, lead, and follow Jesus with courage.",
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
            6th through 12th grade
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
            A place for students to own their faith.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
            Teenagers need room for real questions, steady friendships, and a
            faith that can become their own. Our youth ministry gives them a
            church family to walk with them through those years.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${church.email}?subject=Youth%20Ministry`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-sage-deep hover:bg-cream focus-ring"
            >
              Email Youth Ministry
              <ArrowIcon />
            </a>
            <a
              href={`tel:+1${church.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 focus-ring"
            >
              Call the Office
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src="/kids.jpg"
            alt="Youth Ministry at Fulshear Church of Christ"
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

function Heart() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Faith has to become more than inherited.
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-8 text-charcoal/76">
          <p>
            Middle and high school can be beautiful, awkward, serious, funny,
            and hard all in the same week. We want students to know they are
            not walking through it alone.
          </p>
          <p>
            Our youth ministry is built around Scripture, honest conversation,
            service, and shared life so teenagers can learn what it means to
            follow Jesus when nobody else is choosing for them.
          </p>
        </div>
      </div>
    </section>
  );
}

function WeeklyRhythms() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Weekly Bible classes.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Students meet every week for teaching, questions, and friendship
            centered on Scripture.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {weeklyRhythms.map((rhythm) => (
            <article key={rhythm.day} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-bold text-sage-deep">{rhythm.day}</h3>
                <p className="shrink-0 text-sm font-bold text-sage">{rhythm.time}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{rhythm.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeyondTheBuilding() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Beyond the classroom.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/76">
            Each month, students have opportunities to spend time together
            through service projects, fellowship hangouts, game nights, and
            low-pressure gatherings where friendships can grow naturally.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-2xl font-bold text-sage-deep">
                Monthly youth gatherings
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Students share meals, serve together, play games, and build
                friendships in relaxed settings outside regular class time.
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-2xl font-bold text-sage-deep">
                Adopt a Grandparent
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Youth members adopt a wiser member of the congregation to
                connect with throughout the year, building friendships across
                generations.
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-line bg-white p-6">
            <p className="font-serif text-3xl font-bold leading-tight text-sage-deep">
              Students need adults who know their name.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Danny DiPetta leads our youth ministry and works alongside
              parents and volunteers to help students feel seen and supported.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BigMoments() {
  return (
    <section className="section-pad bg-sage-deep text-white">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            The big moments matter too.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/72">
            Retreats, camps, and shared gatherings help students step away from
            the noise and pay attention to God and one another.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {bigMoments.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/12 bg-white/[0.06] p-6">
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MeetYourMinister() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow md:mx-0">
          <Image
            src="/leaders/danny-dipetta.jpg"
            alt="Danny DiPetta, Youth Minister at Fulshear Church of Christ"
            fill
            sizes="(min-width: 768px) 360px, 80vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose">
            Meet your minister
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Danny DiPetta
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/76">
            Danny teaches classes, plans activities, and walks alongside our
            students through the ordinary and important moments of teenage
            life. If your teen is new, he would be glad to hear from you.
          </p>
          <a
            href={`mailto:${church.email}?subject=Youth%20Ministry`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
          >
            Email Danny
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function YouthMinistryPage() {
  return (
    <>
      <Hero />
      <Heart />
      <WeeklyRhythms />
      <BeyondTheBuilding />
      <BigMoments />
      <MeetYourMinister />
    </>
  );
}
