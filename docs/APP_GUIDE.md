# Guía completa de la app "Finanzas" (para agentes de IA — Claude y otros)

Documento de contexto total del proyecto: qué es, arquitectura, modelo de datos, lógica,
pantallas, seguridad, historial de prompts ejecutados y estado actual. Léelo antes de tocar
cualquier cosa, junto con `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` y
`docs/PROGRESS.md`.

---

## 1. Resumen del producto

App móvil (Android e iOS, un solo código) de **finanzas personales** orientada al mercado
**colombiano** (COP, ingresos por quincena, primas e ingresos irregulares).

Diferenciadores:

1. **Naturaleza del movimiento**: cada ingreso/gasto es `BASE` (esperado/recurrente) o `EXTRA`
   (ocasional/imprevisto). Permite ver el ingreso base real y cuánto se depende de los extras.
2. **"Disponible hoy"**: cuánto se puede gastar hoy sin romper el mes.
3. **Registro rápido**: agregar un movimiento en 2–3 toques (botón flotante +).

Estado: **MVP completo (Fases 1–9)** y verificado en dispositivo. **No publicado** (Fase 10 en
espera por decisión del usuario).

---

## 2. Stack y versiones

- **React Native 0.86 + Expo SDK 57** (Expo Router, TypeScript estricto).
- **React 19.2.3**, **TypeScript 6.0.3**.
- **Supabase** (Postgres + Auth + RLS). Cliente `@supabase/supabase-js`.
- **TanStack Query** (datos del servidor), **Zustand 5** (solo UI, con persistencia).
- **react-hook-form 7** + **zod 4** (formularios/validación).
- **date-fns 4** (fechas), **@expo/vector-icons** (Ionicons).
- **jest-expo + @testing-library/react-native** (tests). **ESLint + Prettier**.
- **expo-local-authentication**, **expo-secure-store**, **expo-notifications** (cargado dinámico).
- **@react-native-async-storage/async-storage** (persistencia local).
- `eas-cli` instalado como devDep (publicación aún no configurada).

---

## 3. Estructura de carpetas

```text
app/
  _layout.tsx               # raíz: QueryClientProvider + AuthProvider + navegación + bloqueo
  (auth)/login|register|forgot-password
  (tabs)/index|movements|settings
  transaction-form.tsx      # modal crear/editar movimiento
  accounts.tsx / account-form.tsx
  categories.tsx / category-form.tsx
  recurring.tsx / recurring-form.tsx
src/
  components/ui/            # sistema de diseño
  features/{auth,accounts,categories,transactions,recurring,summary}/
    api/ hooks/ components/ utils/ store/
  lib/                      # supabase.ts, queryClient.ts, money.ts, dates.ts
  theme/                    # colores, espaciado, radios, tipografía, useTheme
  i18n/es.ts                # TODOS los textos de UI en español
  types/database.ts         # tipos generados a mano del esquema
supabase/
  migrations/001..004
  tests/002_rls_test.sql
docs/                       # PRD, ARCHITECTURE, DATA_MODEL, PROGRESS, SECURITY_REVIEW, esta guía
```

---

## 4. Backend: Supabase

### Proyecto
- Project ref: `blxqqytzehvzoakiydoo` (URL `https://blxqqytzehvzoakiydoo.supabase.co`).
- Claves en `.env` (local, ignorado por git): `EXPO_PUBLIC_SUPABASE_URL` y
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (la key es `publishable`; pública a propósito).
- **Nunca** usar la `service_role key` en la app.

### Migraciones aplicadas (ejecutadas en Supabase, por este orden)
1. **001_schema.sql** — enums, tablas (profiles, accounts, categories, transactions,
   recurring_rules), CHECK de transactions, FKs, índices, trigger `updated_at`, vista
   `account_balances` (`security_invoker = true`).
2. **002_rls.sql** — RLS en las 5 tablas, 21 políticas `authenticated` (sin `anon`), función
   `is_owned_category` (anti-recursión).
3. **003_new_user.sql** — `handle_new_user()`: al registrarse crea perfil, cuenta "Efectivo" y 16
   categorías por defecto (11 gastos + 5 ingresos).
4. **004_recurring_unique.sql** — el índice de recurrentes pasa de parcial a **normal**
   `(recurring_rule_id, occurrence_date)` (para que upsert `on_conflict` funcione).

### Modelo de datos (resumen)
- `transactions`: type (income|expense|transfer), nature (base|extra; nulo en transfer), amount
  (bigint >0), account_id, transfer_account_id (nulo en income/expense), category_id (nulo en
  transfer; obligatorio en income/expense), occurred_on (date), recurring_rule_id/occurrence_date.
- `recurring_rules`: type (solo income|expense), amount, account_id, category_id, frequency
  (weekly|biweekly|semimonthly|monthly), start_date, end_date (opcional), is_active.
- `account_balances` (vista): saldo = initial_balance + ingresos − gastos − transferencias
  salientes + transferencias entrantes. Respeta RLS.

### RLS (verificado 7/7 con dos usuarios reales)
Cada usuario solo ve/modifica lo suyo (`user_id = auth.uid()`). Las políticas de escritura validan
que `account_id`, `transfer_account_id`, `category_id` y `parent_id` sean del mismo usuario. El
script de prueba está en `supabase/tests/002_rls_test.sql`.

---

## 5. Arquitectura de la app

- **Capas**: Pantalla → hook de feature → api de feature → Supabase. Las pantallas NO llaman a
  Supabase directamente.
- **Wrappers en `app/_layout.tsx`**: `QueryClientProvider` → `AuthProvider` → `Stack`.
  Mientras la sesión carga se muestra `LoadingState` (anti-parpadeo). Overlays: `LockOverlay`
  (bloqueo biométrico), hooks `useBiometricLock`, `useRecurringGeneration`,
  `useReminderScheduling`.
- **Protección de rutas**: `(auth)` redirige a `/` si hay sesión; `(tabs)` redirige a `/login` si no.
  Las pantallas como `accounts`, `categories`, etc. son rutas del Stack raíz con guarda propia.
- **Modal de movimiento**: `transaction-form` con `presentation: 'modal'`; al bloquearse la app se
  cierran los modales (`dismissAll`) y al desbloquear se fuerza `/`.

---

## 6. Sistema de diseño y UI

- `src/theme`: paleta claro/oscuro (primary esmeralda, income verde, expense rojo suave, extra
  ámbar), espaciado (4,8,12,16,24,32), radios, tipografía del sistema. `useTheme()` sigue el modo
  del sistema.
- `src/components/ui`: Screen (safe area + `overlay`), Text (title/subtitle/body/caption/money),
  Button (primary/secondary/ghost, loading, disabled), Input (label+error+helper), Card, Chip,
  SegmentedControl, MoneyText (formatea COP y colorea), EmptyState/LoadingState/ErrorState,
  Snackbar (con acción, ej. Deshacer), Fab (botón flotante).
- Todos los textos de UI viven en `src/i18n/es.ts` (objeto `es`).
- Dinero: entero de pesos, formateo `Intl es-CO` (usa `\u00a0` después de `$`). Fechas como texto
  `'YYYY-MM-DD'` local.

---

## 7. Features en detalle

### 7.1 Auth (`src/features/auth`)
- `api/auth.ts`: signUp, signIn, signOut, resetPassword, getSession.
- `hooks/AuthProvider.tsx`: contexto `{ session, user, loading }` + `onAuthStateChange`.
- `hooks/useBiometricLock.ts` + `store/useBiometricStore.ts`: bloqueo opcional con huella/Face ID
  al volver del segundo plano tras 30 s (constante `LOCK_DELAY_MS`, función pura `shouldLock`).
  `isLocked` no se persiste; `biometricEnabled` sí (SecureStore).
- Pantallas login/register/forgot con react-hook-form + zod (email, contraseña ≥8, confirmación),
  errores de Supabase traducidos (`utils/authErrors.ts`).

### 7.2 Cuentas (`src/features/accounts`)
- Vista `account_balances` (solo no archivadas), total = suma de saldos.
- CRUD + archivar con confirmación; no se permite archivar la única cuenta activa.
- Form con nombre, tipo (chips), saldo inicial (`parseMoneyInput`, acepta negativos).

### 7.3 Categorías (`src/features/categories`)
- Subcategorías de **un nivel** (`parent_id`).
- **Reglas de negocio implementadas**:
  - Archivo en **cascada**: archivar una madre archiva también sus subcategorías.
  - Validación de nombres (función pura `validateCategoryName`): una subcategoría no puede llamarse
    igual que su madre; no duplicados entre hermanas ni entre principales del mismo kind
    (compara trim + lowercase).
  - "Ver archivadas" + **Restaurar**: no se puede restaurar una hija si su madre sigue archivada;
    restaurar una madre muestra aviso de que sus hijas siguen archivadas.
  - Editar una categoría **con subcategorías** no permite convertirla en subcategoría (máx. 1 nivel).
- `CategoryPicker` reutilizable: acepta `additionIds` (para conservar una categoría archivada al
  editar movimientos).

### 7.4 Movimientos (`src/features/transactions`)
- Esquema zod **discriminado por type** que replica los CHECK de la BD.
- `api`: `listTransactions` con filtros + **paginación por cursor**, `getTransaction`,
  `getTransactionsInRange`, create/update/delete. Incluye categoría y cuentas.
- `hooks`: infinite query `useTransactions`, `useTransaction`, `useTransactionsInRange`, y
  mutaciones que invalidan `transactions`, `accounts` y `summary`.
- `utils/transactions.ts` (puras): `calculateTotals` (transferencias no cuentan),
  `groupTransactionsByDay`, `monthRange`, `formatDayHeader`, `formatMonthLabel`.
- **Pantalla de registro** (modal): monto grande con teclado numérico y vista formateada, tipo
  Gasto/Ingreso/Transferencia, Base/Extra, `CategoryPicker`, cuenta recordada (última usada),
  fecha Hoy/Ayer, nota, "Guardar" / "Guardar y agregar otro"; edición con eliminar.
- **Lista (Movimientos)**: SectionList por día con totales, selector de mes + resumen Base/Extra,
  búsqueda en nota, filtros en hoja inferior, pull-to-refresh, paginación, editar al tocar,
  eliminar (mantener presionado) con **Deshacer** (Snackbar que reinserta).

### 7.5 Recurrentes (`src/features/recurring`)
- `utils/recurrence.ts` (puras y testeada): `getOccurrences`, `getNextOccurrence`,
  `formatFrequency`. Definiciones: weekly=7 días, biweekly=14, semimonthly=días 15 y último del mes,
  monthly=mismo día (día inexistente → último del mes).
- Generación automática (`generateDueTransactions`, ídempotente vía upsert con índice único):
  corre al abrir la app y al volver del segundo plano (enfriamiento 1 h); retroactivo máx 12 meses;
  los generados se marcan en la lista con ícono ↻.
- Recordatorios locales (`expo-notifications`): en Ajustes, switch + "El mismo día / 1 día antes";
  programa los próximos 30 días de reglas de gasto a las 9:00. **En Expo Go no funciona** (SDK 53+):
  se detecta con `remindersSupported()` y se NO carga el módulo ahí (requiere development build).

### 7.6 Resumen e Inicio (`src/features/summary`)
- `calculateMonthSummary` (pura): desglose Base/Extra de ingresos y gastos, balance, gastos
  recurrentes pendientes (ocurrencias tras hoy dentro del mes), y:
  ```
  disponible_mes  = ingresos_mes − gastos_mes − gastos_recurrentes_pendientes
  disponible_hoy  = max(0, disponible_mes) / días_restantes (contando hoy)
  ```
- `extraDependency` = % de ingresos extras sobre el total (0 sin ingresos).
- Pantalla Inicio: saludo + mes, tarjeta "Disponible hoy" (con ayuda), Ingresos/Gastos con
  Base/Extra, barra de "Dependencia de extras", saldo total + cuentas, últimos 5 movimientos +
  "Ver todos", FAB, skeletons, vacío/error y pull-to-refresh.

---

## 8. Testing y calidad

- Comandos: `npm run typecheck` (tsc --noEmit), `npm run lint`, `npm test` (jest), `npm run format`.
- **137 tests** en verde (schemas, money, dates, resumen, ocurrencias recurrentes, generación,
  notificaciones, filtros, etc.).
- `npm audit`: 87 vulns (1 low, 24 moderate, 62 high) — casi todas en dev/build tooling; **no se
  actualizó nada rompedor**; revisar antes de publicar.
- Avisos benignos conocidos:
  - React Compiler + react-hook-form (`react-hooks/incompatible-library`) → solo warning.
  - "Cannot connect to Expo CLI" en Expo Go + USB (HMR) → inofensivo.
  - "POP_TO_TOP not handled" resuelto con `canDismiss()`.

---

## 9. Seguridad (verificada)

- Sin secretos en código ni historial; `.env` ignorado; solo `.env.example` versionado.
- RLS: 5/5 tablas, 21 políticas solo `authenticated`; **prueba en vivo 7/7 PASSED** (dos usuarios).
- No hay `console.*` ni se registran datos financieros/tokens.
- Reporte completo: `docs/SECURITY_REVIEW.md`.

---

## 10. Historial de prompts ejecutados

| Prompt | Qué se hizo | Estado |
|---|---|---|
| P0.1 | Documentación maestra (AGENTS, PRD, ARCHITECTURE, DATA_MODEL, PROGRESS, .gitignore, .env.example) | ✅ |
| P1.1 | Proyecto Expo SDK 57 (Expo Router, TS estricto, alias `@/`) | ✅ |
| P1.2 | ESLint+Prettier+Jest, scripts, date-fns, `money.ts` | ✅ |
| P1.3 | Sistema de diseño (theme, i18n, componentes UI, preview) | ✅ |
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
| P6.4 | Transferencias (verificada: Banco −100.000, Efectivo +100.000) | ✅ |
| P7.1 | Reglas recurrentes (frecuencias, próxima fecha) | ✅ |
| P7.2 | Generación automática + migración 004 (índice único normal) | ✅ verificado en BD |
| P7.3 | Recordatorios locales (Expo Go limitado a dev build) | ✅ |
| P8.2 | UI de Inicio + lógica de resumen (P8.1 incluida) | ✅ |
| P9.1 | Calidad/accesibilidad/rendimiento (memo filas, a11y, limpieza) | ✅ |
| P9.2 | Auditoría de seguridad + script RLS + SECURITY_REVIEW.md | ✅ 7/7 PASSED |
| P10.1 | (En espera por decisión del usuario) Solo se instaló eas-cli | ⏸️ |

Nota: al margen se hicieron ajustes de UX por feedback del usuario (botones flotantes visibles,
"Cancelar" en el modal, título de subcategorías, cierre de modales con el bloqueo, etc.).

---

## 11. Estado actual y pendientes

**Completado:** MVP funcional de punta a punta (Fases 1–9), subido a GitHub (rama `main`).

**Pendientes / decisiones abiertas:**
- **P10.1 (publicación)**: pausada. Falta: cuenta Expo/EAS, identificadores (bundleIdentifier/
  package), `eas.json`, `RELEASE.md`, `PRIVACY_POLICY.md`, cuentas Google Play/Apple, reactivar
  confirmación de email en Supabase, revisar `npm audit`.
- Revisar/actualizar devdeps antes de publicar (jest etc.).
- Borrar usuarios de prueba (`prueba.*@example.com`) cuando se desee.

---

## 12. Guía rápida para agentes futuros (cómo trabajar sobre esto)

1. **Nunca** empieces sin leer `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` y
   `docs/PROGRESS.md` (y esta guía si aplica).
2. Cambios pequeños y enfocados; no refactorices lo que no se pidió.
3. Al terminar: `npm run typecheck`, `npm run lint`, `npm test`; actualizar `docs/PROGRESS.md`;
   responder con resumen + archivos + mensaje de commit convencional; detenerte.
4. En este equipo Windows: usar `npm.cmd`/`npx.cmd` (política de PowerShell), y `adb` vía
   `cmd /c "…\platform-tools\adb.exe …"` (el envoltorio de PowerShell a veces se cuelga).
5. Para probar en el dispositivo (si está conectado por USB + adb):
   - `adb reverse tcp:8081 tcp:8081`, abrir Expo Go con `exp://localhost:8081`.
   - No se puede "ver" pantallas desde la terminal (el modelo no lee imágenes): verificar por
     `adb logcat -d -t <N> -s ReactNativeJS:E AndroidRuntime:E` y pedir confirmación al usuario.
6. Las verificaciones de BD se pueden hacer con la publishable key vía REST (usuario de prueba),
   sin necesidad del service_role.

---

*Fin de la guía. Actualiza este documento cuando cambien decisiones importantes.*