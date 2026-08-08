alter table public.feedback
  add column if not exists implemented boolean not null default false;
