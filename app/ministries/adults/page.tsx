import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adult Ministry",
  description:
    "Adult Ministry at Fulshear Church of Christ — Sunday Bible classes including the Bridge class for young adults, Wednesday mid-week study, and ongoing groups: Men's Breakfast, Women's Bible Studies, and the Lady OWLs.",
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
            "radial-gradient(ellipse at 80% 50%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          Young Adults & Beyond
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Adult Ministry
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          We never outgrow Scripture, community, or the call to keep growing.
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
            A Place for Every Season
          </h2>
        </div>
        <div className="space-y-5 text-charcoal text-base md:text-lg leading-relaxed">
          <p>
            Adult life at Fulshear is built around a simple conviction: we
            never outgrow our need for Scripture, for honest community, or
            for room to keep growing. Whether you&apos;re navigating early
            career, raising kids, building a marriage, or stepping into the
            rhythms of retirement — there&apos;s a class, a circle, and a
            community waiting for you here.
          </p>
        </div>
      </div>
    </section>
  );
}

const sundayClasses = [
  {
    name: "Bridge",
    label: "The In-Between Years",
    body: "For those navigating the gap between high school and full adulthood — college students, young singles, and anyone still figuring out what comes next. Honest study, real community, no pretending.",
  },
  {
    name: "Adult Class",
    label: "Mixed Adults",
    body: "An adult Bible class with a wide range of life seasons — verse-by-verse, topical, or book-of-the-Bible study depending on the season.",
  },
  {
    name: "Adult Class",
    label: "Mixed Adults",
    body: "A second adult class option offering a different study track — different teacher, different style, same Word.",
  },
];

function SundayClasses() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Sunday Mornings — 9:00 AM
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Three Classes, One Family
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Pick the Sunday class that fits the season you&apos;re in.
            Switch anytime — they all teach the same Word, just from
            different angles.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {sundayClasses.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="bg-white rounded-2xl p-7 shadow-sm flex flex-col gap-3"
            >
              <div>
                <h3 className="font-serif font-bold text-sage-deep text-xl">
                  {c.name}
                </h3>
                <div className="text-sage text-xs font-semibold uppercase tracking-wider mt-0.5">
                  {c.label}
                </div>
              </div>
              <p className="text-charcoal text-sm md:text-base leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WednesdayClass() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
          Wednesday Evenings — 7:00 PM
        </p>
        <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-5">
          Mid-Week Class
        </h2>
        <p className="text-charcoal text-lg leading-relaxed">
          A focused mid-week study for adults — a chance to slow down, ask
          questions, and dig into Scripture with people you&apos;re still
          getting to know. Kids&apos; classes run at the same time, so the
          whole family can be here.
        </p>
      </div>
    </section>
  );
}

const groups = [
  {
    title: "Men's Breakfast",
    body: "The men of the church gathering early over food, the Bible, and the conversations we usually don&rsquo;t make time for. A place for sharpening, friendship, and accountability.",
  },
  {
    title: "Women's Bible Studies",
    body: "Multiple study options through the year — book of the Bible, topical, or seasonal — for women in every life stage. Real Scripture, real friendships, real laughter.",
  },
  {
    title: "Lady OWLs",
    body: "<strong>O</strong>lder, <strong>W</strong>iser, <strong>L</strong>ivelier. The women who have walked the road longest, gathering for fellowship, study, and the kind of joy that only comes from a life lived with God.",
  },
];

function GroupsAndGatherings() {
  return (
    <section className="bg-rose-muted py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose-dark text-sm font-semibold tracking-widest uppercase mb-2">
            Beyond Sunday
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Groups & Gatherings
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Smaller circles where the church family actually grows together.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {groups.map((g) => (
            <div key={g.title} className="bg-white rounded-2xl p-7 shadow-sm">
              <h3 className="font-serif font-bold text-sage-deep text-xl mb-2">
                {g.title}
              </h3>
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

function Contact() {
  return (
    <section className="bg-sage-deep text-white py-12 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-3">
          Get Plugged In
        </p>
        <h2 className="font-serif text-white text-2xl md:text-3xl font-bold mb-3">
          Curious about a class or group?
        </h2>
        <p className="text-white/75 leading-relaxed mb-2">
          Email{" "}
          <a
            href="mailto:info@fulshearcoc.org?subject=Adult%20Ministry"
            className="text-rose-light font-semibold hover:text-white transition-colors"
          >
            info@fulshearcoc.org
          </a>{" "}
          — we&apos;ll point you to the right place.
        </p>
      </div>
    </section>
  );
}

export default function AdultMinistryPage() {
  return (
    <>
      <PageHero />
      <Heart />
      <SundayClasses />
      <WednesdayClass />
      <GroupsAndGatherings />
      <Contact />
    </>
  );
}
