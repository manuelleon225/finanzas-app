# Bitácora de progreso

Registro de lo que se hizo en cada tarea. La memoria del proyecto vive aquí, no en el chat.

## Plantilla de entrada

```markdown
### [YYYY-MM-DD] Tarea: <nombre>

- **Qué se hizo:** ...
- **Archivos creados o modificados:** ...
- **Decisiones tomadas:** ...
- **Pendientes:** ...
```

---

### [2026-10-05] Tarea: P0.1 — Documentos maestros

- **Qué se hizo:** Se creó la documentación base que guía todo el proyecto: reglas para agentes,
  PRD, arquitectura, modelo de datos y esta bitácora. También el `.gitignore` de Node/Expo y
  `.env.example`.
- **Archivos creados o modificados:**
  - `AGENTS.md` (creado)
  - `docs/PRD.md` (creado)
  - `docs/ARCHITECTURE.md` (creado)
  - `docs/DATA_MODEL.md` (creado)
  - `docs/PROGRESS.md` (creado)
  - `.gitignore` (creado)
  - `.env.example` (creado)
- **Decisiones tomadas:**
  - Se incluyó la fórmula "Disponible hoy" en `docs/DATA_MODEL.md` (sección 6) como regla de negocio.
  - El `.gitignore` ignora `.env*` excepto `.env.example`.
  - `initial_balance` se documentó como `bigint` que puede ser negativo (tarjetas de crédito).
- **Pendientes:** Ninguno. Siguiente tarea sugerida: P1.1 (crear el proyecto Expo).

---

### [2026-10-05] Tarea: P1.1 — Crear el proyecto Expo

- **Qué se hizo:** Se creó el proyecto base de Expo en la raíz usando la plantilla oficial `default`
  (SDK 57, React Native 0.86, TypeScript estricto, Expo Router). Se eliminó todo el contenido de
  ejemplo de la plantilla, quedando una pantalla de inicio que muestra "Finanzas". Se activó
  TypeScript estricto y el alias `@/` → `src/`. Se creó la estructura de carpetas de
  `docs/ARCHITECTURE.md` bajo `src/` y `supabase/migrations/`.
- **Archivos creados o modificados:**
  - `package.json`, `package-lock.json` (creados por la plantilla; nombre `finanzas-app`, se quitó el script `reset-project`)
  - `app.json` (name "Finanzas", slug "finanzas-app", scheme "finanzas", portrait, userInterfaceStyle automatic)
  - `tsconfig.json` (strict + alias `@/*` → `./src/*`)
  - `app/_layout.tsx` (Stack mínimo), `app/index.tsx` (pantalla "Finanzas")
  - `assets/images/*` (solo iconos y splash necesarios)
  - `src/components/ui`, `src/features/{auth,accounts,categories,transactions,recurring,summary}/{api,hooks,components,utils}`, `src/lib`, `src/theme`, `src/i18n`, `src/types`, `supabase/migrations` (con `.gitkeep`)
  - `.gitignore` (se añadieron `expo-env.d.ts`, `*.tsbuildinfo`, `.kotlin/`, `.metro-health-check*`, `*.pem`)
- **Decisiones tomadas:**
  - La plantilla `default` de SDK 57 ubica las rutas en `src/app`; se movieron a `app/` en la raíz
    para cumplir la estructura de `docs/ARCHITECTURE.md`. El alias `@/` sigue apuntando a `src/`.
  - Se eliminaron dependencias de ejemplo no usadas (componentes, `constants`, `hooks`, `scripts`,
    `global.css`, `README` y `LICENSE` de la plantilla).
  - Se conservaron las dependencias de la plantilla para no romper la configuración; se depurarán
    en tareas posteriores si hace falta.
  - En este entorno, `npm`/`npx` requieren invocarse como `npm.cmd`/`npx.cmd` por la política de
    ejecución de PowerShell.
- **Pendientes:** Probar en el celular con Expo Go (paso manual). Siguiente tarea: P1.2.
- **Verificación:** `npx tsc --noEmit` en verde y `npx expo export --platform android` empaqueta
  correctamente (1240 módulos).

---

### [2026-10-05] Tarea: P1.2 — Calidad de código y testing

- **Qué se hizo:** Se configuraron ESLint (flat config con `eslint-config-expo`), Prettier
  integrado sin conflictos y Jest con `jest-expo` + `@testing-library/react-native`. Se añadieron
  los scripts `typecheck`, `lint`, `format` y `test`. Se instaló `date-fns` y se creó la librería
  pura de dinero `src/lib/money.ts` con sus tests.
- **Archivos creados o modificados:**
  - `eslint.config.js` (creado; Expo + Prettier recomendado, ignores de build)
  - `.prettierrc`, `.prettierignore` (creados)
  - `package.json` (scripts y bloque `jest` con `preset: jest-expo` y alias `@/`; deps de calidad en devDependencies)
  - `tsconfig.json` (`types: ["jest"]`)
  - `src/lib/money.ts` (creado), `src/lib/money.test.ts` (creado, 13 casos)
- **Decisiones tomadas:**
  - El alias `@/` se mapea en Jest con `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }`.
  - `formatCOP` usa `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`; el
    separador entre `$` y el número es un espacio duro (`\u00a0`), y los tests lo reflejan.
  - `parseMoneyInput` acepta separadores de miles con punto o coma, ignora símbolos y conserva el
    signo negativo (necesario para saldos negativos en P4.1). Entrada inválida o vacía devuelve 0.
  - `test` usa `jest` (una sola pasada) para que sirva en el cierre de tareas y CI.
  - Se fijó `@types/jest@29.5.14` para alinearlo con Jest 29 (el que usa `jest-expo`).
- **Pendientes:** Ninguno. Siguiente tarea: P1.3 (sistema de diseño).
- **Verificación:** `npm run typecheck`, `npm run lint` y `npm test` (13 tests) en verde.

---

### [2026-10-05] Tarea: P1.3 — Sistema de diseño

- **Qué se hizo:** Se creó el sistema de diseño base: tokens de tema (claro/oscuro) y hook
  `useTheme()`, textos de UI centralizados en `src/i18n/es.ts` y la librería de componentes
  reutilizables en `src/components/ui`. Se creó una pantalla temporal `app/design-preview.tsx` que
  muestra todos los componentes y se añadieron tests de render de `Button` y `MoneyText`.
- **Archivos creados o modificados:**
  - `src/theme/colors.ts`, `spacing.ts`, `radii.ts`, `typography.ts`, `useTheme.ts`, `index.ts`
  - `src/i18n/es.ts`
  - `src/components/ui/Screen.tsx`, `Text.tsx`, `Button.tsx`, `Input.tsx`, `Card.tsx`, `Chip.tsx`,
    `SegmentedControl.tsx`, `MoneyText.tsx`, `EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx`,
    `index.ts`
  - `src/components/ui/__tests__/Button.test.tsx`, `MoneyText.test.tsx`
  - `app/design-preview.tsx` (temporal)
- **Decisiones tomadas:**
  - `useTheme()` respeta el modo del sistema vía `useColorScheme()` y devuelve colores, espaciado,
    radios y tipografía. Colores base: primary verde esmeralda, income verde, expense rojo suave,
    extra ámbar; con variantes para modo oscuro.
  - Los componentes usan `StyleSheet` para el layout y estilos dinámicos para los colores del tema.
  - `Text` expone las variantes `title`, `subtitle`, `body`, `caption` y `money`; `money` usa
    `tabular-nums`. `MoneyText` formatea con `formatCOP` y colorea según `income`/`expense`/`neutral`.
  - Accesibilidad: `accessibilityRole` y `accessibilityState` en botones/chips/segmentos, labels en
    textos de dinero y estados, y altura/área mínima de 44 en los elementos táctiles.
  - `app/design-preview.tsx` es solo para desarrollo y se eliminará en P9.1.
- **Pendientes:** Revisar la vista previa en modo claro y oscuro en el dispositivo (paso manual).
  Siguiente tarea: P1.4 (cliente de Supabase y proveedores).
- **Verificación:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde.

---

### [2026-10-05] Tarea: P1.4 — Cliente de Supabase y proveedores

- **Qué se hizo:** Se instalaron `@supabase/supabase-js`, `@react-native-async-storage/async-storage`,
  `@tanstack/react-query` y `react-native-url-polyfill`. Se creó el cliente de Supabase con
  persistencia de sesión y manejo de `AppState`, el `QueryClient` global y se envolvió la app con
  `QueryClientProvider`. Se creó `.env` local con valores vacíos.
- **Archivos creados o modificados:**
  - `src/lib/supabase.ts` (creado)
  - `src/lib/queryClient.ts` (creado)
  - `app/_layout.tsx` (envuelto en `QueryClientProvider`)
  - `package.json` / `package-lock.json` (nuevas dependencias)
  - `.env` (local, ignorado por git, con valores vacíos)
- **Decisiones tomadas:**
  - `supabase.ts` importa `react-native-url-polyfill/auto` y lanza un error legible en español si
    faltan `EXPO_PUBLIC_SUPABASE_URL` o `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - Autenticación: `storage: AsyncStorage`, `autoRefreshToken: true`, `persistSession: true`,
    `detectSessionInUrl: false`; `AppState` inicia/detiene el auto-refresh según la app esté activa.
  - `QueryClient` con `retry: 1` y `staleTime: 30_000` (30 segundos).
  - `.env` no se versiona (ya está en `.gitignore`); solo se versiona `.env.example`. El error de
    configuración aparece en cuanto se importe el cliente de Supabase.
- **Pendientes:** Rellenar `.env` con la URL y la anon key reales (paso manual). Siguiente tarea: P2.1.
- **Verificación:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde. Sin claves
  reales aún la app arranca; el cliente fallará con un mensaje claro al usarse.
