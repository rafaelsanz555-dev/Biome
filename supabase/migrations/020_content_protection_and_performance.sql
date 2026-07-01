-- bio.me · Protección del contenido pago + performance + integridad
-- Correr DESPUÉS de 019_follows_and_audience_fix.sql.
-- Idempotente: seguro de correr más de una vez.

-- ═══════════════════════════════════════════════════════════════
-- 1) PROTECCIÓN DEL CONTENIDO PAGO (crítico)
--    Hasta ahora cualquiera podía leer full_text/content_json de
--    episodios de pago vía la REST API pública de Supabase (la anon
--    key es pública por diseño). Revocamos el SELECT de esas dos
--    columnas para sesiones normales; la app sirve el contenido vía
--    server (service role) SOLO tras validar acceso.
-- ═══════════════════════════════════════════════════════════════
do $$
declare
    cols text;
begin
    select string_agg(quote_ident(column_name), ', ')
    into cols
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'episodes'
      and column_name not in ('full_text', 'content_json');

    execute 'revoke select on public.episodes from anon, authenticated';
    execute format('grant select (%s) on public.episodes to anon, authenticated', cols);
    -- insert/update/delete quedan como estaban (RLS de dueño los protege)
end $$;

-- ═══════════════════════════════════════════════════════════════
-- 2) ÍNDICES para las queries más frecuentes de la app
-- ═══════════════════════════════════════════════════════════════
create index if not exists episodes_creator_idx on public.episodes (creator_id);
create index if not exists episodes_season_idx on public.episodes (season_id);
create index if not exists episodes_published_created_idx on public.episodes (is_published, created_at desc);
create index if not exists seasons_creator_idx on public.seasons (creator_id);
create index if not exists entitlements_user_idx on public.entitlements (user_id);
create index if not exists entitlements_creator_idx on public.entitlements (creator_id);
create index if not exists entitlements_stripe_sub_idx on public.entitlements (stripe_subscription_id) where stripe_subscription_id is not null;
create index if not exists transactions_creator_idx on public.transactions (creator_id);
create index if not exists transactions_user_idx on public.transactions (user_id);
create index if not exists gifts_recipient_idx on public.gifts (recipient_id);
create index if not exists gifts_sender_idx on public.gifts (sender_id);
create index if not exists follows_creator_idx on public.follows (creator_id);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, is_read);

do $$
begin
    if to_regclass('public.reactions') is not null then
        create index if not exists reactions_episode_idx on public.reactions (episode_id);
    end if;
    if to_regclass('public.comments') is not null then
        create index if not exists comments_episode_idx on public.comments (episode_id);
    end if;
    if to_regclass('public.episode_views') is not null then
        create index if not exists episode_views_episode_idx on public.episode_views (episode_id, started_at desc);
    end if;
    if to_regclass('public.episode_shingles') is not null then
        create index if not exists episode_shingles_hash_idx on public.episode_shingles (shingle_hash);
        create index if not exists episode_shingles_episode_idx on public.episode_shingles (episode_id);
    end if;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- 3) INTEGRIDAD: cascades para evitar huérfanos al borrar episodios
--    (borrar un episodio fallaba o dejaba basura en tablas hijas)
-- ═══════════════════════════════════════════════════════════════
do $$
begin
    -- Borrar una season NO borra episodios: quedan como independientes
    alter table public.episodes drop constraint if exists episodes_season_id_fkey;
    alter table public.episodes
        add constraint episodes_season_id_fkey
        foreign key (season_id) references public.seasons(id) on delete set null;

    if to_regclass('public.reactions') is not null then
        alter table public.reactions drop constraint if exists reactions_episode_id_fkey;
        alter table public.reactions
            add constraint reactions_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;

    if to_regclass('public.comments') is not null then
        alter table public.comments drop constraint if exists comments_episode_id_fkey;
        alter table public.comments
            add constraint comments_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;

    -- El regalo es un registro financiero: conservar, soltando la referencia
    alter table public.gifts drop constraint if exists gifts_post_id_fkey;
    alter table public.gifts
        add constraint gifts_post_id_fkey
        foreign key (post_id) references public.episodes(id) on delete set null;

    -- El desbloqueo PPV de un episodio borrado desaparece con él
    alter table public.entitlements drop constraint if exists entitlements_episode_id_fkey;
    alter table public.entitlements
        add constraint entitlements_episode_id_fkey
        foreign key (episode_id) references public.episodes(id) on delete cascade;

    if to_regclass('public.episode_views') is not null then
        alter table public.episode_views drop constraint if exists episode_views_episode_id_fkey;
        alter table public.episode_views
            add constraint episode_views_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;

    if to_regclass('public.episode_shingles') is not null then
        alter table public.episode_shingles drop constraint if exists episode_shingles_episode_id_fkey;
        alter table public.episode_shingles
            add constraint episode_shingles_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;

    if to_regclass('public.reading_bookmarks') is not null then
        alter table public.reading_bookmarks drop constraint if exists reading_bookmarks_episode_id_fkey;
        alter table public.reading_bookmarks
            add constraint reading_bookmarks_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;

    if to_regclass('public.content_flags') is not null then
        alter table public.content_flags drop constraint if exists content_flags_episode_id_fkey;
        alter table public.content_flags
            add constraint content_flags_episode_id_fkey
            foreign key (episode_id) references public.episodes(id) on delete cascade;
    end if;
end $$;
