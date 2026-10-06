-- ============================================================================
-- Migración 002 — Seguridad (Row Level Security)
-- App de finanzas personales.
--
-- Activa RLS en todas las tablas y crea políticas para que cada usuario solo
-- pueda ver y modificar sus propias filas. No hay ninguna política para el
-- rol `anon`.
--
-- Cómo ejecutarla: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo UNA sola vez (es idempotente: puede reintentarse sin residuos).
--
-- Requiere haber ejecutado antes la migración 001.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Activar Row Level Security en todas las tablas
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_rules enable row level security;

-- ============================================================================
-- 2. Políticas de profiles (se identifica por id = auth.uid())
-- ============================================================================

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- ============================================================================
-- 3. Políticas de accounts
-- ============================================================================

drop policy if exists accounts_select_own on public.accounts;
create policy accounts_select_own
  on public.accounts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists accounts_insert_own on public.accounts;
create policy accounts_insert_own
  on public.accounts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists accounts_update_own on public.accounts;
create policy accounts_update_own
  on public.accounts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists accounts_delete_own on public.accounts;
create policy accounts_delete_own
  on public.accounts for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. Políticas de categories
-- Al insertar/actualizar, el parent_id (si no es nulo) debe ser del mismo
-- usuario.
-- ============================================================================

drop policy if exists categories_select_own on public.categories;
create policy categories_select_own
  on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists categories_insert_own on public.categories;
create policy categories_insert_own
  on public.categories for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      parent_id is null
      or parent_id in (
        select p.id from public.categories p
        where p.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists categories_update_own on public.categories;
create policy categories_update_own
  on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      parent_id is null
      or parent_id in (
        select p.id from public.categories p
        where p.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists categories_delete_own on public.categories;
create policy categories_delete_own
  on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. Políticas de transactions
-- Al insertar/actualizar, account_id, transfer_account_id y category_id deben
-- pertenecer al mismo usuario (con EXISTS).
-- ============================================================================

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own
  on public.transactions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = (select auth.uid())
    )
    and (
      transfer_account_id is null
      or exists (
        select 1 from public.accounts a
        where a.id = transfer_account_id and a.user_id = (select auth.uid())
      )
    )
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists transactions_update_own on public.transactions;
create policy transactions_update_own
  on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = (select auth.uid())
    )
    and (
      transfer_account_id is null
      or exists (
        select 1 from public.accounts a
        where a.id = transfer_account_id and a.user_id = (select auth.uid())
      )
    )
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_delete_own
  on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- 6. Políticas de recurring_rules
-- Al insertar/actualizar, account_id y category_id deben ser del mismo usuario.
-- ============================================================================

drop policy if exists recurring_rules_select_own on public.recurring_rules;
create policy recurring_rules_select_own
  on public.recurring_rules for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists recurring_rules_insert_own on public.recurring_rules;
create policy recurring_rules_insert_own
  on public.recurring_rules for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists recurring_rules_update_own on public.recurring_rules;
create policy recurring_rules_update_own
  on public.recurring_rules for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists recurring_rules_delete_own on public.recurring_rules;
create policy recurring_rules_delete_own
  on public.recurring_rules for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- 7. Asegurar que la vista account_balances respete RLS
-- (security_invoker = true hace que use los permisos y el RLS del usuario que
-- consulta, no los del dueño de la vista).
-- ============================================================================

alter view public.account_balances set (security_invoker = true);

commit;

-- ============================================================================
-- Procedimiento manual de verificación con DOS usuarios distintos
-- ============================================================================
--
-- Objetivo: comprobar que un usuario no puede leer ni modificar datos del otro.
--
-- Preparación (en el panel de Supabase):
--   1. Authentication → Users → Add user. Crea el usuario A y el usuario B.
--      Si tienes la confirmación de email desactivada, podrán iniciar sesión.
--   2. Inicia la app (o usa el SQL Editor con JWT de cada usuario) una vez como
--      A y otra como B. Al registrarse, el trigger de la migración 003 creará su
--      perfil, su cuenta "Efectivo" y sus categorías.
--
-- Pruebas con la sesión de A (usando el cliente/SQL autenticado como A):
--   P1. select * from public.accounts;
--       → Solo debe devolver las cuentas de A.
--   P2. select * from public.transactions;
--       → Solo debe devolver los movimientos de A.
--   P3. Toma el id de una cuenta de B e intenta:
--         insert into public.transactions
--           (type, nature, amount, account_id, category_id, occurred_on)
--         values
--           ('expense', 'base', 1000, '<cuenta de B>', '<categoria de A>', '2026-01-01');
--       → Debe FALLAR por la política (account_id ajeno).
--   P4. Intenta leer/actualizar una fila de B:
--         update public.accounts set name = 'hack' where user_id = '<id de B>';
--       → Debe afectar 0 filas (RLS).
--   P5. select * from public.account_balances;
--       → Solo debe mostrar los saldos de las cuentas de A.
--
-- Pruebas con la sesión de B: repetir y confirmar que tampoco ve nada de A.
--
-- Prueba de aislamiento sin sesión (rol anon):
--   - Con la anon/publishable key y sin JWT, consultar las tablas debe devolver
--     un arreglo vacío o un error de permiso, nunca datos.
-- ============================================================================
