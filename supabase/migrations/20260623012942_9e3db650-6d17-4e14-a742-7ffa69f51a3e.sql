create or replace function public.message_study_notes_set_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base text;
  candidate text;
  counter integer := 1;
begin
  if tg_op = 'INSERT' or NEW.title is distinct from OLD.title or NEW.slug is null or NEW.slug = '' then
    base := public.slugify(coalesce(NEW.title, ''));
    if base is null or base = '' then
      base := 'note';
    end if;
    candidate := base;
    while exists (
      select 1 from public.message_study_notes
      where slug = candidate and id <> NEW.id
    ) loop
      counter := counter + 1;
      candidate := base || '-' || counter;
    end loop;
    NEW.slug := candidate;
  end if;
  return NEW;
end;
$$;

drop trigger if exists message_study_notes_set_slug_trg on public.message_study_notes;
create trigger message_study_notes_set_slug_trg
before insert or update on public.message_study_notes
for each row execute function public.message_study_notes_set_slug();

revoke execute on function public.message_study_notes_set_slug() from anon, authenticated;