-- Pergamo editorial content system + versioned legal acceptance.
-- Idempotent. Run after 020_content_protection_and_performance.sql.

alter table public.seasons
    add column if not exists format text default 'series' not null,
    add column if not exists story_type text default 'life_story' not null,
    add column if not exists cover_image_url text,
    add column if not exists status text default 'ongoing' not null,
    add column if not exists age_rating text default 'all' not null;

alter table public.seasons drop constraint if exists seasons_format_check;
alter table public.seasons
    add constraint seasons_format_check check (format in ('series', 'thread'));
alter table public.seasons drop constraint if exists seasons_story_type_check;
alter table public.seasons
    add constraint seasons_story_type_check check (story_type in ('life_story', 'fiction'));
alter table public.seasons drop constraint if exists seasons_status_check;
alter table public.seasons
    add constraint seasons_status_check check (status in ('draft', 'ongoing', 'completed', 'paused'));
alter table public.seasons drop constraint if exists seasons_age_rating_check;
alter table public.seasons
    add constraint seasons_age_rating_check check (age_rating in ('all', '13+', '16+', '18+'));

alter table public.episodes
    add column if not exists content_type text default 'entry' not null,
    add column if not exists age_rating text default 'all' not null,
    add column if not exists content_warnings text[] default '{}',
    add column if not exists rights_confirmed_at timestamptz,
    add column if not exists legal_version text;

update public.episodes
set content_type = case when season_id is null then 'entry' else 'chapter' end
where content_type is null
   or content_type not in ('entry', 'chapter')
   or (season_id is not null and content_type = 'entry');

alter table public.episodes drop constraint if exists episodes_content_type_check;
alter table public.episodes
    add constraint episodes_content_type_check check (content_type in ('entry', 'chapter'));
alter table public.episodes drop constraint if exists episodes_age_rating_check;
alter table public.episodes
    add constraint episodes_age_rating_check check (age_rating in ('all', '13+', '16+', '18+'));

create index if not exists episodes_content_type_created_idx
    on public.episodes (content_type, is_published, created_at desc);
create index if not exists seasons_story_type_created_idx
    on public.seasons (story_type, created_at desc);

create table if not exists public.legal_acceptances (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    document text not null,
    version text not null,
    context text not null,
    resource_id uuid,
    accepted_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb,
    constraint legal_acceptances_document_check
        check (document in ('terms', 'privacy', 'content_policy', 'creator_terms')),
    constraint legal_acceptances_context_check
        check (context in ('signup', 'onboarding', 'publish', 'legal_update'))
);

-- Keep reruns and partially-applied environments aligned with the app contract.
alter table public.legal_acceptances drop constraint if exists legal_acceptances_context_check;
alter table public.legal_acceptances
    add constraint legal_acceptances_context_check
    check (context in ('signup', 'onboarding', 'publish', 'legal_update'));

create unique index if not exists legal_acceptances_unique_event_idx
    on public.legal_acceptances (user_id, document, version, context, coalesce(resource_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists legal_acceptances_user_idx
    on public.legal_acceptances (user_id, accepted_at desc);

alter table public.legal_acceptances enable row level security;

drop policy if exists "legal_acceptances_select_own" on public.legal_acceptances;
create policy "legal_acceptances_select_own" on public.legal_acceptances
    for select to authenticated using (auth.uid() = user_id);

drop policy if exists "legal_acceptances_insert_own" on public.legal_acceptances;
create policy "legal_acceptances_insert_own" on public.legal_acceptances
    for insert to authenticated with check (auth.uid() = user_id);

grant select, insert on public.legal_acceptances to authenticated;

comment on column public.episodes.content_type is
    'entry = standalone feed post; chapter = installment attached to a season';
comment on column public.seasons.story_type is
    'life_story = memoir/real story; fiction = novel/fictional serial';
