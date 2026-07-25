-- v3.3: per-mode stats JSON buckets. Legacy scalars dropped in 005 after backfill.

alter table public.word_hunt_stats
  add column if not exists stats_by_mode jsonb;

alter table public.grid_snap_stats
  add column if not exists stats_by_mode jsonb;

-- Map existing flat totals into daily (Word Hunt) and easy (Grid Snap) buckets.
update public.word_hunt_stats
set stats_by_mode = jsonb_build_object(
  'daily', jsonb_build_object(
    'gamesPlayed', games_played,
    'gamesWon', games_won,
    'currentStreak', current_streak,
    'maxStreak', max_streak,
    'distribution', to_jsonb(distribution),
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  ),
  'practice', jsonb_build_object(
    'gamesPlayed', 0,
    'gamesWon', 0,
    'currentStreak', 0,
    'maxStreak', 0,
    'distribution', jsonb_build_array(0, 0, 0, 0, 0, 0, 0),
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  ),
  'custom', jsonb_build_object(
    'gamesPlayed', 0,
    'gamesWon', 0,
    'currentStreak', 0,
    'maxStreak', 0,
    'distribution', jsonb_build_array(0, 0, 0, 0, 0, 0, 0),
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  )
)
where stats_by_mode is null;

update public.grid_snap_stats
set stats_by_mode = jsonb_build_object(
  'easy', jsonb_build_object(
    'gamesPlayed', games_played,
    'gamesWon', games_won,
    'currentStreak', current_streak,
    'maxStreak', max_streak,
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  ),
  'medium', jsonb_build_object(
    'gamesPlayed', 0,
    'gamesWon', 0,
    'currentStreak', 0,
    'maxStreak', 0,
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  ),
  'hard', jsonb_build_object(
    'gamesPlayed', 0,
    'gamesWon', 0,
    'currentStreak', 0,
    'maxStreak', 0,
    'time', jsonb_build_object(
      'fastestSec', null,
      'slowestSec', null,
      'totalSec', 0,
      'completedCount', 0
    )
  )
)
where stats_by_mode is null;
