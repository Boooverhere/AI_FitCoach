-- Run once in Supabase SQL editor.
-- Safe to re-run: all statements are idempotent.

-- 1. Create table (skipped if it already exists)
create table if not exists coach_subscriptions (
  coach_id                uuid primary key references profiles(id) on delete cascade,
  subscription_status     text not null default 'none',
  trial_ends_at           timestamptz,
  subscription_period_end timestamptz,
  updated_at              timestamptz not null default now()
);

-- 2. Add Dodo columns
alter table coach_subscriptions
  add column if not exists dodo_customer_id     text,
  add column if not exists dodo_subscription_id text;

-- 3. RLS
alter table coach_subscriptions enable row level security;

-- Drop old policies if they exist, then recreate cleanly
drop policy if exists "coach_subscriptions: service role only" on coach_subscriptions;
drop policy if exists "coach_subscriptions: coach reads own"   on coach_subscriptions;

-- Coaches can read their own row (used by middleware + billing page)
create policy "coach_subscriptions: coach reads own" on coach_subscriptions
  for select using (auth.uid() = coach_id);

-- All writes go through service role only (API routes bypass RLS)
create policy "coach_subscriptions: service role writes" on coach_subscriptions
  for all using (false);
