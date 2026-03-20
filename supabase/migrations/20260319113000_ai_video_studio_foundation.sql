create extension if not exists pgcrypto;

create type public.campaign_status as enum (
  'draft',
  'active',
  'in_review',
  'approved',
  'archived'
);

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

create type public.target_model as enum (
  'sora',
  'kling',
  'higgsfield'
);

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

create type public.asset_source as enum (
  'upload',
  'generated',
  'external_link',
  'manual'
);

create type public.review_decision as enum (
  'pending',
  'selected',
  'rejected',
  'hold'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.campaigns (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  scene_number integer not null,
  title text not null,
  objective text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, scene_number)
);

create table public.shots (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, scene_number, shot_number)
);

create table public.prompt_templates (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shot_generations (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assets (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now()
);

create table public.asset_tags (
  asset_id uuid not null references public.assets(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_campaigns_status on public.campaigns(status);
create index idx_scenes_campaign_id on public.scenes(campaign_id);
create index idx_shots_campaign_id on public.shots(campaign_id);
create index idx_shots_scene_id on public.shots(scene_id);
create index idx_shots_status on public.shots(status);
create index idx_shots_target_model on public.shots(target_model);
create index idx_assets_campaign_id on public.assets(campaign_id);
create index idx_assets_shot_id on public.assets(shot_id);
create index idx_assets_generation_id on public.assets(generation_id);
create index idx_assets_type on public.assets(type);
create index idx_reviews_shot_id on public.reviews(shot_id);
create index idx_reviews_asset_id on public.reviews(asset_id);
create index idx_generations_shot_id on public.shot_generations(shot_id);

create trigger set_updated_at_campaigns
before update on public.campaigns
for each row execute function public.set_updated_at();

create trigger set_updated_at_scenes
before update on public.scenes
for each row execute function public.set_updated_at();

create trigger set_updated_at_shots
before update on public.shots
for each row execute function public.set_updated_at();

create trigger set_updated_at_prompt_templates
before update on public.prompt_templates
for each row execute function public.set_updated_at();

create trigger set_updated_at_shot_generations
before update on public.shot_generations
for each row execute function public.set_updated_at();

create trigger set_updated_at_assets
before update on public.assets
for each row execute function public.set_updated_at();

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

create policy "campaigns_internal_access"
on public.campaigns
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "scenes_internal_access"
on public.scenes
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "shots_internal_access"
on public.shots
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "prompt_templates_internal_access"
on public.prompt_templates
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "shot_generations_internal_access"
on public.shot_generations
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "assets_internal_access"
on public.assets
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "reviews_internal_access"
on public.reviews
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "tags_internal_access"
on public.tags
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "asset_tags_internal_access"
on public.asset_tags
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "activity_log_internal_access"
on public.activity_log
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
