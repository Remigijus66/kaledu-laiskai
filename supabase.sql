-- Paleiskite Supabase SQL Editor lange vieną kartą (galima kartoti, nieko neištrins).
--
-- Skaityti gali visi. Rašyti galima tik per funkciją save_page_field, kuri tikrina 4 skaitmenų PIN.
-- Tiesioginis rašymas į lenteles anoniminiam raktui uždraustas, todėl PIN apeiti iš naršyklės negalima.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pages (
  id         text primary key,
  content    jsonb,
  drawing    jsonb,
  checks     jsonb,
  updated_at timestamptz not null default now()
);

-- Jei lentelė buvo sukurta anksčiau (be žymimųjų langelių), pridedame trūkstamą stulpelį.
alter table public.pages add column if not exists checks jsonb;

-- PIN'ų lentelė: RLS įjungtas ir jokios politikos nėra, anoniminis raktas jos nemato.
create table if not exists public.page_pins (
  id           text primary key,
  pin_hash     text not null,
  failed       int  not null default 0,
  locked_until timestamptz
);

alter table public.pages     enable row level security;
alter table public.page_pins enable row level security;

-- Pašaliname ankstesnę, atvirą rašymą leidusią versiją, jei ji buvo paleista.
drop policy if exists "pages insert" on public.pages;
drop policy if exists "pages update" on public.pages;
drop policy if exists "pages read"   on public.pages;
create policy "pages read" on public.pages for select to anon using (true);

-- Vidinė patikra: grąžina 'ok', 'wrong', 'locked' arba 'nopin'.
-- Po 5 klaidingų bandymų laiškas užrakinamas 15 minučių.
create or replace function public._check_pin(p_id text, p_pin text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare r public.page_pins%rowtype;
begin
  select * into r from public.page_pins where id = p_id for update;
  if not found then return 'nopin'; end if;
  if r.locked_until is not null and r.locked_until > now() then return 'locked'; end if;

  if r.pin_hash = crypt(p_pin, r.pin_hash) then
    update public.page_pins set failed = 0, locked_until = null where id = p_id;
    return 'ok';
  end if;

  update public.page_pins
     set failed       = case when failed >= 4 then 0 else failed + 1 end,
         locked_until = case when failed >= 4 then now() + interval '15 minutes' else locked_until end
   where id = p_id;
  return 'wrong';
end $$;

create or replace function public.page_has_pin(p_id text)
returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from public.page_pins where id = p_id);
$$;

-- Nustato PIN tik jei jo dar nėra. Grąžina true, jei nustatė; false, jei jau buvo.
create or replace function public.set_page_pin(p_id text, p_pin text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_pin !~ '^[0-9]{4}$' then raise exception 'PIN turi būti 4 skaitmenų'; end if;
  insert into public.page_pins (id, pin_hash) values (p_id, crypt(p_pin, gen_salt('bf')))
  on conflict (id) do nothing;
  return found;
end $$;

create or replace function public.verify_page_pin(p_id text, p_pin text)
returns text
language sql security definer set search_path = public, extensions as $$
  select public._check_pin(p_id, p_pin);
$$;

create or replace function public.save_page_field(p_id text, p_field text, p_value jsonb, p_pin text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare res text;
begin
  if p_field not in ('content', 'drawing', 'checks') then raise exception 'neleistinas laukas'; end if;
  res := public._check_pin(p_id, p_pin);
  if res <> 'ok' then return res; end if;

  if p_field = 'content' then
    insert into public.pages (id, content, updated_at) values (p_id, p_value, now())
    on conflict (id) do update set content = excluded.content, updated_at = now();
  elsif p_field = 'drawing' then
    insert into public.pages (id, drawing, updated_at) values (p_id, p_value, now())
    on conflict (id) do update set drawing = excluded.drawing, updated_at = now();
  else
    insert into public.pages (id, checks, updated_at) values (p_id, p_value, now())
    on conflict (id) do update set checks = excluded.checks, updated_at = now();
  end if;
  return 'ok';
end $$;

-- Anoniminis raktas gali kviesti tik viešąsias funkcijas, ne _check_pin.
revoke execute on function public._check_pin(text, text)                 from public, anon, authenticated;
revoke execute on function public.page_has_pin(text)                     from public;
revoke execute on function public.set_page_pin(text, text)               from public;
revoke execute on function public.verify_page_pin(text, text)            from public;
revoke execute on function public.save_page_field(text, text, jsonb, text) from public;

grant execute on function public.page_has_pin(text)                       to anon;
grant execute on function public.set_page_pin(text, text)                 to anon;
grant execute on function public.verify_page_pin(text, text)              to anon;
grant execute on function public.save_page_field(text, text, jsonb, text) to anon;
