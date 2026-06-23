alter table public.message_study_notes add column slug text;

create or replace function public.slugify(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select regexp_replace(
    regexp_replace(lower(input), '[^a-z0-9]+', '-', 'g'),
    '^-|-$', '', 'g'
  );
$$;

-- Backfill base slugs from titles
update public.message_study_notes
set slug = public.slugify(title)
where slug is null;

-- Resolve duplicate slugs by appending a counter
 do $$
declare
  rec record;
  new_slug text;
  counter integer;
  base text;
begin
  for rec in
    select id, slug, title
    from public.message_study_notes
    where slug in (
      select slug from public.message_study_notes group by slug having count(*) > 1
    )
    order by slug, created_at, id
  loop
    base := public.slugify(rec.title);
    counter := 1;
    new_slug := base;
    while exists (select 1 from public.message_study_notes where slug = new_slug and id <> rec.id) loop
      counter := counter + 1;
      new_slug := base || '-' || counter;
    end loop;
    update public.message_study_notes set slug = new_slug where id = rec.id;
  end loop;
end;
$$;

-- Enforce uniqueness and non-null
alter table public.message_study_notes alter column slug set not null;
create unique index idx_message_study_notes_slug on public.message_study_notes(slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_study_notes TO authenticated;
GRANT ALL ON public.message_study_notes TO service_role;