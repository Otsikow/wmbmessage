create table if not exists public.bible_plans (
    id uuid primary key default gen_random_uuid(),
    legacy_id text unique,
    title text not null,
    description text,
    duration_days integer not null,
    plan_type text not null,
    difficulty text not null,
    tags text[] default '{}',
    cover_image text,
    theme_color text,
    is_custom boolean default false,
    created_at timestamptz default timezone('utc', now())
);

create table if not exists public.bible_plan_days (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid references public.bible_plans(id) on delete cascade,
    day_number integer not null,
    title text not null,
    scriptures jsonb not null,
    estimated_minutes integer default 10,
    summary text,
    reflection_question text,
    encouragement text,
    created_at timestamptz default timezone('utc', now()),
    unique (plan_id, day_number)
);

create table if not exists public.user_plan_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    plan_id uuid references public.bible_plans(id) on delete cascade,
    current_day integer default 1,
    completed_days integer[] default '{}',
    streak_count integer default 0,
    longest_streak integer default 0,
    last_completed_date date,
    points integer default 0,
    is_completed boolean default false,
    reminder_preferences jsonb default '{}'::jsonb,
    bookmark_days integer[] default '{}',
    catch_up_queue integer[] default '{}',
    history jsonb default '[]'::jsonb,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now()),
    unique (user_id, plan_id)
);

create table if not exists public.achievement_badges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    badge_key text not null,
    badge_title text not null,
    description text,
    date_earned timestamptz default timezone('utc', now()),
    share_text text,
    unique (user_id, badge_key)
);
