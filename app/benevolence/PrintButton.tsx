"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted print:hidden"
    >
      Print
    </button>
  );
}
