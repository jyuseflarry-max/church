create extension if not exists pg_trgm;

create index if not exists benevolence_people_full_name_trgm_idx
  on public.benevolence_people
  using gin (full_name gin_trgm_ops)
  where is_demo_data = false;
