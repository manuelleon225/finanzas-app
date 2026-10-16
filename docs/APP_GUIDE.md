# Guía completa de la app "Finanzas" (para agentes de IA — Claude y otros)

Documento de contexto total del proyecto: qué es, arquitectura, modelo de datos, lógica,
pantallas, seguridad, historial de prompts ejecutados y estado actual. Léelo antes de tocar
cualquier cosa, junto con `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`,
`docs/DESIGN_SYSTEM.md`, `docs/UX_SPEC.md` y `docs/PROGRESS.md`.

---

## 1. Resumen del producto

App móvil (Android e iOS, un solo código) de **finanzas personales** orientada al mercado
**colombiano** (COP, ingresos por quincena, primas e ingresos irregulares).

Diferenciadores:

1. **Naturaleza del movimiento**: cada ingreso/gasto es `BASE` (esperado/recurrente) o `EXTRA`
   (ocasional/imprevisto). Permite ver el ingreso base real y cuánto se depende de los extras.
2. **"Disponible hoy" (v2)**: cuánto se puede gastar hoy sin romper el ciclo hasta el próximo
   ingreso base (ver §6 del modelo de datos).
3. **Registro rápido**: agregar un movimiento en 2–3 toques (botón **(+)** central + categoría),
   con montos recordados y sin botón de guardar.

Estado: **MVP completo (fases 1–9) + rediseño v2 (fases R0–R6)**. Verificado en dispositivo, en
verificación de cierre (R6.4). **No publicado** (publicación = P10.1 de la guía anterior, aún en
espera).

---

## 2. Stack y versiones

- **React Native 0.86.3 + Expo SDK 57** (Expo Router, TypeScript estricto, `typedRoutes`).
- **React 19.2.3**, **TypeScript ~6.0.3** (con React Compiler activado por `experiments`).
- **Supabase** (Postgres + Auth + RLS + Edge Functions). Cliente `@supabase/supabase-js` (PKCE).
- **TanStack Query 5** (datos del servidor) + **persistencia** (`persist-client` +
  `async-storage-persister`) para la cola offline.
- **Zustand 5** (solo UI; stores persistidos: tema, preferencias, prefs de recordatorios,
  biometría; en memoria: `useAuthLinkStore`).
- **react-hook-form 7** + **zod 4** (formularios/validación).
- **date-fns 4** (fechas). **@expo-google-fonts/manrope** (tipografía v2).
- **react-native-svg 15** (gráficos propios), **react-native-reanimated 4** +
  **react-native-gesture-handler** (BottomSheet, SwipeableRow, animaciones).
- **expo-haptics**, **expo-local-authentication**, **expo-secure-store**, **expo-notifications**
  (import dinámico), **@react-native-community/netinfo** (conectividad), **expo-crypto**
  (UUID offline), **expo-file-system** + **expo-sharing** (exportar CSV), **expo-linking** (deep
  links), **@react-native-community/datetimepicker** (elegir fecha).
- **jest-expo + @testing-library/react-native** (tests). **ESLint + Prettier**.
- **EAS**: aún no configurado (se hará en P10.1; `eas-cli` se quitó de devDependencies en R6.3).

---

## 3. Estructura de carpetas

```text
app/
  _layout.tsx               # raíz: providers + navegación + overlays (lock) + deep links
  (auth)/                   # sin sesión: login, register, forgot-password,
                            #   reset-password, confirm-email, verify-email
  (tabs)/                   # index (Inicio), movements, plan (Planificar), more (Más)
  transaction-form.tsx      # modal crear/editar movimiento (registro rápido)
  accounts.tsx / account-form.tsx
  categories.tsx / category-form.tsx
  recurring.tsx / recurring-form.tsx
  budgets.tsx / analysis.tsx / delete-account.tsx
src/
  components/ui/            # sistema de diseño (Screen, Text, Button, ... AppIcon)
  components/charts/        # DonutChart, GroupedBarChart (svg propio)
  features/
    auth/       accounts/    categories/  transactions/
    recurring/  summary/     budgets/     analysis/
      api/ hooks/ components/ utils/ store/
  lib/                      # supabase, queryClient, persister, netinfo, money, dates,
                            #   haptics, snackbar, useConnectivity
  theme/                    # tokens v2 (colors, typography, spacing, radii, metrics, tint)
  i18n/es.ts                # TODOS los textos de UI en español
  types/database.ts         # tipos del esquema (a mano)
supabase/
  migrations/001..007
  tests/002_rls_test.sql, 003_rls_test_v2.sql
  functions/delete-account/ # Edge Function (único código con privilegios elevados)
docs/                       # PRD, ARCHITECTURE, DATA_MODEL, DESIGN_SYSTEM, UX_SPEC,
                            #   DECISIONS, PROGRESS, SECURITY_REVIEW, QA_CHECKLIST, esta guía
```

---

## 4. Backend: Supabase

### Proyecto
- Project ref: `blxqqytzehvzoakiydoo` (URL `https://blxqqytzehvzoakiydoo.supabase.co`).
- Claves en `.env` (local, ignorado por git): `EXPO_PUBLIC_SUPABASE_URL` y
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (clave `publishable`; pública a propósito).
- **Nunca** usar la `service_role key` en la app: solo existe en el entorno de la Edge Function.

### Migraciones aplicadas (ejecutadas en Supabase, por este orden)
1. **001_schema.sql** — enums, tablas (profiles, accounts, categories, transactions,
   recurring_rules), CHECK de transactions, FKs (`on delete cascade`/`restrict`), índices,
   trigger `updated_at`, vista `account_balances` (`security_invoker = true`).
2. **002_rls.sql** — RLS en las tablas y políticas `authenticated` (sin `anon`), función
   `is_owned_category` (anti-recursión).
3. **003_new_user.sql** — `handle_new_user()`: al registrarse crea perfil, cuenta "Efectivo" y 16
   categorías por defecto (11 gastos + 5 ingresos).
4. **004_recurring_unique.sql** — el índice de recurrentes pasa a **normal**
   `(recurring_rule_id, occurrence_date)` (para que funcione el upsert `on_conflict`).
5. **005_accounts_liquid.sql** — `accounts.counts_as_liquid` (boolean, default `true`; `false` en
   `savings`/`credit_card` existentes); recrea `account_balances` con la columna al final.
6. **006_budgets.sql** — tabla `budgets` (presupuesto mensual por categoría principal de gasto),
   `unique (user_id, category_id)`, RLS con `WITH CHECK` (categoría del usuario, de gasto, sin
   madre) y trigger `updated_at`.
7. **007_pending_transactions.sql** — enum `transaction_status` (`'posted' | 'pending'`) y
   `transactions.status` (default `'posted'`); `recurring_rules.confirmation_mode`
   (`'auto' | 'confirm'`, default `'auto'`); recrea `account_balances` para sumar solo `posted`.

### Modelo de datos (resumen)
- `transactions`: type (income|expense|transfer), nature (base|extra; nulo en transfer), status
  (posted|pending), amount (bigint >0), account_id, transfer_account_id (nulo en income/expense),
  category_id (nulo en transfer; obligatorio en income/expense), occurred_on (date),
  recurring_rule_id/occurrence_date. Los `pending` **no** cuentan en saldos, totales, presupuestos
  ni análisis; sí comprometen el "Disponible hoy".
- `recurring_rules`: type (solo income|expense), nature, amount, account_id, category_id,
  frequency (weekly|biweekly|semimonthly|monthly), start_date, end_date (opcional), is_active,
  confirmation_mode.
- `budgets`: monto mensual por categoría principal de gasto.
- `account_balances` (vista): saldo = initial_balance + ingresos − gastos − transferencias
  salientes + transferencias entrantes; solo movimientos `posted`. Respeta RLS. Incluye
  `counts_as_liquid`.

### RLS (verificado con script de dos usuarios)
- RLS activo en **6 tablas**: profiles, accounts, categories, transactions, recurring_rules y
  budgets. 4 políticas por tabla (SELECT/INSERT/UPDATE/DELETE) = **24**, todas para
  `authenticated`; ninguna para `anon`.
- Cada usuario solo ve/modifica lo suyo (`user_id = auth.uid()`). Las políticas de escritura
  validan que `account_id`, `transfer_account_id`, `category_id` y `parent_id` sean del mismo
  usuario. En `budgets`, además, la categoría debe ser de gasto y sin madre.
- Scripts: `supabase/tests/002_rls_test.sql` (original, 7 casos) y
  `supabase/tests/003_rls_test_v2.sql` (cubre las 6 tablas, acceso cruzado, budgets, status,
  confirmation_mode y `counts_as_liquid`, con reporte PASS/FAIL).

### Edge Function
- `supabase/functions/delete-account/index.ts`: valida el JWT del usuario y llama a
  `auth.admin.deleteUser`. Es el **único** punto con `SUPABASE_SERVICE_ROLE_KEY`. Las filas caen
  por `on delete cascade`. Instrucciones de despliegue en `supabase/functions/README.md`.

---

## 5. Arquitectura de la app

- **Capas**: Pantalla → hook de feature → api de feature → Supabase. Las pantallas **no** llaman a
  Supabase directamente.
- **Wrappers en `app/_layout.tsx`**: `PersistQueryClientProvider` (offline) → `AuthProvider` →
  `Stack`, más `ThemeProvider`/fuente Manrope y `SnackbarHost`. Overlays/hooks: `LockOverlay`
  (bloqueo biométrico), `useBiometricLock`, `useRecurringGeneration`, `useReminderScheduling`,
  `useAuthDeepLink`, `useOfflineSync`.
- **Protección de rutas**: `(auth)` redirige a `/` si hay sesión (salvo sesión de recuperación);
  `(tabs)` redirige a `/login` si no la hay y a `/reset-password` si `isRecoverySession`.
- **Modal de movimiento**: `transaction-form` con `presentation: 'fullScreenModal'`; al bloquearse
  la app se cierra y al desbloquear se fuerza `/`.
- **Modo de tema**: store Zustand persistido (`system | dark | light`, default **dark**);
  `useTheme()` lo respeta. Tema oscuro por defecto (decisión de diseño v2).
- **Offline (R5.3, §8 de ARCHITECTURE.md)**: `onlineManager` conectado a NetInfo; persistencia del
  query cache en AsyncStorage (7 días); solo se dehydratan las **creaciones** de movimientos
  `paused` (id generado con `expo-crypto` en las variables de la mutación, idempotente) y las
  queries `success`. Nunca se persisten tokens: la sesión vive en el storage de Supabase. Al cerrar
  sesión se limpia el caché y la cola. Editar/eliminar requieren red.
- **Deep links de auth (R6.2, §9 de ARCHITECTURE.md)**: PKCE; `Linking.createURL` arma las URLs de
  recuperación (`/reset-password`) y confirmación (`/confirm-email`); `parseAuthLink` (pura)
  clasifica el enlace; `useAuthLinkStore` (en memoria) controla la bandera de recuperación.

---

## 6. Sistema de diseño y UI (v2)

Fuente de verdad: `docs/DESIGN_SYSTEM.md` (visual) y `docs/UX_SPEC.md` (estructura y textos). No se
inventan valores: todo sale de `src/theme`.

- **Tokens** (`src/theme`): color claro/oscuro (marca **índigo** `brand`; semánticos `income`
  verde, `expense` coral, `extra` ámbar, `danger`), tipografía Manrope (`displayLg`, `display`,
  `title`, `subtitle`, `body`, `bodyStrong`, `caption`, `micro`), espaciado, radios, alturas y
  duraciones. Helper `tint(color, opacity)`. Test de contraste WCAG AA (`contrast.test.ts`).
- **Componentes** (`src/components/ui`): Screen, Text, Button (primary/secondary/ghost/
  destructive), Input, Card, Chip, SegmentedControl, ListRow, Tag, ProgressBar, StackedBar,
  BottomSheet, Skeleton, EmptyState/LoadingState/ErrorState, Snackbar(+Host), MoneyText,
  AnimatedNumber, NumericKeypad, SwipeableRow, MonthSelector, ScreenHeader, IconButton, AppIcon
  (único punto de acceso a Ionicons), ConnectivityPill, TabBar. Gráficos en
  `src/components/charts` (DonutChart, GroupedBarChart).
- **Reglas**: sin sombras (jerarquía por tonos/tamaño/espacio); un solo botón primary por vista;
  ámbar exclusivo de "extra"; prohibidos hex/rgb y valores sueltos fuera de `src/theme` (regla de
  lint); nunca importar Ionicons fuera de `AppIcon`.
- **Haptics** (`src/lib/haptics.ts`): `tap` (botón primary y +), `select` (chips, segmentos,
  teclas), `success` (guardar), `warning` (eliminar), `error` (validación fallida).
- **Dinero**: entero de pesos, formateo `Intl es-CO` (usa `\u00a0` tras `$`); signo según el tipo;
  cifras tabulares. Fechas como texto `'YYYY-MM-DD'` local.

---

## 7. Features en detalle

### 7.1 Auth (`src/features/auth`)
- `api/auth.ts`: signUp, signIn, signOut, resetPassword, getSession y URLs de redirect
  (`recoveryRedirectTo`, `confirmationRedirectTo`). `hooks/AuthProvider.tsx`: contexto
  `{ session, user, loading }` + `onAuthStateChange`. `hooks/useAuthDeepLink.ts` +
  `utils/authLink.ts` (parseo/clasificación de enlaces). `store/useAuthLinkStore.ts` (bandera de
  recuperación, en memoria).
- Pantallas: login, register, forgot-password, reset-password, confirm-email, verify-email (con
  "Reenviar correo" y enfriamiento de 60 s). `AuthScaffold` con marca tipográfica, `PasswordInput`.
- `hooks/useBiometricLock.ts` + `store/useBiometricStore.ts`: bloqueo opcional con huella/Face ID
  tras volver del segundo plano (30 s, `LOCK_DELAY_MS`). `biometricEnabled` se persiste
  (SecureStore); `isLocked` no.
- `api/deleteAccount.ts` + `utils/deleteAccount.ts`: invoca la Edge Function y limpia el estado
  local (caché persistido, cola, stores, SecureStore, notificaciones).

### 7.2 Cuentas (`src/features/accounts`)
- Vista `account_balances` (solo no archivadas) con `counts_as_liquid`; total = suma de saldos.
- CRUD + archivar con confirmación; no se permite archivar la única cuenta activa.
- Form con nombre, tipo (chips), saldo inicial (puede ser negativo) y switch "Cuenta para gastar"
  (default según tipo: `true` cash/bank, `false` savings/credit_card).

### 7.3 Categorías (`src/features/categories`)
- Subcategorías de **un nivel** (`parent_id`).
- Reglas: archivo en **cascada** (madre → hijas); validación de nombres (`validateCategoryName`);
  "Ver archivadas" + restaurar (no restaurar hija si la madre sigue archivada; aviso al restaurar
  una madre); editar una categoría con hijas no permite convertirla en subcategoría.
- `CategoryPicker` reutilizable (acepta `additionIds` para conservar categorías archivadas al
  editar movimientos).

### 7.4 Movimientos (`src/features/transactions`)
- Esquema zod **discriminado por type** que replica los CHECK de la BD; filtra `status='posted'`
  donde corresponde.
- `api`: `listTransactions` (filtros + paginación por cursor), `getTransaction`,
  `getTransactionsInRange`, create/update/delete, `export.ts` (paginado en bloques de 1000).
- `hooks`: infinite query `useTransactions` y mutaciones que invalidan `transactions`, `accounts`
  y `summary`. Cola offline en `offline.ts` (mutationKey `['transactions','create']`).
- `utils` (puras, con tests): `calculateTotals`, `groupTransactionsByDay`, `monthRange`,
  `formatDayHeader`, `formatMonthLabel`, `rankCategoriesByUsage` (top 5 en 60 días),
  `transactionsToCsv` (separador `;`, BOM UTF-8, escape), `classifyMutationError`,
  `offlinePresentation`, `confirm`.
- **Registro rápido** (modal): monto con `NumericKeypad` (`applyKey`, máx 12 dígitos), tipo
  Gasto/Ingreso/Transferencia, chips Cuenta/Fecha/Base-Extra/Nota, cuadrícula de categorías (5 más
  usadas + "Más"), guarda al tocar categoría con monto > 0 + Snackbar "Guardado" con "Deshacer".
  Transferencia oculta categorías/naturaleza y muestra "Desde/Hacia". Edición: "Guardar cambios" y
  "Eliminar movimiento" (con confirmación).
- **Lista (Movimientos)**: SectionList por día con totales, franja resumen (Ingresos/Gastos/
  Balance), MonthSelector, búsqueda, filtros en BottomSheet, pull-to-refresh, paginación, editar al
  tocar y eliminar deslizando (`SwipeableRow`) con "Deshacer". Sección "Por confirmar".

### 7.5 Recurrentes (`src/features/recurring`)
- `utils/recurrence.ts`: `getOccurrences`, `getNextOccurrence`, `formatFrequency`. weekly=7 días,
  biweekly=14, semimonthly=días 15 y último del mes, monthly=mismo día (día inexistente → último
  del mes).
- Generación automática (`generateDueTransactions`, idempotente por índice único): corre al abrir la
  app y al volver del segundo plano (enfriamiento 1 h); retroactivo máx 12 meses. Reglas `auto`
  publican; reglas `confirm` generan movimientos `pending` (Tag "Por confirmar").
- Recordatorios locales (`expo-notifications`): switch + anticipación; programa los próximos 30 días
  de reglas de gasto a las 9:00. **En Expo Go no funciona** (SDK 53+): `remindersSupported()` evita
  cargar el módulo ahí (requiere development build).

### 7.6 Resumen e Inicio (`src/features/summary`)
- `availableToday.ts` (pura, v2): implementa la fórmula de `docs/DATA_MODEL.md` §6.
  `explainAvailable` (pura) genera el texto de ayuda de la tarjeta.
- `useAvailableToday(month)`: obtiene cuentas, reglas activas y movimientos publicados, lee
  `includeExtrasInAvailable` de `usePreferencesStore` y devuelve el resultado.
- `calculateMonthSummary` (pura): desglose Base/Extra de ingresos y gastos, balance y
  `extraDependency`.
- **Inicio**: encabezado (saludo + MonthSelector + acceso a Análisis), tarjeta héroe "Disponible
  hoy" (AnimatedNumber, ProgressBar, pie "Gastaste X de Y" + "N días a tu pago", colchón extra,
  estado "sin margen", ayuda con BottomSheet, aviso si falta ingreso recurrente), banner "N pagos
  por confirmar", tarjeta "Este mes" (StackedBar base/extra + dependencia de extras), cuentas en
  fila horizontal, "Recientes" con hasta 5 filas + "Ver todos". Skeletons, vacío/error y
  pull-to-refresh.

### 7.7 Presupuestos (`src/features/budgets`)
- `utils/budgetProgress.ts` (pura): `{ spent, remaining, ratio, status }` por presupuesto y totales.
  Subcategorías acumulan a la madre; transferencias ignoradas; estado `ok` (<85%), `near`
  (85%–100%, expense con opacidad 0.65) y `over` (>100%, expense). Nunca ámbar.
- Pantalla `budgets.tsx` (desde Planificar): MonthSelector, ListRow + ProgressBar, "{gastado} de
  {presupuesto}" y "Te quedan/Te pasaste {monto}"; crear/editar en BottomSheet con categoría
  principal de gasto sin presupuesto.

### 7.8 Análisis (`src/features/analysis`)
- `utils/analysis.ts` (puras): `spendingByCategory` (agrupa subcategorías en la madre y el resto en
  "Otros", top 6), `monthlyTrend` (6 meses), `extraShareByMonth`, `buildInsights` (0–3 frases).
  `utils/pagination.ts` pagina en bloques de 1000.
- Pantalla `analysis.tsx`: insights, SegmentedControl Gastos|Ingresos con DonutChart + lista por
  categoría, "Últimos 6 meses" (GroupedBarChart), "Base y extras". Estados carga/vacío/error.

### 7.9 Exportar (`src/features/transactions` + Más)
- `ExportSheet` (BottomSheet) desde Más: rango Este mes / Este año / Todo; genera CSV con
  `expo-file-system` y abre la hoja de compartir (`expo-sharing`); borra el temporal.

---

## 8. Testing y calidad

- Comandos: `npm run typecheck` (tsc --noEmit), `npm run lint`, `npm test` (jest), `npm run format`.
- **343 tests** en verde (51 suites): tema/contraste, money, dates, resumen y "Disponible hoy",
  recurrencia y generación, notificaciones, presupuestos, análisis, offline, deep links, CSV,
  componentes UI, schemas, etc.
- `npm audit`: 67 avisos (17 moderate, 50 high, 0 critical); casi todos en dev/build tooling. En
  producción, solo `decode-uri-component` (moderado, DoS) vía `expo-router`→`query-string`, sin
  corrección compatible sin saltar de SDK. Revisar antes de publicar.
- Avisos benignos conocidos:
  - React Compiler + react-hook-form (`react-hooks/incompatible-library`) → 2 warnings en
    `app/recurring-form.tsx` y `app/transaction-form.tsx`.
  - `act(...)` de `Animated` en el test de ProgressBar → ruido de consola, no falla.
  - "Cannot connect to Expo CLI" en Expo Go + USB (HMR) → inofensivo.

---

## 9. Seguridad (verificada)

- Sin secretos en código ni historial; `.env` ignorado; solo `.env.example` versionado (placeholders
  vacíos). La `service_role` solo existe en el entorno de la Edge Function `delete-account`.
- RLS: 6 tablas, 24 políticas solo `authenticated`; scripts de prueba con dos usuarios
  (`002_rls_test.sql`, `003_rls_test_v2.sql`).
- Sin `console.*` ni registro de datos financieros/tokens/correos. El caché persistido no contiene
  tokens.
- Reporte completo: `docs/SECURITY_REVIEW.md`.

---

## 10. Historial de prompts ejecutados

### Guía 1 (P0.1 – P10.1)

| Prompt | Qué se hizo | Estado |
|---|---|---|
| P0.1 | Documentación maestra (AGENTS, PRD, ARCHITECTURE, DATA_MODEL, PROGRESS, .gitignore, .env.example) | ✅ |
| P1.1 | Proyecto Expo SDK 57 (Expo Router, TS estricto, alias `@/`) | ✅ |
| P1.2 | ESLint+Prettier+Jest, scripts, date-fns, `money.ts` | ✅ |
| P1.3 | Sistema de diseño inicial (theme, i18n, componentes UI, preview) | ✅ |
| P1.4 | Cliente Supabase (AsyncStorage, AppState) + QueryClient y provider | ✅ |
| P2.1 | Migración 001 (esquema) | ✅ aplicada |
| P2.2 | Migración 002 (RLS) + fix anti-recursión | ✅ aplicada |
| P2.3 | Migración 003 (usuario nuevo con datos por defecto) | ✅ aplicada |
| P2.4 | `src/types/database.ts` y cliente tipado | ✅ |
| P3.1 | Auth completo + pestañas + protección de rutas | ✅ verificado en dispositivo |
| P3.2 | Bloqueo biométrico | ✅ verificado en dispositivo |
| P4.1 | Cuentas (vista de saldos, CRUD, archivar) | ✅ verificado |
| P5.1 | Categorías (subcategorías, picker, archivar) | ✅ |
| P5.1b | Reglas: cascada de archivo + validación de nombres | ✅ verificado en BD |
| P5.1c | Ver archivadas + restaurar + título "Nueva subcategoría" | ✅ |
| P6.1 | Capa de datos de movimientos (schemas, api, hooks, utilidades) | ✅ |
| P6.2 | Pantalla de registro (modal) | ✅ |
| P6.3 | Lista de movimientos (mes, filtros, deshacer, paginación) | ✅ |
| P6.4 | Transferencias | ✅ verificado |
| P7.1 | Reglas recurrentes (frecuencias, próxima fecha) | ✅ |
| P7.2 | Generación automática + migración 004 (índice único normal) | ✅ verificado en BD |
| P7.3 | Recordatorios locales (Expo Go limitado a dev build) | ✅ |
| P8.2 | UI de Inicio + lógica de resumen (P8.1 incluida) | ✅ |
| P9.1 | Calidad/accesibilidad/rendimiento (memo filas, a11y, limpieza) | ✅ |
| P9.2 | Auditoría de seguridad + script RLS + SECURITY_REVIEW.md | ✅ |
| P10.1 | Publicación (EAS y tiendas) | ⏸️ pendiente (se ejecuta tras R6.4) |

### Guía 2 (R0.1 – R6.4): rediseño v2

| Prompt | Qué se hizo | Estado |
|---|---|---|
| R0.1 | Actualizar memoria: AGENTS (reglas de agente ciego), DECISIONS, DATA_MODEL (fórmula v2), PRD, ARCHITECTURE | ✅ |
| R1.1 | Migración 005 (`counts_as_liquid`) + switch "Cuenta para gastar" | ✅ aplicada |
| R1.2 | `calculateAvailableToday` (fórmula v2) + tests | ✅ |
| R1.3 | Hook `useAvailableToday`, `usePreferencesStore`, `explainAvailable` | ✅ |
| R2.1 | Fundamentos v2: tokens, Manrope, modo de tema, `tint`, contraste, lint de colores | ✅ |
| R2.2 | Componentes base v2 (Screen, Text, Button, Input, Card, Chip, SegmentedControl, MoneyText) | ✅ |
| R2.3 | Componentes de visualización (ListRow, Tag, ProgressBar, StackedBar, Skeleton, estados, Snackbar, BottomSheet) | ✅ |
| R2.4 | Interacción (haptics, NumericKeypad, AnimatedNumber, SwipeableRow, MonthSelector, ScreenHeader, IconButton) | ✅ |
| R3.1 | Navegación de 5 elementos (TabBar, Planificar, Más; elimina Ajustes y Fab) | ✅ |
| R4.1 | Inicio rediseñado | ✅ |
| R4.2 | Registro rápido rediseñado | ✅ |
| R4.3 | Movimientos rediseñado | ✅ |
| R4.4 | Auth y estados con personalidad | ✅ |
| R4.5 | Pulido de interacción y accesibilidad (elimina preview) | ✅ |
| R5.1 | Presupuestos + migración 006 | ✅ aplicada |
| R5.2 | Análisis con gráficos propios (react-native-svg) | ✅ |
| R5.3 | Offline: infraestructura de cola (TanStack Query persistido) | ✅ |
| R5.4 | Offline: experiencia de usuario (píldora, pendientes, errores) | ✅ |
| R5.5 | Recurrentes con confirmación + migración 007 | ✅ aplicada |
| R5.6 | Exportar movimientos a CSV | ✅ |
| R6.1 | Eliminar cuenta (Edge Function + pantalla) | ✅ |
| R6.2 | Deep links (confirmar correo y recuperar contraseña) | ✅ |
| R6.3 | Auditoría de seguridad y dependencias | ✅ |
| R6.4 | Checklist de QA y cierre (QA_CHECKLIST.md, guía, limpieza) | ✅ |

---

## 11. Estado actual y pendientes

**Completado:** MVP (fases 1–9) + rediseño v2 (R0–R5) y bloqueantes de publicación (R6.1–R6.3).
En confirmación de cierre (R6.4).

**Pendientes / decisiones abiertas:**
- **✋ Verificación manual R6.4**: ejecutar `docs/QA_CHECKLIST.md` en dispositivo real y enviar
  capturas finales para la última revisión de diseño.
- **✋ Pasos manuales heredados**: ejecutar `003_rls_test_v2.sql` con dos usuarios; desplegar la
  Edge Function `delete-account`; en Supabase agregar Redirect URLs `finanzas://**` y `exp://**`,
  reactivar "Confirm email" y probar los flujos de correo.
- **P10.1 (publicación)**: cuenta Expo/EAS, identificadores (bundleIdentifier/package), `eas.json`,
  `RELEASE.md`, `PRIVACY_POLICY.md`, cuentas Google Play/Apple, URL pública de eliminación de cuenta.
- Revisar/actualizar devdeps antes de publicar; revisar `npm audit`.
- Borrar usuarios de prueba (`prueba.*@example.com`) cuando se desee.

---

## 12. Guía rápida para agentes futuros (cómo trabajar sobre esto)

1. **Nunca** empieces sin leer `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` y
   `docs/PROGRESS.md`; si tocas UI, además `docs/DESIGN_SYSTEM.md` y la sección de `docs/UX_SPEC.md`.
2. Cambios pequeños y enfocados; no refactorices lo que no se pidió. No edites migraciones ya
   aplicadas: las nuevas llevan el siguiente número.
3. **No puedes ver la pantalla**: nunca afirmes que algo "se ve bien". Verifica con tipos, tests y
   lint, y entrega siempre una lista **"Para revisar visualmente"**.
4. Todo valor visual sale de `src/theme` (prohibido hex/rgb y valores sueltos). Un solo botón
   primary por vista. Ámbar solo para "extra". Ionicons solo vía `AppIcon`.
5. Al terminar: `npm run typecheck`, `npm run lint`, `npm test`; actualizar `docs/PROGRESS.md`;
   responder con resumen + archivos + comandos/pasos manuales + "Para revisar visualmente" +
   mensaje de commit convencional; detenerte.
6. En este equipo Windows: usar `npm.cmd`/`npx.cmd` (política de PowerShell) y `adb` vía
   `cmd /c "…\platform-tools\adb.exe …"` si el envoltorio de PowerShell se cuelga. `rg` no está
   disponible.
7. Para probar en dispositivo (USB + adb): `adb reverse tcp:8081 tcp:8081` y abrir Expo Go con
   `exp://localhost:8081`; verificar por `adb logcat -d -t <N> -s ReactNativeJS:E AndroidRuntime:E`.
8. Las verificaciones de BD se pueden hacer con la publishable key vía REST (usuario de prueba),
   sin necesidad del service_role.

---

*Fin de la guía. Actualiza este documento cuando cambien decisiones importantes.*
