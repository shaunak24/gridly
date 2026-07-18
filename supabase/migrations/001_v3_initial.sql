-- Gridly V3 schema: user profiles, synced stats/settings, feedback

create type public.feedback_type as enum ('feedback', 'bug');

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.word_hunt_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  games_played integer not null default 0,
  games_won integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  distribution integer[] not null default '{0,0,0,0,0,0,0}',
  daily_completed_date date,
  updated_at timestamptz not null default now()
);

create table public.grid_snap_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  games_played integer not null default 0,
  games_won integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  daily_completed_date date,
  updated_at timestamptz not null default now()
);

create table public.word_hunt_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hard_mode boolean not null default false,
  notifications_enabled boolean not null default true,
  reminder_hour integer not null default 8,
  reminder_minute integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.grid_snap_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  notifications_enabled boolean not null default true,
  reminder_hour integer not null default 8,
  reminder_minute integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('dark', 'light', 'system')),
  updated_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  type public.feedback_type not null default 'feedback',
  message text not null check (char_length(message) between 1 and 4000),
  contact_email text,
  app_version text,
  platform text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.word_hunt_stats enable row level security;
alter table public.grid_snap_stats enable row level security;
alter table public.word_hunt_settings enable row level security;
alter table public.grid_snap_settings enable row level security;
alter table public.app_settings enable row level security;
alter table public.feedback enable row level security;

create policy "Users manage own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own word hunt stats"
  on public.word_hunt_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own grid snap stats"
  on public.grid_snap_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own word hunt settings"
  on public.word_hunt_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own grid snap settings"
  on public.grid_snap_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own app settings"
  on public.app_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

create policy "Users can read own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

-- Configure a database webhook in Supabase dashboard to call
-- send-feedback-notification on feedback insert.
