-- Teaching Library
-- Stores approved public sermon/lesson clips imported from Congregate.

create extension if not exists pgcrypto;

create table if not exists public.teaching_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'congregate',
  provider_item_id text not null,
  source_url text not null,
  source_audio_url text,
  source_video_url text,
  raw_title text not null,
  raw_speaker text,
  raw_service text,
  raw_type text,
  raw_series text,
  raw_published_at timestamptz,
  imported_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  unique (provider, provider_item_id)
);

create table if not exists public.teaching_artwork_styles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  style_prompt text not null,
  palette jsonb not null default '{}'::jsonb,
  reference_artwork_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teaching_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  collection_type text not null check (collection_type in ('series', 'service', 'year', 'topic', 'special')),
  artwork_url text,
  artwork_style_id uuid references public.teaching_artwork_styles(id) on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teaching_lessons (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.teaching_sources(id) on delete set null,
  slug text not null unique,
  title text not null,
  speaker text not null default 'Guest Speaker',
  lesson_date date not null,
  service text not null default '',
  lesson_type text not null default 'Lesson',
  series text,
  scripture text[] not null default '{}'::text[],
  summary text not null default '',
  topics text[] not null default '{}'::text[],
  source_url text not null,
  source_audio_url text,
  source_video_url text,
  clip_start_seconds integer check (clip_start_seconds is null or clip_start_seconds >= 0),
  clip_end_seconds integer,
  clipped_audio_url text,
  clipped_video_url text,
  youtube_video_id text,
  youtube_url text,
  youtube_visibility text
    check (youtube_visibility in ('private', 'unlisted', 'public')),
  youtube_upload_status text not null default 'not_requested'
    check (youtube_upload_status in ('not_requested', 'queued', 'uploading', 'uploaded_private', 'published', 'failed', 'skipped')),
  youtube_uploaded_at timestamptz,
  youtube_published_at timestamptz,
  youtube_metadata jsonb not null default '{}'::jsonb,
  transcript text,
  transcript_status text not null default 'pending'
    check (transcript_status in ('pending', 'generated', 'edited', 'approved')),
  artwork_url text,
  artwork_prompt text,
  artwork_style_id uuid references public.teaching_artwork_styles(id) on delete set null,
  artwork_status text not null default 'pending'
    check (artwork_status in ('pending', 'generated', 'approved', 'rejected')),
  ai_breakdown jsonb not null default '{}'::jsonb,
  approval_status text not null default 'imported'
    check (approval_status in ('imported', 'ai_review', 'needs_changes', 'approved', 'published', 'archived')),
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teaching_lessons_clip_range_chk check (
    clip_end_seconds is null
    or clip_start_seconds is null
    or clip_end_seconds > clip_start_seconds
  )
);

create table if not exists public.teaching_collection_lessons (
  collection_id uuid not null references public.teaching_collections(id) on delete cascade,
  lesson_id uuid not null references public.teaching_lessons(id) on delete cascade,
  position integer,
  created_at timestamptz not null default now(),
  primary key (collection_id, lesson_id)
);

create table if not exists public.teaching_review_events (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.teaching_lessons(id) on delete cascade,
  event_type text not null,
  event_note text,
  event_payload jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists teaching_sources_provider_item_idx
  on public.teaching_sources (provider, provider_item_id);

create index if not exists teaching_lessons_status_date_idx
  on public.teaching_lessons (approval_status, lesson_date desc);

create index if not exists teaching_lessons_public_date_idx
  on public.teaching_lessons (lesson_date desc)
  where approval_status = 'published';

create unique index if not exists teaching_lessons_youtube_video_id_idx
  on public.teaching_lessons (youtube_video_id)
  where youtube_video_id is not null;

create index if not exists teaching_lessons_youtube_upload_status_idx
  on public.teaching_lessons (youtube_upload_status, lesson_date desc);

create index if not exists teaching_lessons_speaker_idx
  on public.teaching_lessons (speaker);

create index if not exists teaching_lessons_service_idx
  on public.teaching_lessons (service);

create index if not exists teaching_lessons_type_idx
  on public.teaching_lessons (lesson_type);

create index if not exists teaching_lessons_series_idx
  on public.teaching_lessons (series)
  where series is not null;

create index if not exists teaching_collection_lessons_lesson_idx
  on public.teaching_collection_lessons (lesson_id);

create index if not exists teaching_review_events_lesson_created_idx
  on public.teaching_review_events (lesson_id, created_at desc);

alter table public.teaching_sources enable row level security;
alter table public.teaching_artwork_styles enable row level security;
alter table public.teaching_collections enable row level security;
alter table public.teaching_lessons enable row level security;
alter table public.teaching_collection_lessons enable row level security;
alter table public.teaching_review_events enable row level security;

create policy "Public can read approved teaching artwork styles"
  on public.teaching_artwork_styles
  for select
  using (true);

create policy "Public can read public teaching collections"
  on public.teaching_collections
  for select
  using (is_public = true);

create policy "Public can read published teaching lessons"
  on public.teaching_lessons
  for select
  using (approval_status = 'published');

create policy "Public can read published collection lesson joins"
  on public.teaching_collection_lessons
  for select
  using (
    exists (
      select 1
      from public.teaching_collections c
      where c.id = collection_id
        and c.is_public = true
    )
    and exists (
      select 1
      from public.teaching_lessons l
      where l.id = lesson_id
        and l.approval_status = 'published'
    )
  );

-- Writes are intentionally left to the Supabase service role for now.
-- Before exposing browser-based admin editing, add authenticated admin policies.
