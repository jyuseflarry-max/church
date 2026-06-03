import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import EditableBenevolenceField from "../../EditableBenevolenceField";

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
  raw_form_data: ArchiveRawData | null;
  is_demo_data: boolean | null;
  created_at: string;
  benevolence_people: PersonRow | PersonRow[] | null;
};

type ArchiveRawData = {
  archiveImport?: {
    publicPath?: string;
    publicPaths?: string[];
    originalPath?: string;
    originalPaths?: string[];
  };
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

type EditableConfig = {
  table: "benevolence_people" | "benevolence_requests";
  field: string;
  id: string;
  rawValue: string | number | string[] | null | undefined;
  inputType?: "text" | "number" | "date" | "money" | "textarea" | "list" | "select";
  options?: { label: string; value: string }[];
};

function Field({
  label,
  value,
  edit,
}: {
  label: string;
  value: React.ReactNode;
  edit?: EditableConfig;
}) {
  return (
    <div className="border-b border-sage-muted py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm text-charcoal">
        {edit ? (
          <EditableBenevolenceField
            table={edit.table}
            field={edit.field}
            id={edit.id}
            value={edit.rawValue}
            displayValue={value}
            inputType={edit.inputType}
            options={edit.options}
          />
        ) : (
          value || "Not recorded"
        )}
      </div>
    </div>
  );
}

function archiveDocuments(row: RequestRow) {
  const archiveImport = row.raw_form_data?.archiveImport;
  const publicPaths =
    archiveImport?.publicPaths ?? (archiveImport?.publicPath ? [archiveImport.publicPath] : []);
  const originalPaths =
    archiveImport?.originalPaths ?? (archiveImport?.originalPath ? [archiveImport.originalPath] : []);

  return publicPaths.map((href, index) => ({
    href,
    label: originalPaths[index] ?? href,
  }));
}

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
];

const urgencyOptions = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const followUpOptions = [
  { label: "Needed", value: "needed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Not Needed", value: "not_needed" },
];

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
      raw_form_data,
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
  const documents = archiveDocuments(request);

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
            <div className="mt-2 text-2xl font-bold text-sage-deep">
              <EditableBenevolenceField
                table="benevolence_requests"
                field="amount_requested"
                id={request.id}
                value={request.amount_requested}
                displayValue={money(request.amount_requested)}
                inputType="money"
              />
            </div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Provided</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">
              <EditableBenevolenceField
                table="benevolence_requests"
                field="amount_provided"
                id={request.id}
                value={request.amount_provided}
                displayValue={money(request.amount_provided)}
                inputType="money"
              />
            </div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Follow-Up</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">
              <EditableBenevolenceField
                table="benevolence_requests"
                field="follow_up_status"
                id={request.id}
                value={request.follow_up_status}
                emptyLabel="None"
                inputType="select"
                options={followUpOptions}
              />
            </div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Outcome</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">
              <EditableBenevolenceField
                table="benevolence_requests"
                field="assistance_outcome"
                id={request.id}
                value={request.assistance_outcome}
                emptyLabel="Open"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Household</h2>
            <div className="mt-3">
              {household ? (
                <>
                  <Field
                    label="Name"
                    value={household.full_name}
                    edit={{
                      table: "benevolence_people",
                      field: "full_name",
                      id: household.id,
                      rawValue: household.full_name,
                    }}
                  />
                  <Field
                    label="Address"
                    value={household.current_address}
                    edit={{
                      table: "benevolence_people",
                      field: "current_address",
                      id: household.id,
                      rawValue: household.current_address,
                    }}
                  />
                  <Field
                    label="Cell Phone"
                    value={household.cell_phone}
                    edit={{
                      table: "benevolence_people",
                      field: "cell_phone",
                      id: household.id,
                      rawValue: household.cell_phone,
                    }}
                  />
                  <Field
                    label="Home Phone"
                    value={household.home_phone}
                    edit={{
                      table: "benevolence_people",
                      field: "home_phone",
                      id: household.id,
                      rawValue: household.home_phone,
                    }}
                  />
                  <Field
                    label="Email"
                    value={household.email_address}
                    edit={{
                      table: "benevolence_people",
                      field: "email_address",
                      id: household.id,
                      rawValue: household.email_address,
                    }}
                  />
                  <Field
                    label="Family Members"
                    value={household.family_members_in_home}
                    edit={{
                      table: "benevolence_people",
                      field: "family_members_in_home",
                      id: household.id,
                      rawValue: household.family_members_in_home,
                      inputType: "textarea",
                    }}
                  />
                  <Field
                    label="Spouse"
                    value={household.spouse_name}
                    edit={{
                      table: "benevolence_people",
                      field: "spouse_name",
                      id: household.id,
                      rawValue: household.spouse_name,
                    }}
                  />
                </>
              ) : (
                <Field label="Household" value="Not recorded" />
              )}
            </div>
          </section>

          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Decision</h2>
            <div className="mt-3">
              <Field
                label="Status"
                value={request.decision_status}
                edit={{
                  table: "benevolence_requests",
                  field: "decision_status",
                  id: request.id,
                  rawValue: request.decision_status,
                  inputType: "select",
                  options: statusOptions,
                }}
              />
              <Field
                label="Urgency"
                value={request.urgency_level}
                edit={{
                  table: "benevolence_requests",
                  field: "urgency_level",
                  id: request.id,
                  rawValue: request.urgency_level,
                  inputType: "select",
                  options: urgencyOptions,
                }}
              />
              <Field
                label="Referral Source"
                value={request.referral_source}
                edit={{
                  table: "benevolence_requests",
                  field: "referral_source",
                  id: request.id,
                  rawValue: request.referral_source,
                }}
              />
              <Field
                label="Request Date"
                value={dateLabel(request.request_made_date)}
                edit={{
                  table: "benevolence_requests",
                  field: "request_made_date",
                  id: request.id,
                  rawValue: request.request_made_date,
                  inputType: "date",
                }}
              />
              <Field
                label="Approved Date"
                value={dateLabel(request.request_approved_date)}
                edit={{
                  table: "benevolence_requests",
                  field: "request_approved_date",
                  id: request.id,
                  rawValue: request.request_approved_date,
                  inputType: "date",
                }}
              />
              <Field
                label="Approved By"
                value={request.approval_made_by}
                edit={{
                  table: "benevolence_requests",
                  field: "approval_made_by",
                  id: request.id,
                  rawValue: request.approval_made_by,
                }}
              />
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Needs And Assistance</h2>
            <div className="mt-3">
              <Field
                label="Requested Needs"
                value={(request.requested_needs ?? []).join(", ")}
                edit={{
                  table: "benevolence_requests",
                  field: "requested_needs",
                  id: request.id,
                  rawValue: request.requested_needs ?? [],
                  inputType: "list",
                }}
              />
              <Field
                label="Provided Needs"
                value={(request.provided_needs ?? []).join(", ")}
                edit={{
                  table: "benevolence_requests",
                  field: "provided_needs",
                  id: request.id,
                  rawValue: request.provided_needs ?? [],
                  inputType: "list",
                }}
              />
              <Field
                label="Previous Assistance"
                value={request.previous_assistance}
                edit={{
                  table: "benevolence_requests",
                  field: "previous_assistance",
                  id: request.id,
                  rawValue: request.previous_assistance,
                  inputType: "select",
                  options: yesNoOptions,
                }}
              />
              <Field
                label="Previous Assistance Amount"
                value={money(request.previous_assistance_amount)}
                edit={{
                  table: "benevolence_requests",
                  field: "previous_assistance_amount",
                  id: request.id,
                  rawValue: request.previous_assistance_amount,
                  inputType: "money",
                }}
              />
              <Field
                label="Other Assistance"
                value={request.other_assistance}
                edit={{
                  table: "benevolence_requests",
                  field: "other_assistance",
                  id: request.id,
                  rawValue: request.other_assistance,
                  inputType: "select",
                  options: yesNoOptions,
                }}
              />
              <Field
                label="Other Assistance Amount"
                value={money(request.other_assistance_amount)}
                edit={{
                  table: "benevolence_requests",
                  field: "other_assistance_amount",
                  id: request.id,
                  rawValue: request.other_assistance_amount,
                  inputType: "money",
                }}
              />
              <Field
                label="Budget Training"
                value={request.budget_training}
                edit={{
                  table: "benevolence_requests",
                  field: "budget_training",
                  id: request.id,
                  rawValue: request.budget_training,
                  inputType: "select",
                  options: yesNoOptions,
                }}
              />
              <Field
                label="Bible Study"
                value={request.wants_study}
                edit={{
                  table: "benevolence_requests",
                  field: "wants_study",
                  id: request.id,
                  rawValue: request.wants_study,
                  inputType: "select",
                  options: yesNoOptions,
                }}
              />
            </div>
          </section>

          <section className="border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Notes</h2>
            <div className="mt-3 space-y-4 text-sm text-charcoal">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Comments</div>
                <div className="mt-1 whitespace-pre-wrap">
                  <EditableBenevolenceField
                    table="benevolence_requests"
                    field="comments"
                    id={request.id}
                    value={request.comments}
                    displayValue={request.comments || "No comments recorded."}
                    inputType="textarea"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Risk Notes</div>
                <div className="mt-1 whitespace-pre-wrap">
                  <EditableBenevolenceField
                    table="benevolence_requests"
                    field="risk_notes"
                    id={request.id}
                    value={request.risk_notes}
                    displayValue={request.risk_notes || "No risk notes recorded."}
                    inputType="textarea"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {documents.length ? (
          <section className="mt-4 border border-sage-muted bg-white p-5">
            <h2 className="text-lg font-bold text-sage-deep">Archive PDFs</h2>
            <div className="mt-3 grid gap-2">
              {documents.map((document) => (
                <Link
                  key={document.href}
                  href={document.href}
                  target="_blank"
                  className="text-sm font-semibold text-sage-deep hover:text-sage-dark"
                >
                  {document.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
