import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Youth Ministry",
  description:
    "Youth Ministry at Fulshear Church of Christ — Sunday and Wednesday Bible classes, monthly activities, Camp Bandina, area-wide youth meetings, retreats, and leadership conferences. Led by Danny DiPetta.",
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
            "radial-gradient(ellipse at 30% 60%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          6th – 12th Grade
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Youth Ministry
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Where teenagers wrestle with real questions, build real
          friendships, and follow Jesus on their own.
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
            Where Faith Becomes Their Own
          </h2>
        </div>
        <div className="space-y-5 text-charcoal text-base md:text-lg leading-relaxed">
          <p>
            The middle and high school years are when faith stops being
            inherited and starts becoming personal. They&apos;re also the
            years when belonging matters most.
          </p>
          <p>
            Our youth ministry exists to walk alongside teenagers through
            both — wrestling honestly with the hard questions, building
            friendships that&apos;ll outlast graduation, and discovering
            what it actually means to follow Jesus when nobody&apos;s
            watching.
          </p>
        </div>
      </div>
    </section>
  );
}

const weeklyRhythms = [
  {
    day: "Sunday Mornings",
    time: "9:00 AM",
    body: "Bible class with their peers — same hour as the adult classes, same building, same family.",
  },
  {
    day: "Wednesday Evenings",
    time: "7:00 PM",
    body: "A mid-week class focused on going deeper — bringing real questions, real life, and real Bible together.",
  },
];

function WeeklyRhythms() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Every Week
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Sunday & Wednesday Bible Classes
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {weeklyRhythms.map((r) => (
            <div key={r.day} className="bg-white rounded-2xl p-7 shadow-sm">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-serif font-bold text-sage-deep text-xl">
                  {r.day}
                </h3>
                <span className="text-sage font-semibold text-sm">
                  {r.time}
                </span>
              </div>
              <p className="text-charcoal text-sm md:text-base leading-relaxed">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MonthlyActivities() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm">
            <Image
              src="/kids.jpg"
              alt="Youth Ministry at Fulshear Church of Christ"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
              Once a Month
            </p>
            <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-5 leading-snug">
              Beyond the Building
            </h2>
            <p className="text-charcoal text-lg leading-relaxed">
              Each month we get out of the classroom — service projects,
              fellowship hangouts, game nights, and the kinds of low-pressure
              gatherings where the best friendships actually happen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const summerEvents = [
  {
    title: "Camp Bandina",
    body: "A week away in the Hill Country — Bible study, worship, lake time, and the kind of friendships that come from shared cabin chaos.",
  },
  {
    title: "Area-Wide Youth Meetings",
    body: "Summer gatherings with youth groups from Churches of Christ across the region — shared worship, shared fun, shared faith.",
  },
  {
    title: "Youth Retreats",
    body: "Weekend getaways focused on going deep with God and with each other — fewer distractions, more space for real conversation.",
  },
  {
    title: "Leadership Conferences",
    body: "Targeted training and challenge for teens stepping into spiritual leadership in their schools, families, and beyond.",
  },
];

function SummerAndBeyond() {
  return (
    <section className="bg-rose-muted py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose-dark text-sm font-semibold tracking-widest uppercase mb-2">
            Summer & Beyond
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            The Big Stuff
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {summerEvents.map((e) => (
            <div key={e.title} className="bg-white rounded-2xl p-7 shadow-sm">
              <h3 className="font-serif font-bold text-sage-deep text-xl mb-2">
                {e.title}
              </h3>
              <p className="text-charcoal text-sm md:text-base leading-relaxed">
                {e.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MeetYourMinister() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-square shadow-sm bg-sage-muted max-w-sm mx-auto md:mx-0 w-full">
            <Image
              src="/leaders/danny-dipetta.jpg"
              alt="Danny DiPetta, Youth Minister at Fulshear Church of Christ"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 360px, 80vw"
            />
          </div>
          <div>
            <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
              Meet Your Minister
            </p>
            <h2 className="font-serif text-sage-deep text-3xl font-bold mb-4 leading-snug">
              Danny DiPetta
            </h2>
            <p className="text-charcoal leading-relaxed mb-6">
              Danny leads our youth ministry — teaching classes, planning
              activities, and walking alongside our students through every
              season of teenage life. If your teen is new, or if you have any
              question at all, he&apos;d love to hear from you.
            </p>
            <a
              href="mailto:info@fulshearcoc.org?subject=Youth%20Ministry"
              className="inline-flex items-center justify-center gap-2 bg-sage text-white font-semibold px-6 py-3 rounded-full hover:bg-sage-dark transition-colors text-base shadow-sm"
            >
              Email Danny
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function YouthMinistryPage() {
  return (
    <>
      <PageHero />
      <Heart />
      <WeeklyRhythms />
      <MonthlyActivities />
      <SummerAndBeyond />
      <MeetYourMinister />
    </>
  );
}
