-- ============================================================================
-- Script de pruebas de aislamiento (RLS) entre DOS usuarios
-- App de finanzas personales.
--
-- Cómo ejecutarlo: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo (sesión como postgres, que es el rol del editor). No modifica
-- datos reales: usa usuarios ficticios y limpia lo que crea.
--
-- Esperado: todos los avisos deben decir "OK ... (esperado ...)".
-- ============================================================================

do $$
declare
  a_account uuid;
  a_category uuid;
  a_tx uuid;
  cnt integer;
begin
  -- 1) Crear datos como el usuario A
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', true);
  set role authenticated;

  insert into public.accounts (name, type)
    values ('Cuenta A test', 'cash') returning id into a_account;
  insert into public.categories (name, kind, icon, color)
    values ('Cat A test', 'expense', 'accessibility-outline', '#000000') returning id into a_category;
  insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
    values ('expense', 'base', 10000, a_account, a_category, '2026-01-01') returning id into a_tx;

  raise notice 'OK: A crea cuenta, categoría y movimiento (un 201/insert normal)';

  -- 2) Como el usuario B: no debe ver nada de A
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', true);

  select count(*) into cnt from public.accounts where id = a_account;
  raise notice 'B ve la cuenta de A? (esperado 0): %', cnt;

  select count(*) into cnt from public.transactions where id = a_tx;
  raise notice 'B ve el movimiento de A? (esperado 0): %', cnt;

  -- 3) B intenta usar la cuenta/categoría de A (debe bloquearse)
  begin
    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
      values ('expense', 'base', 1, a_account, a_category, '2026-01-02');
    raise notice 'FALLO: B pudo insertar con recursos de A';
  exception when others then
    raise notice 'OK: B bloqueado al insertar con recursos de A';
  end;

  -- 4) B intenta modificar una cuenta de A (0 filas)
  update public.accounts set name = 'HACK' where id = a_account;
  get diagnostics cnt = row_count;
  raise notice 'B modifica filas de A? (esperado 0): %', cnt;

  -- 5) Rol anon no debe ver nada
  set role anon;
  perform set_config('request.jwt.claims', '{}', true);
  select count(*) into cnt from public.accounts;
  raise notice 'anon ve cuentas? (esperado 0): %', cnt;

  -- 6) Limpieza (como postgres)
  set role postgres;
  delete from public.transactions where id = a_tx;
  delete from public.accounts where id = a_account;
  delete from public.categories where id = a_category;
  raise notice 'Limpieza completada. REVISA QUE TODOS LOS AVISOS DIGAN OK/esperado.';
exception when others then
  raise exception 'Error inesperado en el script: %', sqlerrm;
end $$;