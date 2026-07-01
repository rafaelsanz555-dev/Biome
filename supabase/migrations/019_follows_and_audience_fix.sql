-- bio.me · Follows + audience visibility fix
-- Root causes being fixed:
--   1. supabase_setup.sql enabled RLS on follows without creating policies →
--      every read/write on follows was blocked.
--   2. follows.creator_id referenced creators(profile_id) → following a writer
--      without a creators config row threw an FK violation.
--   3. entitlements only had a "user sees own" policy → writers could never
--      see their own subscribers (audience page, dashboard metrics).
-- Idempotent: safe to run more than once.

-- ── 1) Repoint follows FKs to profiles + cascade ─────────────────
alter table public.follows drop constraint if exists follows_creator_id_fkey;
alter table public.follows
    add constraint follows_creator_id_fkey
    foreign key (creator_id) references public.profiles(id) on delete cascade;

alter table public.follows drop constraint if exists follows_follower_id_fkey;
alter table public.follows
    add constraint follows_follower_id_fkey
    foreign key (follower_id) references public.profiles(id) on delete cascade;

-- ── 2) Backfill creators rows for any creator profile missing one ─
insert into public.creators (profile_id)
select p.id
from public.profiles p
where p.role = 'creator'
  and not exists (select 1 from public.creators c where c.profile_id = p.id)
on conflict (profile_id) do nothing;

-- ── 3) RLS for follows / story_follows (self-contained re-assert) ─
alter table public.follows enable row level security;

drop policy if exists "follows_select_public" on public.follows;
drop policy if exists "follows_insert_own" on public.follows;
drop policy if exists "follows_delete_own" on public.follows;

create policy "follows_select_public" on public.follows
    for select to anon, authenticated using (true);
create policy "follows_insert_own" on public.follows
    for insert to authenticated with check (auth.uid() = follower_id);
create policy "follows_delete_own" on public.follows
    for delete to authenticated using (auth.uid() = follower_id);

grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;

create table if not exists public.story_follows (
    follower_id uuid references public.profiles(id) on delete cascade,
    season_id uuid references public.seasons(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (follower_id, season_id)
);

alter table public.story_follows enable row level security;

drop policy if exists "story_follows_select_public" on public.story_follows;
drop policy if exists "story_follows_insert_own" on public.story_follows;
drop policy if exists "story_follows_delete_own" on public.story_follows;

create policy "story_follows_select_public" on public.story_follows
    for select to anon, authenticated using (true);
create policy "story_follows_insert_own" on public.story_follows
    for insert to authenticated with check (auth.uid() = follower_id);
create policy "story_follows_delete_own" on public.story_follows
    for delete to authenticated using (auth.uid() = follower_id);

grant select on public.story_follows to anon, authenticated;
grant insert, delete on public.story_follows to authenticated;

-- ── 4) Writers can see entitlements pointed at them (their audience) ─
drop policy if exists "entitlements_creator_select" on public.entitlements;
create policy "entitlements_creator_select" on public.entitlements
    for select to authenticated using (auth.uid() = creator_id);

grant select on public.entitlements to authenticated;

-- ── 5) Public subscriber count (social proof) without exposing rows ─
create or replace function public.public_subscriber_count(p_creator uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
    select count(*)::int
    from public.entitlements
    where creator_id = p_creator
      and entitlement_type = 'subscription'
      and (valid_until is null or valid_until >= now());
$$;

grant execute on function public.public_subscriber_count(uuid) to anon, authenticated;
