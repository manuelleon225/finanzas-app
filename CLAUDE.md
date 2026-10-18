# CLAUDE.md — Contexto maestro del proyecto "Finanzas"

> **Qué es este archivo.** Documento único y autosuficiente para que un agente de IA (Claude u
> otro) entienda **todo** el proyecto Finanzas de una sola lectura: qué es, cómo está construido,
> qué se hizo, qué falta, qué se decidió y qué se sugiere. Complementa (no reemplaza) a
> `AGENTS.md` y a los documentos de `docs/`. Si algo choca con el código, la fuente de verdad son
> `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_SYSTEM.md` y `docs/UX_SPEC.md`.
>
> Última actualización: 2026-10-16 (R7.14: auditoría final y limpieza del rediseño v3).

---

## Tabla de contenido

1. [Resumen en 60 segundos](#1-resumen-en-60-segundos)
2. [Reglas para el agente (obligatorias)](#2-reglas-para-el-agente-obligatorias)
3. [Producto](#3-producto)
4. [Stack y versiones](#4-stack-y-versiones)
5. [Estructura del repositorio](#5-estructura-del-repositorio)
6. [Backend: Supabase](#6-backend-supabase)
7. [Modelo de datos y lógica](#7-modelo-de-datos-y-lógica)
8. [Arquitectura de la app](#8-arquitectura-de-la-app)
9. [Sistema de diseño v3](#9-sistema-de-diseño-v3)
10. [Pantallas (UX)](#10-pantallas-ux)
11. [Features en detalle](#11-features-en-detalle)
12. [Testing y calidad](#12-testing-y-calidad)
13. [Seguridad](#13-seguridad)
14. [Historial completo de prompts](#14-historial-completo-de-prompts)
15. [Estado actual](#15-estado-actual)
16. [Pendientes y bloqueantes](#16-pendientes-y-bloqueantes)
17. [Problemas conocidos y riesgos](#17-problemas-conocidos-y-riesgos)
18. [Recomendaciones / próximos pasos](#18-recomendaciones--próximos-pasos)
19. [Comandos rápidos (Windows)](#19-comandos-rápidos-windows)
20. [Glosario](#20-glosario)

---

## 1. Resumen en 60 segundos

- **Qué es:** app móvil de finanzas personales (Android + iOS, un solo código) para el mercado
  **colombiano** (COP, ingresos por quincena, primas, ingresos irregulares).
- **Diferenciadores:** (1) cada movimiento es **Base** (esperado) o **Extra** (ocasional);
  (2) **"Disponible hoy" (fórmula v2)**: cuánto se puede gastar hoy sin romper el ciclo hasta el
  próximo ingreso base; (3) **registro rápido en 2–3 toques** con botón **(+)** central.
- **Stack:** Expo SDK 57 + React Native 0.86 + TypeScript estricto + Expo Router; Supabase
  (Postgres + Auth + RLS + Edge Functions); TanStack Query (con cola offline); Zustand; RHF+zod.
- **Estado:** MVP completo (fases P1–P9) + rediseño v2 (R0–R6) + rediseño v3 "bloque de color"
  (R7.0–R7.14) terminados en código, con calidad en verde. **Sin publicar** (P10.1 pendiente). Cierre
  v3 = QA visual manual (`docs/QA_VISUAL.md`).
- **Git:** rama **`feat/ui-v3`** (base `main`; `feat/redesign` ya existe). Último commit `dedbe65`
  (`docs: agrega guía de prompts del rediseño UI v3`). El trabajo de R7 está sin commitear en el
  árbol de trabajo. El PR va de `feat/ui-v3` → `feat/redesign` → `main`.

---

## 2. Reglas para el agente (obligatorias)

Tomadas de `AGENTS.md`; resumidas aquí para que este archivo sea autosuficiente.

### 2.1 Antes de empezar
Lee, en este orden: `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/DATA_MODEL.md` →
`docs/PROGRESS.md`. Si vas a tocar UI: además `docs/DESIGN_SYSTEM.md` completo y la sección
correspondiente de `docs/UX_SPEC.md`.

### 2.2 Diseño / UI
- `docs/DESIGN_SYSTEM.md` y `docs/UX_SPEC.md` son **fuente de verdad**. **No** los modifiques ni
  parafrasees; si una pantalla necesita algo que no está ahí, **pregunta, no inventes**.
- **El agente no puede ver pantallas.** Nunca afirmes que algo "se ve bien". Verifica con tipos,
  tests y lint, y entrega siempre una lista **"Para revisar visualmente"**.
- **Prohibidos** colores hex, `rgb()`/`rgba()` y valores de diseño sueltos fuera de `src/theme`
  (hay regla de ESLint). Un solo botón primary por vista. **Ámbar solo para "extra"**, nunca para
  advertencias. Ionicons solo a través de `AppIcon`.

### 2.3 Forma de trabajar
- Haz **solo** lo que la tarea pide; cambios pequeños y enfocados.
- No refactorices código existente que no se pidió tocar.
- No modifiques archivos fuera del alcance. No edites migraciones ya aplicadas: las nuevas llevan
  el siguiente número.
- No agregues dependencias sin permiso. Las de Expo se instalan con `npx.cmd expo install`.
- Maneja siempre estados de carga, vacío y error.
- Nunca imprimas, guardes ni subas secretos. Nunca uses la `service_role key` en la app.
- Si algo es ambiguo, **pregunta antes de inventar**.

### 2.4 Cierre de cada tarea
1. `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`. Corrige todo error.
2. Actualiza `docs/PROGRESS.md`.
3. Responde con: resumen breve, archivos tocados, comandos/pasos manuales, lista "Para revisar
   visualmente" si aplica, y mensaje de commit sugerido (Conventional Commits).
4. **Detente.** No empieces la siguiente tarea.

### 2.5 Convenciones de código
- Documentación y textos de UI en **español**; código, tablas y columnas en **inglés**.
- TypeScript estricto: prohibido `any` y `@ts-ignore` sin justificación en comentario.
- Dinero: entero de pesos (`bigint`), siempre positivo; el signo lo define el tipo. Nunca floats.
- Fechas de movimiento: `date` como texto `'YYYY-MM-DD'` en hora local.
- Saldos: **no** se guardan, se calculan (vista `account_balances`).
- Pantallas no llaman a Supabase: usan hooks → api de la feature.
- Lógica de negocio en funciones puras con tests. Textos centralizados en `src/i18n/es.ts`.

### 2.6 Entorno de este equipo (Windows)
- Usar **`npm.cmd` / `npx.cmd`** (la política de PowerShell bloquea los `.ps1`).
- `rg` **no** está disponible.
- `adb` a veces se cuelga vía el wrapper de PowerShell: usar `cmd /c "…\platform-tools\adb.exe …"`.

---

## 3. Producto

- **PRD:** `docs/PRD.md`. **Registro de decisiones:** `docs/DECISIONS.md`.
- **Mercado inicial:** Colombia. Moneda COP, formateo `Intl` locale `es-CO` (sin decimales,
  espacio no separable tras `$`: `$ 87.500`).
- **Concepto central "naturaleza":** cada ingreso/gasto es `base` o `extra`. Permite ver el
  ingreso base real y la "dependencia de extras".
- **"Disponible hoy" (v2):** amarra el gasto diario al próximo ingreso base en lugar de repartir el
  mes en partes iguales (ver §7.4).
- **Alcance actual:** registro de movimientos, cuentas, categorías (con subcategorías), recurrentes
  (con modo confirmación), presupuestos, análisis, exportar CSV, offline (solo creación),
  eliminación de cuenta, autenticación con deep links.
- **Fuera de alcance por ahora:** tarjetas de crédito y deudas, metas de ahorro, registro por voz,
  foto de recibo, cuentas compartidas, login social (`docs/DECISIONS.md`).

---

## 4. Stack y versiones

| Área | Tecnología |
|---|---|
| Framework | Expo SDK ~57.0.30, React Native 0.86.3, React 19.2.3, Expo Router ~57.0.28 (`typedRoutes`, `reactCompiler`) |
| Lenguaje | TypeScript ~6.0.3 (estricto) |
| Backend | Supabase (`@supabase/supabase-js ^2.117.2`): Postgres + Auth + RLS + Edge Functions (Deno) |
| Datos cliente | TanStack Query 5 + `@tanstack/react-query-persist-client` + `query-async-storage-persister` |
| Estado UI | Zustand 5 (stores persistidos; solo UI) |
| Formularios | react-hook-form 7 + zod 4 + `@hookform/resolvers` |
| Fechas | date-fns 4 |
| Tipografía | `@expo-google-fonts/manrope` (400/500/600/700) |
| Gráficos | `react-native-svg` 15 (componentes propios; sin librerías de charts) |
| Animación/gestos | `react-native-reanimated` 4.5.1 + `react-native-gesture-handler` 2.32 |
| Nativos | expo-haptics, expo-local-authentication, expo-secure-store, expo-notifications (import dinámico), expo-crypto, expo-file-system, expo-sharing, expo-linking, expo-constants, `@react-native-community/netinfo`, `@react-native-community/datetimepicker` |
| Tests | jest-expo ~57 + `@testing-library/react-native` 14 |
| Lint/format | ESLint 9 (flat config) + Prettier |
| Builds | EAS (aún no configurado; `eas-cli` se quitó de devDependencies en R6.3) |

---

## 5. Estructura del repositorio

```text
finanzas-app/
├─ app/                         # rutas de Expo Router
│  ├─ _layout.tsx               # raíz: providers, navegación, overlays (lock), deep links
│  ├─ (auth)/
│  │  ├─ _layout.tsx            # guard: no redirige si hay sesión de recuperación
│  │  ├─ login.tsx  register.tsx  forgot-password.tsx
│  │  ├─ reset-password.tsx  confirm-email.tsx  verify-email.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx            # custom TabBar de 5 elementos
│  │  ├─ index.tsx              # Inicio
│  │  ├─ movements.tsx          # Movimientos
│  │  ├─ plan.tsx               # Planificar
│  │  └─ more.tsx               # Más
│  ├─ transaction-form.tsx      # modal registro rápido (crear/editar)
│  ├─ accounts.tsx  account-form.tsx
│  ├─ categories.tsx  category-form.tsx
│  ├─ recurring.tsx  recurring-form.tsx
│  ├─ budgets.tsx  analysis.tsx  delete-account.tsx
├─ src/
│  ├─ components/
│  │  ├─ ui/                    # sistema de diseño (ver §9)
│  │  └─ charts/                # DonutChart, GroupedBarChart
│  ├─ features/
│  │  ├─ auth/       {api,hooks,components,store,utils}
│  │  ├─ accounts/   {api,hooks,components,utils}
│  │  ├─ categories/ {api,hooks,components,utils}
│  │  ├─ transactions/{api,hooks,components,store,utils}
│  │  ├─ recurring/  {api,hooks,store,utils}
│  │  ├─ summary/    {hooks,store,utils}
│  │  ├─ budgets/    {api,hooks,components,utils}
│  │  └─ analysis/   {api,hooks,utils}
│  ├─ lib/            # supabase, queryClient, persister, netinfo, money, dates,
│  │                  #   haptics, snackbar, useConnectivity
│  ├─ theme/          # colors, typography, spacing, radii, metrics, tint, categoryPalette,
│  │                  #   useTheme, useThemeModeStore
│  ├─ i18n/es.ts      # TODOS los textos de UI
│  └─ types/database.ts
├─ supabase/
│  ├─ migrations/001..007_*.sql
│  ├─ tests/002_rls_test.sql, 003_rls_test_v2.sql
│  └─ functions/delete-account/index.ts (+ README.md)
├─ docs/              # PRD, ARCHITECTURE, DATA_MODEL, DESIGN_SYSTEM, UX_SPEC, DECISIONS,
│                     #   PROGRESS, SECURITY_REVIEW, QA_CHECKLIST, APP_GUIDE
├─ AGENTS.md  CLAUDE.md
├─ guia-prompts-app-finanzas.md       # guía 1 (P0.1–P10.1)
└─ guia-prompts-rediseno-app-finanzas.md  # guía 2 (R0.1–R6.4) + Anexos A/B
```

Cada feature sigue la misma forma: `api/` (acceso a Supabase), `hooks/` (TanStack Query y hooks de
UI), `components/` (UI específica) y `utils/` (lógica pura con tests). Las pantallas **no** llaman a
Supabase directamente.

---

## 6. Backend: Supabase

### 6.1 Proyecto
- Project ref: **`blxqqytzehvzoakiydoo`** → `https://blxqqytzehvzoakiydoo.supabase.co`.
- Claves en `.env` (local, ignorado por git): `EXPO_PUBLIC_SUPABASE_URL` y
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (clave **publishable**, pública a propósito).
- `.env.example` versionado con placeholders vacíos.
- ⚠️ Este proyecto **estuvo pausado** (el host deja de resolver → `UnknownHostException`). Se
  reanudó desde el dashboard. Los proyectos pausados caducan el 18-nov-2027; conviene "Resume"
  antes de trabajar.

### 6.2 Migraciones (se ejecutan a mano en el SQL Editor, en orden)
| # | Archivo | Qué hace |
|---|---|---|
| 001 | `001_schema.sql` | Enums, tablas base, CHECKs, FKs, índices, trigger `updated_at`, vista `account_balances` (`security_invoker=true`) |
| 002 | `002_rls.sql` | RLS + políticas `authenticated`; función `is_owned_category` (anti-recursión) |
| 003 | `003_new_user.sql` | `handle_new_user()`: perfil + cuenta "Efectivo" + 16 categorías por defecto |
| 004 | `004_recurring_unique.sql` | Índice único **normal** `(recurring_rule_id, occurrence_date)` para `upsert` |
| 005 | `005_accounts_liquid.sql` | `accounts.counts_as_liquid` (default `true`; `false` en savings/credit_card); recrea vista |
| 006 | `006_budgets.sql` | Tabla `budgets` + RLS (categoría del usuario, de gasto, sin madre) |
| 007 | `007_pending_transactions.sql` | Enum `transaction_status`, `transactions.status`, `recurring_rules.confirmation_mode`; recrea vista sumando solo `posted` |

**Estado verificado en vivo (2026-10-15):** 001–005 aplicadas; **006 y 007 NO aplicadas** en la BD
(por eso `budgets` da 404 y `transactions.status` 400). Ver §16.

### 6.3 Modelo RLS
- RLS activo en **6 tablas**: profiles, accounts, categories, transactions, recurring_rules,
  budgets. **4 políticas por tabla** (SELECT/INSERT/UPDATE/DELETE) = **24**, todas para
  `authenticated`; **ninguna para `anon`**.
- Cada usuario solo ve/modifica lo suyo (`user_id = auth.uid()`; en `profiles`, `id = auth.uid()`).
- Las políticas de escritura validan con `EXISTS` que `account_id`, `transfer_account_id`,
  `category_id` y `parent_id` sean del mismo usuario. En `budgets`, la categoría debe ser de gasto
  (`kind='expense'`) y principal (`parent_id is null`).

### 6.4 Edge Function
- `supabase/functions/delete-account/index.ts` (Deno): valida el JWT del usuario con
  `auth.getUser()`; si es inválido → 401. Con un cliente administrador
  (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, inyectadas por Supabase) llama a
  `auth.admin.deleteUser`. Es el **único** punto con privilegios elevados. Las filas se borran por
  `on delete cascade`. Despliegue: ver `supabase/functions/README.md`.

### 6.5 Datos por defecto al registrar un usuario
Cuenta "Efectivo" (cash, saldo 0) y 16 categorías:
- **Gastos:** Comida, Mercado, Transporte, Vivienda, Servicios, Salud, Educación, Entretenimiento,
  Ropa, Suscripciones, Otros.
- **Ingresos:** Salario, Extra, Ventas, Regalos, Otros.

---

## 7. Modelo de datos y lógica

Fuente de verdad: `docs/DATA_MODEL.md`. Resumen:

### 7.1 Enums
`account_type` (cash, bank, savings, credit_card) · `category_kind` (income, expense) ·
`transaction_type` (income, expense, transfer) · `nature` (base, extra) ·
`frequency` (weekly, biweekly, semimonthly, monthly) · `transaction_status` (posted, pending) ·
`recurring_confirmation_mode` (auto, confirm).

`frequency`: weekly=7 días · biweekly=14 · **semimonthly = días 15 y último del mes** (quincena
colombiana) · monthly = mismo día (si no existe, último del mes).

### 7.2 Tablas
- **profiles**: id (=auth.users), display_name, currency ('COP').
- **accounts**: id, user_id, name, type, initial_balance (bigint, puede ser negativo: tarjeta),
  is_archived, **counts_as_liquid**.
- **categories**: id, user_id, name, kind, icon, color, parent_id (subcategorías de **un nivel**),
  sort_order, is_archived.
- **transactions**: id, user_id, type, nature, **status** (posted|pending, default posted), amount
  (>0), account_id, transfer_account_id, category_id, occurred_on (date), note, recurring_rule_id,
  occurrence_date.
- **recurring_rules**: id, user_id, type (solo income|expense), nature, amount, account_id,
  category_id, note, frequency, start_date, end_date, is_active, **confirmation_mode**.
- **budgets**: id, user_id, category_id (categoría principal de gasto), amount (>0), is_active,
  unique(user_id, category_id).

**CHECK de transactions:** si `type='transfer'` → `transfer_account_id` obligatorio y distinto de
`account_id`, `nature`/`category_id` nulos. Si `income|expense` → `category_id` y `nature`
obligatorios, `transfer_account_id` nulo.

**Índices clave:** único `(recurring_rule_id, occurrence_date)`, `(user_id, occurred_on desc)`,
`(user_id, account_id)`, `(user_id, category_id)`, `(user_id, status)`.

**FKs:** `account_id`/`transfer_account_id`/`category_id` con `on delete restrict` (se archiva, no
se borra). `user_id` y `budgets.category_id` con `on delete cascade`.

### 7.3 Vista `account_balances`
`security_invoker = true`. Saldo = `initial_balance + ingresos − gastos − transferencias salientes
+ transferencias entrantes`, **solo movimientos `posted`**. Incluye `counts_as_liquid`.

### 7.4 "Disponible hoy" v2 (fórmula)
```text
liquidBalance  = suma de saldos de cuentas activas con counts_as_liquid = true
horizonDate    = próxima ocurrencia (estrictamente posterior a hoy) de la regla recurrente activa
                 de INGRESO BASE más cercana; si no hay, el primer día del mes siguiente
daysToIncome   = max(1, días calendario entre hoy y horizonDate)
committed      = ocurrencias de reglas recurrentes activas de GASTO con fecha entre mañana y el día
                 anterior a horizonDate (inclusive) + gastos PENDIENTES de confirmar
extraCushion   = max(0, ingresos extra del mes − gastos extra del mes)
availableTotal = liquidBalance − committed
availableBase  = availableTotal − extraCushion   (si includeExtras = false)
                 availableTotal                   (si includeExtras = true)
spentToday     = gastos publicados de hoy (sin transferencias)
allowanceToday = floor( max(0, availableBase + spentToday) / daysToIncome )
remainingToday = max(0, allowanceToday − spentToday)
```
Supuestos: cuentas no líquidas no aportan; las transferencias nunca cuentan como gasto/ingreso; los
extras se muestran aparte como colchón y por defecto **no inflan** el número; los gastos pendientes
sí reducen el disponible aunque no estén publicados. Implementación:
`src/features/summary/utils/availableToday.ts` (`calculateAvailableToday`), con `explainAvailable`
para el texto de ayuda.

Existe una v1 editable: si el producto cambia, se edita primero `docs/DATA_MODEL.md`.

---

## 8. Arquitectura de la app

- **Capas:** Pantalla (`app/`) → hook de feature → api de feature → Supabase.
- **Providers (`app/_layout.tsx`):** `PersistQueryClientProvider` (offline) → `AuthProvider` →
  `Stack`, más carga de fuente Manrope/splash, tema y `SnackbarHost`. Overlays/hooks:
  `LockOverlay`/`useBiometricLock`, `useRecurringGeneration`, `useReminderScheduling`,
  `useAuthDeepLink`, `useOfflineSync`.
- **Protección de rutas:** `(auth)` redirige a `/` si hay sesión (salvo recuperación); `(tabs)`
  redirige a `/login` sin sesión y a `/reset-password` si `isRecoverySession`.
- **Registro rápido:** `transaction-form` con `presentation: 'fullScreenModal'`. Al bloquear se
  cierra el modal (`dismissAll`); al desbloquear se fuerza `/`.
- **Modo de tema:** store Zustand persistido (`system | dark | light`), **default dark**.
- **Biometría:** bloqueo opcional tras 30 s en segundo plano (`LOCK_DELAY_MS`, `shouldLock`),
  `biometricEnabled` persistido en SecureStore; `isLocked` no se persiste.
- **Offline (R5.3):** `onlineManager` ↔ NetInfo (`src/lib/netinfo.ts`); `PersistQueryClientProvider`
  con AsyncStorage (`src/lib/persister.ts`), `gcTime`/`maxAge` 7 días. Solo se dehydratan las
  **creaciones** de movimientos `paused` (id `randomUUID` de expo-crypto en las variables de la
  mutación; idempotente ante 23505) y las queries `success`. Nunca se persisten tokens. Al cerrar
  sesión se limpia caché + cola (`queryClient.clear()` + `persister.removeClient()`).
  Editar/eliminar usan `networkMode: 'online'` (sin red no se ejecutan).
  `resumePausedMutations()` al restaurar caché, al iniciar con sesión y al recuperar conexión.
- **Deep links de auth (R6.2, PKCE):** `flowType: 'pkce'`; `Linking.createURL('/reset-password')`
  y `/confirm-email`; `useAuthDeepLink` parsea con `parseAuthLink` (pura) y canjea con
  `exchangeCodeForSession` (respaldo: `setSession`). `useAuthLinkStore` (en memoria) controla
  `isRecoverySession`. Scheme de app: **`finanzas`**.

---

## 9. Sistema de diseño v3

Fuente de verdad visual: `docs/DESIGN_SYSTEM.md`. Todos los valores salen de `src/theme`.

La v3 ("bloque de color") monta cada pantalla sobre un **bloque** superior a color (marca, o
degradado marca→marca→fondo en las pantallas con scroll) con título y controles en `onBrand`/
`onBrandMuted`, y un **Sheet** (superficie de esquinas redondeadas) con el contenido. `ScreenScaffold`
(`variant="block" | "plain"`) lo arma; `BlockHeader` + `Sheet` son las piezas.

- **Identidad:** tema **oscuro por defecto**; marca **índigo** (`brand`) separada de los colores
  semánticos; diseño **plano (sin sombras)**; fuente **Manrope** con cifras tabulares.
- **Color (tokens, claro/oscuro):** `bg`, `surface`, `surfaceRaised`, `surfaceHigh`, `border`,
  `textPrimary`, `textSecondary`, `textMuted`, `brand`, `brandSoft`, `brandText`, `onBrand`,
  `onBrandMuted`, `income` (verde = entra), `expense` (coral = sale), `extra` (ámbar = extra),
  `extraFill`, `extraSoft`, `danger`, `dangerSoft`, `scrim`. Test de contraste WCAG AA
  (`src/theme/__tests__/contrast.test.ts`).
- **Fichas de color:** `tilePalette` (`TileKey` + `getTileColors` + `resolveTileKey`) y
  `categoryPalette` (12 colores) alimentan `IconTile`. Las aliases v2 (`background`, `primary`,
  `onPrimary`) se **eliminaron**.
- **Tipografía:** `displayLg` 44/52, `display` 34/40, `title` 24/30, `subtitle` 17/24, `body`
  15/22, `bodyStrong` 15/22 (600), `caption` 12/16, `micro` 11/14. Todo escala con el sistema.
- **Espaciado/radios/alturas:** espaciado 4–40; radios sm 8/md 12/lg 16/xl 20/sheet 28/pill; botón
  52, campo 52, chip 32, tag 20, fila lista ≥64, tab bar 64, icon button 44, áreas táctiles 44.
- **Componentes (`src/components/ui`):** `ScreenScaffold`, Screen, Text, Button (primary/secondary/
  ghost/destructive), Input, Card, Chip, SegmentedControl, ListRow, Tag, ProgressBar, StackedBar,
  BottomSheet, Skeleton, EmptyState, LoadingState, ErrorState, Snackbar(+Host), MoneyText,
  AnimatedNumber, NumericKeypad, SwipeableRow, MonthSelector, ScreenHeader, IconButton, IconTile,
  Avatar, Switch, AppIcon, ConnectivityPill, TabBar. Gráficos: `src/components/charts` (DonutChart,
  GroupedBarChart).
- **Haptics** (`src/lib/haptics.ts`): `tap` (primary y +), `select` (chips/segmentos/teclas),
  `success` (guardar), `warning` (eliminar), `error` (validación).
- **Animación:** rápida 150 ms, estándar 220 ms, lenta 320 ms; conteo 300–600 ms; con "reducir
  movimiento" las animaciones se **desactivan** (no se acortan).
- **Regla de lint:** prohíbe hex/rgb fuera de `src/theme` y de tests; prohíbe importar Ionicons
  fuera de `AppIcon`.

---

## 10. Pantallas (UX)

Fuente de verdad: `docs/UX_SPEC.md`.

- **Navegación:** barra de 5 elementos — Inicio, Movimientos, **(+) central** (abre el modal de
  registro, no es pestaña), Planificar, Más. Las pantallas secundarias (cuentas, categorías,
  recurrentes, presupuestos, análisis, exportar, eliminar cuenta) se abren sobre la pila con botón
  atrás (Exportar y Eliminar cuenta usan BottomSheet/pantalla según el caso).
- **Inicio:** encabezado (saludo + MonthSelector + acceso a análisis); tarjeta héroe "Disponible
  hoy" (monto animado, ProgressBar, pie "Gastaste X de Y" + "N días a tu pago", colchón extra,
  estado "sin margen", ayuda con desglose); banner "N pagos por confirmar"; tarjeta "Este mes"
  (StackedBar base/extra + % de extras); cuentas en fila horizontal; "Recientes" (hasta 5).
- **Registro rápido (modal):** SegmentedControl Gasto/Ingreso/Transferencia; monto `displayLg` con
  teclado propio (máx 12 dígitos); chips Cuenta/Fecha/Base-Extra/Nota; cuadrícula 3 columnas (5 más
  usadas en 60 días + "Más"); tocar categoría con monto > 0 guarda + Snackbar "Guardado"/"Deshacer";
  transferencia oculta categorías y muestra "Desde/Hacia".
- **Movimientos:** encabezado + MonthSelector + búsqueda/filtros; franja Ingresos/Gastos/Balance;
  lista por día con totales; deslizar para eliminar con "Deshacer"; sección "Por confirmar".
- **Planificar:** Presupuestos (resumen + barra) · Pagos e ingresos recurrentes · Análisis.
- **Presupuestos:** MonthSelector; lista con ProgressBar; umbrales ok/near/over; crear/editar en
  BottomSheet.
- **Análisis:** bloque con título + MonthSelector + primera frase de insights; Donut Gastos|Ingresos +
  lista por categoría (top 6 + "Otros") con fichas de color; "Últimos 6 meses" (barras agrupadas);
  "Base y extras".
- **Recurrentes:** lista con switch; formulario con switch "Pedir confirmación cada vez" (solo
  gastos).
- **Sin conexión:** píldora "Sin conexión · N por sincronizar"; filas "Sin sincronizar"/"No se
  guardó"; Snackbars específicos.
- **Más:** Organización (Cuentas, Categorías); Preferencias (Apariencia, Incluir extras, Bloqueo
  biométrico, Recordatorios); Datos (Exportar movimientos); Cuenta (Cerrar sesión, Eliminar
  cuenta); pie con versión.
- **Autenticación:** wordmark "Finanzas"; títulos "Inicia sesión"/"Crea tu cuenta"/"Recupera tu
  contraseña"; mostrar/ocultar contraseña; formulario no tapado por el teclado.

---

## 11. Features en detalle

### 11.1 Auth (`src/features/auth`)
- `api/auth.ts`: signUp, signIn, signOut, resetPassword, getSession, `recoveryRedirectTo`,
  `confirmationRedirectTo`. `hooks/AuthProvider.tsx`. `utils/authErrors.ts` (traducción de errores).
- Deep links (`utils/authLink.ts`, `hooks/useAuthDeepLink.ts`, `store/useAuthLinkStore.ts`).
- Pantallas: login, register, forgot-password, reset-password, confirm-email, verify-email.
- Biometría (`hooks/useBiometricLock.ts`, `store/useBiometricStore.ts`, `utils/biometrics.ts`).
- Eliminar cuenta (`api/deleteAccount.ts`, `utils/deleteAccount.ts`, `app/delete-account.tsx`):
  escribe `ELIMINAR`, invoca la Edge Function y limpia todo el estado local.

### 11.2 Cuentas
- Vista `account_balances`; CRUD + archivar (no la última activa); switch "Cuenta para gastar"
  (default por tipo).

### 11.3 Categorías
- Subcategorías de un nivel; archivo en cascada; validación de nombres
  (`utils/categories.ts`); "Ver archivadas" + restaurar; `CategoryPicker`.

### 11.4 Movimientos
- Schemas zod discriminados; `listTransactions` (cursor), `getTransactionsInRange`,
  create/update/delete; `api/export.ts` (paginado en bloques de 1000).
- `utils`: `calculateTotals`, `groupTransactionsByDay`, `monthRange`, `formatDayHeader`,
  `formatMonthLabel`, `rankCategoriesByUsage`, `transactionsToCsv`, `classifyMutationError`,
  `offlinePresentation`, `confirm`, `form`, `schemas`, `ranking`.

### 11.5 Recurrentes
- `utils/recurrence.ts` (`getOccurrences`, `getNextOccurrence`, `formatFrequency`);
  `generateDueTransactions` idempotente (reglas `auto` publican; `confirm` generan `pending`);
  recordatorios locales (`expo-notifications`; limitados en Expo Go).

### 11.6 Resumen/Inicio
- `utils/availableToday.ts`, `utils/explain.ts`, `utils/summary.ts` (`calculateMonthSummary`: base/
  extra + `extraDependency`), `hooks/useAvailableToday.ts`, `store/usePreferencesStore.ts`.

### 11.7 Presupuestos
- `utils/budgetProgress.ts` (`ok` <85%, `near` 85–100% con expense@0.65, `over` >100%; nunca ámbar);
  subcategorías acumulan a la madre.

### 11.8 Análisis
- `utils/analysis.ts` (`spendingByCategory` top 6 + "Otros", `monthlyTrend` 6 meses,
  `extraShareByMonth`, `buildInsights` 0–3 frases), `utils/pagination.ts` (bloques de 1000).

### 11.9 Exportar
- `ExportSheet` (BottomSheet) desde Más: rango Este mes/Año/Todo; CSV con `;`, BOM UTF-8, escape;
  `expo-file-system` + `expo-sharing`.

---

## 12. Testing y calidad

- **Comandos:** `npm.cmd run typecheck` (tsc --noEmit), `npm.cmd run lint`, `npm.cmd test`,
  `npm.cmd run format`, `npx.cmd expo export --platform android`.
- **Estado verificado (2026-10-16):** typecheck ✅ · lint ✅ (0 errores, **2 warnings**
  preexistentes de React Compiler + react-hook-form en `app/recurring-form.tsx` y
  `app/transaction-form.tsx`) · **509 tests / 71 suites** ✅ · `expo export --platform android` ✅.
- **Ruido de consola:** en el test de ProgressBar, `act(...)` de `Animated` (no falla).
- **`npm audit`:** 67 (17 moderate, 50 high, 0 critical); en producción solo
  `decode-uri-component` (moderado, DoS) vía `expo-router`→`query-string`, sin fix compatible con
  el SDK. Revisar antes de publicar.
- **`expo-doctor`:** 21/21 tras quitar `eas-cli`.

---

## 13. Seguridad

- Sin secretos en código ni historial; `.env` ignorado; solo `.env.example` versionado.
- `service_role` **solo** en el entorno de la Edge Function `delete-account`.
- RLS 6 tablas / 24 políticas, solo `authenticated`. Scripts de verificación con dos usuarios
  (`002_rls_test.sql`, `003_rls_test_v2.sql`).
- Sin `console.*`, `error.message` crudo ni `Alert.alert` en `app/`/`src/`. El caché persistido no
  contiene tokens.
- Reporte: `docs/SECURITY_REVIEW.md`.

---

## 14. Historial completo de prompts

Tres guías: `guia-prompts-app-finanzas.md` (P0.1–P10.1),
`guia-prompts-rediseno-app-finanzas.md` (R0.1–R6.4, con Anexos A/B = design system y UX spec) y
`guia-prompts-ui-v3-app-finanzas.md` (R7.0–R7.14, rediseño v3 "bloque de color", con Anexo B de QA).

### 14.1 Guía 1 (P0.1 – P10.1)
| Prompt | Qué hizo | Estado |
|---|---|---|
| P0.1 | Documentación maestra (AGENTS, PRD, ARCHITECTURE, DATA_MODEL, PROGRESS, .gitignore, .env.example) | ✅ |
| P1.1 | Proyecto Expo SDK 57 (Router, TS estricto, alias `@/`) | ✅ |
| P1.2 | ESLint+Prettier+Jest, scripts, date-fns, `money.ts` | ✅ |
| P1.3 | Sistema de diseño inicial (theme, i18n, componentes UI, preview) | ✅ |
| P1.4 | Cliente Supabase (AsyncStorage, AppState) + QueryClient y provider | ✅ |
| P2.1 | Migración 001 (esquema) | ✅ |
| P2.2 | Migración 002 (RLS) + fix anti-recursión | ✅ |
| P2.3 | Migración 003 (usuario nuevo) | ✅ |
| P2.4 | `types/database.ts` y cliente tipado | ✅ |
| P3.1 | Auth completo + pestañas + protección de rutas | ✅ |
| P3.2 | Bloqueo biométrico | ✅ |
| P4.1 | Cuentas (saldos, CRUD, archivar) | ✅ |
| P5.1 | Categorías (subcategorías, picker, archivar) | ✅ |
| P5.1b | Cascada de archivo + validación de nombres | ✅ |
| P5.1c | Ver archivadas + restaurar | ✅ |
| P6.1 | Capa de datos de movimientos | ✅ |
| P6.2 | Pantalla de registro (modal) | ✅ |
| P6.3 | Lista de movimientos (mes, filtros, deshacer, paginación) | ✅ |
| P6.4 | Transferencias | ✅ |
| P7.1 | Reglas recurrentes | ✅ |
| P7.2 | Generación automática + migración 004 | ✅ |
| P7.3 | Recordatorios locales | ✅ |
| P8.2 | UI de Inicio + lógica de resumen | ✅ |
| P9.1 | Calidad/accesibilidad/rendimiento | ✅ |
| P9.2 | Auditoría de seguridad + script RLS + SECURITY_REVIEW | ✅ |
| P10.1 | Publicación (EAS y tiendas) | ⏸️ pendiente |

### 14.2 Guía 2 (R0.1 – R6.4): rediseño v2
| Prompt | Qué hizo | Estado |
|---|---|---|
| R0.1 | Actualiza memoria (AGENTS, DECISIONS, DATA_MODEL v2, PRD, ARCHITECTURE) | ✅ |
| R1.1 | Migración 005 (`counts_as_liquid`) + switch de cuenta | ✅ |
| R1.2 | `calculateAvailableToday` (fórmula v2) + tests | ✅ |
| R1.3 | Hook `useAvailableToday`, `usePreferencesStore`, `explainAvailable` | ✅ |
| R2.1 | Fundamentos v2: tokens, Manrope, tema, `tint`, contraste, lint de colores | ✅ |
| R2.2 | Componentes base v2 | ✅ (último commit) |
| R2.3 | Componentes de visualización | ✅ (sin commit) |
| R2.4 | Interacción (haptics, teclado, animaciones, gestos) | ✅ (sin commit) |
| R3.1 | Navegación de 5 elementos (TabBar, Planificar, Más) | ✅ (sin commit) |
| R4.1 | Inicio rediseñado | ✅ (sin commit) |
| R4.2 | Registro rápido rediseñado | ✅ (sin commit) |
| R4.3 | Movimientos rediseñado | ✅ (sin commit) |
| R4.4 | Auth y estados con personalidad | ✅ (sin commit) |
| R4.5 | Pulido de interacción y accesibilidad | ✅ (sin commit) |
| R5.1 | Presupuestos + migración 006 | ✅ (sin commit) |
| R5.2 | Análisis con gráficos propios | ✅ (sin commit) |
| R5.3 | Offline: infraestructura | ✅ (sin commit) |
| R5.4 | Offline: experiencia de usuario | ✅ (sin commit) |
| R5.5 | Recurrentes con confirmación + migración 007 | ✅ (sin commit) |
| R5.6 | Exportar movimientos a CSV | ✅ (sin commit) |
| R6.1 | Eliminar cuenta (Edge Function + pantalla) | ✅ (sin commit) |
| R6.2 | Deep links (confirmar correo y recuperar contraseña) | ✅ (sin commit) |
| R6.3 | Auditoría de seguridad y dependencias | ✅ (sin commit) |
| R6.4 | Checklist de QA y cierre | ✅ (sin commit) |

### 14.3 Guía 3 (R7.0 – R7.14): rediseño v3 "bloque de color"
| Prompt | Qué hizo | Estado |
|---|---|---|
| R7.0 | Rama `feat/ui-v3` y documentos del diseño v3 | ✅ |
| R7.1 | Tokens v3 (colores, tipografía, radios, `tilePalette`/`categoryPalette`) + contraste | ✅ |
| R7.2 | Barras del sistema (edges-to-edge) | ✅ |
| R7.3 | Iconos rellenos y fichas de color (`IconTile`) | ✅ |
| R7.4 | Piezas base: bloque, `Sheet`, `Switch`, `Avatar`, variantes | ✅ |
| R7.5 | Barra de pestañas v3 | ✅ |
| R7.6 | Inicio | ✅ |
| R7.7 | Registro rápido | ✅ |
| R7.8 | Movimientos | ✅ |
| R7.9 | Planificar y Presupuestos | ✅ |
| R7.10 | Más | ✅ |
| R7.11 | Cuentas y Categorías | ✅ |
| R7.12 | Login, registro y estados vacíos y de error | ✅ |
| R7.13 | Análisis | ✅ |
| R7.14 | Auditoría final y limpieza | ✅ (sin commit) |

---

## 15. Estado actual

- **Código:** rediseño v2 (R2.3→R6.4) y rediseño v3 (R7.0→R7.14) implementados, con typecheck,
  lint y tests en verde (509/71).
- **Git:**
  - Rama **`feat/ui-v3`**; último commit **`dedbe65`** `docs: agrega guía de prompts del rediseño
    UI v3 (R7.0-R7.14)`.
  - Trabajo de R7 **sin commitear** en el árbol de trabajo.
  - Existen `main`, `feat/redesign` y `feat/ui-v3` (locales y en `origin`). El PR va de
    `feat/ui-v3` → `feat/redesign` → `main`.
- **Base de datos:** migraciones **001–007 aplicadas** (006 y 007 lo estaban ya desde R5.1/R5.5).
- **Documentación:** `docs/APP_GUIDE.md` y este `CLAUDE.md` actualizados a v3; `docs/QA_VISUAL.md`
  creada (checklist de QA visual v3); `docs/PROGRESS.md` con la entrada de R7.14.

---

## 16. Pendientes y bloqueantes

### 16.1 Base de datos
- Migraciones **001–007 aplicadas**. (Un snapshot previo de este archivo decía que 006 y 007
  estaban pendientes y rompían Inicio; ya no aplica.)
- Verificación pendiente: correr `supabase/tests/003_rls_test_v2.sql` con **dos usuarios reales** y
  confirmar PASS.

### 16.2 Verificación manual heredada (✋)
- Recorrer `docs/QA_VISUAL.md` (checklist v3) en un dispositivo real, en claro y oscuro, y enviar
  capturas finales. (`docs/QA_CHECKLIST.md` sigue disponible como checklist general.)
- Correr `supabase/tests/003_rls_test_v2.sql` con **dos usuarios reales** y confirmar PASS.
- Desplegar la Edge Function `delete-account`.
- En Supabase (Authentication → URL Configuration): agregar Redirect URLs `finanzas://**` y
  `exp://**`; reactivar "Confirm email"; probar ambos flujos con un correo real (idealmente en
  development build).
- Probar en development build (no Expo Go): biometría plena, recordatorios, exportar CSV (los
  módulos nativos no funcionan del todo en Expo Go).

### 16.3 Decisiones abiertas
- **Dependencias sin uso** detectadas (no desinstaladas aún): `expo-image`, `expo-web-browser`,
  `expo-device`. `expo-system-ui` se conserva (probablemente requerido por `userInterfaceStyle` en
  Android).
- **Discrepancias docs vs código** (§17.3): decidir si se actualizan los docs, se corrige el código,
  o se deja.
- **Polyfill PKCE** (§17.2): decidir si se aplica.

### 16.4 Publicación (P10.1)
- Cuenta Expo/EAS, identificadores (`bundleIdentifier`/`package`), `eas.json`, `RELEASE.md`,
  `PRIVACY_POLICY.md`, cuentas Google Play/Apple, URL pública de eliminación de cuenta, revisar
  `npm audit`.
- Antes: unir el trabajo a `main` de forma ordenada (hoy está todo sin commitear).

---

## 17. Problemas conocidos y riesgos

### 17.1 Base de datos
Migraciones 001–007 aplicadas (corrige la nota anterior, ya obsoleta). Pendiente la verificación RLS
con dos usuarios reales (§16.1).

### 17.2 Warning de PKCE (WebCrypto)
`@supabase/auth-js` avisa: *"WebCrypto API is not supported. Code challenge method will default to
use plain instead of sha256."* Hermes no incluye `crypto.subtle`, así que PKCE cae a `plain` (la
app funciona, pero con menor calidad criptográfica). **Fix sugerido sin dependencias nuevas:**
polyfill de `globalThis.crypto.subtle.digest` con `expo-crypto` (`Crypto.digest(SHA256, data)`) en
`src/lib/supabase.ts`, antes de crear el cliente.

### 17.3 Discrepancias `docs/DESIGN_SYSTEM.md` + `docs/UX_SPEC.md` vs código
Los documentos **no** se modificaron. Diferencias detectadas:
1. Planificar: la fila "Pagos e ingresos recurrentes" no muestra "cantidad de reglas activas y
   próxima fecha" (`app/(tabs)/plan.tsx`).
2. Presupuestos: botón "Nuevo presupuesto" vs doc "Agregar presupuesto".
3. Transferencia: "Las cuentas de origen y destino deben ser distintas." vs doc "Elige cuentas
   distintas".
4. Edición de movimiento: "Eliminar movimiento" vs doc "Eliminar".
5. Filtros de Movimientos: orden tipo→naturaleza→cuenta→categoría vs doc cuenta→categoría→tipo→
   naturaleza.
6. Filtros: "Limpiar filtros" vs doc "Limpiar".
7. Inicio "Este mes": "Ingresos del mes"/"Gastos del mes" vs doc "Ingresos"/"Gastos".
8. Encabezado de día: "mar 7 de oct" vs doc "mar 7 oct".
9. Márgenes laterales de pantalla: 16 vs doc 20.
10. Card: borde `hairline` en ambos temas vs doc "1 px solo en claro".
11. `tint` de fondos suaves: siempre 0.16 vs doc 0.16 (oscuro) / 0.12 (claro).
12. Snackbar: 5000 ms y `bottom:24` (solapa la barra) vs doc 4 s "sobre la barra".
13. Accesibilidad: `MoneyText` usa `$ 87.500` como label, no palabras ("87.500 pesos").
14. `app/recurring-form.tsx` usa `fontSize 36/lineHeight 44` fuera de tokens.

Sospechosas/no verificables: variante `subtitle` del título del modal; "Cancelar" como `Pressable`
y no `ghost`; chip "Nota (opcional)"; ícono de recurrente en `trailing` (doc: en el subtítulo);
acciones de filas fallidas en BottomSheet (doc: inline); número mínimo de insights; orden de campos
del formulario de recurrentes; separación 16 vs 12 entre tarjetas; color del primary presionado.

**Diferencias del rediseño v3 (auditoría R7.14; docs sin modificar):**
1. **`recurring.tsx`, `recurring-form.tsx` y `delete-account.tsx` no tienen prompt R7**: conservan
   la estructura v2 (`Screen`/`ScreenHeader`, enlaces de texto, `Switch` v3 ya migrado) en vez del
   bloque + `Sheet` de la v3.
2. **`Screen` (v2) sigue existiendo** y en uso solo por esas pantallas y por los *early-returns* de
   carga/error de algunos formularios. La v3 usa `ScreenScaffold`.
3. **`Snackbar`**: posición `left/right: 16`, `bottom: 24` fija (no considera la barra de pestañas
   ni la zona segura), frente al doc "12 px sobre la barra de pestañas". Duración 4000 ms (correcta).
4. **`app/recurring-form.tsx`**: `styles.amountDisplay` con `fontSize: 36` / `lineHeight: 44`
   literales (no salen de tokens).
5. **`SegmentedControl`**: alto 40 (spec) con `hitSlop` vertical para llegar a 44 px de área táctil;
   `Chip` igual (32 + `hitSlop`).

### 17.4 Ruido/dependencias
- 2 warnings de lint preexistentes (React Compiler + react-hook-form).
- `npm audit`: 50 high + 17 moderate, casi todo tooling; `decode-uri-component` sí alcanzable en
  runtime.

---

## 18. Recomendaciones / próximos pasos

Orden sugerido:

1. **QA visual v3:** recorrer `docs/QA_VISUAL.md` en dispositivo real (claro y oscuro) y enviar
   capturas finales.
2. **Aplicar el polyfill de PKCE** con `expo-crypto` (§17.2): sin dependencias nuevas y mejora la
   seguridad del flujo de recuperación/confirmación.
3. **Abrir el PR** de `feat/ui-v3` → `feat/redesign` → `main` (commits por fase o uno de cierre).
4. **Correr `docs/QA_CHECKLIST.md`** en un dispositivo real y adjuntar capturas.
5. **Resolver las decisiones abiertas:** quitar dependencias sin uso (con permiso), y decidir sobre
   las 14 discrepancias de diseño (mi recomendación: actualizar `docs/UX_SPEC.md`/
   `docs/DESIGN_SYSTEM.md` donde el código es coherente y consciente, y corregir el código en los
   casos que son claramente bugs — p. ej. el borde del Card, la duración/posición del Snackbar, el
   `MoneyText` en palabras y la tipografía fuera de tokens de `recurring-form`).
6. **Development build** para probar biometría/notificaciones/exportar de verdad.
7. **P10.1:** publicar (EAS + tiendas + política de privacidad + URL de borrado de cuenta).
8. **Housekeeping:** borrar usuarios de prueba y, si ya no se necesita, el proyecto pausado.
9. Añadir CI (GitHub Actions) con `typecheck` + `lint` + `test` antes de publicar (sugerencia).

---

## 19. Comandos rápidos (Windows)

```powershell
# Calidad (siempre antes de cerrar una tarea)
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run format

# Servidor de desarrollo (deja el QR visible)
npm.cmd start            # o: npx.cmd expo start
# Recargar en la ventana de Expo: tecla r

# Bundles
npx.cmd expo export --platform android

# Dependencias
npx.cmd expo install --check
npx.cmd expo install --fix
npx.cmd expo-doctor

# Dispositivo por USB (si adb no se cuelga)
adb reverse tcp:8081 tcp:8081      # abrir Expo Go en exp://localhost:8081
# Ver errores del dispositivo:
adb logcat -d -t 200 -s ReactNativeJS:E AndroidRuntime:E

# Supabase CLI (Edge Function)
supabase login
supabase link --project-ref blxqqytzehvzoakiydoo
supabase functions deploy delete-account
```

---

## 20. Glosario

- **Base / Extra:** naturaleza de un movimiento. Base = esperado/recurrente; Extra = ocasional.
- **Disponible hoy:** monto diario sugerido según la fórmula v2.
- **Colchón extra:** `max(0, ingresos extra del mes − gastos extra del mes)`; por defecto no infla
  el disponible.
- **Horizonte (`horizonDate`):** próximo ingreso base; ancla el gasto diario.
- **Comprometido (`committed`):** gastos recurrentes próximos + pendientes, hasta el horizonte.
- **Pendiente (`pending`):** movimiento generado por una regla `confirm`, a la espera de confirmar;
  no cuenta en saldos/totales.
- **Cuenta líquida (`counts_as_liquid`):** cuenta cuyo saldo entra en "Disponible hoy".
- **Registro rápido:** modal (+) para crear un movimiento en pocos toques.
- **RLS:** Row Level Security de Postgres (cada usuario solo ve sus filas).
- **PKCE:** flujo OAuth para deep links de auth.
- **Estado del proyecto:** MVP + rediseño v2 listos en código; falta aplicar 2 migraciones,
  commitear, verificar en dispositivo y publicar.

---

*Fin del contexto maestro. Si algo aquí contradice al código o a `docs/`, gana el código/`docs/`.
Mantén este archivo actualizado al cerrar tareas importantes.*

## Estado R8

R8.2-R8.6 aplicados: acciones r�pidas, �ltimos 7 d�as, categor�a sugerida y frecuentes, an�lisis interactivo, flujo del mes, micro-interacciones e ilustraciones.


## Resumen de trabajo R8 (R8.2 a R8.7)

### Prompts ejecutados
- R8.2 (Prompt Maestro #3): acciones r�pidas y tarjeta "�ltimos 7 d�as" en Inicio.
- R8.3 (Prompt Maestro #4): categor�a sugerida por nota y movimientos frecuentes en registro r�pido.
- R8.4 (Prompt Maestro #5): encabezado de An�lisis y barras interactivas de 6 meses.
- R8.5 (Prompt Maestro #6): flujo del mes interactivo (balance acumulado arrastrable).
- R8.6 (Prompt Maestro #7): micro-interacciones (PressableScale), Snackbar animado, ilustraciones de estados vac�os.
- R8.7 (Prompt Maestro #8): auditor�a final de consistencia y calidad.

### Archivos principales tocados
- app/(tabs)/index.tsx, app/analysis.tsx, app/transaction-form.tsx
- src/features/summary/components/QuickActions.tsx, DailySpendingCard.tsx
- src/features/summary/utils/dailySpending.ts (+tests)
- src/features/transactions/utils/suggestions.ts (+tests)
- src/components/charts/layout.ts, GroupedBarChart.tsx, CashFlowChart.tsx
- src/features/analysis/utils/cashFlow.ts (+tests)
- src/components/ui/PressableScale.tsx, EmptyIllustration.tsx, EmptyState.tsx, Snackbar.tsx, ListRow.tsx
- src/i18n/es.ts, docs/UX_SPEC.md, docs/PROGRESS.md, docs/QA_VISUAL.md, docs/APP_GUIDE.md

### Comandos de calidad (verde)
- npm run typecheck
- npm run lint (0 errores, avisos preexistentes)
- npm test (567 tests)

### Notas
- No se modific� l�gica de negocio existente salvo ampliaci�n de ventana de historial a 180 d�as.
- docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md solo editados donde el prompt lo permiti�.
