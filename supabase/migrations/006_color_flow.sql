-- v4.0: Color Flow stats and settings tables

create table public.color_flow_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stats_by_mode jsonb,
  daily_completed_date date,
  updated_at timestamptz not null default now()
);

create table public.color_flow_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  notifications_enabled boolean not null default true,
  reminder_hour integer not null default 8,
  reminder_minute integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.color_flow_stats enable row level security;
alter table public.color_flow_settings enable row level security;

create policy "Users manage own color flow stats"
  on public.color_flow_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own color flow settings"
  on public.color_flow_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
