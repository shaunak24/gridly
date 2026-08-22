alter table public.app_settings
  add column if not exists music_enabled boolean not null default true;
