-- ============================================================================
-- Migración 005 — Cuenta líquida (counts_as_liquid)
-- App de finanzas personales.
--
-- Añade la marca de "cuenta para gastar" (el saldo de estas cuentas cuenta en
-- "Disponible hoy") y la incluye en la vista account_balances al final.
--
-- Cómo ejecutarla: pegar todo en el SQL Editor de Supabase y ejecutar una vez.
-- Requiere las migraciones 001 a 004 aplicadas.
-- ============================================================================

begin;

-- 1) Nueva columna (por defecto true: al crear, cuenta para gastar)
alter table public.accounts
  add column counts_as_liquid boolean not null default true;

-- 2) Las cuentas existentes de ahorro y tarjetas de crédito NO son líquidas
update public.accounts
  set counts_as_liquid = false
  where type in ('savings', 'credit_card');

-- 3) Recrear la vista añadiendo counts_as_liquid AL FINAL, sin cambiar el orden
--    de las columnas existentes y conservando security_invoker = true.
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
  and (t.account_id = a.id or t.transfer_account_id = a.id)
group by a.id;

commit;

-- ============================================================================
-- Verificación manual
-- ============================================================================
-- select name, type, counts_as_liquid from public.accounts order by name;
--   -> 'Efectivo'/'Banco' deben tener true; 'Ahorros'/'Tarjeta' false.
-- select * from public.account_balances limit 5;
--   -> debe incluir counts_as_liquid como última columna.
-- ============================================================================