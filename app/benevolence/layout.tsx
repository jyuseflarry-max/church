import Link from "next/link";
import BenevolenceSearch from "./BenevolenceSearch";

export default function BenevolenceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="sticky top-14 z-40 border-b border-sage-muted bg-cream/95 px-4 py-3 backdrop-blur md:top-16 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <Link
              href="/benevolence/reports"
              className="rounded-md border border-sage px-3 py-2 text-sage-deep hover:bg-sage-muted"
            >
              Reports
            </Link>
            <Link
              href="/benevolence/requests"
              className="rounded-md border border-sage px-3 py-2 text-sage-deep hover:bg-sage-muted"
            >
              Requests
            </Link>
            <Link
              href="/benevolence"
              className="rounded-md bg-sage px-3 py-2 text-white hover:bg-sage-dark"
            >
              New Request
            </Link>
          </div>
          <BenevolenceSearch />
        </div>
      </div>
      {children}
    </>
  );
}
