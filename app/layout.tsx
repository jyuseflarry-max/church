import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import BottomNav from "./components/BottomNav";

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

// Resolves to the Vercel production URL automatically (e.g. project.vercel.app)
// while the custom domain is still on the old host. Once fulshearcoc.org is
// migrated to Vercel, set NEXT_PUBLIC_SITE_URL=https://fulshearcoc.org in the
// Vercel project settings to make that the canonical OG / metadata URL.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const SITE_NAME = "Fulshear Church of Christ";
const SITE_DESCRIPTION =
  "A welcoming community of faith in Fulshear, TX. Join us for worship, community, and a life transformed by grace.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["church", "Fulshear", "Church of Christ", "worship", "community", "faith"],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const desktopNavLinks = [
  { href: "/", label: "Home" },
  { href: "/plan-a-visit", label: "Plan a Visit" },
  { href: "/connect", label: "Connect" },
  { href: "/about", label: "About" },
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
        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-muted shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center group" aria-label="Fulshear Church of Christ — Home">
              <Image
                src="/logo.png"
                alt="Fulshear Church of Christ"
                width={150}
                height={126}
                priority
                className="h-12 w-auto"
              />
            </Link>

            <nav className="flex items-center gap-1">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-charcoal hover:text-sage rounded-md hover:bg-sage-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Reserved for member login / account menu */}
            <div className="hidden lg:block w-[140px]" aria-hidden="true" />
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-muted">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex items-center" aria-label="Fulshear Church of Christ — Home">
              <Image
                src="/logo.png"
                alt="Fulshear Church of Christ"
                width={150}
                height={126}
                priority
                className="h-10 w-auto"
              />
            </Link>
            {/* Reserved for member login / account menu */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer — visible on all sizes; extra bottom padding on mobile to
            clear the fixed bottom nav (h-16 = 64px). */}
        <footer className="bg-sage-deep text-white/80 py-10 pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="font-serif text-white text-lg mb-3">Fulshear Church of Christ</div>
              <p className="text-sm leading-relaxed">A welcoming community of faith in Fulshear, TX.</p>
            </div>
            <div>
              <div className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Service Times</div>
              <p className="text-sm">Sunday Bible Class: 9:00 AM</p>
              <p className="text-sm">Sunday Worship: 10:00 AM</p>
              <p className="text-sm">Wednesday Evening: 7:00 PM</p>
            </div>
            <div>
              <div className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Visit Us</div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=9241+Charger+Way+Fulshear+TX+77441"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors block"
              >
                9241 Charger Way<br />
                Fulshear, TX 77441
              </a>
              <p className="text-sm mt-3">
                <a href="mailto:info@fulshearcoc.org" className="hover:text-white transition-colors">
                  info@fulshearcoc.org
                </a>
              </p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
            &copy; {new Date().getFullYear()} Fulshear Church of Christ. All rights reserved.
          </div>
        </footer>

        {/* Sticky Mobile Bottom Nav */}
        <BottomNav />
      </body>
    </html>
  );
}
