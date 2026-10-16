-- ============================================================================
-- Script de pruebas de aislamiento (RLS) entre DOS usuarios — v2 (R6.3)
-- App de finanzas personales.
--
-- Amplía supabase/tests/002_rls_test.sql para cubrir TODAS las tablas
-- (profiles, accounts, categories, transactions, recurring_rules, budgets),
-- el acceso cruzado en SELECT/INSERT/UPDATE/DELETE, las columnas nuevas de la
-- migración 007 (transactions.status, recurring_rules.confirmation_mode) y la
-- vista account_balances (counts_as_liquid + filtro de movimientos pending).
--
-- Cómo ejecutarlo: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo. Usa automáticamente los DOS primeros usuarios de auth.users.
-- Al final aparece una tabla "_rls_results" con una fila por prueba:
--   check_name  |  passed  |  detail
-- Todas las filas deben tener passed = TRUE.
--
-- No modifica datos reales: crea filas de prueba marcadas y las borra al final.
-- ============================================================================

drop table if exists _rls_results;
create temp table _rls_results (check_name text, passed boolean, detail text);
grant all on _rls_results to authenticated, anon;

do $$
declare
  u_a uuid;
  u_b uuid;

  -- Recursos de A
  a_account_liquid uuid;
  a_account_nonliquid uuid;
  a_category uuid;
  a_tx uuid;
  a_tx_pending uuid;
  a_rule uuid;
  a_budget uuid;

  -- Recursos de B
  b_account uuid;
  b_category uuid;
  b_subcategory uuid;
  b_income_category uuid;

  cnt integer;
  st public.transaction_status;
  cm public.recurring_confirmation_mode;
  cl boolean;
  cl2 boolean;
  bal_before bigint;
  bal_pending bigint;
  bal_posted bigint;
begin
  select id into u_a from auth.users order by created_at asc limit 1;
  select id into u_b from auth.users order by created_at asc limit 1 offset 1;

  if u_a is null or u_b is null then
    insert into _rls_results values (
      'Se necesitan DOS usuarios en auth.users',
      false,
      'Creá un segundo usuario en Authentication -> Users y reintentá.'
    );
    return;
  end if;

  -- ==========================================================================
  -- A crea sus datos
  -- ==========================================================================
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u_a::text)::text, true);
    set role authenticated;

    insert into public.profiles (id, display_name)
      values (u_a, 'Usuario A test')
      on conflict (id) do nothing;

    insert into public.accounts (name, type)
      values ('Cuenta A liquida test', 'cash')
      returning id into a_account_liquid;

    insert into public.accounts (name, type, counts_as_liquid)
      values ('Cuenta A no liquida test', 'savings', false)
      returning id into a_account_nonliquid;

    insert into public.categories (name, kind, icon, color)
      values ('Cat A test', 'expense', 'accessibility-outline', '#000000')
      returning id into a_category;

    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
      values ('expense', 'base', 10000, a_account_liquid, a_category, '2026-01-01')
      returning id into a_tx;

    insert into public.recurring_rules (type, nature, amount, account_id, category_id, frequency, start_date)
      values ('expense', 'base', 20000, a_account_liquid, a_category, 'monthly', '2026-01-01')
      returning id into a_rule;

    insert into public.budgets (category_id, amount)
      values (a_category, 50000)
      returning id into a_budget;

    -- --- Valores por defecto de las columnas nuevas --------------------------
    select status into st from public.transactions where id = a_tx;
    insert into _rls_results values (
      'status por defecto de un movimiento = posted',
      st = 'posted',
      'status=' || coalesce(st::text, 'null')
    );

    select confirmation_mode into cm from public.recurring_rules where id = a_rule;
    insert into _rls_results values (
      'confirmation_mode por defecto de una regla = auto',
      cm = 'auto',
      'modo=' || coalesce(cm::text, 'null')
    );

    -- --- A puede cambiar confirmation_mode ----------------------------------
    update public.recurring_rules set confirmation_mode = 'confirm' where id = a_rule;
    get diagnostics cnt = row_count;
    select confirmation_mode into cm from public.recurring_rules where id = a_rule;
    insert into _rls_results values (
      'A puede cambiar confirmation_mode a confirm',
      cnt = 1 and cm = 'confirm',
      'filas=' || cnt::text || ' modo=' || coalesce(cm::text, 'null')
    );

    -- --- account_balances ignora movimientos pending ------------------------
    select balance into bal_before from public.account_balances where account_id = a_account_liquid;

    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on, status)
      values ('expense', 'base', 5000, a_account_liquid, a_category, '2026-01-02', 'pending')
      returning id into a_tx_pending;

    select balance into bal_pending from public.account_balances where account_id = a_account_liquid;
    insert into _rls_results values (
      'account_balances ignora movimientos pending',
      bal_pending = bal_before and bal_before = -10000,
      'antes=' || bal_before::text || ' con_pending=' || bal_pending::text
    );

    update public.transactions set status = 'posted' where id = a_tx_pending;
    get diagnostics cnt = row_count;
    select balance into bal_posted from public.account_balances where account_id = a_account_liquid;
    insert into _rls_results values (
      'al pasar pending a posted el saldo baja',
      cnt = 1 and bal_posted = bal_before - 5000,
      'filas=' || cnt::text || ' saldo=' || bal_posted::text
    );

    -- --- counts_as_liquid en la vista ---------------------------------------
    select counts_as_liquid into cl from public.account_balances where account_id = a_account_liquid;
    select counts_as_liquid into cl2 from public.account_balances where account_id = a_account_nonliquid;
    insert into _rls_results values (
      'cuenta liquida expone counts_as_liquid = true (por defecto)',
      cl = true,
      'valor=' || coalesce(cl::text, 'null')
    );
    insert into _rls_results values (
      'cuenta no liquida expone counts_as_liquid = false',
      cl2 = false,
      'valor=' || coalesce(cl2::text, 'null')
    );

    insert into _rls_results values ('A crea su cuenta, categoria, movimiento, regla y presupuesto', true, a_account_liquid::text);
  exception when others then
    insert into _rls_results values ('Error creando datos de A', false, sqlerrm);
  end;

  -- ==========================================================================
  -- B crea sus propios recursos (debe permitirse)
  -- ==========================================================================
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u_b::text)::text, true);
    set role authenticated;

    insert into public.accounts (name, type)
      values ('Cuenta B test', 'cash')
      returning id into b_account;

    insert into public.categories (name, kind, icon, color)
      values ('Cat B test', 'expense', 'accessibility-outline', '#000000')
      returning id into b_category;

    insert into public.categories (name, kind, icon, color, parent_id)
      values ('Subcat B test', 'expense', 'accessibility-outline', '#000000', b_category)
      returning id into b_subcategory;

    insert into public.categories (name, kind, icon, color)
      values ('Cat ingreso B test', 'income', 'accessibility-outline', '#000000')
      returning id into b_income_category;

    insert into _rls_results values ('B crea sus propios recursos', true, b_account::text);
  exception when others then
    insert into _rls_results values ('B crea sus propios recursos', false, sqlerrm);
  end;

  -- ==========================================================================
  -- B no ve datos de A (SELECT)
  -- ==========================================================================
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u_b::text)::text, true);
    set role authenticated;

    select count(*) into cnt from public.profiles where id = u_a;
    insert into _rls_results values ('B no ve el perfil de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.accounts where id = a_account_liquid;
    insert into _rls_results values ('B no ve las cuentas de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.categories where id = a_category;
    insert into _rls_results values ('B no ve las categorias de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.transactions where id = a_tx;
    insert into _rls_results values ('B no ve los movimientos de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.transactions where id = a_tx_pending;
    insert into _rls_results values ('B no ve el segundo movimiento de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.recurring_rules where id = a_rule;
    insert into _rls_results values ('B no ve las reglas recurrentes de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.budgets where id = a_budget;
    insert into _rls_results values ('B no ve los presupuestos de A', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.account_balances where account_id = a_account_liquid;
    insert into _rls_results values ('B no ve las cuentas de A en account_balances', cnt = 0, 'filas=' || cnt::text);
  exception when others then
    insert into _rls_results values ('Error en pruebas SELECT de B', false, sqlerrm);
  end;

  -- ==========================================================================
  -- B no modifica ni borra filas de A (UPDATE / DELETE -> 0 filas)
  -- ==========================================================================
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u_b::text)::text, true);
    set role authenticated;

    update public.profiles set display_name = 'HACK' where id = u_a;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica el perfil de A', cnt = 0, 'filas=' || cnt::text);

    update public.accounts set name = 'HACK' where id = a_account_liquid;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica las cuentas de A', cnt = 0, 'filas=' || cnt::text);

    update public.categories set name = 'HACK' where id = a_category;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica las categorias de A', cnt = 0, 'filas=' || cnt::text);

    update public.transactions set amount = 1 where id = a_tx;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica los movimientos de A', cnt = 0, 'filas=' || cnt::text);

    update public.recurring_rules set amount = 1 where id = a_rule;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica las reglas de A', cnt = 0, 'filas=' || cnt::text);

    update public.budgets set amount = 1 where id = a_budget;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no modifica los presupuestos de A', cnt = 0, 'filas=' || cnt::text);

    delete from public.transactions where id = a_tx;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no borra los movimientos de A', cnt = 0, 'filas=' || cnt::text);

    delete from public.accounts where id = a_account_liquid;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no borra las cuentas de A', cnt = 0, 'filas=' || cnt::text);

    delete from public.budgets where id = a_budget;
    get diagnostics cnt = row_count;
    insert into _rls_results values ('B no borra los presupuestos de A', cnt = 0, 'filas=' || cnt::text);
  exception when others then
    insert into _rls_results values ('Error en pruebas UPDATE/DELETE de B', false, sqlerrm);
  end;

  -- ==========================================================================
  -- B intenta insertar usando recursos de A (debe bloquearse)
  -- ==========================================================================
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u_b::text)::text, true);
    set role authenticated;
  exception when others then
    null;
  end;

  begin
    insert into public.accounts (user_id, name, type)
      values (u_a, 'Cuenta hack test', 'cash');
    insert into _rls_results values ('B bloqueado al crear cuenta para A', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al crear cuenta para A', true, 'rechazado por RLS');
  end;

  begin
    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
      values ('expense', 'base', 1, a_account_liquid, b_category, '2026-02-01');
    insert into _rls_results values ('B bloqueado al usar cuenta de A en un movimiento', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al usar cuenta de A en un movimiento', true, 'rechazado por RLS');
  end;

  begin
    insert into public.transactions (type, nature, amount, account_id, category_id, occurred_on)
      values ('expense', 'base', 1, b_account, a_category, '2026-02-02');
    insert into _rls_results values ('B bloqueado al usar categoria de A en un movimiento', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al usar categoria de A en un movimiento', true, 'rechazado por RLS');
  end;

  begin
    insert into public.recurring_rules (type, nature, amount, account_id, category_id, frequency, start_date)
      values ('expense', 'base', 1, a_account_liquid, b_category, 'monthly', '2026-02-01');
    insert into _rls_results values ('B bloqueado al usar cuenta de A en una regla', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al usar cuenta de A en una regla', true, 'rechazado por RLS');
  end;

  begin
    insert into public.budgets (category_id, amount) values (a_category, 1);
    insert into _rls_results values ('B bloqueado al crear presupuesto con categoria de A', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al crear presupuesto con categoria de A', true, 'rechazado por RLS');
  end;

  begin
    insert into public.budgets (category_id, amount) values (b_income_category, 1);
    insert into _rls_results values ('B bloqueado al presupuestar una categoria de ingreso', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al presupuestar una categoria de ingreso', true, 'rechazado por RLS');
  end;

  begin
    insert into public.budgets (category_id, amount) values (b_subcategory, 1);
    insert into _rls_results values ('B bloqueado al presupuestar una subcategoria', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al presupuestar una subcategoria', true, 'rechazado por RLS');
  end;

  begin
    insert into public.categories (name, kind, icon, color, parent_id)
      values ('Subcat hack test', 'expense', 'accessibility-outline', '#000000', a_category);
    insert into _rls_results values ('B bloqueado al crear subcategoria bajo una de A', false, 'NO fue bloqueado');
  exception when others then
    insert into _rls_results values ('B bloqueado al crear subcategoria bajo una de A', true, 'rechazado por RLS');
  end;

  -- ==========================================================================
  -- anon no ve nada
  -- ==========================================================================
  begin
    set role anon;
    perform set_config('request.jwt.claims', '{}', true);

    select count(*) into cnt from public.accounts where name = 'Cuenta A liquida test';
    insert into _rls_results values ('anon no ve cuentas', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.transactions where id = a_tx;
    insert into _rls_results values ('anon no ve movimientos', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.recurring_rules where id = a_rule;
    insert into _rls_results values ('anon no ve reglas', cnt = 0, 'filas=' || cnt::text);

    select count(*) into cnt from public.budgets where id = a_budget;
    insert into _rls_results values ('anon no ve presupuestos', cnt = 0, 'filas=' || cnt::text);

    begin
      select count(*) into cnt from public.account_balances;
      insert into _rls_results values ('anon no ve account_balances', cnt = 0, 'filas=' || cnt::text);
    exception when insufficient_privilege then
      insert into _rls_results values ('anon no ve account_balances', true, 'sin privilegios (correcto)');
    end;
  exception when others then
    insert into _rls_results values ('Error en pruebas anon', false, sqlerrm);
  end;

  -- ==========================================================================
  -- Limpieza (siempre, incluso si alguna prueba previa falló)
  -- ==========================================================================
  set role postgres;
  begin
    delete from public.transactions where id in (a_tx, a_tx_pending);
    delete from public.budgets where id = a_budget;
    delete from public.recurring_rules where id = a_rule;
    delete from public.accounts where id in (a_account_liquid, a_account_nonliquid, b_account);
    delete from public.categories where id in (a_category, b_category, b_subcategory, b_income_category);
    insert into _rls_results values ('Limpieza', true, 'ok');
  exception when others then
    insert into _rls_results values ('Error en la limpieza', false, sqlerrm);
  end;
end $$;

-- Resultado: todas las filas deben decir TRUE.
select check_name, passed, detail from _rls_results order by check_name;
