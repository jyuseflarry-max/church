import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import PrintButton from "../../PrintButton";

export const metadata: Metadata = {
  title: "Benevolence Household History",
  description: "Household assistance history.",
};

type PersonRow = {
  id: string;
  full_name: string | null;
  age: string | null;
  gender: string | null;
  family_status: string | null;
  current_address: string | null;
  work_phone: string | null;
  home_phone: string | null;
  cell_phone: string | null;
  email_address: string | null;
  spouse_name: string | null;
  family_members_in_home: string | null;
  is_demo_data: boolean | null;
};

type RequestRow = {
  id: string;
  request_made_date: string | null;
  amount_requested: number | null;
  amount_provided: number | null;
  requested_needs: string[] | null;
  decision_status: string | null;
  urgency_level: string | null;
  follow_up_status: string | null;
  assistance_outcome: string | null;
  comments: string | null;
};

function dateLabel(value: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default async function BenevolencePersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const [{ data: person, error: personError }, { data: requests, error: requestError }] =
    await Promise.all([
      supabase.from("benevolence_people").select("*").eq("id", id).single(),
      supabase
        .from("benevolence_requests")
        .select(
          `
          id,
          request_made_date,
          amount_requested,
          amount_provided,
          requested_needs,
          decision_status,
          urgency_level,
          follow_up_status,
          assistance_outcome,
          comments
        `,
        )
        .eq("person_id", id)
        .order("request_made_date", { ascending: false }),
    ]);

  if (personError || !person || requestError) {
    notFound();
  }

  const household = person as PersonRow;
  const rows = (requests ?? []) as RequestRow[];
  const totalProvided = rows.reduce((sum, row) => sum + Number(row.amount_provided ?? 0), 0);
  const totalRequested = rows.reduce((sum, row) => sum + Number(row.amount_requested ?? 0), 0);
  const lastRequest = rows[0];

  return (
    <div className="benevolence-detail bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-dark">
              Household History
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sage-deep">
              {household.full_name ?? "Unknown household"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {household.current_address || "No address recorded"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <PrintButton />
            <Link
              href={`/benevolence/requests?person=${household.id}`}
              className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
            >
              Filtered Requests
            </Link>
            <Link
              href="/benevolence/reports"
              className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              Reports
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Requests</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{rows.length}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Requested</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(totalRequested)}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Provided</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(totalProvided)}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Last Request</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{dateLabel(lastRequest?.request_made_date ?? null)}</div>
          </div>
        </div>

        <section className="mt-6 border border-sage-muted bg-white p-5">
          <h2 className="text-lg font-bold text-sage-deep">Household Information</h2>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</div>
              <div className="mt-1 text-charcoal">{household.cell_phone || household.home_phone || household.work_phone || "Not recorded"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Email</div>
              <div className="mt-1 text-charcoal">{household.email_address || "Not recorded"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Family Members</div>
              <div className="mt-1 text-charcoal">{household.family_members_in_home || "Not recorded"}</div>
            </div>
          </div>
        </section>

        <section className="mt-4 border border-sage-muted bg-white p-5">
          <h2 className="text-lg font-bold text-sage-deep">Request History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-sage-muted text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Urgency</th>
                  <th className="py-2 pr-4">Needs</th>
                  <th className="py-2 pr-4 text-right">Requested</th>
                  <th className="py-2 pr-4 text-right">Provided</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-sage-muted/70 hover:bg-cream">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/benevolence/requests/${row.id}`}
                        className="font-semibold text-sage-deep hover:text-sage-dark"
                      >
                        {dateLabel(row.request_made_date)}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{row.decision_status ?? "pending"}</td>
                    <td className="py-2 pr-4">{row.urgency_level ?? "Unspecified"}</td>
                    <td className="py-2 pr-4">{(row.requested_needs ?? []).join(", ") || "None"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{money(row.amount_requested)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{money(row.amount_provided)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
