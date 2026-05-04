import type { Metadata } from "next";
import Link from "next/link";

const REGISTER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSekebZlMH6PQlZRl8hX-b74GuYUsyZruq1ERc9wic-XUzH83g/viewform?usp=send_form";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=9241+Charger+Way+Fulshear+TX+77441";

export const metadata: Metadata = {
  title: "Camp Faith — VBS 2026",
  description:
    "Camp Faith VBS 2026 — Gathering Around God's Light. June 1–4, 2026, 6:00–8:00 PM. For ages 3 through 5th grade. Register today.",
};

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function VBSHero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #5BA8DD 0%, #8DC76F 45%, #F4C969 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 75% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="inline-block text-white text-sm font-bold tracking-widest uppercase mb-4 bg-rose px-4 py-1.5 rounded-full shadow">
          VBS 2026
        </p>
        <h1 className="font-serif text-white text-5xl md:text-7xl font-bold mb-4 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          Camp Faith
        </h1>
        <p className="font-serif text-white text-2xl md:text-3xl italic mb-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
          Gathering Around God&apos;s Light
        </p>
        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-white text-sage-deep font-bold px-8 py-4 rounded-full hover:bg-cream transition-colors text-lg shadow-xl"
        >
          Register Your Kids
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
        </a>
      </div>
    </section>
  );
}

/* ─── Details ───────────────────────────────────────────────────────────────── */
const details = [
  {
    label: "Dates",
    body: (
      <>
        <p className="font-semibold text-sage-deep">June 1–4, 2026</p>
        <p className="text-sm text-muted mt-1">Monday through Thursday</p>
        <p className="text-sm text-muted mt-1">
          Day 4 — Kids Program & Ice Cream Social
        </p>
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path
          fillRule="evenodd"
          d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Time",
    body: (
      <>
        <p className="font-semibold text-sage-deep">6:00 – 8:00 PM</p>
        <p className="text-sm text-muted mt-1">Each evening</p>
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Ages",
    body: (
      <>
        <p className="font-semibold text-sage-deep">3 years old – 5th grade</p>
        <p className="text-sm text-muted mt-1">Age-appropriate classes</p>
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
      </svg>
    ),
  },
];

function Details() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            What to Know
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            The Details
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {details.map((item) => (
            <div
              key={item.label}
              className="bg-cream rounded-2xl p-7 text-center"
            >
              <div className="text-rose w-fit mx-auto mb-4">{item.icon}</div>
              <div className="font-serif font-bold text-sage-deep text-xl mb-3 uppercase tracking-wide">
                {item.label}
              </div>
              {item.body}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─────────────────────────────────────────────────────────────────── */
function About() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
          What is VBS?
        </p>
        <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-6">
          Four Nights of Faith, <br className="hidden md:block" />
          Friendship & Fun
        </h2>
        <p className="text-charcoal text-lg leading-relaxed mb-4">
          Vacation Bible School is a free, four-night event packed with Bible
          stories, songs, crafts, games, and snacks — all centered on the light
          of Jesus. This year&apos;s theme is{" "}
          <span className="font-semibold text-sage-deep">Camp Faith</span>:
          gathering around God&apos;s light just like a campfire, learning what
          it means to walk in his light every day.
        </p>
        <p className="text-charcoal text-lg leading-relaxed">
          We close out the week on Thursday with a special Kids Program where
          your children show off what they&apos;ve learned, followed by an Ice
          Cream Social for the whole family.
        </p>
      </div>
    </section>
  );
}

/* ─── Register CTA ──────────────────────────────────────────────────────────── */
function RegisterCTA() {
  return (
    <section className="bg-sage-deep py-16 md:py-20 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-3">
          Save Your Spot
        </p>
        <h2 className="font-serif text-white text-3xl md:text-4xl font-bold mb-4">
          Register for Camp Faith
        </h2>
        <p className="text-white/75 text-lg leading-relaxed mb-8">
          Registration takes just a couple of minutes. Once you&apos;re signed
          up, we&apos;ll have everything ready for your kids the moment you
          arrive.
        </p>
        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-rose text-white font-bold px-8 py-4 rounded-full hover:bg-rose-dark transition-colors text-lg shadow-xl"
        >
          Open Registration Form
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

/* ─── Contact / Location ────────────────────────────────────────────────────── */
function ContactInfo() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Questions?
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Get in Touch
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-cream rounded-2xl p-6">
            <div className="font-semibold text-sage-deep mb-2">Where</div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted text-sm leading-relaxed hover:text-sage transition-colors block"
            >
              Fulshear Church of Christ
              <br />
              9241 Charger Way
              <br />
              Fulshear, TX 77441
            </a>
          </div>
          <div className="bg-cream rounded-2xl p-6">
            <div className="font-semibold text-sage-deep mb-2">Contact</div>
            <p className="text-muted text-sm leading-relaxed">
              <a
                href="mailto:office@fulshearcoc.org"
                className="hover:text-sage transition-colors"
              >
                office@fulshearcoc.org
              </a>
            </p>
            <p className="text-muted text-sm leading-relaxed">
              <a
                href="tel:+12817121492"
                className="hover:text-sage transition-colors"
              >
                281-712-1492
              </a>
            </p>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage font-semibold text-sm hover:text-sage-dark transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function VBSPage() {
  return (
    <>
      <VBSHero />
      <Details />
      <About />
      <RegisterCTA />
      <ContactInfo />
    </>
  );
}
