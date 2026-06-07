import type { Metadata } from "next";
import Link from "next/link";
import { church } from "../../site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Fulshear Church of Christ handles information submitted through our website and related online services.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We may collect information you choose to provide through this website, such as your name, email address, phone number, prayer requests, questions, visit plans, or other details included in a form or message.",
      "Our website may also collect basic technical information automatically, such as browser type, device information, pages visited, referring pages, and approximate location derived from your connection. This information helps us maintain, secure, and improve the website.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use information submitted through the site to respond to questions, follow up with visitors, receive prayer requests, provide ministry information, support website operation, and communicate with people who ask to hear from us.",
      "We do not sell, rent, or trade personal information.",
    ],
  },
  {
    title: "Prayer Requests and Ministry Communications",
    body: [
      "Prayer requests or messages submitted to the church may be shared with appropriate church leaders or ministry servants so they can respond, pray, or provide care. Please do not submit highly sensitive information unless you are comfortable sharing it with the church for that purpose.",
      "If you ask us to contact you, we may use the contact information you provide to reply by email, phone, text message, or another reasonable method.",
    ],
  },
  {
    title: "Online Giving and Third-Party Services",
    body: [
      "If this website links to an online giving provider, video platform, map service, member portal, email service, analytics provider, or other third-party service, that service may collect and process information under its own privacy policy.",
      "We encourage you to review the privacy practices of any third-party site before submitting personal, payment, or account information there.",
    ],
  },
  {
    title: "Cookies and Similar Technologies",
    body: [
      "Our website and third-party services may use cookies or similar technologies to support basic site functionality, understand site usage, remember preferences, improve performance, or protect the site from abuse.",
      "You can adjust cookie settings through your browser. Some website features may not work as intended if cookies are disabled.",
    ],
  },
  {
    title: "Information Sharing",
    body: [
      "We may share information with church leaders, ministry workers, service providers who help operate the website, or others when needed to respond to your request, provide a ministry service, comply with law, protect the site, or protect the rights and safety of others.",
      "Service providers are expected to use information only for the work they perform for us.",
    ],
  },
  {
    title: "Security and Retention",
    body: [
      "We take reasonable steps to protect information submitted through the website. No website, email system, or internet transmission can be guaranteed completely secure.",
      "We keep information only as long as it is useful for the purposes described in this policy, needed for church records, or required by law.",
    ],
  },
  {
    title: "Children",
    body: [
      "This website is intended for a general audience. We do not knowingly collect personal information from children under 13 without appropriate permission. If you believe a child has submitted personal information through the site, please contact us so we can review it.",
    ],
  },
  {
    title: "Updates to This Policy",
    body: [
      "We may update this privacy policy from time to time. When we do, we will update the effective date on this page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="bg-warm-white">
      <section className="section-pad border-b border-line/80 bg-cream">
        <div className="container-wide max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-dark">
            Website Privacy
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-sage-deep sm:text-5xl md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/76">
            This policy explains how {church.name} handles information submitted
            through our website and related online services.
          </p>
          <p className="mt-4 text-sm font-semibold text-muted">
            Effective date: June 7, 2026
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="self-start rounded-2xl border border-line bg-cream p-6">
            <h2 className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-sage-deep">
              Contact
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Questions about this policy may be sent to the church office.
            </p>
            <a
              href={`mailto:${church.email}`}
              className="mt-4 block text-sm font-bold text-sage-deep underline hover:text-sage-dark"
            >
              {church.email}
            </a>
            <a
              href={`tel:+1${church.phone.replace(/\D/g, "")}`}
              className="mt-2 block text-sm font-bold text-sage-deep underline hover:text-sage-dark"
            >
              {church.phone}
            </a>
            <p className="mt-5 text-sm leading-7 text-muted">{church.address}</p>
          </aside>

          <div className="space-y-9">
            <section>
              <h2 className="text-2xl font-bold text-sage-deep">
                Our Commitment
              </h2>
              <p className="mt-3 text-base leading-8 text-charcoal/76">
                We respect the privacy of visitors, members, and guests who use
                our website. We collect only what is useful for church
                communication, ministry care, website operation, and related
                purposes described below.
              </p>
            </section>

            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-bold text-sage-deep">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-charcoal/76"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-line bg-cream p-6">
              <h2 className="text-2xl font-bold text-sage-deep">
                Contact Us
              </h2>
              <p className="mt-3 text-base leading-8 text-charcoal/76">
                To ask a privacy question or request that we review information
                you submitted through the website, contact us at{" "}
                <a
                  href={`mailto:${church.email}`}
                  className="font-bold text-sage-deep underline hover:text-sage-dark"
                >
                  {church.email}
                </a>
                .
              </p>
              <Link
                href="/connect"
                className="mt-5 inline-flex rounded-full bg-sage-deep px-5 py-3 text-sm font-bold text-white hover:bg-sage-dark focus-ring"
              >
                Contact the church
              </Link>
            </section>
          </div>
        </div>
      </section>
    </article>
  );
}
