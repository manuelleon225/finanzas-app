-- ============================================================================
-- Migración 008 — Corrección de codificación de texto
-- ============================================================================

begin;

-- Corrige categorías ya guardadas con texto roto (solo patrón roto).
update public.categories
set name = 'Educación'
where name like 'Educaci%'
  and name <> 'Educación';

-- Recrea handle_new_user() con textos correctos.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

  insert into public.accounts (user_id, name, type, initial_balance)
  select new.id, 'Efectivo', 'cash'::public.account_type, 0
  where not exists (
    select 1 from public.accounts a where a.user_id = new.id
  );

  insert into public.categories (user_id, name, kind, icon, color, sort_order)
  select new.id, v.name, v.kind::public.category_kind, v.icon, v.color, v.sort_order
  from (
    values
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

commit;
