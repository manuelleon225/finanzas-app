-- ============================================================================
-- Migración 007 — Movimientos pendientes de confirmar
-- App de finanzas personales.
--
-- Agrega el estado de movimiento (posted/pending) y el modo de confirmación de
-- las reglas recurrentes. Un movimiento 'pending' NO cuenta en saldos, totales,
-- presupuestos ni análisis; SÍ cuenta como gasto comprometido en "Disponible hoy".
--
-- Cómo ejecutarla: pegar todo en el SQL Editor de Supabase y ejecutar una vez.
-- Requiere las migraciones 001 a 006 aplicadas.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enums
-- ============================================================================

create type public.transaction_status as enum ('posted', 'pending');
create type public.recurring_confirmation_mode as enum ('auto', 'confirm');

-- ============================================================================
-- 2. Columnas nuevas
-- ============================================================================

alter table public.transactions
  add column status public.transaction_status not null default 'posted';

alter table public.recurring_rules
  add column confirmation_mode public.recurring_confirmation_mode not null default 'auto';

-- ============================================================================
-- 3. Índice de apoyo (filtrado por estado)
-- ============================================================================

create index transactions_user_status_idx on public.transactions (user_id, status);

-- ============================================================================
-- 4. Recrear account_balances sumando SOLO movimientos 'posted'
--    (mismo orden de columnas que la migración 005; conserva security_invoker).
-- ============================================================================

drop view if exists public.account_balances;

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
  )::bigint as balance,
  a.counts_as_liquid
from public.accounts a
left join public.transactions t
  on t.user_id = a.user_id
  and t.status = 'posted'
  and (t.account_id = a.id or t.transfer_account_id = a.id)
group by a.id;

commit;

-- ============================================================================
-- Verificación manual
-- ============================================================================
-- Los saldos de account_balances deben ser IDÉNTICOS antes y después de esta
-- migración (solo se añadió el filtro status = 'posted', y las filas existentes
-- quedan con status 'posted' por el default).
-- ============================================================================
