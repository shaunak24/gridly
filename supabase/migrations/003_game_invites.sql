-- Gridly v3.1: server-stored game invites for shareable HTTPS links

create table public.game_invites (
  id text primary key,
  game_id text not null,
  payload jsonb not null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.game_invites enable row level security;

-- Invite ID is the capability; only non-expired rows are readable from the client.
create policy "Anyone can read active game invites"
  on public.game_invites for select
  using (expires_at is null or expires_at > now());

-- Inserts are performed by the create-invite Edge Function (service role).
