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
| 0

## Estado R8

R8.2-R8.6 aplicados: acciones rápidas, últimos 7 días, categoría sugerida y frecuentes, análisis interactivo, flujo del mes, micro-interacciones e ilustraciones.
R8.7 auditoría final realizada. Calidad en verde.
