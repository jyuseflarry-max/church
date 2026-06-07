"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06L12 5.43l-8.16 8.16a.75.75 0 1 1-1.06-1.06l8.69-8.69Z" />
        <path d="m12 7.55 6.75 6.75v5.08c0 1.03-.84 1.87-1.88 1.87H14.5a.75.75 0 0 1-.75-.75v-4.25h-3.5v4.25a.75.75 0 0 1-.75.75H7.13a1.87 1.87 0 0 1-1.88-1.87V14.3L12 7.55Z" />
      </svg>
    ),
  },
  {
    href: "/plan-a-visit",
    label: "Visit",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2.25A7.25 7.25 0 0 0 4.75 9.5c0 5.04 6.42 11.62 6.7 11.9a.75.75 0 0 0 1.1 0c.28-.28 6.7-6.86 6.7-11.9A7.25 7.25 0 0 0 12 2.25Zm0 9.75a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/live",
    label: "Live",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M8 5.75v12.5L18.5 12 8 5.75Z" />
      </svg>
    ),
  },
  {
    href: "/connect",
    label: "Connect",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12 12.75a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5ZM4.5 21a7.5 7.5 0 0 1 15 0H4.5Z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/96 shadow-[0_-10px_30px_rgba(33,63,55,0.12)] backdrop-blur-md md:hidden">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors ${
                isActive ? "text-sage-deep" : "text-muted hover:text-sage-deep"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
