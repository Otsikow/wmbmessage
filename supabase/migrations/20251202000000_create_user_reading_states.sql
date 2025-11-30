create table if not exists public.user_reading_states (
    user_id uuid primary key references auth.users(id) on delete cascade,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_reading_states enable row level security;

create policy if not exists "Users can view their own reading state"
    on public.user_reading_states for select
    using (auth.uid() = user_id);

create policy if not exists "Users can upsert their own reading state"
    on public.user_reading_states for insert
    with check (auth.uid() = user_id);

create policy if not exists "Users can update their own reading state"
    on public.user_reading_states for update
    using (auth.uid() = user_id);

create policy if not exists "Users can delete their own reading state"
    on public.user_reading_states for delete
    using (auth.uid() = user_id);

create or replace function public.set_user_reading_states_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists user_reading_states_updated_at on public.user_reading_states;
create trigger user_reading_states_updated_at
    before update on public.user_reading_states
    for each row
    execute function public.set_user_reading_states_updated_at();
