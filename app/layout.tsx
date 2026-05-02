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

const SITE_URL = "https://fulshearcoc.org";
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
  { href: "/ministries", label: "Ministries" },
  { href: "/about", label: "About" },
  { href: "/sermons", label: "Sermons" },
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

            <Link
              href="/plan-a-visit"
              className="hidden lg:inline-flex items-center gap-2 bg-sage px-4 py-2 rounded-full text-white text-sm font-semibold hover:bg-sage-dark transition-colors"
            >
              Plan Your Visit
            </Link>
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
            <Link
              href="/plan-a-visit"
              className="bg-sage text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage-dark transition-colors"
            >
              Plan a Visit
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* Footer */}
        <footer className="hidden md:block bg-sage-deep text-white/80 py-10">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8">
            <div>
              <div className="font-serif text-white text-lg font-semibold mb-2">Fulshear Church of Christ</div>
              <p className="text-sm leading-relaxed">A welcoming community of faith in Fulshear, TX.</p>
            </div>
            <div>
              <div className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Service Times</div>
              <p className="text-sm">Sunday Bible Class: 9:00 AM</p>
              <p className="text-sm">Sunday Worship: 10:00 AM</p>
              <p className="text-sm">Wednesday Evening: 7:00 PM</p>
            </div>
            <div>
              <div className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Connect</div>
              <p className="text-sm">info@fulshearcoc.org</p>
              <p className="text-sm mt-1">Fulshear, TX 77441</p>
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
