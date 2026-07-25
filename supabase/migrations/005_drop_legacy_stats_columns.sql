-- v3.3: remove scalar stats columns superseded by stats_by_mode jsonb.
-- daily_completed_date and updated_at remain for daily-lock sync and merge timestamps.

alter table public.word_hunt_stats
  drop column if exists games_played,
  drop column if exists games_won,
  drop column if exists current_streak,
  drop column if exists max_streak,
  drop column if exists distribution;

alter table public.grid_snap_stats
  drop column if exists games_played,
  drop column if exists games_won,
  drop column if exists current_streak,
  drop column if exists max_streak;
