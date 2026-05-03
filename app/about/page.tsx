import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Fulshear Church of Christ — a place to belong, a path to follow, a people to love. Meet our elders, ministers, deacons, and the heritage that shapes who we are.",
};

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function PageHero() {
  return (
    <section className="relative overflow-hidden bg-sage-deep py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #2F5247 0%, #4D7770 50%, #C97A7C 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          Who We Are
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          About Us
        </h1>
        <p className="font-serif text-white text-2xl md:text-3xl italic leading-relaxed max-w-2xl mx-auto">
          A place to belong. A path to follow. A people to love.
        </p>
      </div>
    </section>
  );
}

/* ─── Mission ───────────────────────────────────────────────────────────────── */
function Mission() {
  return (
    <section className="bg-rose-muted py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-rose-dark text-sm font-semibold tracking-widest uppercase mb-3">
          Our Mission
        </p>
        <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-6 leading-snug">
          Where We&apos;re Going
        </h2>
        <p className="text-charcoal text-lg md:text-xl leading-relaxed">
          To see the Fulshear community transformed by the love of Jesus —
          becoming a place where faith is rooted in Scripture, families are
          strengthened by fellowship, and hope is shared with the world.
        </p>
      </div>
    </section>
  );
}

/* ─── Our Story ─────────────────────────────────────────────────────────────── */
function OurStory() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Our Story
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            How We Got Here
          </h2>
        </div>
        <div className="space-y-5 text-charcoal text-base md:text-lg leading-relaxed">
          <p>
            Fulshear Church of Christ began as a small group of families
            committed to being &ldquo;just Christians&rdquo; — gathering to
            worship simply, study Scripture together, and serve the people of
            our growing town.
          </p>
          <p>
            Today we meet at our home on Charger Way, just off the heart of
            Fulshear. We&apos;re not a denomination and we&apos;re not chasing
            a trend. We&apos;re a family of believers trying to follow Jesus
            faithfully — together, in this place, for as long as God gives us
            to do it.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── What's a Church of Christ? ────────────────────────────────────────────── */
function WhatIsACOC() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
          A Common Question
        </p>
        <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-6">
          What&apos;s a Church of Christ?
        </h2>
        <p className="text-charcoal text-lg leading-relaxed">
          We are a group of Christians who strive to be &ldquo;just
          Christians.&rdquo; We have no creeds but the Bible, no leader but
          Christ, and no mission other than to love God and serve our
          community like the original church did 2,000 years ago.
        </p>
      </div>
    </section>
  );
}

/* ─── Our Foundation (moved from home) ──────────────────────────────────────── */
const beliefs = [
  {
    text: "We believe in the authority of Scripture as the inspired Word of God — our ultimate guide for faith and practice.",
    reference: "2 Timothy 3:16–17",
  },
  {
    text: "We confess that Jesus Christ is the Son of God, Lord, and Savior of all who place their trust in him.",
    reference: "Romans 10:9",
  },
  {
    text: "We practice baptism by immersion as a response of faith to the grace of God for the forgiveness of sins.",
    reference: "Acts 2:38",
  },
  {
    text: "We gather every Sunday to remember Jesus in the Lord's Supper, breaking bread together as one body.",
    reference: "Acts 20:7",
  },
  {
    text: "We are united in Christ alone — no creed but the Bible, no name but the name above all names.",
    reference: "Colossians 3:17",
  },
];

function OurFoundation() {
  return (
    <section className="bg-sage-deep text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-3">
            What We Believe
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Our Foundation
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Not a denomination — a family of believers anchored in the Word of
            God and united in the name of Christ.
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {beliefs.map((belief) => (
            <div
              key={belief.reference}
              className="py-6 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="shrink-0 sm:w-36 text-rose-light font-serif text-sm font-semibold italic">
                {belief.reference}
              </div>
              <p className="text-white/85 leading-relaxed">{belief.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Leadership ────────────────────────────────────────────────────────────── */
const elders = [
  { name: "Mike Pawlik", photo: "/leaders/mike-pawlik.jpg" },
  { name: "Keith Williams", photo: "/leaders/keith-williams.jpg" },
  { name: "Mark Pierce", photo: "/leaders/mark-pierce.jpg" },
];

const ministers = [
  {
    name: "Paul Cartwright",
    role: "Preaching Minister",
    photo: "/leaders/paul-cartwright.jpeg",
  },
  {
    name: "Danny DiPetta",
    role: "Youth Minister",
    photo: "/leaders/danny-dipetta.jpg",
  },
];

const deacons = [
  { name: "Paul Adams", photo: "/leaders/paul-adams.png" },
  { name: "Keith Arnold", photo: "/leaders/keith-arnold.jpg" },
  { name: "Danny DiPetta", photo: "/leaders/danny-dipetta.jpg" },
  { name: "Tommy Kuykendall", photo: "/leaders/tommy-kuykendall.jpg" },
  { name: "Jyusef Larry", photo: "/leaders/jyusef-larry.jpg" },
  { name: "Luke Matthews", photo: "/leaders/luke-matthews.jpg" },
  { name: "Brock Mayberry", photo: "/leaders/brock-mayberry.jpg" },
  { name: "Mike Richardson", photo: "/leaders/mike-richardson.jpg" },
  { name: "Brent Seifert", photo: "/leaders/brent-seifert.jpg" },
  { name: "Randy Simmons", photo: "/leaders/randy-simmons.jpg" },
  { name: "Jim Taylor", photo: "/leaders/jim-taylor.png" },
];

function PersonCard({
  name,
  role,
  photo,
  size = "md",
}: {
  name: string;
  role?: string;
  photo: string;
  size?: "md" | "sm";
}) {
  const photoSizeClass = size === "sm" ? "" : "";
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-sage-muted shadow-sm ${photoSizeClass}`}
      >
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
          className="object-cover"
        />
      </div>
      <div className="mt-4">
        <div className="font-serif font-bold text-sage-deep text-base md:text-lg">
          {name}
        </div>
        {role && (
          <div className="text-muted text-xs md:text-sm mt-0.5 font-medium">
            {role}
          </div>
        )}
      </div>
    </div>
  );
}

function Leadership() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Our Shepherds & Servants
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Leadership
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Our elders shepherd the congregation, our ministers teach and walk
            alongside us, and our deacons serve in the day-to-day life of the
            church.
          </p>
        </div>

        {/* Elders */}
        <div className="mb-16">
          <h3 className="font-serif text-sage-deep text-2xl font-bold text-center mb-8">
            Elders
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {elders.map((person) => (
              <PersonCard key={person.name} {...person} />
            ))}
          </div>
        </div>

        {/* Ministers */}
        <div className="mb-16">
          <h3 className="font-serif text-sage-deep text-2xl font-bold text-center mb-8">
            Ministers
          </h3>
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {ministers.map((person) => (
              <PersonCard key={person.name + person.role} {...person} />
            ))}
          </div>
        </div>

        {/* Deacons */}
        <div>
          <h3 className="font-serif text-sage-deep text-2xl font-bold text-center mb-8">
            Deacons
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {deacons.map((person) => (
              <PersonCard key={person.name} {...person} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Where We Gather (banner closer) ───────────────────────────────────────── */
function WhereWeGather() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Find Us
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-3">
            Where We Gather
          </h2>
          <p className="text-muted leading-relaxed max-w-xl mx-auto">
            We&apos;d love to meet you on Sunday — pull into the lot,
            we&apos;ll be looking out for you.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/banner.png"
            alt="Fulshear Church of Christ building at sunset — 9241 Charger Way, Fulshear, TX 77441"
            width={1700}
            height={650}
            className="w-full h-auto"
          />
        </div>

        <div className="text-center mt-10">
          <Link
            href="/plan-a-visit"
            className="inline-flex items-center justify-center gap-2 bg-sage text-white font-semibold px-7 py-3.5 rounded-full hover:bg-sage-dark transition-colors text-base shadow-sm"
          >
            Plan Your Visit
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <>
      <PageHero />
      <Mission />
      <OurStory />
      <WhatIsACOC />
      <OurFoundation />
      <Leadership />
      <WhereWeGather />
    </>
  );
}
