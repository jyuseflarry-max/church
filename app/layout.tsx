import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Fulshear Church of Christ",
  description:
    "A welcoming community of faith in Fulshear, TX. Join us for worship, community, and a life transformed by grace.",
  keywords: ["church", "Fulshear", "Church of Christ", "worship", "community", "faith"],
};

const desktopNavLinks = [
  { href: "/", label: "Home" },
  { href: "/what-to-expect", label: "Plan a Visit" },
  { href: "/sermons", label: "Sermons" },
  { href: "/ministries", label: "Ministries" },
  { href: "/give", label: "Give" },
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
        <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-muted shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-slate-deep flex items-center justify-center">
                <span className="text-white font-serif text-sm font-bold">F</span>
              </div>
              <div className="leading-tight">
                <div className="font-serif font-bold text-slate-deep text-sm">Fulshear</div>
                <div className="text-xs text-muted tracking-widest uppercase">Church of Christ</div>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-charcoal hover:text-slate rounded-md hover:bg-slate-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/what-to-expect"
              className="hidden lg:inline-flex items-center gap-2 bg-slate px-4 py-2 rounded-full text-white text-sm font-semibold hover:bg-slate-dark transition-colors"
            >
              Plan Your Visit
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-muted">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-deep flex items-center justify-center">
                <span className="text-white font-serif text-xs font-bold">F</span>
              </div>
              <div className="leading-tight">
                <div className="font-serif font-semibold text-slate-deep text-sm">Fulshear</div>
                <div className="text-[10px] text-muted tracking-widest uppercase">Church of Christ</div>
              </div>
            </Link>
            <Link
              href="/what-to-expect"
              className="bg-slate text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-slate-dark transition-colors"
            >
              Plan a Visit
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* Footer */}
        <footer className="hidden md:block bg-slate-deep text-white/80 py-10">
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
