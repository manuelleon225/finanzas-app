-- ============================================================================
-- Migración 003 — Datos por defecto al registrar un usuario
-- App de finanzas personales.
--
-- Cuando se crea una fila en auth.users, crea automáticamente:
--   1. Su fila en public.profiles.
--   2. Una cuenta "Efectivo" (tipo cash, saldo inicial 0).
--   3. Las categorías por defecto (ver docs/DATA_MODEL.md).
--
-- Cómo ejecutarla: pegar TODO este archivo en el SQL Editor de Supabase y
-- ejecutarlo. Es idempotente: puede volver a ejecutarse sin residuos.
--
-- Requiere haber ejecutado antes las migraciones 001 y 002.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Función que crea los datos por defecto del usuario.
-- SECURITY DEFINER + search_path vacío: corre con permisos del dueño de la
-- función y todas las referencias van con esquema explícito.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Perfil. Idempotente: si ya existe, no hace nada.
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        split_part(coalesce(new.email, ''), '@', 1)
      ),
      ''
    )
  )
  on conflict (id) do nothing;

  -- Cuenta "Efectivo" (solo si el usuario no tiene ninguna cuenta).
  insert into public.accounts (user_id, name, type, initial_balance)
  select new.id, 'Efectivo', 'cash'::public.account_type, 0
  where not exists (
    select 1 from public.accounts a where a.user_id = new.id
  );

  -- Categorías por defecto (solo si el usuario no tiene ninguna categoría).
  insert into public.categories (user_id, name, kind, icon, color, sort_order)
  select new.id, v.name, v.kind::public.category_kind, v.icon, v.color, v.sort_order
  from (
    values
      -- Gastos
      ('Comida',          'expense', 'fast-food-outline',        '#EF4444', 1),
      ('Mercado',         'expense', 'cart-outline',             '#F97316', 2),
      ('Transporte',      'expense', 'bus-outline',              '#3B82F6', 3),
      ('Vivienda',        'expense', 'home-outline',             '#8B5CF6', 4),
      ('Servicios',       'expense', 'flash-outline',            '#EAB308', 5),
      ('Salud',           'expense', 'medkit-outline',           '#14B8A6', 6),
      ('Educación',       'expense', 'school-outline',           '#0EA5E9', 7),
      ('Entretenimiento', 'expense', 'game-controller-outline',  '#EC4899', 8),
      ('Ropa',            'expense', 'shirt-outline',            '#A855F7', 9),
      ('Suscripciones',   'expense', 'repeat-outline',           '#6366F1', 10),
      ('Otros',           'expense', 'ellipsis-horizontal-outline', '#6B7280', 11),
      -- Ingresos
      ('Salario',         'income',  'cash-outline',             '#16A34A', 1),
      ('Extra',           'income',  'trending-up-outline',      '#22C55E', 2),
      ('Ventas',          'income',  'pricetag-outline',         '#10B981', 3),
      ('Regalos',         'income',  'gift-outline',             '#F43F5E', 4),
      ('Otros',           'income',  'ellipsis-horizontal-outline', '#6B7280', 5)
  ) as v (name, kind, icon, color, sort_order)
  where not exists (
    select 1 from public.categories c where c.user_id = new.id
  );

  return new;
end;
$$;

-- ============================================================================
-- 2. Trigger AFTER INSERT en auth.users
-- ============================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;

-- ============================================================================
-- Verificación manual
-- ============================================================================
-- 1. Authentication → Users → Add user. Crea un usuario nuevo (ej. con email
--    confirmado o con la confirmación de email desactivada).
-- 2. En el SQL Editor ejecuta, reemplazando el email:
--      select * from public.profiles
--        where id = (select id from auth.users where email = 'tu@correo.com');
--      select * from public.accounts
--        where user_id = (select id from auth.users where email = 'tu@correo.com');
--      select kind, count(*) from public.categories
--        where user_id = (select id from auth.users where email = 'tu@correo.com')
--        group by kind;
--    → Debe aparecer 1 perfil, 1 cuenta "Efectivo" y 16 categorías
--      (11 de gasto y 5 de ingreso).
-- ============================================================================
