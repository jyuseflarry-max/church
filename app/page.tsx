import Link from "next/link";
import Image from "next/image";

/* ─── Hero ─────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-deep min-h-[520px] md:min-h-[620px] flex items-center">
      {/* Placeholder: AI-generated image — diverse, smiling congregation in a sun-lit modern lobby */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1E3A5F 0%, #2D4F7A 40%, #4A6FA5 70%, #A67C52 100%)",
        }}
      />
      {/* Warm light overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(196,149,106,0.25) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <p className="text-wood-light text-sm font-semibold tracking-[0.2em] uppercase mb-4">
          New Here?
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold leading-tight max-w-2xl mb-6">
          You&apos;re Welcome <br className="hidden md:block" />
          Just As You Are
        </h1>
        <p className="text-white/75 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          Fulshear Church of Christ is a community of ordinary people
          transformed by extraordinary grace — gathering to worship, grow,
          and serve together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/what-to-expect"
            className="inline-flex items-center justify-center gap-2 bg-wood text-white font-semibold px-7 py-3.5 rounded-full hover:bg-wood-dark transition-colors text-base shadow-lg"
          >
            Plan Your Visit
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/sermons"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/20 transition-colors text-base backdrop-blur-sm"
          >
            Watch a Sermon
          </Link>
        </div>

        {/* Service times strip */}
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2">
          {[
            { day: "Sunday", time: "9:00 AM — Bible Class" },
            { day: "Sunday", time: "10:00 AM — Worship" },
            { day: "Wednesday", time: "7:00 PM — Mid-Week" },
          ].map((item) => (
            <div key={item.time} className="text-white/60 text-sm">
              <span className="font-semibold text-white/90">{item.day}</span>{" "}
              {item.time}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Latest Message ────────────────────────────────────────────────────────── */
function LatestMessage() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-wood text-sm font-semibold tracking-widest uppercase mb-2">
            Latest Message
          </p>
          <h2 className="font-serif text-slate-deep text-3xl md:text-4xl font-bold">
            Watch This Week&apos;s Sermon
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Video embed */}
          <div className="md:col-span-3">
            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video bg-slate-muted relative">
              <iframe
                src="https://www.youtube.com/embed/wBU6d6XULU4?rel=0&modestbranding=1"
                title="Latest Sermon — Fulshear Church of Christ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          {/* Sermon info */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-slate-muted text-slate text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" clipRule="evenodd" />
              </svg>
              April 13, 2026
            </div>
            <h3 className="font-serif text-slate-deep text-2xl font-bold mb-3 leading-snug">
              Walking By Faith, Not By Sight
            </h3>
            <p className="text-muted leading-relaxed mb-2 text-sm">
              Series: <span className="text-charcoal font-medium">Anchored in Grace</span>
            </p>
            <p className="text-muted leading-relaxed text-sm mb-6">
              2 Corinthians 5:7 — What does it mean to trust God in the spaces
              between the promise and the fulfillment? A message about courage,
              surrender, and the faithfulness of God.
            </p>
            <Link
              href="/sermons"
              className="inline-flex items-center gap-2 text-slate font-semibold text-sm hover:text-slate-dark transition-colors"
            >
              Browse All Sermons
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Ministry Grid ─────────────────────────────────────────────────────────── */
const ministries = [
  {
    key: "kids",
    label: "Kids",
    subtitle: "Ages 0 – 5th Grade",
    description:
      "A safe, fun, and faith-filled environment where children discover who God is and how deeply he loves them.",
    color: "bg-wood-muted",
    iconColor: "text-wood",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
      </svg>
    ),
  },
  {
    key: "youth",
    label: "Youth",
    subtitle: "6th – 12th Grade",
    description:
      "Middle and high schoolers finding identity, belonging, and purpose in community with Christ at the center.",
    color: "bg-slate-muted",
    iconColor: "text-slate",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
      </svg>
    ),
  },
  {
    key: "adults",
    label: "Adults",
    subtitle: "Young Adults & Beyond",
    description:
      "Deep study, real community, and meaningful service. Grow in faith alongside other believers at every season of life.",
    color: "bg-warm-white",
    iconColor: "text-slate-dark",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
      </svg>
    ),
  },
];

function MinistryGrid() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-wood text-sm font-semibold tracking-widest uppercase mb-2">
            Ministries
          </p>
          <h2 className="font-serif text-slate-deep text-3xl md:text-4xl font-bold">
            A Place for Every Stage of Life
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            From our youngest members to our wisest — everyone belongs here.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {ministries.map((ministry) => (
            <div
              key={ministry.key}
              className={`${ministry.color} rounded-2xl p-7 flex flex-col gap-4 hover:shadow-md transition-shadow`}
            >
              <div className={`${ministry.iconColor} w-fit`}>{ministry.icon}</div>
              <div>
                <div className="font-serif font-bold text-slate-deep text-xl">{ministry.label}</div>
                <div className="text-muted text-xs font-medium mt-0.5">{ministry.subtitle}</div>
              </div>
              <p className="text-charcoal text-sm leading-relaxed flex-1">
                {ministry.description}
              </p>
              <Link
                href={`/ministries/${ministry.key}`}
                className="inline-flex items-center gap-1 text-slate text-sm font-semibold hover:text-slate-dark transition-colors"
              >
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Our Foundation ────────────────────────────────────────────────────────── */
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
    <section className="bg-slate-deep text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-wood-light text-sm font-semibold tracking-widest uppercase mb-3">
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
            <div key={belief.reference} className="py-6 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="shrink-0 sm:w-36 text-wood-light font-serif text-sm font-semibold italic">
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

/* ─── Community Image Banner ────────────────────────────────────────────────── */
function CommunityBanner() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Placeholder: AI-generated image — peaceful Fulshear community, golden-hour fields */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #C4956A 0%, #A67C52 30%, #4A6FA5 70%, #2D4F7A 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p className="text-wood-light text-sm font-semibold tracking-widest uppercase mb-4">
          Rooted in Fulshear
        </p>
        <h2 className="font-serif text-white text-3xl md:text-5xl font-bold mb-6 leading-tight">
          A Community Growing Together
        </h2>
        <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Planted in the heart of Fulshear, we&apos;re a neighborhood church
          committed to loving God, loving our neighbors, and leaving this
          community better than we found it.
        </p>
        <Link
          href="/what-to-expect"
          className="inline-flex items-center justify-center gap-2 bg-white text-slate-deep font-semibold px-8 py-3.5 rounded-full hover:bg-cream transition-colors shadow-lg"
        >
          We&apos;d Love to Meet You
        </Link>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestMessage />
      <MinistryGrid />
      <OurFoundation />
      <CommunityBanner />
    </>
  );
}
