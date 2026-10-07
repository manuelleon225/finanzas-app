-- ============================================================================
-- Script de pruebas de aislamiento (RLS) entre DOS usuarios
-- App de finanzas personales.
--
-- Cómo ejecutarlo: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo. Usa automáticamente los DOS primeros usuarios de auth.users.
-- Al final aparece una tabla "_rls_results" con una fila por prueba:
--   check_name  |  passed  |  detail
-- Todas las filas deben tener passed = TRUE.
-- ============================================================================

drop table if exists _rls_results;
create temp table _rls_results (check_name text, passed boolean, detail text);
grant all on _rls_results to authenticated, anon;

do $$
declare
  u_a uuid;
  u_b uuid;
  a_account uuid;
  a_category uuid;
  a_tx uuid;
  cnt integer;
begin
  select id into u_a from auth.users order by created_at asc limit 1;
  select id into u_b from auth.users order by created_at asc limit 1 offset 1;

  if u_a is null or u_b is null then
    raise exception 'Se necesitan al menos DOS usuarios en Authentication -> Users. Creá un segundo usuario e reintentá.';
  end if;

  -- 1) A crea sus datos
  perform set_config('request.jwt.claims', jsonb_build_object('sub', u_a::text)::text, true);
  set role authenticated;

  insert into public.accounts (name, type)
    values ('Cuenta A test', 'cash') returning id into a_account;
  insert into public.categories (name, kind, icon, color)
    values ('Cat A test', 'expense', 'accessibility-outline', '#000000') returning id into a_category;
  insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
    values ('expense', 'base', 10000, a_account, a_category, '2026-01-01') returning id into a_tx;

  insert into _rls_results values ('A crea cuenta, categoría y movimiento', true, a_account::text);

  -- 2) B no ve nada de A
  perform set_config('request.jwt.claims', jsonb_build_object('sub', u_b::text)::text, true);

  select count(*) into cnt from public.accounts where id = a_account;
  insert into _rls_results values ('B no ve la cuenta de A', cnt = 0, 'filas=' || cnt::text);

  select count(*) into cnt from public.transactions where id = a_tx;
  insert into _rls_results values ('B no ve el movimiento de A', cnt = 0, 'filas=' || cnt::text);

  -- 3) B intenta usar recursos de A (debe bloquearse)
  begin
    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
      values ('expense', 'base', 1, a_account, a_category, '2026-01-02');
    insert into _rls_results values ('B bloqueado al insertar con recursos de A', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al insertar con recursos de A', true, 'rechazado por RLS');
  end;

  -- 4) B intenta modificar la cuenta de A (0 filas)
  update public.accounts set name = 'HACK' where id = a_account;
  get diagnostics cnt = row_count;
  insert into _rls_results values ('B no modifica filas de A', cnt = 0, 'filas=' || cnt::text);

  -- 5) anon no ve nada
  set role anon;
  perform set_config('request.jwt.claims', '{}', true);
  select count(*) into cnt from public.accounts where name = 'Cuenta A test';
  insert into _rls_results values ('anon no ve cuentas', cnt = 0, 'filas=' || cnt::text);

  -- 6) Limpieza
  set role postgres;
  delete from public.transactions where id = a_tx;
  delete from public.accounts where id = a_account;
  delete from public.categories where id = a_category;
  insert into _rls_results values ('Limpieza', true, 'ok');
exception when others then
  insert into _rls_results values ('Error inesperado', false, sqlerrm);
end $$;

-- Resultado: todas las filas deben decir TRUE (excepto esta consulta misma)
select check_name, passed, detail from _rls_results order by check_name;