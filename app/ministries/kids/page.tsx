import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kids Ministry",
  description:
    "Kids Ministry at Fulshear Church of Christ — age-grouped Bible classes from nursery through 5th grade, plus VBS, Trunk-or-Treat, and Easter Egg Hunts.",
};

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
          Ages 0 — 5th Grade
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Kids Ministry
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Where every child is known, deeply loved, and rooted in the story
          of God.
        </p>
      </div>
    </section>
  );
}

function Heart() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Our Heart
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            We Want Your Kids to Love Jesus
          </h2>
        </div>
        <div className="space-y-5 text-charcoal text-base md:text-lg leading-relaxed">
          <p>
            Childhood is the season when faith takes root. At Fulshear, we
            don&apos;t just want your kids to learn <em>about</em> Jesus —
            we want them to fall in love with him. To grow up knowing they
            are deeply loved by God, deeply known by this church family,
            and deeply written into the story of Scripture.
          </p>
          <p>
            Our volunteers build their classes around the Bible itself —
            stories, songs, crafts, and conversations that help children
            see themselves and their world through the eyes of God&apos;s
            grace.
          </p>
        </div>
      </div>
    </section>
  );
}

const ageGroups = [
  {
    range: "Nursery",
    ages: "0 – 2 years",
    body: "A safe, loving space for our littlest ones — gentle care, soft songs, and a Bible verse or two woven through every visit.",
  },
  {
    range: "Pre-K",
    ages: "3 – 5 years",
    body: "Big Bible stories told in small, hands-on ways. Songs, simple crafts, and the basics of who God is — Father, Son, and Spirit.",
  },
  {
    range: "K – 2nd Grade",
    ages: "Kindergarten – 2nd",
    body: "Reading the Bible, meeting its people, and learning the timeline of God&rsquo;s story — from creation through the early church.",
  },
  {
    range: "3rd – 5th Grade",
    ages: "Older elementary",
    body: "Deeper Bible study, real questions, and real friendships. The class where kids start owning their faith — not just receiving it.",
  },
];

function WhenWeMeet() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            When We Meet
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Classes for Every Age
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Age-grouped Bible classes meet during Sunday Bible Class hour
            (9:00 AM) and Wednesday evenings (7:00 PM). Pick the one that
            fits your child&apos;s grade — they&apos;ll be in great hands.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {ageGroups.map((g) => (
            <div
              key={g.range}
              className="bg-white rounded-2xl p-7 shadow-sm border border-sage-muted/60"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-serif font-bold text-sage-deep text-xl">
                  {g.range}
                </h3>
                <span className="text-sage font-semibold text-sm">
                  {g.ages}
                </span>
              </div>
              <p
                className="text-charcoal text-sm md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: g.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const events = [
  {
    title: "Vacation Bible School",
    body: "Our biggest week of the summer — a full-on, all-in celebration of Scripture, songs, games, and friends. Open to every kid in the community.",
  },
  {
    title: "Trunk or Treat",
    body: "An October evening in our parking lot — decorated trunks, lots of candy, no pressure. Bring the whole neighborhood.",
  },
  {
    title: "Easter Egg Hunts",
    body: "Our annual celebration of the resurrection — eggs hidden by the hundreds, snacks, and the story of why we have this hope at all.",
  },
];

function SpecialEvents() {
  return (
    <section className="bg-rose-muted py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose-dark text-sm font-semibold tracking-widest uppercase mb-2">
            Beyond Sunday
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Special Events
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            The big-deal moments your kids will look forward to all year.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((e) => (
            <div
              key={e.title}
              className="bg-white rounded-2xl p-7 shadow-sm flex flex-col gap-3"
            >
              <h3 className="font-serif font-bold text-sage-deep text-xl">
                {e.title}
              </h3>
              <p className="text-charcoal text-sm leading-relaxed">{e.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanAVisitCallout() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 shadow-sm">
            <Image
              src="/kids.jpg"
              alt="Children enjoying Kids Ministry at Fulshear Church of Christ"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
              Visiting?
            </p>
            <h2 className="font-serif text-sage-deep text-3xl font-bold mb-4 leading-snug">
              Your First Sunday
            </h2>
            <p className="text-charcoal leading-relaxed mb-6">
              We use a secure check-in system at every entrance. All of our
              volunteers are background-checked and trained. Your kids will
              be loved on, taught well, and returned safely. Plan a visit and
              we&apos;ll meet you at the door.
            </p>
            <Link
              href="/plan-a-visit"
              className="inline-flex items-center justify-center gap-2 bg-sage text-white font-semibold px-6 py-3 rounded-full hover:bg-sage-dark transition-colors text-base shadow-sm"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="bg-sage-deep text-white py-12 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-3">
          Questions?
        </p>
        <h2 className="font-serif text-white text-2xl md:text-3xl font-bold mb-3">
          We&apos;d Love to Talk
        </h2>
        <p className="text-white/75 leading-relaxed mb-2">
          Email us at{" "}
          <a
            href="mailto:info@fulshearcoc.org?subject=Kids%20Ministry"
            className="text-rose-light font-semibold hover:text-white transition-colors"
          >
            info@fulshearcoc.org
          </a>{" "}
          — we&apos;ll get back to you quickly.
        </p>
      </div>
    </section>
  );
}

export default function KidsMinistryPage() {
  return (
    <>
      <PageHero />
      <Heart />
      <WhenWeMeet />
      <SpecialEvents />
      <PlanAVisitCallout />
      <Contact />
    </>
  );
}
