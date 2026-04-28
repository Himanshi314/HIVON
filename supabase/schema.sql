-- ============================================================
-- Hivon Blog — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────
create extension if not exists "uuid-ossp";


-- ─── PROFILES TABLE ──────────────────────────────────────
-- Extends Supabase Auth users with role + display name
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text not null,
  role        text not null default 'viewer'
                check (role in ('viewer', 'author', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── POSTS TABLE ─────────────────────────────────────────
create table public.posts (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  slug         text not null unique,
  body         text not null,
  image_url    text,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  summary      text,                      -- AI-generated, stored once
  tags         text[] default '{}',
  reading_time integer default 1,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-update updated_at on edit
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at();

-- Index for search and ordering
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_author_id_idx on public.posts(author_id);
create index posts_slug_idx on public.posts(slug);
create index posts_published_idx on public.posts(published);

-- Full-text search index
alter table public.posts
  add column fts tsvector
    generated always as (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
    ) stored;

create index posts_fts_idx on public.posts using gin(fts);


-- ─── COMMENTS TABLE ──────────────────────────────────────
create table public.comments (
  id            uuid primary key default uuid_generate_v4(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  comment_text  text not null check (char_length(comment_text) >= 1),
  created_at    timestamptz not null default now()
);

create index comments_post_id_idx on public.comments(post_id);


-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────
-- This enforces access control at the DATABASE level.
-- Even if someone bypasses the UI, the DB won't let them in.

alter table public.profiles enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;


-- Helper: get the current user's role
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ── PROFILES policies ──
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can update any profile"
  on public.profiles for update
  using (get_my_role() = 'admin');


-- ── POSTS policies ──
create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (published = true);

create policy "Authors can see their own unpublished posts"
  on public.posts for select
  using (author_id = auth.uid());

create policy "Authors can insert posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and get_my_role() in ('author', 'admin')
  );

create policy "Authors can update their own posts"
  on public.posts for update
  using (author_id = auth.uid());

create policy "Admins can update any post"
  on public.posts for update
  using (get_my_role() = 'admin');

create policy "Authors can delete their own posts"
  on public.posts for delete
  using (author_id = auth.uid());

create policy "Admins can delete any post"
  on public.posts for delete
  using (get_my_role() = 'admin');


-- ── COMMENTS policies ──
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Logged-in users can comment"
  on public.comments for insert
  with check (auth.uid() = user_id and auth.uid() is not null);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

create policy "Admins can delete any comment"
  on public.comments for delete
  using (get_my_role() = 'admin');


-- ─── STORAGE BUCKET for post images ─────────────────────
-- Run this separately in Supabase Dashboard → Storage → New Bucket
-- OR paste this into SQL Editor:

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authors can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
  );

create policy "Authors can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
