import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { church, distinctives, images } from "../site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Fulshear Church of Christ: a simple, sincere church family shaped by Scripture, weekly communion, a cappella worship, and local community.",
};

const leaders = [
  { name: "Mike Pawlik", role: "Elder", photo: "/leaders/mike-pawlik.jpg" },
  { name: "Mark Pierce", role: "Elder", photo: "/leaders/mark-pierce.jpg" },
  { name: "Keith Williams", role: "Elder", photo: "/leaders/keith-williams.jpg" },
  { name: "Paul Cartwright", role: "Preaching Minister", photo: "/leaders/paul-cartwright.jpeg" },
  { name: "Danny DiPetta", role: "Youth Minister", photo: "/leaders/danny-dipetta.jpg" },
];

function Hero() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-sage-deep sm:text-5xl md:text-7xl">
            We are trying to be the kind of church we read about in Scripture.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/76">
            Devoted to Jesus. Shaped by the Bible. Gathered around communion.
            Singing together, praying together, and caring for one another.
          </p>
          <Link
            href="/plan-a-visit"
            className="mt-8 inline-flex rounded-full bg-sage-deep px-6 py-3.5 font-bold text-white hover:bg-sage-dark focus-ring"
          >
            Plan Your Visit
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.study}
            alt="Adults studying Scripture and praying together"
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

function Identity() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            What is a Church of Christ?
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Churches of Christ are independent congregations seeking to follow
            the pattern and spirit of the New Testament church. We are not
            trying to build a religious brand. We are trying to follow Jesus
            together.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {distinctives.map((item) => (
            <article key={item.title} className="rounded-2xl border border-line bg-cream p-6">
              <h3 className="text-2xl font-bold text-sage-deep">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalMission() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.fellowship}
            alt="People visiting together after worship"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            A local church family for a growing community.
          </h2>
          <p className="mt-5 text-lg leading-8 text-charcoal/76">
            Fulshear, Katy, Brookshire, Simonton, Richmond, and west Houston
            are changing quickly. We want to be a steady place where people can
            hear Scripture, ask honest questions, raise families in faith, and
            find a church family that knows their name.
          </p>
        </div>
      </div>
    </section>
  );
}

function Leadership() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-sage-deep md:text-5xl">
            Shepherds and ministers you can recognize.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            Trust grows when people have names and faces. These are some of the
            men who shepherd, teach, and serve alongside the congregation.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {leaders.map((person) => (
            <article key={person.name} className="text-center">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage-muted">
                <Image
                  src={person.photo}
                  alt={`${person.name}, ${person.role}`}
                  fill
                  sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 text-lg font-bold text-sage-deep">{person.name}</h3>
              <p className="text-sm font-semibold text-muted">{person.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisitCallout() {
  return (
    <section className="bg-sage-deep py-14 text-center text-white">
      <div className="container-wide">
        <h2 className="text-3xl font-bold md:text-4xl">
          The best way to know us is to worship with us.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/72">
          We meet at {church.address}. Come as you are and move at your pace.
        </p>
        <Link
          href="/plan-a-visit"
          className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-bold text-sage-deep hover:bg-cream focus-ring"
        >
          Plan Your Visit
        </Link>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Identity />
      <LocalMission />
      <Leadership />
      <VisitCallout />
    </>
  );
}
