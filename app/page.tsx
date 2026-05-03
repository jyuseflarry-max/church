import Link from "next/link";
import Image from "next/image";

/* ─── Hero ─────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-sage-deep min-h-[520px] md:min-h-[620px] flex items-center">
      {/* Placeholder: AI-generated image — diverse, smiling congregation in a sun-lit modern lobby */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #2F5247 0%, #4D7770 40%, #6B9489 70%, #C97A7C 100%)",
        }}
      />
      {/* Warm light overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(228,168,170,0.28) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <p className="text-rose-light text-sm font-semibold tracking-[0.2em] uppercase mb-4">
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
        <div>
          <Link
            href="/plan-a-visit"
            className="inline-flex items-center justify-center gap-2 bg-rose text-white font-semibold px-7 py-3.5 rounded-full hover:bg-rose-dark transition-colors text-base shadow-lg"
          >
            Plan Your Visit
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
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
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Latest Message
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Watch This Week&apos;s Sermon
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Sermon thumbnail — links to the YouTube video */}
          <div className="md:col-span-3">
            <a
              href="https://www.youtube.com/watch?v=wBU6d6XULU4"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-sage-deep/10"
              aria-label="Watch this week's sermon: Walking By Faith, Not By Sight"
            >
              <svg
                viewBox="0 0 1600 900"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="sermon-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B342D" />
                    <stop offset="40%" stopColor="#2F5247" />
                    <stop offset="68%" stopColor="#7A4F4F" />
                    <stop offset="86%" stopColor="#A35C5E" />
                    <stop offset="100%" stopColor="#E4A8AA" />
                  </linearGradient>
                  <radialGradient id="sermon-sun" cx="0.62" cy="0.7" r="0.55">
                    <stop offset="0%" stopColor="#FAF9F6" stopOpacity="0.85" />
                    <stop offset="18%" stopColor="#F8E5E6" stopOpacity="0.55" />
                    <stop offset="42%" stopColor="#E4A8AA" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C97A7C" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="sermon-hill-far" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CBCB3" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#6B9489" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="sermon-hill-mid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B9489" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#4D7770" />
                  </linearGradient>
                  <linearGradient id="sermon-hill-near" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3D5F55" />
                    <stop offset="100%" stopColor="#142620" />
                  </linearGradient>
                  <linearGradient id="sermon-path" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FAF9F6" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#FAF9F6" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="sermon-bottom-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                  </linearGradient>
                </defs>

                {/* Sky base + sun bloom */}
                <rect width="1600" height="900" fill="url(#sermon-sky)" />
                <rect width="1600" height="900" fill="url(#sermon-sun)" />

                {/* Stars in the upper sky */}
                <g fill="#FAF9F6">
                  <circle cx="120" cy="90" r="2" opacity="0.75" />
                  <circle cx="280" cy="60" r="1.4" opacity="0.6" />
                  <circle cx="420" cy="130" r="2.3" opacity="0.85" />
                  <circle cx="180" cy="220" r="1.2" opacity="0.5" />
                  <circle cx="340" cy="200" r="1.8" opacity="0.6" />
                  <circle cx="500" cy="80" r="1.5" opacity="0.55" />
                  <circle cx="660" cy="150" r="1.3" opacity="0.6" />
                  <circle cx="220" cy="330" r="1.5" opacity="0.5" />
                  <circle cx="80" cy="180" r="1.6" opacity="0.65" />
                  <circle cx="380" cy="290" r="1.2" opacity="0.5" />
                  <circle cx="560" cy="250" r="1.5" opacity="0.55" />
                  <circle cx="720" cy="300" r="1.3" opacity="0.5" />
                  <circle cx="60" cy="290" r="2" opacity="0.7" />
                </g>

                {/* Sun core at the horizon — destination of the path */}
                <circle cx="990" cy="630" r="70" fill="#FAF9F6" opacity="0.32" />
                <circle cx="990" cy="630" r="42" fill="#FAF9F6" opacity="0.65" />
                <circle cx="990" cy="630" r="22" fill="#FAF9F6" opacity="0.95" />

                {/* Far hills */}
                <path
                  d="M 0 540 C 200 510, 350 545, 500 510 C 700 470, 850 535, 1000 515 C 1200 485, 1400 530, 1600 510 L 1600 900 L 0 900 Z"
                  fill="url(#sermon-hill-far)"
                />
                {/* Mid hills */}
                <path
                  d="M 0 645 C 180 615, 360 645, 540 620 C 720 595, 900 650, 1080 625 C 1260 600, 1440 645, 1600 620 L 1600 900 L 0 900 Z"
                  fill="url(#sermon-hill-mid)"
                />
                {/* Near hills */}
                <path
                  d="M 0 745 C 200 725, 380 750, 560 730 C 740 710, 920 755, 1100 735 C 1280 715, 1440 750, 1600 735 L 1600 900 L 0 900 Z"
                  fill="url(#sermon-hill-near)"
                />

                {/* Path winding from the foreground up to the horizon glow */}
                <path
                  d="M 740 900 C 760 820, 880 770, 950 720 C 990 690, 990 660, 990 640"
                  stroke="url(#sermon-path)"
                  strokeWidth="44"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Anchor watermark — Anchored in Grace */}
                <g
                  transform="translate(1330 555) scale(0.85)"
                  stroke="#FAF9F6"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.1"
                >
                  <circle cx="100" cy="35" r="22" />
                  <line x1="100" y1="57" x2="100" y2="215" />
                  <line x1="55" y1="85" x2="145" y2="85" />
                  <path d="M 25 158 C 25 215 70 248 100 248 C 130 248 175 215 175 158" />
                </g>

                {/* Bottom fade so the title reads cleanly */}
                <rect x="0" y="500" width="1600" height="400" fill="url(#sermon-bottom-fade)" />
              </svg>

              {/* Top-left series label */}
              <div className="absolute top-4 left-5 md:top-6 md:left-7 z-10">
                <span className="inline-flex items-center gap-2 text-rose-light text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase">
                  <span aria-hidden="true" className="inline-block w-6 h-px bg-rose-light/60" />
                  Anchored in Grace · Series
                </span>
              </div>

              {/* Title block, bottom-left */}
              <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7 md:right-7 z-10">
                <h3 className="font-serif text-white text-xl md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  Walking By Faith,<br />
                  Not By Sight
                </h3>
                <p className="font-serif italic text-rose-light text-xs md:text-sm mt-1 md:mt-2 tracking-wide">
                  2 Corinthians 5:7
                </p>
              </div>

              {/* Play button — slightly above center to clear the title */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-8 md:-mt-12">
                <div className="relative">
                  <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/25 group-hover:scale-150 transition-transform duration-500 ease-out" />
                  <span aria-hidden="true" className="absolute -inset-2 rounded-full ring-1 ring-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative bg-white/95 text-sage-deep rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-9 md:h-9 ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Sermon info */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-sage-muted text-sage text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" clipRule="evenodd" />
              </svg>
              April 13, 2026
            </div>
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
              className="inline-flex items-center gap-2 text-sage font-semibold text-sm hover:text-sage-dark transition-colors"
            >
              Browse Recent Sermons
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
    color: "bg-rose-muted",
    iconColor: "text-rose",
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
    color: "bg-sage-muted",
    iconColor: "text-sage",
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
    iconColor: "text-sage-dark",
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
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Ministries
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            A Place for Every <br className="hidden md:block" />
            Stage of Life
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
                <div className="font-serif font-bold text-sage-deep text-xl">{ministry.label}</div>
                <div className="text-muted text-xs font-medium mt-0.5">{ministry.subtitle}</div>
              </div>
              <p className="text-charcoal text-sm leading-relaxed flex-1">
                {ministry.description}
              </p>
              <Link
                href={`/ministries/${ministry.key}`}
                className="inline-flex items-center gap-1 text-sage text-sm font-semibold hover:text-sage-dark transition-colors"
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
            "linear-gradient(160deg, #E4A8AA 0%, #C97A7C 30%, #6B9489 70%, #2F5247 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          Rooted in Fulshear
        </p>
        <h2 className="font-serif text-white text-3xl md:text-5xl font-bold mb-6 leading-tight">
          A Community <br className="hidden md:block" />
          Growing Together
        </h2>
        <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Planted in the heart of Fulshear, we&apos;re a neighborhood church
          committed to loving God, loving our neighbors, and leaving this
          community better than we found it.
        </p>
        <Link
          href="/plan-a-visit"
          className="inline-flex items-center justify-center gap-2 bg-white text-sage-deep font-semibold px-8 py-3.5 rounded-full hover:bg-cream transition-colors shadow-lg"
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
      <MinistryGrid />
      <CommunityBanner />
      <LatestMessage />
    </>
  );
}
