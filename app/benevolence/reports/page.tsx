import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "Benevolence Reports",
  description: "Decision reporting for benevolence assistance.",
};

type ReportsSearchParams = Record<string, string | string[] | undefined>;

type PersonRow = {
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
  is_member: string | null;
  wants_study: string | null;
  previous_assistance: string | null;
  other_assistance: string | null;
  budget_training: string | null;
  comments: string | null;
  is_demo_data: boolean | null;
  created_at: string;
  benevolence_people: PersonRow | PersonRow[] | null;
};

type NamedMetric = {
  name: string;
  count: number;
  amount: number;
};

type HouseholdMetric = {
  personId: string;
  name: string;
  count: number;
  amount: number;
  lastDate: string;
  demo: boolean;
};

type SeasonalityMetric = {
  monthNumber: number;
  monthName: string;
  requests: number;
  requested: number;
  provided: number;
  topNeeds: NamedMetric[];
};

const reportSelect = `
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
  is_member,
  wants_study,
  previous_assistance,
  other_assistance,
  budget_training,
  comments,
  is_demo_data,
  created_at,
  benevolence_people (
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

  return "Unable to load benevolence report data.";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yearStartIso() {
  return `${new Date().getFullYear()}-01-01`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${Math.round(value)}%`;
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

function monthKey(value: string | null) {
  if (!value) {
    return "No date";
  }

  return value.slice(0, 7);
}

function person(row: RequestRow) {
  return Array.isArray(row.benevolence_people)
    ? row.benevolence_people[0]
    : row.benevolence_people;
}

function countBy(rows: RequestRow[], getKey: (row: RequestRow) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = getKey(row)?.trim() || "Unspecified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function needs(rows: RequestRow[], key: "requested_needs" | "provided_needs") {
  const metrics = new Map<string, NamedMetric>();
  for (const row of rows) {
    for (const need of row[key] ?? []) {
      const metric = metrics.get(need) ?? { name: need, count: 0, amount: 0 };
      metric.count += 1;
      metric.amount += Number(row.amount_provided ?? 0);
      metrics.set(need, metric);
    }
  }

  return [...metrics.values()].sort((a, b) => b.count - a.count || b.amount - a.amount);
}

function householdMetrics(rows: RequestRow[]) {
  const metrics = new Map<string, HouseholdMetric>();
  for (const row of rows) {
    const household = person(row);
    const key = row.person_id;
    const current = metrics.get(key) ?? {
      personId: key,
      name: household?.full_name ?? "Unknown household",
      count: 0,
      amount: 0,
      lastDate: row.request_made_date ?? "",
      demo: Boolean(row.is_demo_data || household?.is_demo_data),
    };

    current.count += 1;
    current.amount += Number(row.amount_provided ?? 0);
    if ((row.request_made_date ?? "") > current.lastDate) {
      current.lastDate = row.request_made_date ?? "";
    }
    metrics.set(key, current);
  }

  return [...metrics.values()].sort((a, b) => b.count - a.count || b.amount - a.amount);
}

function monthlyTrend(rows: RequestRow[]) {
  const months = new Map<string, { month: string; requests: number; provided: number }>();
  for (const row of rows) {
    const key = monthKey(row.request_made_date);
    const current = months.get(key) ?? { month: key, requests: 0, provided: 0 };
    current.requests += 1;
    current.provided += Number(row.amount_provided ?? 0);
    months.set(key, current);
  }

  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function seasonalDemand(rows: RequestRow[]) {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });
  const months = Array.from({ length: 12 }, (_, index): SeasonalityMetric => ({
    monthNumber: index + 1,
    monthName: monthFormatter.format(new Date(2026, index, 1)),
    requests: 0,
    requested: 0,
    provided: 0,
    topNeeds: [],
  }));
  const needMaps = new Map<number, Map<string, NamedMetric>>();

  for (const row of rows) {
    if (!row.request_made_date) {
      continue;
    }

    const monthIndex = Number(row.request_made_date.slice(5, 7)) - 1;
    const metric = months[monthIndex];
    if (!metric) {
      continue;
    }

    metric.requests += 1;
    metric.requested += Number(row.amount_requested ?? 0);
    metric.provided += Number(row.amount_provided ?? 0);

    const monthNeeds = needMaps.get(metric.monthNumber) ?? new Map<string, NamedMetric>();
    for (const need of row.requested_needs ?? []) {
      const needMetric = monthNeeds.get(need) ?? { name: need, count: 0, amount: 0 };
      needMetric.count += 1;
      needMetric.amount += Number(row.amount_requested ?? 0);
      monthNeeds.set(need, needMetric);
    }
    needMaps.set(metric.monthNumber, monthNeeds);
  }

  for (const metric of months) {
    metric.topNeeds = [...(needMaps.get(metric.monthNumber)?.values() ?? [])]
      .sort((a, b) => b.count - a.count || b.amount - a.amount)
      .slice(0, 3);
  }

  return months.sort((a, b) => b.requests - a.requests || b.requested - a.requested);
}

function avgGap(rows: RequestRow[]) {
  const withGap = rows.filter(
    (row) => row.monthly_income !== null && row.monthly_expenses !== null,
  );
  if (!withGap.length) {
    return 0;
  }

  return (
    withGap.reduce(
      (total, row) => total + Number(row.monthly_expenses) - Number(row.monthly_income),
      0,
    ) / withGap.length
  );
}

function Bar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-charcoal">{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-sage-muted">
        <div
          className="h-2 rounded-full bg-sage"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-sage-muted bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold text-sage-deep">{value}</div>
      <div className="mt-1 text-sm text-charcoal">{note}</div>
    </div>
  );
}

function ReportPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-sage-muted bg-white p-5 ${className}`}>
      <h2 className="text-lg font-bold text-sage-deep">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function BenevolenceReportsPage({
  searchParams,
}: {
  searchParams: Promise<ReportsSearchParams>;
}) {
  const params = await searchParams;
  const start = first(params.start) || yearStartIso();
  const end = first(params.end) || todayIso();
  const includeDemo = first(params.demo) !== "no";

  let rows: RequestRow[] = [];
  let historyRows: RequestRow[] = [];
  let errorMessage = "";

  try {
    let query = getSupabaseAdmin()
      .from("benevolence_requests")
      .select(reportSelect)
      .gte("request_made_date", start)
      .lte("request_made_date", end)
      .order("request_made_date", { ascending: false });

    let historyQuery = getSupabaseAdmin()
      .from("benevolence_requests")
      .select(reportSelect)
      .not("request_made_date", "is", null);

    if (!includeDemo) {
      query = query.eq("is_demo_data", false);
      historyQuery = historyQuery.eq("is_demo_data", false);
    }

    const [{ data, error }, { data: historyData, error: historyError }] =
      await Promise.all([query, historyQuery]);
    if (error) {
      throw error;
    }
    if (historyError) {
      throw historyError;
    }
    rows = (data ?? []) as RequestRow[];
    historyRows = (historyData ?? []) as RequestRow[];
  } catch (error) {
    errorMessage = errorText(error);
  }

  const totalRequests = rows.length;
  const totalProvided = rows.reduce((total, row) => total + Number(row.amount_provided ?? 0), 0);
  const totalRequested = rows.reduce((total, row) => total + Number(row.amount_requested ?? 0), 0);
  const approvedCount = rows.filter((row) => row.decision_status === "approved").length;
  const pendingCount = rows.filter((row) => row.decision_status === "pending").length;
  const repeatHouseholds = householdMetrics(rows).filter((household) => household.count > 1);
  const trend = monthlyTrend(rows);
  const statusCounts = countBy(rows, (row) => row.decision_status);
  const urgencyCounts = countBy(rows, (row) => row.urgency_level);
  const followUpCounts = countBy(rows, (row) => row.follow_up_status);
  const referralCounts = countBy(rows, (row) => row.referral_source);
  const requestedNeeds = needs(rows, "requested_needs");
  const providedNeeds = needs(rows, "provided_needs");
  const maxMonthlyRequests = Math.max(...trend.map((item) => item.requests), 0);
  const maxStatusCount = Math.max(...statusCounts.map((item) => item.count), 0);
  const maxNeedCount = Math.max(...requestedNeeds.map((item) => item.count), 0);
  const seasonality = seasonalDemand(historyRows);
  const maxSeasonalRequests = Math.max(...seasonality.map((item) => item.requests), 0);
  const topDemandMonth = seasonality[0];
  const highPriorityQueue = rows
    .filter(
      (row) =>
        row.decision_status === "pending" ||
        row.urgency_level === "critical" ||
        row.urgency_level === "high" ||
        row.follow_up_status === "needed",
    )
    .slice(0, 12);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-dark">
              Internal Benevolence
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sage-deep">Decision Reports</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Date-filtered reporting for assistance volume, funding patterns, repeat requests,
              urgency, follow-up, referrals, and ministry opportunities.
            </p>
          </div>
          <Link
            href="/benevolence"
            className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
          >
            New Request
          </Link>
        </div>

        <form className="mt-6 grid gap-3 border border-sage-muted bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Start Date
            <input
              type="date"
              name="start"
              defaultValue={start}
              className="mt-1 w-full rounded-md border border-sage-muted px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            End Date
            <input
              type="date"
              name="end"
              defaultValue={end}
              className="mt-1 w-full rounded-md border border-sage-muted px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Demo Data
            <select
              name="demo"
              defaultValue={includeDemo ? "yes" : "no"}
              className="mt-1 w-full rounded-md border border-sage-muted px-3 py-2 text-sm font-normal"
            >
              <option value="yes">Include demo data</option>
              <option value="no">Exclude demo data</option>
            </select>
          </label>
          <button
            type="submit"
            className="self-end rounded-md bg-sage px-5 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
          >
            Run Reports
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 border border-rose-light bg-rose-muted p-4 text-sm font-semibold text-rose-dark">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card label="Requests" value={totalRequests.toLocaleString()} note={`${start} to ${end}`} />
          <Card label="Provided" value={money(totalProvided)} note="Total direct assistance" />
          <Card
            label="Fulfillment"
            value={percent(totalRequested ? (totalProvided / totalRequested) * 100 : 0)}
            note={`${money(totalRequested)} requested`}
          />
          <Card
            label="Approved"
            value={percent(totalRequests ? (approvedCount / totalRequests) * 100 : 0)}
            note={`${approvedCount} approved requests`}
          />
          <Card
            label="Pending"
            value={pendingCount.toLocaleString()}
            note="Needs a decision or follow-up"
          />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <ReportPanel
            title="Program History: Monthly Demand Seasonality"
            className="xl:col-span-2"
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  label="Highest Demand Month"
                  value={topDemandMonth?.monthName ?? "None"}
                  note={topDemandMonth ? `${topDemandMonth.requests} historical requests` : "No historical data"}
                />
                <Card
                  label="History Analyzed"
                  value={historyRows.length.toLocaleString()}
                  note={includeDemo ? "Including demo records" : "Real records only"}
                />
                <Card
                  label="Peak Month Provided"
                  value={money(topDemandMonth?.provided ?? 0)}
                  note="Assistance provided in peak month"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-sage-muted text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4">Rank</th>
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4">Demand</th>
                      <th className="py-2 pr-4">Requested</th>
                      <th className="py-2 pr-4">Provided</th>
                      <th className="py-2 pr-4">Most Common Needs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonality.map((month, index) => (
                      <tr key={month.monthNumber} className="border-b border-sage-muted/70">
                        <td className="py-2 pr-4 font-semibold text-muted">{index + 1}</td>
                        <td className="py-2 pr-4 font-semibold text-charcoal">{month.monthName}</td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 rounded-full bg-sage-muted">
                              <div
                                className="h-2 rounded-full bg-sage"
                                style={{
                                  width: `${maxSeasonalRequests ? Math.max(4, (month.requests / maxSeasonalRequests) * 100) : 0}%`,
                                }}
                              />
                            </div>
                            <span className="tabular-nums">{month.requests}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 tabular-nums">{money(month.requested)}</td>
                        <td className="py-2 pr-4 tabular-nums">{money(month.provided)}</td>
                        <td className="py-2 pr-4 text-muted">
                          {month.topNeeds.length
                            ? month.topNeeds
                                .map((need) => `${need.name} (${need.count})`)
                                .join(", ")
                            : "No need data"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-sm leading-6 text-muted">
                This report uses all historical requests, not just the selected date range, so it
                can reveal recurring seasonal pressure points for staffing, budget planning, and
                proactive outreach.
              </p>
            </div>
          </ReportPanel>

          <ReportPanel title="Monthly Assistance Trend">
            <div className="space-y-3">
              {trend.slice(-18).map((item) => (
                <div key={item.month} className="grid gap-2 md:grid-cols-[6rem_1fr_7rem] md:items-center">
                  <div className="text-sm font-semibold text-charcoal">{item.month}</div>
                  <div className="h-3 rounded-full bg-sage-muted">
                    <div
                      className="h-3 rounded-full bg-sage"
                      style={{
                        width: `${maxMonthlyRequests ? Math.max(4, (item.requests / maxMonthlyRequests) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm tabular-nums text-muted">
                    {item.requests} / {money(item.provided)}
                  </div>
                </div>
              ))}
              {!trend.length ? <p className="text-sm text-muted">No requests in this date range.</p> : null}
            </div>
          </ReportPanel>

          <ReportPanel title="Decision Status">
            <div className="space-y-4">
              {statusCounts.map((item) => (
                <Bar key={item.name} label={item.name} value={item.count} max={maxStatusCount} />
              ))}
            </div>
          </ReportPanel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ReportPanel title="Need Mix Requested">
            <div className="space-y-4">
              {requestedNeeds.slice(0, 10).map((item) => (
                <Bar key={item.name} label={item.name} value={item.count} max={maxNeedCount} />
              ))}
            </div>
          </ReportPanel>

          <ReportPanel title="Need Mix Provided">
            <div className="space-y-3">
              {providedNeeds.slice(0, 10).map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-4 border-b border-sage-muted pb-2 text-sm">
                  <span className="font-medium text-charcoal">{item.name}</span>
                  <span className="text-right tabular-nums text-muted">
                    {item.count} / {money(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel title="Urgency And Follow-Up">
            <div className="grid gap-5">
              <div>
                <h3 className="text-sm font-bold text-charcoal">Urgency</h3>
                <div className="mt-2 space-y-2">
                  {urgencyCounts.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="tabular-nums text-muted">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal">Follow-Up</h3>
                <div className="mt-2 space-y-2">
                  {followUpCounts.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="tabular-nums text-muted">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ReportPanel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <ReportPanel title="Repeat Household Review">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-sage-muted text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-2 pr-4">Household</th>
                    <th className="py-2 pr-4">Requests</th>
                    <th className="py-2 pr-4">Provided</th>
                    <th className="py-2 pr-4">Last Request</th>
                  </tr>
                </thead>
                <tbody>
                  {repeatHouseholds.slice(0, 12).map((household) => (
                    <tr key={household.personId} className="border-b border-sage-muted/70">
                      <td className="py-2 pr-4 font-medium text-charcoal">
                        {household.name}
                        {household.demo ? <span className="ml-2 text-xs text-muted">demo</span> : null}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">{household.count}</td>
                      <td className="py-2 pr-4 tabular-nums">{money(household.amount)}</td>
                      <td className="py-2 pr-4">{dateLabel(household.lastDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportPanel>

          <ReportPanel title="High-Priority Decision Queue">
            <div className="space-y-3">
              {highPriorityQueue.map((row) => {
                const household = person(row);
                return (
                  <div key={row.id} className="border-b border-sage-muted pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-charcoal">
                        {household?.full_name ?? "Unknown household"}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-rose-dark">
                        {row.urgency_level ?? "unspecified"} / {row.decision_status ?? "pending"}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {dateLabel(row.request_made_date)} - requested {money(Number(row.amount_requested ?? 0))} - provided {money(Number(row.amount_provided ?? 0))}
                    </div>
                    <div className="mt-1 text-sm text-charcoal">
                      {(row.requested_needs ?? []).join(", ") || "No need category recorded"}
                    </div>
                  </div>
                );
              })}
              {!highPriorityQueue.length ? (
                <p className="text-sm text-muted">No high-priority requests in this date range.</p>
              ) : null}
            </div>
          </ReportPanel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ReportPanel title="Referral Sources">
            <div className="space-y-2">
              {referralCounts.slice(0, 8).map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="tabular-nums text-muted">{item.count}</span>
                </div>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel title="Financial Pressure">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal">Average household gap</span>
                <span className="font-semibold tabular-nums text-sage-deep">{money(avgGap(rows))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">Budget training interest</span>
                <span className="font-semibold tabular-nums text-sage-deep">
                  {rows.filter((row) => row.budget_training === "Yes").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">Bible study interest</span>
                <span className="font-semibold tabular-nums text-sage-deep">
                  {rows.filter((row) => row.wants_study === "Yes").length}
                </span>
              </div>
            </div>
          </ReportPanel>

          <ReportPanel title="Report Catalog">
            <ul className="space-y-2 text-sm text-charcoal">
              <li>Assistance volume and spend by date range</li>
              <li>Need categories requested versus funded</li>
              <li>Repeat household and recurrence review</li>
              <li>Urgency, pending decision, and follow-up queue</li>
              <li>Referral source and outreach effectiveness</li>
              <li>Financial pressure and budget-training opportunities</li>
              <li>Member, study interest, and ministry-care signals</li>
              <li>Demo-data filtered reporting for production review</li>
            </ul>
          </ReportPanel>
        </div>
      </div>
    </div>
  );
}
