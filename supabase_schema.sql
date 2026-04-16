-- ============================================================
-- Fitness Coach SaaS – Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable pgcrypto for gen_random_uuid (already available in Supabase)

-- ──────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null check (role in ('coach', 'client')) default 'client',
  coach_id    uuid references profiles(id) on delete set null,
  invite_code text unique,          -- coaches get a unique code
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────
-- HABITS  (coach-owned templates or assignments)
-- ──────────────────────────────────────────
create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references profiles(id) on delete cascade,
  label       text not null,
  icon        text not null default '🏋️',
  is_template boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────
-- CLIENT_HABITS  (habits assigned to a specific client)
-- ──────────────────────────────────────────
create table if not exists client_habits (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references profiles(id) on delete cascade,
  habit_id   uuid not null references habits(id) on delete cascade,
  streak     int not null default 0,
  created_at timestamptz not null default now(),
  unique (client_id, habit_id)
);

-- ──────────────────────────────────────────
-- CHECKINS
-- ──────────────────────────────────────────
create table if not exists checkins (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references profiles(id) on delete cascade,
  date             date not null default current_date,
  note             text not null default '',
  completed_habits uuid[] not null default '{}',
  submitted_at     timestamptz not null default now(),
  unique (client_id, date)
);

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────
alter table profiles      enable row level security;
alter table habits        enable row level security;
alter table client_habits enable row level security;
alter table checkins      enable row level security;

-- profiles: user sees their own row; coach sees their clients
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

create policy "profiles: coach sees clients" on profiles
  for select using (
    auth.uid() = coach_id
    or auth.uid() = id
  );

-- habits: coach owns their habits; clients can read habits assigned to them
create policy "habits: coach owns" on habits
  for all using (auth.uid() = coach_id);

create policy "habits: client reads assigned" on habits
  for select using (
    exists (
      select 1 from client_habits ch
      where ch.habit_id = habits.id
        and ch.client_id = auth.uid()
    )
  );

-- client_habits: coach can manage; client can read/update their own
create policy "client_habits: coach manages" on client_habits
  for all using (
    exists (
      select 1 from habits h
      where h.id = client_habits.habit_id
        and h.coach_id = auth.uid()
    )
  );

create policy "client_habits: client reads own" on client_habits
  for select using (client_id = auth.uid());

create policy "client_habits: client updates streak" on client_habits
  for update using (client_id = auth.uid());

-- checkins: client owns; coach can read their clients'
create policy "checkins: client owns" on checkins
  for all using (client_id = auth.uid());

create policy "checkins: coach reads clients" on checkins
  for select using (
    exists (
      select 1 from profiles p
      where p.id = checkins.client_id
        and p.coach_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- HEALTH PROFILES  (client health data)
-- ──────────────────────────────────────────
create table if not exists health_profiles (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null unique references profiles(id) on delete cascade,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table health_profiles enable row level security;

create policy "health_profiles: client owns" on health_profiles
  for all using (client_id = auth.uid());

create policy "health_profiles: coach reads clients" on health_profiles
  for select using (
    exists (
      select 1 from profiles p
      where p.id = health_profiles.client_id
        and p.coach_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- COACH AI SETTINGS
-- ──────────────────────────────────────────
create table if not exists coach_ai_settings (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null unique references profiles(id) on delete cascade,
  settings    jsonb not null default '{}',
  credentials jsonb not null default '[]',
  cert_files  text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table coach_ai_settings enable row level security;

create policy "coach_ai_settings: coach owns" on coach_ai_settings
  for all using (coach_id = auth.uid());

-- ──────────────────────────────────────────
-- STORAGE: certificates bucket
-- Run in Supabase dashboard > Storage or via SQL:
-- ──────────────────────────────────────────
-- insert into storage.buckets (id, name, public)
-- values ('certificates', 'certificates', false)
-- on conflict (id) do nothing;
--
-- create policy "certificates: coach upload own folder" on storage.objects
--   for insert with check (
--     bucket_id = 'certificates'
--     and auth.uid()::text = split_part(name, '/', 1)
--   );
--
-- create policy "certificates: coach read own folder" on storage.objects
--   for select using (
--     bucket_id = 'certificates'
--     and auth.uid()::text = split_part(name, '/', 1)
--   );
--
-- create policy "certificates: coach delete own folder" on storage.objects
--   for delete using (
--     bucket_id = 'certificates'
--     and auth.uid()::text = split_part(name, '/', 1)
--   );

-- ──────────────────────────────────────────
-- HELPER: generate 6-char invite codes
-- ──────────────────────────────────────────
create or replace function generate_invite_code()
returns text language sql as $$
  select upper(substring(md5(random()::text) for 6));
$$;

-- ──────────────────────────────────────────
-- HELPER: look up a coach by invite code
-- Runs as security definer so RLS is bypassed —
-- a new client (with no coach yet) can still find the coach row.
-- ──────────────────────────────────────────
create or replace function lookup_coach_by_invite_code(code text)
returns uuid language sql security definer as $$
  select id from profiles
  where invite_code = upper(trim(code))
  limit 1;
$$;
