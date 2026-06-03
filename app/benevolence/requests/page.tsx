import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import EditableBenevolenceField from "../EditableBenevolenceField";

export const metadata: Metadata = {
  title: "Benevolence Requests",
  description: "Filtered benevolence request list.",
};

type SearchParams = Record<string, string | string[] | undefined>;

type PersonRow = {
  id: string;
  full_name: string | null;
  current_address: string | null;
  cell_phone: string | null;
  home_phone: string | null;
  email_address: string | null;
  family_members_in_home: string | null;
  is_demo_data: boolean | null;
};

type RequestRow = {
  id: string;
  person_id: string;
  request_made_date: string | null;
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
  budget_training: string | null;
  wants_study: string | null;
  comments: string | null;
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

const requestSelect = `
  id,
  person_id,
  request_made_date,
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
  budget_training,
  wants_study,
  comments,
  raw_form_data,
  is_demo_data,
  created_at,
  benevolence_people (
    id,
    full_name,
    current_address,
    cell_phone,
    home_phone,
    email_address,
    family_members_in_home,
    is_demo_data
  )
`;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unable to load benevolence requests.";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yearStartIso() {
  return `${new Date().getFullYear()}-01-01`;
}

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function dateLabel(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function monthBounds(month: string) {
  const [yearValue, monthValue] = month.split("-").map(Number);
  if (!yearValue || !monthValue) {
    return null;
  }

  const nextMonth = monthValue === 12 ? 1 : monthValue + 1;
  const nextYear = monthValue === 12 ? yearValue + 1 : yearValue;

  return {
    start: `${yearValue}-${String(monthValue).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

function person(row: RequestRow) {
  return Array.isArray(row.benevolence_people)
    ? row.benevolence_people[0]
    : row.benevolence_people;
}

function titleCase(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function activeFilters(params: SearchParams) {
  const filters: string[] = [];
  for (const [key, rawValue] of Object.entries(params)) {
    const value = first(rawValue);
    if (!value || ["start", "end"].includes(key)) {
      continue;
    }
    filters.push(`${titleCase(key)}: ${value}`);
  }
  return filters;
}

function buildReportsHref(params: SearchParams) {
  const query = new URLSearchParams();
  const start = first(params.start);
  const end = first(params.end);
  if (start) query.set("start", start);
  if (end) query.set("end", end);
  return `/benevolence/reports${query.toString() ? `?${query}` : ""}`;
}

function archiveDocumentCount(row: RequestRow) {
  const archiveImport = row.raw_form_data?.archiveImport;
  return archiveImport?.publicPaths?.length ?? (archiveImport?.publicPath ? 1 : 0);
}

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

export default async function BenevolenceRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = first(params.status);
  const urgency = first(params.urgency);
  const followUp = first(params.followUp);
  const need = first(params.need);
  const referral = first(params.referral);
  const personId = first(params.person);
  const month = first(params.month);
  const seasonMonth = first(params.seasonMonth);
  const queue = first(params.queue);
  const moneyFilter = first(params.money);
  const ministry = first(params.ministry);
  const pressure = first(params.pressure);
  const start = first(params.start) || yearStartIso();
  const end = first(params.end) || todayIso();
  const useDateRange = !seasonMonth;

  let rows: RequestRow[] = [];
  let errorMessage = "";

  try {
    let query = getSupabaseAdmin()
      .from("benevolence_requests")
      .select(requestSelect)
      .eq("is_demo_data", false)
      .order("request_made_date", { ascending: false });

    if (useDateRange) {
      query = query.gte("request_made_date", start).lte("request_made_date", end);
    }

    if (status) {
      query = query.eq("decision_status", status);
    }
    if (urgency) {
      query = query.eq("urgency_level", urgency);
    }
    if (followUp) {
      query = query.eq("follow_up_status", followUp);
    }
    if (referral) {
      query = query.eq("referral_source", referral);
    }
    if (personId) {
      query = query.eq("person_id", personId);
    }
    if (need) {
      query = query.contains("requested_needs", [need]);
    }
    if (month) {
      const bounds = monthBounds(month);
      if (bounds) {
        query = query.gte("request_made_date", bounds.start).lt("request_made_date", bounds.end);
      }
    }
    if (moneyFilter === "provided") {
      query = query.gt("amount_provided", 0);
    }
    if (moneyFilter === "unfunded") {
      query = query.or("amount_provided.is.null,amount_provided.eq.0");
    }
    if (ministry === "budget") {
      query = query.eq("budget_training", "Yes");
    }
    if (ministry === "study") {
      query = query.eq("wants_study", "Yes");
    }

    const { data, error } = await query.limit(500);
    if (error) {
      throw error;
    }

    rows = ((data ?? []) as RequestRow[]).filter((row) => {
      if (seasonMonth && row.request_made_date?.slice(5, 7) !== seasonMonth.padStart(2, "0")) {
        return false;
      }
      if (
        queue === "needs-action" &&
        row.decision_status !== "pending" &&
        row.urgency_level !== "critical" &&
        row.urgency_level !== "high" &&
        row.follow_up_status !== "needed"
      ) {
        return false;
      }
      if (
        pressure === "gap" &&
        (row.monthly_income === null ||
          row.monthly_expenses === null ||
          Number(row.monthly_expenses) <= Number(row.monthly_income))
      ) {
        return false;
      }
      return true;
    });
  } catch (error) {
    errorMessage = errorText(error);
  }

  const filters = activeFilters(params);
  const totalProvided = rows.reduce((sum, row) => sum + Number(row.amount_provided ?? 0), 0);
  const totalRequested = rows.reduce((sum, row) => sum + Number(row.amount_requested ?? 0), 0);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-dark">
              Benevolence Drill-Down
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sage-deep">Requests</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Filtered request list for dashboard counts, queues, need categories, seasonal
              trends, and household follow-up.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildReportsHref(params)}
              className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
            >
              Back to Reports
            </Link>
            <Link
              href="/benevolence"
              className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              New Request
            </Link>
          </div>
        </div>

        <form className="mt-6 grid gap-3 border border-sage-muted bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Start Date
            <input
              type="date"
              name="start"
              defaultValue={start}
              disabled={Boolean(seasonMonth)}
              className="mt-1 w-full rounded-md border border-sage-muted px-3 py-2 text-sm font-normal disabled:bg-sage-muted"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            End Date
            <input
              type="date"
              name="end"
              defaultValue={end}
              disabled={Boolean(seasonMonth)}
              className="mt-1 w-full rounded-md border border-sage-muted px-3 py-2 text-sm font-normal disabled:bg-sage-muted"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-md bg-sage px-5 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
          >
            Apply Dates
          </button>

          {[
            ["status", status],
            ["urgency", urgency],
            ["followUp", followUp],
            ["need", need],
            ["referral", referral],
            ["person", personId],
            ["month", month],
            ["seasonMonth", seasonMonth],
            ["queue", queue],
            ["money", moneyFilter],
            ["ministry", ministry],
            ["pressure", pressure],
          ].map(([key, value]) =>
            value ? <input key={key} type="hidden" name={key} value={value} /> : null,
          )}
        </form>

        {errorMessage ? (
          <div className="mt-6 border border-rose-light bg-rose-muted p-4 text-sm font-semibold text-rose-dark">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Requests</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{rows.length}</div>
            <div className="mt-1 text-sm text-charcoal">
              {seasonMonth ? "Across all program history" : `${start} to ${end}`}
            </div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Requested</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(totalRequested)}</div>
            <div className="mt-1 text-sm text-charcoal">Filtered total</div>
          </div>
          <div className="border border-sage-muted bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Provided</div>
            <div className="mt-2 text-2xl font-bold text-sage-deep">{money(totalProvided)}</div>
            <div className="mt-1 text-sm text-charcoal">Filtered total</div>
          </div>
        </div>

        {filters.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <span
                key={filter}
                className="rounded-full bg-sage-muted px-3 py-1 text-xs font-semibold text-sage-deep"
              >
                {filter}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto border border-sage-muted bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-sage-muted bg-sage-muted/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Household</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Follow-Up</th>
                <th className="px-4 py-3">Needs</th>
                <th className="px-4 py-3">Archive</th>
                <th className="px-4 py-3 text-right">Requested</th>
                <th className="px-4 py-3 text-right">Provided</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const household = person(row);
                return (
                  <tr key={row.id} className="border-b border-sage-muted/70 hover:bg-cream">
                    <td className="px-4 py-3 whitespace-nowrap">{dateLabel(row.request_made_date)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/benevolence/people/${row.person_id}`}
                        className="font-semibold text-sage-deep hover:text-sage-dark"
                      >
                        {household?.full_name ?? "Unknown household"}
                      </Link>
                      <div className="text-xs text-muted">{household?.current_address}</div>
                      <Link
                        href={`/benevolence/requests/${row.id}`}
                        className="mt-1 inline-block text-xs font-semibold text-sage-deep hover:text-sage-dark"
                      >
                        Open request
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="decision_status"
                        id={row.id}
                        value={row.decision_status ?? "pending"}
                        inputType="select"
                        options={statusOptions}
                        buttonClassName="rounded-full bg-sage-muted px-2 py-1 text-xs font-semibold text-sage-deep hover:bg-sage-light"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="urgency_level"
                        id={row.id}
                        value={row.urgency_level}
                        emptyLabel="Unspecified"
                        inputType="select"
                        options={urgencyOptions}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="follow_up_status"
                        id={row.id}
                        value={row.follow_up_status}
                        emptyLabel="Unspecified"
                        inputType="select"
                        options={followUpOptions}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="requested_needs"
                        id={row.id}
                        value={row.requested_needs ?? []}
                        displayValue={(row.requested_needs ?? []).join(", ")}
                        emptyLabel="None"
                        inputType="list"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {archiveDocumentCount(row) ? (
                        <Link
                          href={`/benevolence/requests/${row.id}`}
                          className="font-semibold text-sage-deep hover:text-sage-dark"
                        >
                          {archiveDocumentCount(row)} PDF{archiveDocumentCount(row) === 1 ? "" : "s"}
                        </Link>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="amount_requested"
                        id={row.id}
                        value={row.amount_requested}
                        displayValue={money(row.amount_requested)}
                        inputType="money"
                        align="right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <EditableBenevolenceField
                        table="benevolence_requests"
                        field="amount_provided"
                        id={row.id}
                        value={row.amount_provided}
                        displayValue={money(row.amount_provided)}
                        inputType="money"
                        align="right"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length ? (
            <div className="p-6 text-sm text-muted">No requests match these filters.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
