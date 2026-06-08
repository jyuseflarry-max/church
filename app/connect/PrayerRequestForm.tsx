"use client";

import { useState } from "react";

export default function PrayerRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [confidential, setConfidential] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = encodeURIComponent("Prayer Request");
    const lines = [
      `From: ${name || "(no name given)"}${email ? ` <${email}>` : ""}`,
      confidential
        ? "[Please share only with elders / prayer team - confidential]"
        : "",
      "",
      "Request:",
      request,
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:office@fulshearcoc.org?subject=${subject}&body=${body}`;
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-charcoal placeholder:text-muted/70 transition focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="prayer-name"
            className="mb-2 block text-sm font-bold text-sage-deep"
          >
            Your Name
          </label>
          <input
            id="prayer-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First & last (optional)"
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="prayer-email"
            className="mb-2 block text-sm font-bold text-sage-deep"
          >
            Email
          </label>
          <input
            id="prayer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="So we can follow up (optional)"
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="prayer-request"
          className="mb-2 block text-sm font-bold text-sage-deep"
        >
          Your Request
        </label>
        <textarea
          id="prayer-request"
          required
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          rows={6}
          placeholder="Share whatever you'd like us to lift up: a need, a celebration, a quiet weight you're carrying."
          className={inputClass}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-charcoal">
        <input
          type="checkbox"
          checked={confidential}
          onChange={(e) => setConfidential(e.target.checked)}
          className="mt-1 h-4 w-4 accent-sage"
        />
        <span>
          Keep this confidential - share only with our elders and prayer team.
        </span>
      </label>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-deep px-7 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-sage-dark focus-ring"
      >
        Send Prayer Request
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
        </svg>
      </button>
      <p className="text-xs leading-5 text-muted">
        Submitting opens your email app with the message pre-filled - just hit
        send. Prefer to type it yourself? Email{" "}
        <a
          href="mailto:office@fulshearcoc.org?subject=Prayer%20Request"
          className="font-bold text-sage-deep hover:text-rose"
        >
          office@fulshearcoc.org
        </a>
        .
      </p>
    </form>
  );
}
