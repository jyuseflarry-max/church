import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { church, distinctives, images, nextSteps } from "./site-content";

const searchItems = [
  { title: "Purpose", body: "We all want our lives to matter.", icon: "spark" },
  { title: "Hope", body: "We long for something more.", icon: "star" },
  { title: "Peace", body: "We crave peace that lasts.", icon: "flower" },
  { title: "Forgiveness", body: "We all need a fresh start.", icon: "heart" },
  { title: "Real Relationships", body: "We were made for connection.", icon: "people" },
  { title: "Truth", body: "We all want to know what is real.", icon: "cross" },
];

const visitInfo = [
  { label: "Sunday Worship", value: "10:00 AM", icon: "clock" },
  { label: "Bible Class", value: "9:00 AM", icon: "book" },
  { label: "Location", value: "9241 Charger Way", icon: "pin" },
  { label: "What to Wear", value: "Come as you are", icon: "shirt" },
];

const stories = [
  {
    title: "From anxiety to peace",
    body: "God met me in my hardest season.",
    image: "/leaders/jyusef-larry.jpg",
  },
  {
    title: "Marriage restored",
    body: "We found hope and healing.",
    image: "/redesign/fellowship-lobby.png",
  },
  {
    title: "A new purpose",
    body: "I found a life worth living again.",
    image: "/leaders/brock-mayberry.jpg",
  },
  {
    title: "Forgiven and set free",
    body: "Grace gave me a new beginning.",
    image: "/leaders/danny-dipetta.jpg",
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

function LineIcon({ name }: { name: string }) {
  const common = "fill-none stroke-current stroke-[1.8]";

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-rose"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="8" className={common} />
          <path d="M12 7.8v4.6l3 1.8" className={common} />
        </>
      )}
      {name === "book" && (
        <>
          <path d="M5 5.5h6a3 3 0 0 1 3 3v10a3 3 0 0 0-3-3H5z" className={common} />
          <path d="M19 5.5h-5a3 3 0 0 0-3 3v10a3 3 0 0 1 3-3h5z" className={common} />
        </>
      )}
      {name === "pin" && (
        <>
          <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" className={common} />
          <circle cx="12" cy="10" r="2" className={common} />
        </>
      )}
      {name === "shirt" && (
        <path d="M8 5 5 7.5 7 11l1.5-.8V19h7v-8.8L17 11l2-3.5L16 5l-2 2h-4z" className={common} />
      )}
      {name === "cross" && <path d="M12 4v16M6.5 9.5h11" className={common} />}
      {name === "people" && (
        <>
          <circle cx="9" cy="9" r="3" className={common} />
          <circle cx="16" cy="10" r="2.5" className={common} />
          <path d="M4 19a5 5 0 0 1 10 0M13 18.5a4.5 4.5 0 0 1 7 0" className={common} />
        </>
      )}
      {name === "heart" && (
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" className={common} />
      )}
      {name === "spark" && (
        <path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" className={common} />
      )}
      {name === "star" && (
        <path d="m12 4 2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8L5 9.1l4.8-.7z" className={common} />
      )}
      {name === "flower" && (
        <>
          <circle cx="12" cy="12" r="2.4" className={common} />
          <path d="M12 4.5c2 2.2 2 3.8 0 5-2-1.2-2-2.8 0-5ZM12 19.5c-2-2.2-2-3.8 0-5 2 1.2 2 2.8 0 5ZM4.5 12c2.2-2 3.8-2 5 0-1.2 2-2.8 2-5 0ZM19.5 12c-2.2 2-3.8 2-5 0 1.2-2 2.8-2 5 0Z" className={common} />
        </>
      )}
    </svg>
  );
}

function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
}) {
  const classes = {
    primary: "bg-rose text-white hover:bg-rose-dark",
    secondary: "border border-rose/35 bg-white text-rose-dark hover:bg-rose-muted",
    light: "bg-white text-charcoal hover:bg-cream",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold shadow-sm transition-colors focus-ring ${classes[variant]}`}
    >
      {children}
    </Link>
  );
}

function Hero() {
  return (
    <section className="bg-warm-white">
      <div className="container-wide py-6 md:py-8">
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_18px_50px_rgba(36,33,30,0.11)]">
          <div className="grid min-h-[620px] md:grid-cols-[0.92fr_1.08fr]">
            <div className="flex items-center px-7 py-12 sm:px-10 lg:px-12">
              <div className="max-w-xl">
                <h1 className="text-4xl font-bold leading-[1.08] text-charcoal sm:text-5xl lg:text-6xl">
                  There&apos;s{" "}
                  <span className="font-sans text-[0.9em] italic text-rose">hope</span>
                  <br />
                  bigger than what you&apos;re carrying.
                </h1>
                <p className="mt-6 max-w-md text-base leading-7 text-muted">
                  We&apos;re a church family learning to follow Jesus and love like He loves.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/about">Learn About Jesus</ButtonLink>
                  <ButtonLink href="/plan-a-visit" variant="secondary">
                    Plan Your Visit
                  </ButtonLink>
                </div>
              </div>
            </div>

            <div className="relative min-h-[360px]">
              <Image
                src={images.arrival}
                alt="A quiet morning landscape that reflects hope and welcome"
                fill
                priority
                sizes="(min-width: 768px) 54vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent md:from-white/40" />
            </div>
          </div>

          <div className="grid gap-3 border-t border-line bg-rose-muted/60 px-7 py-4 text-sm md:grid-cols-[auto_1fr_auto] md:items-center lg:px-12">
            <div className="flex items-center gap-3 font-bold text-charcoal">
              <LineIcon name="spark" />
              <span>THIS SUNDAY</span>
            </div>
            <p className="font-semibold text-charcoal/82">Find upcoming classes, gatherings, and church family events.</p>
            <Link href="/vbs" className="inline-flex items-center gap-2 font-bold text-rose-dark hover:text-charcoal">
              See What&apos;s Coming <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchingSection() {
  return (
    <section className="bg-warm-white py-12">
      <div className="container-wide">
        <h2 className="text-3xl font-bold leading-tight text-charcoal md:text-4xl">
          Everyone is searching for something.
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          You&apos;re not alone. We believe life is better when we find it in God.
        </p>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {searchItems.map((item) => (
            <article key={item.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <LineIcon name={item.icon} />
              </div>
              <h3 className="mt-3 font-sans text-sm font-extrabold text-charcoal">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkStoryCallout() {
  return (
    <section className="relative overflow-hidden bg-[#201c18] py-16 text-white">
      <Image
        src={images.study}
        alt="An open Bible on a table"
        fill
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#201c18] via-[#201c18]/80 to-[#201c18]/20" />
      <div className="container-wide relative">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            What if Jesus really is who He claimed to be?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/76">
            Jesus offers hope that can change everything.
          </p>
          <div className="mt-7">
            <ButtonLink href="/sermons" variant="primary">
              Explore the Story
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisitSection() {
  return (
    <section className="bg-white py-14">
      <div className="container-wide overflow-hidden rounded-lg border border-line bg-white shadow-[0_16px_48px_rgba(36,33,30,0.09)]">
        <div className="relative min-h-[380px] px-7 py-14 text-white sm:px-10 lg:px-12">
          <Image
            src={images.arrival}
            alt="Families arriving at Fulshear Church of Christ"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#201c18] via-[#201c18]/75 to-[#201c18]/25" />
          <div className="relative max-w-md">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">Plan Your Visit</h2>
            <p className="mt-4 text-sm leading-7 text-white/82">
              We can&apos;t wait to meet you. When you visit, you&apos;ll find friendly
              people, meaningful worship, and a place where you can belong.
            </p>
            <div className="mt-7">
              <ButtonLink href="/plan-a-visit">Plan Your Visit</ButtonLink>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-line bg-white md:grid-cols-4 md:divide-x md:divide-y-0">
          {visitInfo.map((item) => (
            <article key={item.label} className="px-6 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <LineIcon name={item.icon} />
              </div>
              <h3 className="mt-3 font-sans text-sm font-extrabold text-charcoal">{item.label}</h3>
              <p className="mt-2 text-sm leading-5 text-muted">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="border-t border-line bg-white px-7 py-4 text-center">
          <a
            href={church.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-rose-dark hover:text-charcoal"
          >
            Get Directions <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

function StoriesSection() {
  return (
    <section className="bg-warm-white py-14">
      <div className="container-wide">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
            Real People. Real Stories. Real Change.
          </h2>
          <p className="mt-2 text-sm text-muted">See how Jesus is transforming lives.</p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <article key={story.title} className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-sage-muted">
                <Image
                  src={story.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-sans text-base font-extrabold leading-tight text-charcoal">{story.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{story.body}</p>
                <Link href="/connect" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-dark hover:text-charcoal">
                  Watch Story <ArrowIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NextStepsSection() {
  return (
    <section className="bg-cream py-14">
      <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-charcoal md:text-5xl">
            Wherever you are, we&apos;re here to help.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            You do not have to figure everything out before you come near. Pick
            the next step that makes sense, and we will meet you there.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-lg border border-line bg-white p-6 shadow-sm transition-colors hover:border-rose-light hover:bg-warm-white focus-ring"
            >
              <LineIcon name={step.title === "Visit Sunday" ? "pin" : step.title === "Watch First" ? "book" : "people"} />
              <h3 className="mt-4 font-sans text-lg font-extrabold leading-tight text-charcoal">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-rose-dark group-hover:text-charcoal">
                {step.cta} <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FamilySection() {
  return (
    <section className="bg-white py-14">
      <div className="container-wide overflow-hidden rounded-lg border border-line bg-white shadow-[0_16px_48px_rgba(36,33,30,0.08)]">
        <div className="relative min-h-[360px] px-7 py-14 text-white sm:px-10 lg:px-12">
          <Image
            src={images.kids}
            alt="Children smiling together at church"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#201c18]/88 via-[#201c18]/52 to-transparent" />
          <div className="relative max-w-md">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Your kids will love it here too.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/82">
              Safe, fun, and age-appropriate teaching every Sunday.
            </p>
            <div className="mt-7">
              <ButtonLink href="/ministries/kids">Learn More</ButtonLink>
            </div>
          </div>
        </div>
        <div className="grid divide-y divide-line bg-white md:grid-cols-4 md:divide-x md:divide-y-0">
          {["Nursery 0-2 Years", "Preschool 3-5 Years", "Kids K-5th Grade", "Students 6th-12th Grade"].map((item, index) => (
            <div key={item} className="px-5 py-7 text-center">
              <LineIcon name={index === 3 ? "people" : "heart"} />
              <p className="mt-3 text-sm font-extrabold text-charcoal">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesBand() {
  return (
    <section className="border-y border-line bg-white py-7">
      <div className="container-wide grid gap-6 md:grid-cols-[1fr_2fr] md:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight text-charcoal md:text-4xl">
            Seeking and Saving the Lost.
          </h2>
          <p className="mt-2 text-base text-muted">Helping people find life, purpose, and hope in Jesus.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {distinctives.map((item, index) => (
            <div key={item.title} className="border-line lg:border-l lg:pl-7">
              <LineIcon name={["cross", "book", "people", "heart"][index]} />
              <h3 className="mt-3 font-sans text-sm font-extrabold text-charcoal">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchingSection />
      <DarkStoryCallout />
      <VisitSection />
      <StoriesSection />
      <NextStepsSection />
      <FamilySection />
      <ValuesBand />
    </>
  );
}
