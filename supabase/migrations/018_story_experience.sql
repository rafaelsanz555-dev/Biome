-- bio.me · Story experience
-- Adds Story DNA, story follows, and safe public follow policies.

alter table public.seasons
    add column if not exists slug text,
    add column if not exists tagline text,
    add column if not exists tone text,
    add column if not exists promise text,
    add column if not exists central_question text,
    add column if not exists audience text,
    add column if not exists transformation text,
    add column if not exists emotional_tags text[] default '{}';

update public.seasons
set slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
where slug is null;

create unique index if not exists seasons_creator_slug_idx
    on public.seasons (creator_id, slug)
    where slug is not null;

create table if not exists public.story_follows (
    follower_id uuid references public.profiles(id) on delete cascade,
    season_id uuid references public.seasons(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (follower_id, season_id)
);

alter table public.follows enable row level security;
alter table public.story_follows enable row level security;

drop policy if exists "follows_select_public" on public.follows;
drop policy if exists "follows_insert_own" on public.follows;
drop policy if exists "follows_delete_own" on public.follows;

create policy "follows_select_public" on public.follows
    for select to anon, authenticated using (true);
create policy "follows_insert_own" on public.follows
    for insert to authenticated with check (auth.uid() = follower_id);
create policy "follows_delete_own" on public.follows
    for delete to authenticated using (auth.uid() = follower_id);

drop policy if exists "story_follows_select_public" on public.story_follows;
drop policy if exists "story_follows_insert_own" on public.story_follows;
drop policy if exists "story_follows_delete_own" on public.story_follows;

create policy "story_follows_select_public" on public.story_follows
    for select to anon, authenticated using (true);
create policy "story_follows_insert_own" on public.story_follows
    for insert to authenticated with check (auth.uid() = follower_id);
create policy "story_follows_delete_own" on public.story_follows
    for delete to authenticated using (auth.uid() = follower_id);

grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;
grant select on public.story_follows to anon, authenticated;
grant insert, delete on public.story_follows to authenticated;
