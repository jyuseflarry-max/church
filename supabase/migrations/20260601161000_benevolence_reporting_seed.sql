alter table public.benevolence_people
  add column if not exists is_demo_data boolean not null default false;

alter table public.benevolence_requests
  add column if not exists is_demo_data boolean not null default false,
  add column if not exists decision_status text not null default 'pending',
  add column if not exists urgency_level text,
  add column if not exists follow_up_status text,
  add column if not exists referral_source text,
  add column if not exists assistance_outcome text,
  add column if not exists household_size integer,
  add column if not exists monthly_income numeric(12, 2),
  add column if not exists monthly_expenses numeric(12, 2),
  add column if not exists risk_notes text;

create index if not exists benevolence_people_is_demo_data_idx
  on public.benevolence_people(is_demo_data);

create index if not exists benevolence_requests_reporting_period_idx
  on public.benevolence_requests(request_made_date desc, is_demo_data);

create index if not exists benevolence_requests_decision_status_idx
  on public.benevolence_requests(decision_status);

with seed_people as (
  insert into public.benevolence_people (
    normalized_name,
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
    is_demo_data,
    created_at,
    updated_at
  )
  select
    'demo household ' || person_number,
    'Demo Household ' || person_number,
    (18 + (person_number % 58))::text,
    case when person_number % 3 = 0 then 'Female' else 'Male' end,
    case
      when person_number % 5 = 0 then 'Single parent'
      when person_number % 5 = 1 then 'Married'
      when person_number % 5 = 2 then 'Single'
      when person_number % 5 = 3 then 'Widowed'
      else 'Family'
    end,
    (1000 + person_number)::text || ' Demo Mercy Ln, Fulshear, TX 77441',
    '281-555-' || lpad(((person_number * 17) % 10000)::text, 4, '0'),
    '832-555-' || lpad(((person_number * 29) % 10000)::text, 4, '0'),
    '713-555-' || lpad(((person_number * 43) % 10000)::text, 4, '0'),
    'demo.household.' || person_number || '@example.test',
    case when person_number % 4 = 0 then 'Demo Spouse ' || person_number else null end,
    (1 + (person_number % 6))::text,
    true,
    now(),
    now()
  from generate_series(1, 180) as person_number
  on conflict (normalized_name) do update set
    full_name = excluded.full_name,
    is_demo_data = true,
    updated_at = now()
  returning id, normalized_name
),
all_seed_people as (
  select id, normalized_name
  from seed_people
  union
  select id, normalized_name
  from public.benevolence_people
  where is_demo_data = true
    and normalized_name like 'demo household %'
),
seed_requests as (
  select
    request_number,
    ((request_number - 1) % 180 + 1) as person_number,
    (
      date '1999-01-01'
      + (((request_number - 1) * 20) % (date '2026-06-01' - date '1999-01-01'))::integer
    )::date as request_date
  from generate_series(1, 500) as request_number
)
insert into public.benevolence_requests (
  person_id,
  entered_by_name,
  request_made_date,
  request_approved_date,
  response_call_date,
  follow_up_interview_date,
  amount_requested,
  requested_needs,
  amount_provided,
  provided_needs,
  is_member,
  how_long,
  member_where,
  attends_where,
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
  raw_form_data,
  is_demo_data,
  decision_status,
  urgency_level,
  follow_up_status,
  referral_source,
  assistance_outcome,
  household_size,
  monthly_income,
  monthly_expenses,
  risk_notes,
  created_at
)
select
  people.id,
  case when request_number % 3 = 0 then 'Demo Elder' when request_number % 3 = 1 then 'Demo Deacon' else 'Demo Admin' end,
  request_date,
  case when request_number % 9 = 0 then null else request_date + ((request_number % 5) + 1) end,
  request_date + ((request_number % 4) + 1),
  case when request_number % 6 = 0 then request_date + 14 else null end,
  (75 + ((request_number * 37) % 925))::numeric(12, 2),
  array_remove(array[
    case when request_number % 2 = 0 then 'Food' end,
    case when request_number % 3 = 0 then 'Rent / Mortgage' end,
    case when request_number % 4 = 0 then 'Utility Bill' end,
    case when request_number % 5 = 0 then 'Gas' end,
    case when request_number % 7 = 0 then 'Medical Expenses' end,
    case when request_number % 11 = 0 then 'Auto Repair' end,
    case when request_number % 13 = 0 then 'Hotel' end,
    case when request_number % 17 = 0 then 'Prayers' end,
    case when request_number % 19 = 0 then 'Budget Training' end
  ], null),
  case
    when request_number % 9 = 0 then 0
    else (50 + ((request_number * 23) % 750))::numeric(12, 2)
  end,
  array_remove(array[
    case when request_number % 2 = 0 then 'Food' end,
    case when request_number % 3 = 0 then 'Rent / Mortgage' end,
    case when request_number % 4 = 0 then 'Utility Bill' end,
    case when request_number % 5 = 0 then 'Gas' end,
    case when request_number % 7 = 0 then 'Medical Expenses' end,
    case when request_number % 11 = 0 then 'Auto Repair' end,
    case when request_number % 17 = 0 then 'Prayers' end
  ], null),
  case when request_number % 4 = 0 then 'Yes' else 'No' end,
  case when request_number % 4 = 0 then ((request_number % 12) + 1)::text || ' years' else null end,
  case when request_number % 4 = 0 then 'Fulshear Church of Christ' else null end,
  case when request_number % 5 = 0 then 'Nearby congregation' else null end,
  case when request_number % 6 = 0 then 'Yes' else 'No' end,
  case when request_number % 7 = 0 then 'Yes' else 'No' end,
  case when request_number % 7 = 0 then (40 + ((request_number * 11) % 400))::numeric(12, 2) else null end,
  case when request_number % 7 = 0 then 'Prior demo support' else null end,
  case when request_number % 8 = 0 then 'Yes' else 'No' end,
  case when request_number % 8 = 0 then (25 + ((request_number * 13) % 300))::numeric(12, 2) else null end,
  case when request_number % 8 = 0 then 'Community agency demo support' else null end,
  case when request_number % 5 = 0 then 'Yes' else 'No' end,
  case when request_number % 10 = 0 then 'No' else 'Yes' end,
  case when request_number % 9 = 0 then null else 'Demo Approver' end,
  'Demo Form User',
  jsonb_build_array(
    jsonb_build_object('name', 'Demo Child A', 'age', ((request_number % 15) + 2)::text),
    jsonb_build_object('name', 'Demo Child B', 'age', ((request_number % 13) + 4)::text)
  ),
  'Demo benevolence request for report testing. Do not treat as real assistance data.',
  jsonb_build_object(
    'seed', 'benevolence_reporting_seed',
    'demoRecordNumber', request_number,
    'applicantName', 'Demo Household ' || person_number
  ),
  true,
  case
    when request_number % 9 = 0 then 'declined'
    when request_number % 6 = 0 then 'pending'
    else 'approved'
  end,
  case
    when request_number % 10 in (0, 1) then 'critical'
    when request_number % 10 in (2, 3, 4) then 'high'
    when request_number % 10 in (5, 6, 7) then 'medium'
    else 'low'
  end,
  case
    when request_number % 6 = 0 then 'needed'
    when request_number % 6 = 1 then 'scheduled'
    when request_number % 6 = 2 then 'completed'
    else 'not_needed'
  end,
  case
    when request_number % 5 = 0 then 'Member referral'
    when request_number % 5 = 1 then 'Walk-in'
    when request_number % 5 = 2 then 'Community partner'
    when request_number % 5 = 3 then 'Phone call'
    else 'Repeat request'
  end,
  case
    when request_number % 9 = 0 then 'Unable to assist'
    when request_number % 6 = 0 then 'Under review'
    when request_number % 5 = 0 then 'Referred and assisted'
    else 'Assisted'
  end,
  1 + (request_number % 6),
  (700 + ((request_number * 31) % 3900))::numeric(12, 2),
  (950 + ((request_number * 41) % 4300))::numeric(12, 2),
  case when request_number % 12 = 0 then 'Repeated requests in short period; review with care team.' else null end,
  request_date::timestamptz
from seed_requests
join all_seed_people people
  on people.normalized_name = 'demo household ' || seed_requests.person_number
where not exists (
  select 1
  from public.benevolence_requests existing
  where existing.is_demo_data = true
    and existing.raw_form_data ->> 'seed' = 'benevolence_reporting_seed'
    and existing.raw_form_data ->> 'demoRecordNumber' = seed_requests.request_number::text
);
