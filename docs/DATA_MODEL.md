# Modelo de datos y reglas de negocio

Fuente única de verdad del modelo de datos. Las migraciones en `supabase/migrations/` deben
reflejar exactamente este documento.

## 1. Tipos enum

```text
account_type      ('cash', 'bank', 'savings', 'credit_card')
category_kind     ('income', 'expense')
transaction_type  ('income', 'expense', 'transfer')
nature            ('base', 'extra')
frequency         ('weekly', 'biweekly', 'semimonthly', 'monthly')
```

### Significado de `frequency`

- `weekly`: cada 7 días.
- `biweekly`: cada 14 días.
- `semimonthly`: los días **15 y último** de cada mes (la quincena colombiana).
- `monthly`: cada mes el mismo día; si el día no existe en ese mes, se usa el último día del mes.

## 2. Tablas

### profiles

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, referencia `auth.users(id)` `on delete cascade` |
| display_name | text | Nombre a mostrar |
| currency | text | default `'COP'` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### accounts

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, default `auth.uid()`, referencia `auth.users(id)` `on delete cascade` |
| name | text | |
| type | account_type | |
| initial_balance | bigint | default `0`; **puede ser negativo** (tarjetas de crédito) |
| is_archived | boolean | default `false` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### categories

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, default `auth.uid()`, referencia `auth.users(id)` `on delete cascade` |
| name | text | |
| kind | category_kind | `income` o `expense` |
| icon | text | Identificador de ícono |
| color | text | Color en formato de texto |
| parent_id | uuid | nullable, referencia `categories(id)` |
| sort_order | integer | Orden de presentación |
| is_archived | boolean | default `false` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### transactions

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, default `auth.uid()`, referencia `auth.users(id)` `on delete cascade` |
| type | transaction_type | |
| nature | nature | nullable |
| amount | bigint | `> 0` |
| account_id | uuid | referencia `accounts(id)` `on delete restrict` |
| transfer_account_id | uuid | nullable, referencia `accounts(id)` `on delete restrict` |
| category_id | uuid | nullable, referencia `categories(id)` `on delete restrict` |
| occurred_on | date | Fecha del movimiento |
| note | text | nullable |
| recurring_rule_id | uuid | nullable, referencia `recurring_rules(id)` |
| occurrence_date | date | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Reglas con CHECK:**

- Si `type = 'transfer'`:
  - `transfer_account_id` obligatorio y **distinto** de `account_id`.
  - `nature` y `category_id` nulos.
- Si `type` es `'income'` o `'expense'`:
  - `category_id` y `nature` obligatorios.
  - `transfer_account_id` nulo.

**Índices:**

- Índice único sobre `(recurring_rule_id, occurrence_date)` (no parcial; ver migración 004). Los
  `NULL` se consideran distintos en un `UNIQUE`, así que los movimientos manuales no se ven
  afectados; solo se impide duplicar una ocurrencia generada.
- `(user_id, occurred_on desc)`.
- `(user_id, account_id)`.
- `(user_id, category_id)`.

**Llaves foráneas:**

- `account_id`, `transfer_account_id` y `category_id` usan `on delete restrict`: las cuentas y
  categorías con movimientos se archivan, no se borran.

### recurring_rules

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, default `auth.uid()`, referencia `auth.users(id)` `on delete cascade` |
| type | transaction_type | **solo** `income` o `expense` |
| nature | nature | |
| amount | bigint | `> 0` |
| account_id | uuid | referencia `accounts(id)` |
| category_id | uuid | referencia `categories(id)` |
| note | text | nullable |
| frequency | frequency | |
| start_date | date | |
| end_date | date | nullable |
| is_active | boolean | default `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## 3. Vista `account_balances`

`security_invoker = true` (respeta RLS del usuario que consulta).

Saldo actual por cuenta:

```text
saldo = initial_balance
      + ingresos
      - gastos
      - transferencias salientes
      + transferencias entrantes
```

Las transferencias salientes usan `account_id`; las entrantes usan `transfer_account_id`.

## 4. Seguridad (RLS)

- RLS activo en **todas** las tablas de datos: `profiles`, `accounts`, `categories`,
  `transactions` y `recurring_rules`.
- Cada usuario solo ve y modifica sus filas: `user_id = auth.uid()` (y `id = auth.uid()` en `profiles`).
- Sin políticas para el rol `anon`.
- Las políticas de `insert` y `update` verifican además, con `EXISTS`, que `account_id`,
  `transfer_account_id` (si no es nulo) y `category_id` (si no es nulo) pertenezcan al mismo usuario.
- En `categories`, se verifica que `parent_id` (si no es nulo) pertenezca al mismo usuario.

## 5. Datos por defecto al registrar un usuario

Un trigger `AFTER INSERT` en `auth.users` ejecuta `handle_new_user()` (`SECURITY DEFINER`,
`set search_path = ''`, referencias con esquema explícito) que crea:

1. La fila en `profiles`.
2. Una cuenta **"Efectivo"** de tipo `cash` con saldo inicial `0`.
3. Las categorías por defecto:

**Gastos (`expense`):** Comida, Mercado, Transporte, Vivienda, Servicios, Salud, Educación,
Entretenimiento, Ropa, Suscripciones, Otros.

**Ingresos (`income`):** Salario, Extra, Ventas, Regalos, Otros.

## 6. Regla de negocio: "Disponible hoy" (v2)

> V1 editable. Si el producto cambia, se edita este documento primero y luego el código.

Fórmula:

```text
liquidBalance  = suma de saldos de cuentas activas con counts_as_liquid = true
horizonDate    = fecha de la próxima ocurrencia (estrictamente posterior a hoy) de la regla
                 recurrente activa de ingreso BASE más cercana; si no hay ninguna,
                 el primer día del mes siguiente
daysToIncome   = max(1, días calendario entre hoy y horizonDate)
committed      = suma de las ocurrencias de reglas recurrentes activas de GASTO con fecha entre
                 mañana y el día anterior a horizonDate (inclusive)
                 + gastos PENDIENTES de confirmar
extraCushion   = max(0, ingresos extra del mes − gastos extra del mes)
availableTotal = liquidBalance − committed
availableBase  = availableTotal − extraCushion   (si includeExtras es false)
                 availableTotal                   (si includeExtras es true)
spentToday    = gastos publicados de hoy (sin transferencias)
allowanceToday = floor( max(0, availableBase + spentToday) / daysToIncome )
remainingToday = max(0, allowanceToday − spentToday)
```

Supuestos (v1 editable):

- Las cuentas con `counts_as_liquid = false` (p. ej. ahorros/tarjetas por defecto) no aportan al
  dinero disponible para gastar.
- `horizonDate` ancla el gasto al próximo ingreso base (quincena/mes); si no existe ingreso
  recurrente, se usa el cierre de mes como fallback.
- Los **extras** se muestran aparte como colchón y, por defecto, **no inflan** el número
  (`includeExtras = false`).
- Las **transferencias** nunca cuentan como gasto ni ingreso.
- Los gastos **pendientes de confirmar** reducen el disponible aunque aún no estén publicados.

## 7. Cambios planificados (aún no implementados)

| Campo / tabla | Descripción |
|---|---|
| `accounts.counts_as_liquid` | `boolean` (default `true`). Marca cuentas cuyo saldo cuenta en "Disponible hoy". |
| tabla `budgets` | Presupuesto mensual por categoría principal de gasto (monto, `is_active`). |
| `transactions.status` | `enum 'posted'` \| `'pending'` (default `'posted'`). Los `pending` no cuentan en saldos/totales/presupuestos/análisis; sí en `committed`. |
| `recurring_rules.confirmation_mode` | `enum 'auto'` \| `'confirm'` (default `'auto'`). En `confirm`, la generación crea movimientos `pending`. |

Se implementarán con las migraciones 005 (líquidas), 006 (budgets) y 007 (status/pending).
