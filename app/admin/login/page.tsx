import type { Metadata } from "next";
import { isAdminAuthConfigured } from "../auth";
import { loginTeachingAdminAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the Teaching Library admin workflow.",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const configured = isAdminAuthConfigured();

  return (
    <section className="section-pad bg-cream">
      <div className="container-wide max-w-md">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-sage-deep">
            Teaching Library Login
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This protects the sermon review workflow while lessons, transcripts,
            clips, and YouTube uploads are being prepared.
          </p>

          {!configured && (
            <div className="mt-5 rounded-xl bg-rose-muted p-4 text-sm leading-6 text-rose-dark">
              Admin login is not configured yet. Add
              <code className="mx-1 rounded bg-white px-1 py-0.5">TEACHING_ADMIN_PASSWORD</code>
              and
              <code className="mx-1 rounded bg-white px-1 py-0.5">TEACHING_ADMIN_SESSION_SECRET</code>
              to the environment.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-rose-muted p-4 text-sm font-semibold text-rose-dark">
              That password did not work.
            </div>
          )}

          <form action={loginTeachingAdminAction} className="mt-6">
            <label className="text-sm font-bold text-sage-deep">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={!configured}
                className="mt-2 min-h-12 w-full rounded-xl border border-line bg-cream px-4 text-base font-medium text-charcoal outline-none focus:border-sage disabled:opacity-50"
              />
            </label>
            <button
              disabled={!configured}
              className="mt-5 w-full rounded-full bg-sage-deep px-5 py-3 text-sm font-bold text-white hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
