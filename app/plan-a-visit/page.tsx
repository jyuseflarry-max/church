import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { church, images, serviceTimes } from "../site-content";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description:
    "Plan your first visit to Fulshear Church of Christ: worship times, parking, kids, what to wear, communion, a cappella singing, and what to expect.",
};

const firstSunday = [
  {
    title: "Arrive and park",
    body: "Pull into our free parking lot at 9241 Charger Way. If you are new, come in the main entrance and someone will gladly help you find where to go.",
  },
  {
    title: "Settle your family",
    body: "Kids and teens have Bible classes at 9:00 AM. We will help you find the right room and answer any questions before class begins.",
  },
  {
    title: "Join worship",
    body: "Worship is simple and centered on Jesus: a cappella singing, prayer, communion, and a message from Scripture.",
  },
  {
    title: "Stay at your pace",
    body: "You will not be singled out or pressured. Stay to meet people, ask a question, or head out quietly. We are simply glad you came.",
  },
];

const faqs = [
  {
    q: "What should I wear?",
    a: "Come as you are. You will see jeans, dresses, boots, polos, and Sunday best. We care far more about you being present than what you are wearing.",
  },
  {
    q: "Will I be expected to give money?",
    a: "No. Giving is for our church family. As a guest, please feel no obligation to give.",
  },
  {
    q: "What is a cappella worship?",
    a: "We sing without instruments because worship is something the whole church does together. You do not need musical skill. Your voice belongs.",
  },
  {
    q: "What is communion?",
    a: "Every Sunday we remember Jesus through the Lord's Supper, also called communion. Visitors are welcome to observe if they are not ready to participate.",
  },
  {
    q: "How long is worship?",
    a: "Sunday morning worship is usually about 60 to 70 minutes. Bible class before worship is about 45 minutes.",
  },
  {
    q: "Can I just watch first?",
    a: "Yes. You are welcome to sit, listen, and take things in. You can also watch recent sermons online before visiting in person.",
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
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
            Know what to expect before you arrive.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
            Visiting a new church can feel uncertain. This page is here to take
            the mystery out of Sunday so you can walk in with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={church.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-sage-deep hover:bg-cream focus-ring"
            >
              Get Directions
              <ArrowIcon />
            </a>
            <Link
              href={church.livestreamUrl}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 focus-ring"
            >
              Watch First
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
          <Image
            src={images.arrival}
            alt="Families arriving at church on Sunday morning"
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

function QuickInfo() {
  return (
    <section className="-mt-8 relative z-10">
      <div className="container-wide rounded-[1.5rem] border border-line bg-white p-5 shadow-xl">
        <div className="grid gap-4 md:grid-cols-4">
          {serviceTimes.map((item) => (
            <div key={item.label} className="rounded-2xl bg-cream p-4">
              <p className="text-2xl font-bold text-sage-deep">{item.time}</p>
              <p className="mt-1 text-sm font-semibold text-muted">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-sm font-semibold text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{church.address}</span>
          <a href={`tel:+1${church.phone.replace(/\D/g, "")}`} className="text-sage-deep hover:text-rose">
            {church.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function FirstSunday() {
  return (
    <section id="first-sunday" className="section-pad bg-cream">
      <div className="container-wide">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Your first Sunday, step by step.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            No surprises. No spotlight. Just a clear path from the parking lot
            to worship.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {firstSunday.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-line bg-white p-6">
              <p className="font-serif text-4xl font-bold text-rose-light">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-5 text-2xl font-bold text-sage-deep">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorshipAndKids() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid gap-12 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
            <Image
              src={images.worship}
              alt="Congregation singing during simple worship"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <h2 className="mt-7 text-3xl font-bold text-sage-deep">
            What worship is like
          </h2>
          <p className="mt-3 text-base leading-7 text-charcoal/76">
            We sing together without instruments, pray together, listen to
            Scripture, share communion, and hear a Bible-centered message. If
            you are unsure what to do, simply observe.
          </p>
        </div>
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sage-muted soft-shadow">
            <Image
              src={images.kids}
              alt="Children in a supervised Bible class"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <h2 className="mt-7 text-3xl font-bold text-sage-deep">
            What about kids?
          </h2>
          <p className="mt-3 text-base leading-7 text-charcoal/76">
            Children and teens have age-appropriate Bible classes at 9:00 AM.
            Our volunteers will help you find the right place, and parents are
            welcome to ask anything before leaving a child in class.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-sage-deep md:text-5xl">
            Good to know before you come.
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/76">
            These are the questions visitors often wonder but do not always ask.
          </p>
        </div>
        <div className="divide-y divide-line rounded-[1.5rem] border border-line bg-white px-6">
          {faqs.map((faq) => (
            <article key={faq.q} className="py-6">
              <h3 className="text-xl font-bold text-sage-deep">{faq.q}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
            </article>
          ))}
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
          We would be glad to meet you this Sunday.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/72">
          Have a question before you come? Send us a note and a real person
          will reply.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={church.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-6 py-3 font-bold text-sage-deep hover:bg-cream focus-ring">
            Get Directions
          </a>
          <a href={`mailto:${church.email}`} className="rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10 focus-ring">
            Ask a Question
          </a>
        </div>
      </div>
    </section>
  );
}

export default function PlanVisitPage() {
  return (
    <>
      <Hero />
      <QuickInfo />
      <FirstSunday />
      <WorshipAndKids />
      <FAQSection />
      <ClosingCTA />
    </>
  );
}
