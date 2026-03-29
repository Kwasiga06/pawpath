-- Run this in the Supabase SQL editor to enable walk history

create table if not exists walks (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references auth.users(id) on delete cascade not null,
  dog_id           uuid,
  dog_name         text,
  breed            text,
  started_at       timestamptz not null,
  ended_at         timestamptz,
  duration_seconds integer,
  distance_meters  float,
  route            jsonb,   -- array of {lat, lng} objects
  park_name        text,
  created_at       timestamptz default now()
);

-- Row-level security: users only see their own walks
alter table walks enable row level security;

create policy "Users can insert their own walks"
  on walks for insert
  with check (auth.uid() = owner_id);

create policy "Users can read their own walks"
  on walks for select
  using (auth.uid() = owner_id);

create policy "Users can delete their own walks"
  on walks for delete
  using (auth.uid() = owner_id);
