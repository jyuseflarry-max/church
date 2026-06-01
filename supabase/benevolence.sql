create extension if not exists pgcrypto;

create table if not exists public.benevolence_people (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  full_name text not null,
  age text,
  gender text,
  family_status text,
  current_address text,
  work_phone text,
  home_phone text,
  cell_phone text,
  email_address text,
  spouse_name text,
  family_members_in_home text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.benevolence_requests (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.benevolence_people(id) on delete cascade,
  entered_by_name text not null,
  request_made_date date,
  request_approved_date date,
  response_call_date date,
  follow_up_interview_date date,
  amount_requested numeric(12, 2),
  requested_needs text[] not null default '{}',
  amount_provided numeric(12, 2),
  provided_needs text[] not null default '{}',
  is_member text,
  how_long text,
  member_where text,
  attends_where text,
  wants_study text,
  previous_assistance text,
  previous_assistance_amount numeric(12, 2),
  previous_assistance_purpose text,
  other_assistance text,
  other_assistance_amount numeric(12, 2),
  other_assistance_purpose text,
  budget_training text,
  contact_allowed text,
  approval_made_by text,
  form_completed_by text,
  children jsonb not null default '[]'::jsonb,
  comments text,
  raw_form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists benevolence_requests_person_id_idx
  on public.benevolence_requests(person_id);

create index if not exists benevolence_requests_created_at_idx
  on public.benevolence_requests(created_at desc);

alter table public.benevolence_people enable row level security;
alter table public.benevolence_requests enable row level security;

-- The Next.js Server Action writes with SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Add authenticated read policies here later if you build an admin list view in Supabase/Auth.
