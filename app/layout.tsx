import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "./components/BottomNav";
import { church, serviceTimes } from "./site-content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const SITE_DESCRIPTION =
  "A simple, sincere church family in the Fulshear-Katy area learning to follow Jesus together.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: church.name,
    template: `%s | ${church.name}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Fulshear church",
    "Katy church",
    "Church of Christ",
    "church near me",
    "Bible church Fulshear",
    "family church Katy",
  ],
  openGraph: {
    title: church.name,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: church.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: church.name,
    description: SITE_DESCRIPTION,
  },
};

const navLinks = [
  { href: "/plan-a-visit", label: "Plan Your Visit" },
  { href: "/ministries/kids", label: "Kids" },
  { href: "/ministries/youth", label: "Youth" },
  { href: "/sermons", label: "Teaching" },
  { href: "/about", label: "About" },
  { href: "/connect", label: "Connect" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream">
        <header className="sticky top-0 z-50 border-b border-line/80 bg-warm-white/95 backdrop-blur-md">
          <div className="container-wide flex h-16 items-center justify-between gap-5">
            <Link href="/" className="flex items-center focus-ring" aria-label={`${church.name} home`}>
              <Image
                src="/logo.png"
                alt={church.name}
                width={150}
                height={126}
                priority
                className="h-12 w-auto"
              />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-sage-muted hover:text-sage-deep focus-ring"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={church.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-sage-deep transition-colors hover:border-sage-light hover:bg-sage-muted focus-ring sm:inline-flex"
              >
                Directions
              </a>
              <Link
                href="/plan-a-visit"
                className="rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-dark focus-ring"
              >
                Plan Your Visit
              </Link>
            </div>
          </div>
        </header>

        <main className="site-shell flex-1">{children}</main>

        <footer className="bg-sage-deep pb-24 pt-14 text-white md:pb-14">
          <div className="container-wide grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <Image
                src="/logo.png"
                alt={church.name}
                width={150}
                height={126}
                className="mb-5 h-16 w-auto rounded bg-white/95 p-1"
              />
              <p className="max-w-sm text-sm leading-7 text-white/72">
                A simple, sincere church family serving Fulshear, Katy, Brookshire,
                Simonton, Richmond, and west Houston families.
              </p>
              <a
                href={church.memberUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex text-sm font-semibold text-rose-light hover:text-white"
              >
                Member login
              </a>
              <Link
                href="/about/privacy-policy"
                className="mt-3 block text-sm font-semibold text-white/64 hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>

            <div>
              <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-[0.18em] text-white">
                Gather With Us
              </h2>
              <div className="space-y-2">
                {serviceTimes.map((item) => (
                  <p key={item.label} className="text-sm text-white/74">
                    <span className="font-semibold text-white">{item.time}</span>{" "}
                    {item.label}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-[0.18em] text-white">
                Visit Us
              </h2>
              <a
                href={church.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm leading-7 text-white/74 hover:text-white"
              >
                9241 Charger Way
                <br />
                Fulshear, TX 77441
              </a>
              <a href={`tel:+1${church.phone.replace(/\D/g, "")}`} className="mt-3 block text-sm text-white/74 hover:text-white">
                {church.phone}
              </a>
              <a href={`mailto:${church.email}`} className="mt-2 block text-sm text-white/74 hover:text-white">
                {church.email}
              </a>
            </div>
          </div>

          <div className="container-wide mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/45">
            &copy; {new Date().getFullYear()} {church.name}. All rights reserved.
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
