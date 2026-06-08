import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PrayerRequestForm from "./PrayerRequestForm";
import { church, images } from "../site-content";

export const metadata: Metadata = {
  title: "Get Connected",
  description:
    "Get connected at Fulshear Church of Christ through Bible classes, newcomer dinners, service, community outreach, prayer, and conversations with a minister.",
};

const classBlocks = [
  {
    day: "Sunday Mornings",
    time: "9:00 AM",
    adult: "Three adult class options, with kids and teens meeting at the same time.",
    family: "The whole family can study Scripture in age-appropriate spaces before worship begins.",
  },
  {
    day: "Wednesday Evenings",
    time: "7:00 PM",
    adult: "A focused mid-week study for adults.",
    family: "Kids and students meet too, making Wednesday a simple rhythm for the whole family.",
  },
];

const ministries = [
  {
    name: "Worship",
    body: "Song leading, prayers, Lord's Supper preparation, Scripture reading, and the shared rhythms of Sunday worship.",
  },
  {
    name: "Kids Ministry",
    body: "Teach, assist, or help create a calm first-Sunday experience for children and parents.",
  },
  {
    name: "Youth Ministry",
    body: "Walk alongside middle and high school students as they grow in faith and friendship.",
  },
  {
    name: "Greeters & Hospitality",
    body: "Be the friendly face at the door and the warm welcome visitors remember.",
  },
  {
    name: "Meals & Care",
    body: "Cook, deliver, and care for families navigating illness, loss, or a new baby.",
  },
  {
    name: "Audio / Visual",
    body: "Help run sound, slides, and livestream support so worship can be heard clearly.",
  },
];

const outreach = [
  {
    title: "Missions",
    body: "We support missionaries carrying the gospel into communities close to home and across the world.",
  },
  {
    title: "Fulshear High School",
    body: "We partner with coaches, teams, and student groups by showing up with meals, mentoring, and encouragement.",
  },
  {
    title: "First Responders",
    body: "We regularly support and care for Fulshear's police, fire, and EMS workers.",
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
    <section className="relative overflow-hidden">
      <div className="container-wide grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 md:grid-cols-[0.95fr_1.05fr] md:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose">
            Get connected
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.03] text-sage-deep sm:text-5xl md:text-7xl md:leading-[0.98]">
            Start finding your place in the church family.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/78">
            Once you have visited, the next step is usually simple: learn with
            us, share a meal, serve somewhere, or ask a real question. We would
            be glad to help you take the next step at your pace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${church.email}?subject=Getting%20Connected`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-deep px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-sage-dark focus-ring"
            >
              Email the Office
              <ArrowIcon />
            </a>
            <Link
              href="/plan-a-visit"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-base font-bold text-sage-deep transition-colors hover:border-sage-light hover:bg-sage-muted focus-ring"
            >
              Plan a Visit
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage-muted soft-shadow md:aspect-[5/6]">
            <Image
              src={images.fellowship}
              alt="People visiting together after worship in a church lobby"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-line md:left-auto md:w-72">
            <p className="font-serif text-2xl font-bold leading-tight text-sage-deep">
              You do not have to figure it out alone.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Send a note, come to class, or ask someone at the door on Sunday.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BibleClasses() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Learn Scripture with people you are getting to know.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Bible study is one of the easiest ways to move from visiting to
            belonging. Visitors are always welcome to sit in and ask questions.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {classBlocks.map((block) => (
            <article key={block.day} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-bold text-sage-deep">{block.day}</h3>
                <p className="shrink-0 text-sm font-bold text-sage">{block.time}</p>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose">
                    Adults
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{block.adult}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose">
                    Kids & Teens
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{block.family}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewcomerDinner() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.arrival}
            alt="Families arriving at church on Sunday morning"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose">
            Meet the family
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Come to a newcomer dinner.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/76">
            A few times a year, we set aside an evening for newer faces to
            share a relaxed meal with elders, ministers, and others who are
            finding their way into the church family.
          </p>
          <a
            href={`mailto:${church.email}?subject=Newcomer%20Dinner`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
          >
            Ask About the Next One
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

function FindYourPlace() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Find a place to serve.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Every ministry has a place for willing hands. Curious about a
            specific area? Send a note and we will connect you with the right
            person.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => (
            <article key={ministry.name} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-2xl font-bold text-sage-deep">{ministry.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{ministry.body}</p>
            </article>
          ))}
        </div>
        <a
          href={`mailto:${church.email}?subject=I%27d%20like%20to%20serve`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark focus-ring"
        >
          Ask Where to Serve
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}

function InTheCommunity() {
  return (
    <section className="section-pad bg-sage-deep text-white">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            We want to bless the community around us.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/72">
            Loving our neighbors means showing up beyond Sunday morning.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {outreach.map((item) => (
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

function PrayerSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose">
            Pray with us
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Submit a prayer request.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Whether it is a quiet weight, a celebration, or a need someone you
            love is facing, we want to pray with you.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-cream p-6 shadow-sm md:p-8">
          <PrayerRequestForm />
        </div>
      </div>
    </section>
  );
}

function TalkToMinister() {
  return (
    <section className="bg-sage-deep py-14 text-center text-white">
      <div className="container-wide">
        <h2 className="text-3xl font-bold md:text-4xl">
          We would love to hear from you.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/72">
          Big question, small question, or anything in between, send a note and
          a real person will reply.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`mailto:${church.email}`} className="rounded-full bg-white px-6 py-3 font-bold text-sage-deep hover:bg-cream focus-ring">
            Email the Office
          </a>
          <a href={`tel:+1${church.phone.replace(/\D/g, "")}`} className="rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10 focus-ring">
            {church.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ConnectPage() {
  return (
    <>
      <Hero />
      <BibleClasses />
      <NewcomerDinner />
      <FindYourPlace />
      <InTheCommunity />
      <PrayerSection />
      <TalkToMinister />
    </>
  );
}
