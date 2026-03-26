-- BrandBuild full Supabase bootstrap
-- Paste this entire file into the Supabase SQL Editor for the connected BrandBuild project.
-- It includes:
-- 1. legacy profile/onboarding foundation required by the current app
-- 2. AI video studio schema
-- 3. account/settings schema
-- 4. private storage bucket + policies
-- 5. demo seed data

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'app_role'
  ) then
    create type public.app_role as enum ('creator', 'campaign');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'campaign_status'
  ) then
    create type public.campaign_status as enum (
      'draft',
      'active',
      'in_review',
      'approved',
      'archived'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'shot_status'
  ) then
    create type public.shot_status as enum (
      'planned',
      'prompt_ready',
      'queued',
      'generating',
      'generated',
      'reviewed',
      'selected',
      'rejected',
      'archived'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'target_model'
  ) then
    create type public.target_model as enum (
      'sora',
      'kling',
      'higgsfield'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'asset_type'
  ) then
    create type public.asset_type as enum (
      'reference_image',
      'reference_video',
      'generated_video',
      'thumbnail',
      'logo',
      'product_image',
      'character_sheet',
      'moodboard',
      'audio_track',
      'subtitle_file',
      'edit_export'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'asset_source'
  ) then
    create type public.asset_source as enum (
      'upload',
      'generated',
      'external_link',
      'manual'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'review_decision'
  ) then
    create type public.review_decision as enum (
      'pending',
      'selected',
      'rejected',
      'hold'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'notification_frequency'
  ) then
    create type public.notification_frequency as enum (
      'instant',
      'daily_digest',
      'weekly_digest',
      'off'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'privacy_request_type'
  ) then
    create type public.privacy_request_type as enum (
      'export',
      'delete'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'privacy_request_status'
  ) then
    create type public.privacy_request_status as enum (
      'pending',
      'processing',
      'completed',
      'rejected',
      'cancelled'
    );
  end if;
end
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  onboarding_completed boolean not null default false,
  role public.app_role,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null,
  owner_user_id uuid not null unique references public.profiles (id) on delete cascade,
  website_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text not null,
  content_focus text not null,
  audience_size text not null,
  primary_platform text not null,
  home_base text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_profiles (
  owner_user_id uuid primary key references public.profiles (id) on delete cascade,
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  campaign_name text not null,
  creator_goal text not null,
  creator_budget text not null,
  geography_focus text not null,
  launch_timeline text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.handle_updated_at();

drop trigger if exists set_creator_profiles_updated_at on public.creator_profiles;
create trigger set_creator_profiles_updated_at
before update on public.creator_profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_campaign_profiles_updated_at on public.campaign_profiles;
create trigger set_campaign_profiles_updated_at
before update on public.campaign_profiles
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.campaign_profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "organizations_select_own" on public.organizations;
create policy "organizations_select_own"
on public.organizations
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "organizations_insert_own" on public.organizations;
create policy "organizations_insert_own"
on public.organizations
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "organizations_update_own" on public.organizations;
create policy "organizations_update_own"
on public.organizations
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "creator_profiles_select_own" on public.creator_profiles;
create policy "creator_profiles_select_own"
on public.creator_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "creator_profiles_insert_own" on public.creator_profiles;
create policy "creator_profiles_insert_own"
on public.creator_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "creator_profiles_update_own" on public.creator_profiles;
create policy "creator_profiles_update_own"
on public.creator_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "campaign_profiles_select_own" on public.campaign_profiles;
create policy "campaign_profiles_select_own"
on public.campaign_profiles
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "campaign_profiles_insert_own" on public.campaign_profiles;
create policy "campaign_profiles_insert_own"
on public.campaign_profiles
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "campaign_profiles_update_own" on public.campaign_profiles;
create policy "campaign_profiles_update_own"
on public.campaign_profiles
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

insert into public.profiles (id, full_name)
select
  auth_users.id,
  nullif(trim(coalesce(auth_users.raw_user_meta_data ->> 'full_name', '')), '')
from auth.users auth_users
on conflict (id) do update
set full_name = coalesce(public.profiles.full_name, excluded.full_name);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  client_name text,
  brand_name text,
  objective text,
  audience text,
  offer text,
  call_to_action text,
  hook_angle text,
  target_platforms text[] default '{}',
  default_aspect_ratios text[] default '{}',
  status public.campaign_status not null default 'draft',
  start_date date,
  due_date date,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  scene_number integer not null,
  title text not null,
  objective text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, scene_number)
);

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete set null,
  scene_number integer not null,
  shot_number integer not null,
  title text not null,
  purpose text,
  duration_seconds integer default 8,
  aspect_ratio text default '9:16',
  target_model public.target_model not null,
  status public.shot_status not null default 'planned',
  camera_direction text,
  movement_direction text,
  environment text,
  lighting text,
  mood text,
  visual_style text,
  dialogue_audio_intent text,
  constraints text,
  prompt_text text,
  negative_prompt text,
  internal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, scene_number, shot_number)
);

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  target_model public.target_model,
  subject_template text,
  action_template text,
  camera_template text,
  environment_template text,
  lighting_template text,
  mood_template text,
  visual_style_template text,
  dialogue_audio_template text,
  constraints_template text,
  final_template text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shot_generations (
  id uuid primary key default gen_random_uuid(),
  shot_id uuid not null references public.shots(id) on delete cascade,
  provider public.target_model not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  provider_job_id text,
  status text not null default 'mocked',
  output_url text,
  thumbnail_url text,
  duration_seconds integer,
  aspect_ratio text,
  seed text,
  generation_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  shot_id uuid references public.shots(id) on delete set null,
  generation_id uuid references public.shot_generations(id) on delete set null,
  type public.asset_type not null,
  source public.asset_source not null default 'upload',
  file_name text not null,
  file_url text not null,
  mime_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  duration_seconds numeric,
  metadata_json jsonb not null default '{}'::jsonb,
  tags text[] default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shot_id uuid not null references public.shots(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  reviewer_name text,
  score_realism integer check (score_realism between 1 and 10),
  score_brand_fit integer check (score_brand_fit between 1 and 10),
  score_hook_strength integer check (score_hook_strength between 1 and 10),
  score_editability integer check (score_editability between 1 and 10),
  score_motion_quality integer check (score_motion_quality between 1 and 10),
  score_prompt_fidelity integer check (score_prompt_fidelity between 1 and 10),
  decision public.review_decision not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.asset_tags (
  asset_id uuid not null references public.assets(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_scenes_campaign_id on public.scenes(campaign_id);
create index if not exists idx_shots_campaign_id on public.shots(campaign_id);
create index if not exists idx_shots_scene_id on public.shots(scene_id);
create index if not exists idx_shots_status on public.shots(status);
create index if not exists idx_shots_target_model on public.shots(target_model);
create index if not exists idx_assets_campaign_id on public.assets(campaign_id);
create index if not exists idx_assets_shot_id on public.assets(shot_id);
create index if not exists idx_assets_generation_id on public.assets(generation_id);
create index if not exists idx_assets_type on public.assets(type);
create index if not exists idx_reviews_shot_id on public.reviews(shot_id);
create index if not exists idx_reviews_asset_id on public.reviews(asset_id);
create index if not exists idx_generations_shot_id on public.shot_generations(shot_id);

drop trigger if exists set_updated_at_campaigns on public.campaigns;
create trigger set_updated_at_campaigns
before update on public.campaigns
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_scenes on public.scenes;
create trigger set_updated_at_scenes
before update on public.scenes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_shots on public.shots;
create trigger set_updated_at_shots
before update on public.shots
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_prompt_templates on public.prompt_templates;
create trigger set_updated_at_prompt_templates
before update on public.prompt_templates
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_shot_generations on public.shot_generations;
create trigger set_updated_at_shot_generations
before update on public.shot_generations
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_assets on public.assets;
create trigger set_updated_at_assets
before update on public.assets
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_reviews on public.reviews;
create trigger set_updated_at_reviews
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.campaigns enable row level security;
alter table public.scenes enable row level security;
alter table public.shots enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.shot_generations enable row level security;
alter table public.assets enable row level security;
alter table public.reviews enable row level security;
alter table public.tags enable row level security;
alter table public.asset_tags enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "campaigns_internal_access" on public.campaigns;
create policy "campaigns_internal_access"
on public.campaigns
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "scenes_internal_access" on public.scenes;
create policy "scenes_internal_access"
on public.scenes
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "shots_internal_access" on public.shots;
create policy "shots_internal_access"
on public.shots
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "prompt_templates_internal_access" on public.prompt_templates;
create policy "prompt_templates_internal_access"
on public.prompt_templates
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "shot_generations_internal_access" on public.shot_generations;
create policy "shot_generations_internal_access"
on public.shot_generations
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "assets_internal_access" on public.assets;
create policy "assets_internal_access"
on public.assets
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "reviews_internal_access" on public.reviews;
create policy "reviews_internal_access"
on public.reviews
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "tags_internal_access" on public.tags;
create policy "tags_internal_access"
on public.tags
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "asset_tags_internal_access" on public.asset_tags;
create policy "asset_tags_internal_access"
on public.asset_tags
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "activity_log_internal_access" on public.activity_log;
create policy "activity_log_internal_access"
on public.activity_log
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text,
  username text unique,
  headline text,
  bio text,
  avatar_path text,
  cover_image_path text,
  contact_email text,
  contact_phone text,
  contact_website text,
  share_slug text unique,
  share_token uuid,
  share_link_enabled boolean not null default false,
  is_public boolean not null default false,
  is_discoverable boolean not null default false,
  noindex boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'system',
  timezone text not null default 'UTC',
  language text not null default 'en',
  email_digest_frequency public.notification_frequency not null default 'daily_digest',
  dashboard_layout text not null default 'cinematic-ops',
  onboarding_hints_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  subtitles_enabled boolean not null default true,
  last_reauthenticated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  frequency public.notification_frequency not null default 'daily_digest',
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text not null default 'UTC',
  transactional_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, topic)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  permission_state text not null default 'default',
  device_label text,
  browser_name text,
  platform_name text,
  subscription_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, endpoint)
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_token_hash text not null,
  session_label text,
  browser text,
  os text,
  ip_address text,
  approximate_location text,
  trusted boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  last_active_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, session_token_hash)
);

create table if not exists public.user_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  credential_id text unique,
  credential_public_key text,
  transports text[] default '{}',
  counter bigint not null default 0,
  aaguid text,
  backed_up boolean not null default false,
  registration_status text not null default 'pending',
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_type public.privacy_request_type not null,
  status public.privacy_request_status not null default 'pending',
  requested_export_first boolean not null default false,
  status_detail text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_notification_preferences_user_topic_idx
  on public.user_notification_preferences (user_id, topic);
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id, created_at desc);
create index if not exists user_sessions_user_idx
  on public.user_sessions (user_id, last_active_at desc);
create index if not exists user_sessions_token_idx
  on public.user_sessions (session_token_hash);
create index if not exists user_passkeys_user_idx
  on public.user_passkeys (user_id, created_at desc);
create index if not exists user_privacy_requests_user_idx
  on public.user_privacy_requests (user_id, created_at desc);
create index if not exists audit_events_user_event_idx
  on public.audit_events (user_id, event_type, created_at desc);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.handle_updated_at();

drop trigger if exists set_user_notification_preferences_updated_at on public.user_notification_preferences;
create trigger set_user_notification_preferences_updated_at
before update on public.user_notification_preferences
for each row
execute function public.handle_updated_at();

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.handle_updated_at();

drop trigger if exists set_user_sessions_updated_at on public.user_sessions;
create trigger set_user_sessions_updated_at
before update on public.user_sessions
for each row
execute function public.handle_updated_at();

drop trigger if exists set_user_passkeys_updated_at on public.user_passkeys;
create trigger set_user_passkeys_updated_at
before update on public.user_passkeys
for each row
execute function public.handle_updated_at();

drop trigger if exists set_user_privacy_requests_updated_at on public.user_privacy_requests;
create trigger set_user_privacy_requests_updated_at
before update on public.user_privacy_requests
for each row
execute function public.handle_updated_at();

create or replace function public.ensure_default_notification_preferences(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_notification_preferences (
    user_id,
    topic,
    in_app_enabled,
    email_enabled,
    sms_enabled,
    push_enabled,
    frequency,
    transactional_locked,
    timezone
  )
  values
    (target_user_id, 'security', true, true, false, false, 'instant', true, 'UTC'),
    (target_user_id, 'account', true, true, false, false, 'instant', true, 'UTC'),
    (target_user_id, 'billing', true, true, false, false, 'daily_digest', true, 'UTC'),
    (target_user_id, 'reminders', true, false, false, false, 'daily_digest', false, 'UTC'),
    (target_user_id, 'messages', true, true, false, false, 'instant', false, 'UTC'),
    (target_user_id, 'mentions', true, true, false, false, 'instant', false, 'UTC'),
    (target_user_id, 'comments', true, false, false, false, 'daily_digest', false, 'UTC'),
    (target_user_id, 'product', true, true, false, false, 'weekly_digest', false, 'UTC'),
    (target_user_id, 'marketing', false, false, false, false, 'off', false, 'UTC')
  on conflict (user_id, topic) do nothing;
end;
$$;

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

  insert into public.user_profiles (user_id, display_name, contact_email)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    new.email
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  perform public.ensure_default_notification_preferences(new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.user_profiles (user_id, display_name, contact_email)
select
  profiles.id,
  coalesce(nullif(trim(profiles.full_name), ''), split_part(coalesce(auth_users.email, ''), '@', 1)),
  auth_users.email
from public.profiles
left join auth.users auth_users on auth_users.id = profiles.id
on conflict (user_id) do nothing;

insert into public.user_preferences (user_id)
select profiles.id
from public.profiles
on conflict (user_id) do nothing;

select public.ensure_default_notification_preferences(id) from public.profiles;

alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_sessions enable row level security;
alter table public.user_passkeys enable row level security;
alter table public.user_privacy_requests enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_notification_preferences_select_own" on public.user_notification_preferences;
create policy "user_notification_preferences_select_own"
on public.user_notification_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_notification_preferences_insert_own" on public.user_notification_preferences;
create policy "user_notification_preferences_insert_own"
on public.user_notification_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_notification_preferences_update_own" on public.user_notification_preferences;
create policy "user_notification_preferences_update_own"
on public.user_notification_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own"
on public.push_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own"
on public.push_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own"
on public.push_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_sessions_select_own" on public.user_sessions;
create policy "user_sessions_select_own"
on public.user_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_sessions_insert_own" on public.user_sessions;
create policy "user_sessions_insert_own"
on public.user_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_sessions_update_own" on public.user_sessions;
create policy "user_sessions_update_own"
on public.user_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_passkeys_select_own" on public.user_passkeys;
create policy "user_passkeys_select_own"
on public.user_passkeys
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_passkeys_insert_own" on public.user_passkeys;
create policy "user_passkeys_insert_own"
on public.user_passkeys
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_passkeys_update_own" on public.user_passkeys;
create policy "user_passkeys_update_own"
on public.user_passkeys
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_passkeys_delete_own" on public.user_passkeys;
create policy "user_passkeys_delete_own"
on public.user_passkeys
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_privacy_requests_select_own" on public.user_privacy_requests;
create policy "user_privacy_requests_select_own"
on public.user_privacy_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_privacy_requests_insert_own" on public.user_privacy_requests;
create policy "user_privacy_requests_insert_own"
on public.user_privacy_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "audit_events_select_own" on public.audit_events;
create policy "audit_events_select_own"
on public.audit_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "audit_events_insert_own" on public.audit_events;
create policy "audit_events_insert_own"
on public.audit_events
for insert
to authenticated
with check (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'assets',
  'assets',
  false,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_bucket_authenticated_select'
  ) then
    create policy "assets_bucket_authenticated_select"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'assets');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_bucket_authenticated_insert'
  ) then
    create policy "assets_bucket_authenticated_insert"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'assets');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_bucket_authenticated_update'
  ) then
    create policy "assets_bucket_authenticated_update"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'assets')
    with check (bucket_id = 'assets');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_bucket_authenticated_delete'
  ) then
    create policy "assets_bucket_authenticated_delete"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'assets');
  end if;
end
$$;

-- Demo seed data
insert into public.campaigns (
  id,
  name,
  slug,
  client_name,
  brand_name,
  objective,
  audience,
  offer,
  call_to_action,
  hook_angle,
  target_platforms,
  default_aspect_ratios,
  status,
  created_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Spring Hero Launch',
    'spring-hero-launch',
    'Vantage',
    'Vantage Labs',
    'Launch a premium hero campaign that positions the product as polished, cinematic, and high-converting.',
    'Performance marketers and creative directors at fast-moving ecommerce brands.',
    'Limited launch bundle with strategy bonus.',
    'Book a strategy session',
    'Launch-night premium reveal with polished product authority.',
    array['YouTube', 'Meta', 'Landing Page'],
    array['16:9', '9:16'],
    'active',
    '2026-03-18T16:15:00Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'UGC Motion Sprint',
    'ugc-motion-sprint',
    'Northstar',
    'Northstar Commerce',
    'Create repeatable paid-social variants with strong hooks and clearer product motion.',
    'Growth leads and founder-operators scanning short-form performance creatives.',
    '14-day free trial with concierge onboarding.',
    'Start a free trial',
    'UGC-style immediacy with cleaner CTA pacing.',
    array['TikTok', 'Instagram Reels', 'Meta'],
    array['9:16'],
    'in_review',
    '2026-03-17T14:05:00Z'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Executive Narrative Cut',
    'executive-narrative-cut',
    'Atlas',
    'Atlas Stack',
    'Develop a cinematic explainer with premium polish for outbound, deck embeds, and landing page use.',
    'Executive buyers evaluating a premium SaaS purchase with a longer sales cycle.',
    'Enterprise implementation workshop.',
    'Request a live demo',
    'High-concept cinematic storytelling for executive buyers.',
    array['LinkedIn', 'Landing Page', 'Sales Enablement'],
    array['16:9'],
    'draft',
    '2026-03-16T11:40:00Z'
  ),
  (
    '44444444-1111-1111-1111-111111111111',
    'Spring Product Launch',
    'spring-product-launch',
    'Internal Demo Client',
    'Luma Drink',
    'Launch a premium sparkling energy drink campaign',
    'Health-conscious adults 24-40 who like sleek premium lifestyle brands',
    'New citrus energy drink with clean ingredients',
    'Shop now',
    'Luxury energy with clean ingredients',
    array['instagram', 'tiktok', 'youtube-shorts'],
    array['9:16', '1:1', '16:9'],
    'active',
    '2026-03-19T15:10:00Z'
  )
on conflict (id) do nothing;

insert into public.scenes (
  id,
  campaign_id,
  scene_number,
  title,
  objective,
  notes,
  created_at
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    1,
    'Hero reveal sequence',
    'Introduce the product with premium cinematic polish.',
    'Keep the launch-night tone restrained and elegant.',
    '2026-03-18T16:20:00Z'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '22222222-2222-2222-2222-222222222222',
    1,
    'Social hook sequence',
    'Create a fast social-native opener with strong product clarity.',
    'Optimize for readable motion and CTA pacing.',
    '2026-03-17T14:10:00Z'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    1,
    'Abstract opener',
    'Test a cinematic executive opener before narrowing down the final story path.',
    'Use this scene for worldbuilding exploration.',
    '2026-03-16T12:00:00Z'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '44444444-1111-1111-1111-111111111111',
    1,
    'Opening Hook',
    'Stop the scroll in first 2 seconds',
    'Need a premium cinematic hero look',
    '2026-03-19T15:16:00Z'
  ),
  (
    '44444444-4444-4444-4444-444444444445',
    '44444444-1111-1111-1111-111111111111',
    2,
    'Product Experience',
    'Show taste, freshness, and premium vibe',
    'Can be more motion-driven',
    '2026-03-19T15:18:00Z'
  )
on conflict (id) do nothing;

insert into public.shots (
  id,
  campaign_id,
  scene_id,
  scene_number,
  shot_number,
  title,
  purpose,
  duration_seconds,
  aspect_ratio,
  target_model,
  status,
  camera_direction,
  movement_direction,
  environment,
  lighting,
  mood,
  visual_style,
  dialogue_audio_intent,
  constraints,
  prompt_text,
  internal_notes,
  created_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    1,
    1,
    'Hero reveal entrance',
    'Open the campaign with a hero shot that signals premium quality immediately.',
    8,
    '16:9',
    'sora',
    'generating',
    'Slow dolly in with a subtle parallax arc ending on a locked medium-wide hero frame.',
    null,
    'Premium dark studio with reflective floor, volumetric haze, and branded light strips.',
    'Directional key with cool rim lights and restrained cyan highlights.',
    'Confident, premium, launch-night anticipation.',
    'Photoreal, polished brand film, restrained luxury tech aesthetic.',
    'Low-key cinematic sound design with a single line delivered cleanly to camera.',
    'No warped hands, no floating UI, keep product silhouette consistent, avoid excessive lens flare.',
    E'Subject: Founder in tailored black wardrobe holding the hero product.\nAction: Founder steps through an illuminated product tunnel and pauses for a hero reveal.\nCamera: Slow dolly in with a subtle parallax arc ending on a locked medium-wide hero frame.\nEnvironment: Premium dark studio with reflective floor, volumetric haze, and branded light strips.\nLighting: Directional key with cool rim lights and restrained cyan highlights.\nMood: Confident, premium, launch-night anticipation.\nVisual style: Photoreal, polished brand film, restrained luxury tech aesthetic.\nDialogue / audio intent: Low-key cinematic sound design with a single line delivered cleanly to camera.\nConstraints: No warped hands, no floating UI, keep product silhouette consistent, avoid excessive lens flare.',
    'Primary hero opener. Needs premium realism and flawless product silhouette.',
    '2026-03-18T16:25:00Z'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    1,
    2,
    'Pedestal lockup',
    'Bridge from hero reveal into product focus with strong edit points.',
    6,
    '16:9',
    'sora',
    'reviewed',
    'Slow dolly in with a subtle parallax arc ending on a locked medium-wide hero frame.',
    null,
    'Premium dark studio with reflective floor, volumetric haze, and branded light strips.',
    'Directional key with cool rim lights and restrained cyan highlights.',
    'Confident, premium, launch-night anticipation.',
    'Photoreal, polished brand film, restrained luxury tech aesthetic.',
    'Low-key cinematic sound design with a single line delivered cleanly to camera.',
    'No warped hands, no floating UI, keep product silhouette consistent, avoid excessive lens flare.',
    E'Subject: Founder in tailored black wardrobe holding the hero product.\nAction: Founder places the product on a pedestal while branded UI light wraps across the frame.\nCamera: Slow dolly in with a subtle parallax arc ending on a locked medium-wide hero frame.\nEnvironment: Premium dark studio with reflective floor, volumetric haze, and branded light strips.\nLighting: Directional key with cool rim lights and restrained cyan highlights.\nMood: Confident, premium, launch-night anticipation.\nVisual style: Photoreal, polished brand film, restrained luxury tech aesthetic.\nDialogue / audio intent: Low-key cinematic sound design with a single line delivered cleanly to camera.\nConstraints: No warped hands, no floating UI, keep product silhouette consistent, avoid excessive lens flare.',
    'Need a cleaner camera lock for editability.',
    '2026-03-18T16:32:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444442',
    1,
    1,
    'UGC hook turn',
    'Create a fast hook for paid social with crisp character-driven motion.',
    10,
    '9:16',
    'kling',
    'selected',
    'Controlled handheld-feel push with crisp lock-offs for hook beats.',
    null,
    'Minimal branded room with a practical light wall and product pedestal.',
    'High-contrast key with practical sources visible in frame.',
    'Sharp, energetic, ad-ready momentum.',
    'Social-first premium ad spot with clean graphic readability.',
    'Short lip-sync-friendly line with punchy social-native pacing.',
    'Preserve facial identity, keep motion readable, avoid rubbery handoffs and noisy backgrounds.',
    E'Subject: Confident creator talent demonstrating the product naturally.\nAction: Character pivots with the product in hand while interface callouts animate around them.\nCamera: Controlled handheld-feel push with crisp lock-offs for hook beats.\nEnvironment: Minimal branded room with a practical light wall and product pedestal.\nLighting: High-contrast key with practical sources visible in frame.\nMood: Sharp, energetic, ad-ready momentum.\nVisual style: Social-first premium ad spot with clean graphic readability.\nDialogue / audio intent: Short lip-sync-friendly line with punchy social-native pacing.\nConstraints: Preserve facial identity, keep motion readable, avoid rubbery handoffs and noisy backgrounds.',
    'Lip-sync-safe motion with punchier hand gesture timing.',
    '2026-03-17T14:15:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444442',
    1,
    2,
    'Feature handoff',
    'Show product usage with controlled motion and stronger CTA clarity.',
    9,
    '9:16',
    'kling',
    'queued',
    'Controlled handheld-feel push with crisp lock-offs for hook beats.',
    null,
    'Minimal branded room with a practical light wall and product pedestal.',
    'High-contrast key with practical sources visible in frame.',
    'Sharp, energetic, ad-ready momentum.',
    'Social-first premium ad spot with clean graphic readability.',
    'Short lip-sync-friendly line with punchy social-native pacing.',
    'Preserve facial identity, keep motion readable, avoid rubbery handoffs and noisy backgrounds.',
    E'Subject: Confident creator talent demonstrating the product naturally.\nAction: Talent demonstrates the mobile workflow and lands on a crisp CTA gesture.\nCamera: Controlled handheld-feel push with crisp lock-offs for hook beats.\nEnvironment: Minimal branded room with a practical light wall and product pedestal.\nLighting: High-contrast key with practical sources visible in frame.\nMood: Sharp, energetic, ad-ready momentum.\nVisual style: Social-first premium ad spot with clean graphic readability.\nDialogue / audio intent: Short lip-sync-friendly line with punchy social-native pacing.\nConstraints: Preserve facial identity, keep motion readable, avoid rubbery handoffs and noisy backgrounds.',
    'Try a sharper CTA beat at the end for stronger hook strength.',
    '2026-03-17T14:28:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444443',
    1,
    1,
    'Abstract product genesis',
    'Explore a high-concept opener for executive narrative storytelling.',
    12,
    '16:9',
    'higgsfield',
    'planned',
    'Floating crane move that transitions into a wide impossible orbit.',
    null,
    'Abstract black void evolving into a cinematic dream environment.',
    'High-contrast beams with dramatic practical reflections.',
    'Exploratory, bold, future-facing.',
    'Cinematic experimentation with precise composition and premium polish.',
    'No dialogue, only tonal music bed and atmospheric impact cues.',
    'Keep brand geometry legible, avoid muddy textures, no chaotic transitions.',
    E'Subject: Hero product emerging from fragments and light.\nAction: Product fragments reassemble into a surreal hero tableau as the scene expands beyond reality.\nCamera: Floating crane move that transitions into a wide impossible orbit.\nEnvironment: Abstract black void evolving into a cinematic dream environment.\nLighting: High-contrast beams with dramatic practical reflections.\nMood: Exploratory, bold, future-facing.\nVisual style: Cinematic experimentation with precise composition and premium polish.\nDialogue / audio intent: No dialogue, only tonal music bed and atmospheric impact cues.\nConstraints: Keep brand geometry legible, avoid muddy textures, no chaotic transitions.',
    'Use this as the exploratory scene to test worldbuilding range before locking brand-safe cuts.',
    '2026-03-16T12:05:00Z'
  ),
  (
    'ddddaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '44444444-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    1,
    1,
    'Can Hero Spin',
    'Premium opening hero shot of the can',
    6,
    '9:16',
    'sora',
    'prompt_ready',
    'macro product camera with slow orbit',
    'smooth cinematic motion',
    'dark premium reflective studio',
    'moody rim lighting with glossy highlights',
    'luxury, modern, crisp',
    'premium ad cinematic realism',
    'no spoken dialogue, intense whoosh and impact sound design',
    'avoid warped labels, avoid extra objects, keep branding centered',
    'A premium macro cinematic product shot of a sleek citrus energy drink can slowly rotating in a dark reflective studio, dramatic rim lighting, glossy condensation, ultra realistic liquid beads, elegant commercial composition, smooth orbit camera move, polished luxury beverage advertisement look',
    'Use this as the hero opener for the Luma Drink launch cut.',
    '2026-03-19T15:22:00Z'
  ),
  (
    'ddddaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '44444444-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444445',
    2,
    1,
    'Lifestyle Sip',
    'Human-driven motion shot showing refreshment moment',
    8,
    '9:16',
    'kling',
    'prompt_ready',
    'handheld close-medium ad shot',
    'natural human motion and subtle push-in',
    'sunlit rooftop lounge',
    'golden-hour commercial sunlight',
    'fresh, aspirational, elevated',
    'social ad realism with polished lifestyle cinematography',
    'soft ambient city sound, optional upbeat music, no dialogue',
    'keep hands natural, avoid facial distortion, keep can design readable',
    'A stylish young adult on a rooftop lounge at golden hour takes a sip from a premium citrus energy drink and reacts with a refreshed confident expression, subtle camera push-in, natural body motion, polished lifestyle commercial feel, realistic hands and face, premium social ad look',
    'Good candidate for motion-led social variants once product hero is approved.',
    '2026-03-19T15:28:00Z'
  )
on conflict (id) do nothing;

insert into public.prompt_templates (
  id,
  name,
  category,
  description,
  target_model,
  subject_template,
  action_template,
  camera_template,
  environment_template,
  lighting_template,
  mood_template,
  visual_style_template,
  dialogue_audio_template,
  constraints_template,
  final_template,
  is_system,
  created_at
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    'Premium hero launch',
    'hero',
    'Use for polished launch-night reveal shots.',
    'sora',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'Subject: {{subject}}',
    true,
    '2026-03-18T15:00:00Z'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'Social motion hook',
    'social',
    'Use for fast hook-driven social variants.',
    'kling',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'Subject: {{subject}}',
    true,
    '2026-03-17T13:30:00Z'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    'Exploratory cinematic opener',
    'exploration',
    'Use for surreal or worldbuilding-first creative exploration.',
    'higgsfield',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'Subject: {{subject}}',
    true,
    '2026-03-16T11:30:00Z'
  ),
  (
    '55555555-5555-5555-5555-555555555554',
    'Premium Product Hero',
    'product',
    'For premium product beauty shots',
    'sora',
    'A premium product shot featuring {{subject}}',
    '{{action}}',
    '{{camera}}',
    '{{environment}}',
    '{{lighting}}',
    '{{mood}}',
    '{{visual_style}}',
    '{{dialogue_audio_intent}}',
    '{{constraints}}',
    '{{subject}}. {{action}}. {{camera}}. {{environment}}. {{lighting}}. {{mood}}. {{visual_style}}. {{dialogue_audio_intent}}. {{constraints}}.',
    true,
    '2026-03-19T15:32:00Z'
  )
on conflict (id) do nothing;

insert into public.shot_generations (
  id,
  shot_id,
  provider,
  request_payload,
  response_payload,
  provider_job_id,
  status,
  output_url,
  thumbnail_url,
  duration_seconds,
  aspect_ratio,
  seed,
  generation_notes,
  created_at
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'sora',
    '{"prompt_version":"v2"}'::jsonb,
    '{"status":"mocked"}'::jsonb,
    'sora-job-hero-1',
    'mocked',
    '/assets/demo/vantage-hero-v2.mp4',
    '/assets/demo/vantage-key-visual.png',
    8,
    '16:9',
    'hero-seed-01',
    'Hero variation two with stronger silhouette control.',
    '2026-03-18T16:45:00Z'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'kling',
    '{"prompt_version":"v4"}'::jsonb,
    '{"status":"mocked"}'::jsonb,
    'kling-job-social-1',
    'mocked',
    '/assets/demo/northstar-ugc-v4.mp4',
    '/assets/demo/northstar-ugc-thumb.jpg',
    10,
    '9:16',
    'social-seed-04',
    'Social hook variation with cleaner gesture timing.',
    '2026-03-17T14:20:00Z'
  )
on conflict (id) do nothing;

insert into public.assets (
  id,
  campaign_id,
  shot_id,
  generation_id,
  type,
  source,
  file_name,
  file_url,
  mime_type,
  width,
  height,
  duration_seconds,
  metadata_json,
  tags,
  created_at
)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    null,
    'reference_image',
    'upload',
    'vantage-key-visual.png',
    '/assets/demo/vantage-key-visual.png',
    'image/png',
    2048,
    1152,
    null,
    '{"aspect_ratio":"16:9","palette":"violet-cyan","resolution":"2048x1152"}'::jsonb,
    array['hero', 'reference'],
    '2026-03-18T16:22:00Z'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '66666666-6666-6666-6666-666666666661',
    'generated_video',
    'generated',
    'vantage-hero-v2.mp4',
    '/assets/demo/vantage-hero-v2.mp4',
    'video/mp4',
    1920,
    1080,
    8,
    '{"duration_seconds":8,"version":"v2","width":1920}'::jsonb,
    array['hero', 'select'],
    '2026-03-18T16:50:00Z'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '66666666-6666-6666-6666-666666666662',
    'thumbnail',
    'generated',
    'northstar-ugc-thumb.jpg',
    '/assets/demo/northstar-ugc-thumb.jpg',
    'image/jpeg',
    1080,
    1920,
    null,
    '{"aspect_ratio":"9:16","frame":"opening-hook"}'::jsonb,
    array['thumbnail', 'social'],
    '2026-03-17T14:18:00Z'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '66666666-6666-6666-6666-666666666662',
    'generated_video',
    'generated',
    'northstar-ugc-v4.mp4',
    '/assets/demo/northstar-ugc-v4.mp4',
    'video/mp4',
    1080,
    1920,
    10,
    '{"duration_seconds":10,"version":"v4","width":1080}'::jsonb,
    array['social', 'selected'],
    '2026-03-17T14:22:00Z'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    '33333333-3333-3333-3333-333333333333',
    null,
    null,
    'logo',
    'upload',
    'atlas-brand-logo.svg',
    '/assets/demo/atlas-brand-logo.svg',
    'image/svg+xml',
    null,
    null,
    null,
    '{"background":"transparent","usage":"endcard"}'::jsonb,
    array['brand'],
    '2026-03-16T11:55:00Z'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff2',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    null,
    'character_sheet',
    'upload',
    'atlas-character-sheet.png',
    '/assets/demo/atlas-character-sheet.png',
    'image/png',
    null,
    null,
    null,
    '{"notes":"Executive wardrobe references","pages":1}'::jsonb,
    array['reference', 'character'],
    '2026-03-16T12:08:00Z'
  )
on conflict (id) do nothing;

insert into public.reviews (
  id,
  shot_id,
  asset_id,
  reviewer_name,
  score_realism,
  score_brand_fit,
  score_hook_strength,
  score_editability,
  score_motion_quality,
  score_prompt_fidelity,
  decision,
  notes,
  created_at
)
values
  (
    '99999999-9999-9999-9999-999999999991',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'Creative Ops',
    9,
    9,
    8,
    8,
    8,
    9,
    'selected',
    'Excellent brand fit and lighting. Needs a cleaner hand transition in the opening beat.',
    '2026-03-18T17:05:00Z'
  ),
  (
    '99999999-9999-9999-9999-999999999992',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    'Performance Creative',
    8,
    8,
    7,
    9,
    8,
    8,
    'selected',
    'The hook works fast, but we need stronger CTA timing for the back half.',
    '2026-03-17T14:42:00Z'
  ),
  (
    '99999999-9999-9999-9999-999999999993',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'Performance Creative',
    7,
    7,
    6,
    8,
    7,
    7,
    'rejected',
    'Good thumbnail frame, but the facial expression needs more urgency.',
    '2026-03-17T14:30:00Z'
  )
on conflict (id) do nothing;

insert into public.tags (
  id,
  name,
  color,
  created_at
)
values
  ('77777777-7777-7777-7777-777777777771', 'hero', '#7c3aed', '2026-03-18T15:30:00Z'),
  ('77777777-7777-7777-7777-777777777772', 'reference', '#06b6d4', '2026-03-18T15:31:00Z'),
  ('77777777-7777-7777-7777-777777777773', 'social', '#f59e0b', '2026-03-17T13:31:00Z'),
  ('77777777-7777-7777-7777-777777777774', 'selected', '#10b981', '2026-03-17T13:32:00Z'),
  ('77777777-7777-7777-7777-777777777775', 'brand', '#64748b', '2026-03-16T11:31:00Z')
on conflict (id) do nothing;

insert into public.asset_tags (
  asset_id,
  tag_id
)
values
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '77777777-7777-7777-7777-777777777771'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '77777777-7777-7777-7777-777777777772'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '77777777-7777-7777-7777-777777777771'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '77777777-7777-7777-7777-777777777774'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '77777777-7777-7777-7777-777777777773'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '77777777-7777-7777-7777-777777777774'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', '77777777-7777-7777-7777-777777777775')
on conflict do nothing;

insert into public.activity_log (
  id,
  entity_type,
  entity_id,
  action,
  payload,
  created_at
)
values
  (
    '88888888-8888-8888-8888-888888888881',
    'campaign',
    '11111111-1111-1111-1111-111111111111',
    'campaign_created',
    '{"source":"seed"}'::jsonb,
    '2026-03-18T16:15:00Z'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    'shot_generation',
    '66666666-6666-6666-6666-666666666661',
    'generation_mocked',
    '{"provider":"sora"}'::jsonb,
    '2026-03-18T16:45:00Z'
  ),
  (
    '88888888-8888-8888-8888-888888888883',
    'review',
    '99999999-9999-9999-9999-999999999991',
    'review_selected',
    '{"reviewer":"Creative Ops"}'::jsonb,
    '2026-03-18T17:05:00Z'
  ),
  (
    '88888888-8888-8888-8888-888888888884',
    'campaign',
    '44444444-1111-1111-1111-111111111111',
    'campaign_created',
    '{"source":"seed","slug":"spring-product-launch"}'::jsonb,
    '2026-03-19T15:10:00Z'
  )
on conflict (id) do nothing;
