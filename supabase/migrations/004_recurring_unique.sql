-- ============================================================================
-- Migración 004 — Índice único de recurrentes (no parcial)
-- App de finanzas personales.
--
-- Motivo: la generación automática usa upsert on_conflict
-- (recurring_rule_id, occurrence_date) con "ignore duplicates". PostgREST no
-- puede usar un índice único PARCIAL como objetivo de ON CONFLICT, por lo que
-- se reemplaza por un índice único NORMAL sobre las mismas columnas.
--
-- Es seguro: en Postgres los NULL se consideran distintos en un UNIQUE, así que
-- los movimientos manuales (recurring_rule_id y occurrence_date nulos) siguen
-- pudiendo repetirse; solo se impide duplicar una ocurrencia generada.
--
-- Cómo ejecutarla: pegar todo en el SQL Editor de Supabase y ejecutar una vez.
-- ============================================================================

begin;

drop index if exists public.transactions_recurring_occurrence_uidx;

create unique index transactions_recurring_occurrence_uidx
  on public.transactions (recurring_rule_id, occurrence_date);

commit;
