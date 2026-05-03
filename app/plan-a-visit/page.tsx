import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description:
    "Everything you need to know before your first visit — service times, what to wear, where to go, and how we can make you feel at home.",
};

/* ─── Page Hero ─────────────────────────────────────────────────────────────── */
function PageHero() {
  return (
    <section className="relative overflow-hidden bg-sage-deep py-20 md:py-28">
      {/* Placeholder: AI-generated image — warm, sun-lit modern church lobby with welcoming staff */}
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
            "radial-gradient(ellipse at 80% 60%, rgba(228,168,170,0.32) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-rose-light text-sm font-semibold tracking-widest uppercase mb-4">
          First Time Here?
        </p>
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
          What to Expect
        </h1>
        <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          We know visiting a new church can feel a little daunting. We want to
          take the mystery out of it. Here&apos;s everything you need to know
          before Sunday.
        </p>
      </div>
    </section>
  );
}

/* ─── Quick Info Cards ──────────────────────────────────────────────────────── */
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=9241+Charger+Way+Fulshear+TX+77441";

type QuickInfoItem = {
  icon: React.ReactNode;
  label: string;
  body: React.ReactNode;
};

const quickInfo: QuickInfoItem[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      </svg>
    ),
    label: "Service Times",
    body: (
      <>
        <p className="text-sm text-muted leading-relaxed">Sunday Bible Class: 9:00 AM</p>
        <p className="text-sm text-muted leading-relaxed">Sunday Worship: 10:00 AM</p>
        <p className="text-sm text-muted leading-relaxed">Wednesday Evening: 7:00 PM</p>
      </>
    ),
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8.25 8.25 0 0 0-16.5 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742ZM21.75 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Zm-13.5-1.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd" />
      </svg>
    ),
    label: "Location",
    body: (
      <>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted leading-relaxed hover:text-sage transition-colors block"
        >
          9241 Charger Way<br />
          Fulshear, TX 77441
        </a>
        <p className="text-sm text-muted leading-relaxed mt-1">Free parking is always available</p>
      </>
    ),
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
        <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
      </svg>
    ),
    label: "Get in Touch",
    body: (
      <>
        <p className="text-sm text-muted leading-relaxed">
          <a href="mailto:info@fulshearcoc.org" className="hover:text-sage transition-colors">
            info@fulshearcoc.org
          </a>
        </p>
        <p className="text-sm text-muted leading-relaxed">Questions? We love to hear from you.</p>
        <p className="text-sm text-muted leading-relaxed">We&apos;ll get back to you quickly.</p>
      </>
    ),
  },
];

function QuickInfoCards() {
  return (
    <section className="bg-white py-12 border-b border-sage-muted">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-3 gap-6">
          {quickInfo.map((card) => (
            <div key={card.label} className="flex gap-4 p-5 rounded-xl bg-cream">
              <div className="text-rose shrink-0 mt-0.5">{card.icon}</div>
              <div>
                <div className="font-semibold text-sage-deep mb-2">{card.label}</div>
                {card.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What Happens Section ──────────────────────────────────────────────────── */
const steps = [
  {
    number: "01",
    title: "Arrive & Park",
    body: "Pull into our free lot and look for our friendly greeters at every entrance. If it&rsquo;s your first Sunday, head to the Welcome Table just inside the main lobby — we&rsquo;d love to say hello personally.",
  },
  {
    number: "02",
    title: "Check In Your Kids",
    body: "Our Kids Ministry team will get your children checked in and settled into a safe, age-appropriate class. We use a secure check-in system so you can worship with complete peace of mind.",
  },
  {
    number: "03",
    title: "Join Us for Worship",
    body: "Our Sunday worship service lasts about 60–70 minutes. We sing a cappella — no instruments, just voices raised together — study the Bible, and share the Lord&rsquo;s Supper as a family.",
  },
  {
    number: "04",
    title: "Stay for Coffee",
    body: "After worship, the lobby fills up. Grab a cup of coffee and meet people. No pressure — just an open door. Many of our deepest friendships started right here.",
  },
];

function WhatHappens() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Your First Sunday
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold mb-4">
            Here&apos;s How It Goes
          </h2>
          <p className="text-muted leading-relaxed">
            No surprises. No pressure. We want your first visit to feel
            comfortable from the moment you pull in the parking lot.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-2xl p-7 flex gap-5 shadow-sm">
              <div className="font-serif text-4xl font-bold text-rose-light/50 leading-none shrink-0 w-10">
                {step.number}
              </div>
              <div>
                <h3 className="font-serif font-bold text-sage-deep text-lg mb-2">
                  {step.title}
                </h3>
                <p
                  className="text-muted text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: step.body }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What to Wear / FAQs ───────────────────────────────────────────────────── */
const faqs = [
  {
    q: "What should I wear?",
    a: "Come as you are — truly. You'll see people in everything from jeans and t-shirts to Sunday best. We care far more about you being present than what you're wearing.",
  },
  {
    q: "Do I have to participate?",
    a: "Not at all. You're welcome to simply observe. We'll never put you on the spot, ask you to stand up as a visitor, or pressure you in any way.",
  },
  {
    q: "What about giving?",
    a: "As a guest, please don't feel any obligation to give. Offerings are for our church family. We just want you to feel welcome.",
  },
  {
    q: "What is a cappella worship?",
    a: "Churches of Christ have historically worshipped with voices only — no instruments. It can feel surprisingly powerful and beautiful. We think you'll love it.",
  },
  {
    q: "What is the Lord's Supper?",
    a: "Each Sunday we remember Jesus's death and resurrection through unleavened bread and grape juice. Visitors are welcome to observe. There's no pressure to participate if you're not ready.",
  },
  {
    q: "How long is the service?",
    a: "Sunday worship runs about 60–70 minutes. Bible class before worship is 45 minutes. There's no 'right' time to arrive — join us for whatever works for your schedule.",
  },
];

function FAQSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-sm font-semibold tracking-widest uppercase mb-2">
            Common Questions
          </p>
          <h2 className="font-serif text-sage-deep text-3xl md:text-4xl font-bold">
            Good to Know <br className="hidden md:block" />
            Before You Come
          </h2>
        </div>

        <div className="divide-y divide-sage-muted">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <h3 className="font-serif font-semibold text-sage-deep text-lg mb-2">
                {faq.q}
              </h3>
              <p className="text-muted leading-relaxed text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function WhatToExpectPage() {
  return (
    <>
      <PageHero />
      <QuickInfoCards />
      <WhatHappens />
      <FAQSection />
    </>
  );
}
