-- Family Quest — Supabase database setup
-- Kjør dette i Supabase Dashboard → SQL Editor → New query

-- Tabell for familiedata
create table if not exists family_state (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  state        jsonb not null default '{}',
  updated_at   timestamptz default now()
);

-- Sikkerhet: hver familie ser bare sine egne data
alter table family_state enable row level security;

create policy "family_own_data" on family_state
  for all
  using  (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Aktiver real-time synkronisering
alter publication supabase_realtime add table family_state;
