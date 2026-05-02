import type { Metadata } from "next";
import Link from "next/link";
import PrayerRequestForm from "./PrayerRequestForm";

export const metadata: Metadata = {
  title: "Get Connected",
  description:
    "Once you've visited, here's how to get involved at Fulshear Church of Christ — Bible classes, our Newcomer Dinner, ways to serve, the partners we love in our community, and how to talk with a minister.",
};

/* ─── Page Hero ─────────────────────────────────────────────────────────────── */
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
            "radial-gradient(ellipse at 20% 60%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          Get Involved
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Get Connected
        </h1>
        <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          You&apos;ve visited — now what? Here&apos;s how the Fulshear family
          learns, serves, and grows together. Email or stop by anytime;
          we&apos;d love to put a face with your name.
        </p>
      </div>
    </section>
  );
}

/* ─── Bible Classes ─────────────────────────────────────────────────────────── */
const classBlocks = [
  {
    day: "Sunday Mornings",
    time: "9:00 AM",
    adultLabel: "Three concurrent adult classes",
    adultBody:
      "Pick the study track that fits the season you&rsquo;re in — verse-by-verse Bible study, topical discussion, or a deeper dive on a single book.",
    kidsBody:
      "Age-grouped classes from nursery through high school, all running at the same time so the whole family can plug in together.",
  },
  {
    day: "Wednesday Evenings",
    time: "7:00 PM",
    adultLabel: "One mid-week adult class",
    adultBody:
      "A focused mid-week study — a great place to slow down, ask questions, and dig into Scripture with people you&rsquo;re getting to know.",
    kidsBody:
      "Multiple kids&rsquo; classes running concurrently, so parents can join the adult study without missing a beat.",
  },
];

function BibleClasses() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Learn Together
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Bible Classes for Every Age
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Bible study is at the heart of who we are. Visitors are always
            welcome — come early, sit in, ask questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {classBlocks.map((block) => (
            <div
              key={block.day}
              className="bg-cream rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif font-bold text-sage-deep text-xl">
                  {block.day}
                </h3>
                <span className="text-sage font-semibold text-sm">
                  {block.time}
                </span>
              </div>
              <div>
                <div className="text-sage-deep font-semibold text-sm mb-1">
                  Adults
                </div>
                <p
                  className="text-charcoal text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: block.adultLabel + " — " + block.adultBody }}
                />
              </div>
              <div>
                <div className="text-sage-deep font-semibold text-sm mb-1">
                  Kids & Teens
                </div>
                <p
                  className="text-charcoal text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: block.kidsBody }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Newcomer Dinner ───────────────────────────────────────────────────────── */
function NewcomerDinner() {
  return (
    <section className="bg-rose-muted py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-dark text-sm font-semibold tracking-widest uppercase mb-3">
          Meet the Family
        </p>
        <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-5 leading-snug">
          Come to Our Newcomer Dinner
        </h2>
        <p className="text-charcoal leading-relaxed text-lg mb-6 max-w-2xl mx-auto">
          A few times a year we set aside an evening just for newer faces — a
          relaxed dinner with our elders, ministers, and other folks who are
          new to the church family. It&apos;s the easiest way to put names
          with faces, ask the questions visitors usually have, and feel less
          like the new person on Sunday.
        </p>
        <a
          href="mailto:info@fulshearcoc.org?subject=Newcomer%20Dinner"
          className="inline-flex items-center justify-center gap-2 bg-sage text-white font-semibold px-7 py-3.5 rounded-full hover:bg-sage-dark transition-colors text-base shadow-sm"
        >
          Ask About the Next One
        </a>
      </div>
    </section>
  );
}

/* ─── Serve / Find Your Place ───────────────────────────────────────────────── */
const ministries = [
  {
    name: "Worship",
    body: "Song leading, prayers, Lord&rsquo;s Supper preparation — the rhythms of Sunday worship.",
  },
  {
    name: "Kids Ministry",
    body: "Teach, assist, or help with check-in for our nursery through 5th-grade classes.",
  },
  {
    name: "Youth Ministry",
    body: "Walk alongside our middle and high schoolers as they grow in faith and friendship.",
  },
  {
    name: "Greeters & Hospitality",
    body: "Be the friendly face at the door and the warm welcome that visitors remember.",
  },
  {
    name: "Meals & Benevolence",
    body: "Cook, deliver, and care for families navigating illness, loss, or a new baby.",
  },
  {
    name: "Audio / Visual",
    body: "Help run sound, slides, and the live stream so we can worship and reach beyond the building.",
  },
  {
    name: "Outreach & Service",
    body: "Plug into our work with Fulshear High, first responders, and missions partners (see below).",
  },
];

function FindYourPlace() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Serve Together
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Find Your Place
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Every ministry is open to anyone willing to serve — whether
            you&apos;ve been here a month or a decade. Curious about a
            specific area? Email us and we&apos;ll connect you with the team
            lead.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ministries.map((m) => (
            <div
              key={m.name}
              className="bg-cream rounded-xl p-6 border border-sage-muted/60"
            >
              <h3 className="font-serif font-bold text-sage-deep text-lg mb-2">
                {m.name}
              </h3>
              <p
                className="text-charcoal text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: m.body }}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="mailto:info@fulshearcoc.org?subject=I%27d%20like%20to%20serve"
            className="inline-flex items-center gap-2 text-sage font-semibold text-base hover:text-sage-dark transition-colors"
          >
            Email Paul Cartwright to get started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── In the Community / Outreach ───────────────────────────────────────────── */
const outreach = [
  {
    title: "Missions",
    body: "We support missionaries carrying the gospel into communities both close to home and across the world. Their work is our work.",
  },
  {
    title: "Fulshear High School",
    body: "We partner with athletic teams, coaches, and student groups at Fulshear High — providing meals, mentoring, and showing up for the kids in our community.",
  },
  {
    title: "First Responders",
    body: "We regularly support and care for Fulshear&rsquo;s police, fire, and EMS — the men and women who keep our neighborhood safe.",
  },
];

function InTheCommunity() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Beyond Our Walls
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            In the Community
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Loving our neighbors means more than Sunday morning. Here&apos;s
            where the Fulshear church family is showing up.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {outreach.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-7 shadow-sm flex flex-col gap-3"
            >
              <h3 className="font-serif font-bold text-sage-deep text-xl">
                {item.title}
              </h3>
              <p
                className="text-charcoal text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Prayer Request ────────────────────────────────────────────────────────── */
function PrayerSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Pray With Us
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-3">
            Submit a Prayer Request
          </h2>
          <p className="text-muted leading-relaxed">
            Whether it&apos;s a quiet weight, a celebration, or a need someone
            you love is facing — we want to pray with you.
          </p>
        </div>

        <div className="bg-cream rounded-2xl p-6 md:p-8 shadow-sm">
          <PrayerRequestForm />
        </div>
      </div>
    </section>
  );
}

/* ─── Talk to a Minister ────────────────────────────────────────────────────── */
function TalkToMinister() {
  return (
    <section className="bg-sage-deep text-white py-16 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-3">
          Talk to a Minister
        </p>
        <h2 className="font-serif text-white text-3xl md:text-4xl font-bold mb-4">
          We&apos;d Love to Hear from You
        </h2>
        <p className="text-white/75 text-lg leading-relaxed mb-8">
          Big question, small question, or anything in between — Paul
          Cartwright is glad to hear from you. Email anytime; we&apos;ll get
          back to you quickly.
        </p>
        <a
          href="mailto:info@fulshearcoc.org"
          className="inline-flex items-center justify-center gap-2 bg-white text-sage-deep font-semibold px-8 py-3.5 rounded-full hover:bg-cream transition-colors shadow-lg text-base"
        >
          Email Paul
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
            <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
          </svg>
        </a>
        <p className="text-white/60 text-sm mt-4">info@fulshearcoc.org</p>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function ConnectPage() {
  return (
    <>
      <PageHero />
      <BibleClasses />
      <NewcomerDinner />
      <FindYourPlace />
      <InTheCommunity />
      <PrayerSection />
      <TalkToMinister />
    </>
  );
}
