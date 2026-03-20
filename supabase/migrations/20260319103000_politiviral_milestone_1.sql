create extension if not exists "pgcrypto";

create type public.app_role as enum ('creator', 'campaign');

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  organization_type text not null,
  website_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.creator_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  primary_platform text not null,
  content_focus text not null,
  audience_size text not null,
  home_base text not null,
  bio text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.campaign_profiles (
  owner_user_id uuid primary key references public.profiles (id) on delete cascade,
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  campaign_name text not null,
  geography_focus text not null,
  creator_goal text not null,
  creator_budget text not null,
  launch_timeline text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index profiles_role_idx on public.profiles (role);
create index organizations_owner_idx on public.organizations (owner_user_id);
create index campaign_profiles_org_idx on public.campaign_profiles (organization_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.handle_updated_at();

create trigger set_creator_profiles_updated_at
before update on public.creator_profiles
for each row
execute function public.handle_updated_at();

create trigger set_campaign_profiles_updated_at
before update on public.campaign_profiles
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.campaign_profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "organizations_select_own"
on public.organizations
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "organizations_insert_own"
on public.organizations
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "organizations_update_own"
on public.organizations
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "creator_profiles_select_own"
on public.creator_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "creator_profiles_insert_own"
on public.creator_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "creator_profiles_update_own"
on public.creator_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "campaign_profiles_select_own"
on public.campaign_profiles
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "campaign_profiles_insert_own"
on public.campaign_profiles
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "campaign_profiles_update_own"
on public.campaign_profiles
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);
