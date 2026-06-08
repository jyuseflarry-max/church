-- Teaching Library audio cleanup
-- Tracks hum/noise cleanup as a separate processing step from clipping and publishing.

alter table public.teaching_lessons
  add column if not exists audio_cleanup_status text not null default 'not_requested'
    check (audio_cleanup_status in ('not_requested', 'queued', 'processing', 'processed', 'failed', 'skipped')),
  add column if not exists audio_cleanup_provider text,
  add column if not exists cleaned_source_audio_url text,
  add column if not exists cleaned_clip_audio_url text,
  add column if not exists audio_cleanup_settings jsonb not null default '{}'::jsonb,
  add column if not exists audio_cleanup_notes text,
  add column if not exists audio_cleanup_completed_at timestamptz;

create index if not exists teaching_lessons_audio_cleanup_status_idx
  on public.teaching_lessons (audio_cleanup_status, lesson_date desc);
