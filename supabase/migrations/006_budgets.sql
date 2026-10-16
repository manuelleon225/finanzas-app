-- ============================================================================
-- Migración 006 — Presupuestos mensuales por categoría de gasto
-- App de finanzas personales.
--
-- Un presupuesto es un monto mensual recurrente asociado a UNA categoría
-- principal de gasto (parent_id nulo). El gasto de sus subcategorías se acumula
-- en el de la madre. Un solo presupuesto por categoría y usuario.
--
-- Cómo ejecutarla: pegar todo en el SQL Editor de Supabase y ejecutar una vez.
-- Requiere las migraciones 001 a 005 aplicadas.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Tabla budgets
-- ============================================================================

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount bigint not null check (amount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_unique_category unique (user_id, category_id)
);

-- ============================================================================
-- 2. Índices (apoyo a RLS y a la llave foránea de category_id)
-- ============================================================================

create index budgets_user_idx on public.budgets (user_id);
create index budgets_category_idx on public.budgets (category_id);

-- ============================================================================
-- 3. Trigger de updated_at
-- ============================================================================

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. Row Level Security
-- Cada usuario solo ve y modifica sus presupuestos. Al insertar/actualizar, la
-- categoría debe ser del mismo usuario, de tipo 'expense' y principal
-- (parent_id nulo). Se comprueba con EXISTS.
-- ============================================================================

alter table public.budgets enable row level security;

drop policy if exists budgets_select_own on public.budgets;
create policy budgets_select_own
  on public.budgets for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists budgets_insert_own on public.budgets;
create policy budgets_insert_own
  on public.budgets for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
        and c.kind = 'expense'
        and c.parent_id is null
    )
  );

drop policy if exists budgets_update_own on public.budgets;
create policy budgets_update_own
  on public.budgets for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
        and c.kind = 'expense'
        and c.parent_id is null
    )
  );

drop policy if exists budgets_delete_own on public.budgets;
create policy budgets_delete_own
  on public.budgets for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;

-- ============================================================================
-- Verificación manual
-- ============================================================================
-- select * from public.budgets;
--   -> solo los presupuestos del usuario autenticado.
-- Intenta crear un presupuesto con una categoría de ingreso o subcategoría:
--   -> debe fallar por la política (WITH CHECK).
-- ============================================================================
