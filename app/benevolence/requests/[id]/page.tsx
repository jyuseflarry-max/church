import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "Benevolence Request Detail",
  description: "Detailed benevolence assistance request record.",
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
  person_id: string;
  entered_by_name: string | null;
  request_made_date: string | null;
  request_approved_date: string | null;
  response_call_date: string | null;
  follow_up_interview_date: string | null;
  amount_requested: number | null;
  amount_provided: number | null;
  requested_needs: string[] | null;
  provided_needs: string[] | null;
  decision_status: string | null;
  urgency_level: string | null;
  follow_up_status: string | null;
  referral_source: string | null;
  assistance_outcome: string | null;
  household_size: number | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  is_member: string | null;
  wants_study: string | null;
  previous_assistance: string | null;
  previous_assistance_amount: number | null;
  previous_assistance_purpose: string | null;
  other_assistance: string | null;
  other_assistance_amount: number | null;
  other_assistance_purpose: string | null;
  budget_training: string | null;
  contact_allowed: string | null;
  approval_made_by: string | null;
  form_completed_by: string | null;
  children: { name?: string; age?: string }[] | null;
  comments: string | null;
  risk_notes: string | null;
  is_demo_data: boolean | null;
  created_at: string;
  benevolence_people: PersonRow | PersonRow[] | null;
};

function person(row: RequestRow) {
  return Array.isArray(row.benevolence_people)
    ? row.benevolence_people[0]
    : row.benevolence_people;
}

function dateLabel(value: string | null) {
  if (!value) return "Not recorded";
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-sage-muted py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm text-charcoal">{value || "Not recorded"}</div>
    </div>
  );
}

export default async function BenevolenceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getSupabaseAdmin()
    .from("benevolence_requests")
    .select(
      `
      id,
      person_id,
      entered_by_name,
      request_made_date,
      request_approved_date,
      response_call_date,
      follow_up_interview_date,
      amount_requested,
      amount_provided,
      requested_needs,
      provided_needs,
      decision_status,
      urgency_level,
      follow_up_status,
      referral_source,
      assistance_outcome,
      household_size,
      monthly_income,
      monthly_expenses,
      is_member,
      wants_study,
      previous_assistance,
      previous_assistance_amount,
      previous_assistance_purpose,
      other_assistance,
      other_assistance_amount,
      other_assistance_purpose,
      budget_training,
      contact_allowed,
      approval_made_by,
      form_completed_by,
      children,
      comments,
      risk_notes,
      is_demo_data,
      created_at,
      benevolence_people (
        id,
        full_name,
        age,
        gender,
        family_status,
        current_address,
        work_phone,
        home_phone,
        cell_phone,
        email_address,
        spouse_name,
        family_members_in_home,
        is_demo_data
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const request = data as RequestRow;
  const household = person(request);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-dark">
              Request Detail
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sage-deep">
              {household?.full_name ?? "Unknown household"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {dateLabel(request.request_made_date)} · {request.decision_status ?? "pending"} · {request.urgency_level ?? "no urgency"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/benevolence/requests"
              className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
            >
              Requests
            </Link>
            <Link
              href={`/benevolence/people/${request.person_id}`}
              className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              Household History
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Requested</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(request.amount_requested)}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Provided</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(request.amount_provided)}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Follow-Up</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{request.follow_up_status ?? "None"}</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Outcome</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{request.assistance_outcome ?? "Open"}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Household</h2>
            <div className="mt-3">
              <Field label="Address" value={household?.current_address} />
              <Field label="Phone" value={household?.cell_phone || household?.home_phone || household?.work_phone} />
              <Field label="Email" value={household?.email_address} />
              <Field label="Family Members" value={household?.family_members_in_home} />
              <Field label="Spouse" value={household?.spouse_name} />
            </div>
          </section>

          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Decision</h2>
            <div className="mt-3">
              <Field label="Status" value={request.decision_status} />
              <Field label="Urgency" value={request.urgency_level} />
              <Field label="Referral Source" value={request.referral_source} />
              <Field label="Approved Date" value={dateLabel(request.request_approved_date)} />
              <Field label="Approved By" value={request.approval_made_by} />
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Needs And Assistance</h2>
            <div className="mt-3">
              <Field label="Requested Needs" value={(request.requested_needs ?? []).join(", ")} />
              <Field label="Provided Needs" value={(request.provided_needs ?? []).join(", ")} />
              <Field label="Previous Assistance" value={request.previous_assistance} />
              <Field label="Other Assistance" value={request.other_assistance} />
              <Field label="Budget Training" value={request.budget_training} />
              <Field label="Bible Study" value={request.wants_study} />
            </div>
          </section>

          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Notes</h2>
            <div className="mt-3 space-y-4 text-sm text-charcoal">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Comments</div>
                <p className="mt-1 whitespace-pre-wrap">{request.comments || "No comments recorded."}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Risk Notes</div>
                <p className="mt-1 whitespace-pre-wrap">{request.risk_notes || "No risk notes recorded."}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
