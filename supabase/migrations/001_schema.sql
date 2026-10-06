-- ============================================================================
-- Migración 001 — Esquema base
-- App de finanzas personales.
-- Implementa exactamente docs/DATA_MODEL.md.
--
-- Cómo ejecutarla: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo UNA sola vez. Está envuelto en una transacción: si algo falla,
-- no se crea nada a medias y se puede volver a intentar sin residuos.
--
-- NO crea políticas RLS (eso es la migración 002).
-- ============================================================================

begin;

-- ============================================================================
-- 1. Tipos enum
-- ============================================================================

-- Tipos de cuenta.
create type public.account_type as enum ('cash', 'bank', 'savings', 'credit_card');

-- Tipo de categoría: ingreso o gasto.
create type public.category_kind as enum ('income', 'expense');

-- Tipo de movimiento.
create type public.transaction_type as enum ('income', 'expense', 'transfer');

-- Naturaleza del movimiento: base (esperado/recurrente) o extra (ocasional).
create type public.nature as enum ('base', 'extra');

-- Frecuencia de una regla recurrente.
-- weekly = cada 7 días; biweekly = cada 14 días;
-- semimonthly = días 15 y último del mes; monthly = mismo día de cada mes.
create type public.frequency as enum ('weekly', 'biweekly', 'semimonthly', 'monthly');

-- ============================================================================
-- 2. Función genérica para actualizar updated_at
-- ============================================================================

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 3. Tablas
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: datos públicos del usuario (1:1 con auth.users).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency text not null default 'COP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- accounts: cuentas del usuario (efectivo, banco, ahorros, tarjeta).
-- ---------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type public.account_type not null,
  initial_balance bigint not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories: categorías de ingreso/gasto, con un nivel de subcategorías.
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind public.category_kind not null,
  icon text not null,
  color text not null,
  parent_id uuid references public.categories (id) on delete restrict,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- recurring_rules: plantillas de movimientos recurrentes.
-- Se crea antes de transactions porque transactions la referencia.
-- ---------------------------------------------------------------------------
create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type public.transaction_type not null check (type in ('income', 'expense')),
  nature public.nature not null,
  amount bigint not null check (amount > 0),
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  note text,
  frequency public.frequency not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- transactions: movimientos (ingreso, gasto o transferencia).
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type public.transaction_type not null,
  nature public.nature,
  amount bigint not null check (amount > 0),
  account_id uuid not null references public.accounts (id) on delete restrict,
  transfer_account_id uuid references public.accounts (id) on delete restrict,
  category_id uuid references public.categories (id) on delete restrict,
  occurred_on date not null,
  note text,
  recurring_rule_id uuid references public.recurring_rules (id) on delete set null,
  occurrence_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_valid_shape check (
    (
      type = 'transfer'
      and transfer_account_id is not null
      and transfer_account_id <> account_id
      and nature is null
      and category_id is null
    )
    or
    (
      type in ('income', 'expense')
      and category_id is not null
      and nature is not null
      and transfer_account_id is null
    )
  )
);

-- ============================================================================
-- 4. Índices
-- ============================================================================

-- Transacciones generadas por recurrentes: evita duplicados por (regla, fecha).
create unique index transactions_recurring_occurrence_uidx
  on public.transactions (recurring_rule_id, occurrence_date)
  where recurring_rule_id is not null;

-- Consultas principales de transactions.
create index transactions_user_occurred_idx
  on public.transactions (user_id, occurred_on desc);
create index transactions_user_account_idx
  on public.transactions (user_id, account_id);
create index transactions_user_category_idx
  on public.transactions (user_id, category_id);

-- Apoyo a RLS y a las llaves foráneas del resto de tablas.
create index accounts_user_idx on public.accounts (user_id);
create index categories_user_idx on public.categories (user_id);
create index categories_parent_idx on public.categories (parent_id);
create index recurring_rules_user_idx on public.recurring_rules (user_id);

-- ============================================================================
-- 5. Triggers de updated_at
-- ============================================================================

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger recurring_rules_set_updated_at
  before update on public.recurring_rules
  for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. Vista account_balances (saldo calculado por cuenta)
-- security_invoker = true: la vista respeta el RLS del usuario que consulta.
-- ============================================================================

create view public.account_balances
with (security_invoker = true)
as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.type,
  a.initial_balance,
  a.is_archived,
  (
    a.initial_balance
    + coalesce(
        sum(
          case
            when t.type = 'income' and t.account_id = a.id then t.amount
            when t.type = 'expense' and t.account_id = a.id then -t.amount
            when t.type = 'transfer' and t.account_id = a.id then -t.amount
            when t.type = 'transfer' and t.transfer_account_id = a.id then t.amount
            else 0
          end
        ),
        0
      )
  )::bigint as balance
from public.accounts a
left join public.transactions t
  on t.user_id = a.user_id
  and (t.account_id = a.id or t.transfer_account_id = a.id)
group by a.id;

commit;

-- ============================================================================
-- Decisiones tomadas donde docs/DATA_MODEL.md era ambiguo
-- ============================================================================
-- 1. `name` en accounts y categories, e `icon`/`color` en categories, se
--    definieron NOT NULL (el documento no lo especificaba, pero son datos
--    obligatorios del producto).
-- 2. `occurred_on` se definió NOT NULL (todo movimiento tiene fecha).
-- 3. `categories.parent_id` usa on delete restrict (las categorías se
--    archivan; no se borra un padre con hijos).
-- 4. `transactions.recurring_rule_id` usa on delete set null, para que borrar
--    una regla no borre ni bloquee los movimientos ya generados (ver P7.2).
-- 5. Se añadieron índices sobre user_id (y categories.parent_id) para apoyar
--    RLS y las llaves foráneas; el documento solo listaba los de transactions.
-- 6. La columna `balance` de la vista se castea a bigint para mantener el
--    dinero como entero.
-- 7. Se usó `gen_random_uuid()` (disponible en Postgres 13+) para los id.
-- 8. `profiles.display_name` queda nullable (el usuario podría no tenerlo aún).
-- ============================================================================
