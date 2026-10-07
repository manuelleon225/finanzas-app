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

---

### [2026-10-05] Tarea: P2.1 — Migración 001, esquema

- **Qué se hizo:** Se creó `supabase/migrations/001_schema.sql` con los enums, las 5 tablas, los
  CHECK de `transactions`, las llaves foráneas, los índices (incluido el índice único parcial de
  recurrentes), el trigger genérico de `updated_at` y la vista `account_balances` con
  `security_invoker = true`. El script va envuelto en una transacción (`begin`/`commit`).
- **Archivos creados o modificados:**
  - `supabase/migrations/001_schema.sql` (creado)
  - `supabase/migrations/.gitkeep` (eliminado; la carpeta ya tiene contenido)
  - `eslint.config.js` (se ignora `expo-env.d.ts`, generado por Expo)
  - `.prettierignore` (se ignora `expo-env.d.ts`)
- **Decisiones tomadas (donde `docs/DATA_MODEL.md` era ambiguo):**
  1. `name` en accounts/categories, e `icon`/`color` en categories: NOT NULL.
  2. `occurred_on`: NOT NULL.
  3. `categories.parent_id`: `on delete restrict`.
  4. `transactions.recurring_rule_id`: `on delete set null` (borrar una regla no altera los
     movimientos ya generados; ver P7.2).
  5. Índices adicionales por `user_id` (y `categories.parent_id`) para RLS y llaves foráneas.
  6. `balance` de la vista casteado a `bigint`.
  7. `gen_random_uuid()` para los id.
  8. `profiles.display_name` nullable.
- **Pendientes:** Ejecutar `001_schema.sql` en el SQL Editor de Supabase y verificar las tablas en el
  Table Editor (paso manual). Siguiente tarea: P2.2 (RLS).
- **Verificación:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde.

---

### [2026-10-05] Tarea: P2.2 — Migración 002, seguridad (RLS)

- **Qué se hizo:** Se creó `supabase/migrations/002_rls.sql`: activa RLS en las cinco tablas y crea
  políticas separadas de select/insert/update/delete para el rol `authenticated` (sin políticas para
  `anon`). Las políticas de escritura verifican la propiedad de `account_id`, `transfer_account_id`,
  `category_id` y `categories.parent_id` con `EXISTS`/`IN`. Se reforzó `account_balances` con
  `security_invoker = true`. El script es idempotente (usa `drop policy if exists`) y va en una
  transacción.
- **Archivos creados o modificados:**
  - `supabase/migrations/002_rls.sql` (creado)
- **Decisiones tomadas:**
  - Se usa `(select auth.uid())` (initplan) en lugar de `auth.uid()` directo, por rendimiento.
  - `categories.parent_id` se valida con la función `public.is_owned_category(uuid)`
    (`SECURITY DEFINER`, `set search_path = ''`). Una subconsulta directa a `categories` dentro de su
    propia política provocaba el error **"infinite recursion detected in policy"**; la función
    definer evita la recursión y sigue usando `auth.uid()` del usuario que consulta.
  - Sin políticas de `anon`: el acceso anónimo queda denegado por defecto al estar RLS activo.
- **Verificación funcional:** Tras aplicar el arreglo, se probó con dos usuarios reales (A y B) vía
  la API: A crea cuenta/categoría/movimiento (201); B no ve las cuentas ni movimientos de A (0
  filas), no puede insertar movimientos con `account_id`/`category_id` de A (403, `42501`) y su
  `update` sobre una cuenta de A afecta 0 filas. La vista `account_balances` respeta el RLS.
- **Pendientes:** Aplicado y verificado en Supabase. Siguiente tarea: P2.3 (usuario nuevo con datos
  por defecto).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde.

---

### [2026-10-05] Tarea: P2.3 — Migración 003, usuario nuevo con datos por defecto

- **Qué se hizo:** Se creó `supabase/migrations/003_new_user.sql` con la función
  `public.handle_new_user()` (`SECURITY DEFINER`, `set search_path = ''`, referencias con esquema
  explícito) y el trigger `on_auth_user_created` (`AFTER INSERT` en `auth.users`). Al registrarse un
  usuario crea su perfil, una cuenta "Efectivo" (cash, saldo 0) y las 16 categorías por defecto
  (11 de gasto y 5 de ingreso) con `icon`, `color` y `sort_order`.
- **Archivos creados o modificados:**
  - `supabase/migrations/003_new_user.sql` (creado)
- **Decisiones tomadas:**
  - Idempotencia: el perfil usa `on conflict (id) do nothing`; la cuenta y las categorías solo se
    insertan si el usuario aún no tiene ninguna (`where not exists`).
  - `display_name` se toma de `raw_user_meta_data.display_name` y, si no existe, de la parte local
    del email.
  - Los íconos usan nombres de Ionicons (conjunto que se usará en P5.1) y una paleta fija de colores.
  - La función es `SECURITY DEFINER` porque durante el registro el usuario aún no está autenticado y
    RLS está activo.
- **Verificación funcional:** Aplicado en Supabase y comprobado vía API con un usuario nuevo: se crea
  1 perfil, 1 cuenta "Efectivo" (cash, saldo 0) y 16 categorías (11 de gasto + 5 de ingreso).
- **Pendientes:** Ninguno. Siguiente tarea: P2.4 (tipos de TypeScript de la base de datos).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde.

---

### [2026-10-05] Tarea: P2.4 — Tipos de TypeScript de la base de datos

- **Qué se hizo:** Se creó `src/types/database.ts` con los tipos fieles al esquema (Row/Insert/Update
  por tabla, enums como uniones de strings, la vista `account_balances` y las funciones
  `is_owned_category` / `handle_new_user`). El cliente en `src/lib/supabase.ts` ahora se tipa con
  `createClient<Database>`.
- **Archivos creados o modificados:**
  - `src/types/database.ts` (creado)
  - `src/lib/supabase.ts` (se tipa el cliente)
  - `src/types/.gitkeep` (eliminado)
- **Decisiones tomadas:**
  - No hay Supabase CLI configurado, así que los tipos se escribieron a mano fielmente a
    `001_schema.sql`. `bigint` se tipa como `number` (igual que la CLi de Supabase).
  - La vista se declaró como no actualizable (solo `Row` + `Relationships`), como genera la CLI.
  - Se añadieron helpers `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>` y `Enums<T>` para usar
    en las features.
- **Pendientes:** Ninguno. **Fase 3 completada.** Siguiente tarea: P3.1 (autenticación).
- **Cómo regenerar los tipos cuando cambie el esquema (manual):**
  1. Instalar y autenticar la Supabase CLI (`npm i -g supabase` y `supabase login`).
  2. Ejecutar:
     ```
     supabase gen types typescript --project-id blxqqytzehvzoakiydoo > src/types/database.ts
     ```
  3. Revisar el diff y mantener los helpers manuales (`Tables`, `TablesInsert`, etc.) si la CLI los
     eliminara.
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (21 tests) en verde.

---

### [2026-10-05] Tarea: P3.1 — Registro, login y sesión

- **Qué se hizo:** Se implementó la autenticación por email/contraseña: capa api
  (`signUp`, `signIn`, `signOut`, `resetPassword`, `getSession`), traductor de errores de Supabase a
  español, `AuthProvider` + `useSession` (escucha `onAuthStateChange`), esquemas zod con tests,
  pantallas de login/registro/recuperar contraseña con react-hook-form + zod, tres pestañas
  (Inicio, Movimientos, Ajustes con "Cerrar sesión") y protección de rutas con anti-parpadeo.
- **Dependencias agregadas:** `react-hook-form`, `zod`, `@hookform/resolvers` (pedidas por el prompt).
- **Archivos creados o modificados:**
  - `src/features/auth/api/auth.ts`, `src/features/auth/hooks/AuthProvider.tsx`
  - `src/features/auth/utils/authErrors.ts`, `schemas.ts` + `__tests__/` (schemas y authErrors)
  - `app/(auth)/_layout.tsx`, `login.tsx`, `register.tsx`, `forgot-password.tsx`
  - `app/(tabs)/_layout.tsx`, `index.tsx`, `movements.tsx`, `settings.tsx`
  - `app/_layout.tsx` (AuthProvider + LoadingState mientras carga la sesión)
  - `src/i18n/es.ts` (textos de auth y tabs)
  - Se eliminó `app/index.tsx` (la raíz "/" ahora es `(tabs)/index`).
- **Decisiones tomadas:**
  - Errores de Supabase traducidos con `translateAuthError` en una función pura (testeada).
  - Los esquemas zod usan la API de zod v4 (`z.email()`).
  - Protección de rutas con layouts de grupo: `(auth)` redirige a "/" si hay sesión; `(tabs)`
    redirige a `/login` si no la hay; el layout raíz muestra `LoadingState` hasta restaurar la sesión.
  - Se regeneraron los tipos de rutas de Expo (`expo start`); hubo que matar un servidor viejo que
    ocupaba el puerto 8081 con rutas antiguas.
- **Verificación funcional:** Probado en el celular del usuario: registro → entrada automática → vista
  de 3 pestañas → cerrar sesión desde Ajustes → vuelta al login → inicio de sesión de nuevo. La sesión
  persiste al reabrir la app.
- **Pendientes:** Ninguno. Siguiente tarea: P3.2 (bloqueo con biometría).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (33 tests) en verde.

---

### [2026-10-05] Tarea: P3.2 — Bloqueo con biometría

- **Qué se hizo:** Se agregó bloqueo opcional con huella/Face ID. Store de Zustand
  `useBiometricStore` persiste `biometricEnabled` en SecureStore (nunca `isLocked`). El switch en
  Ajustes verifica hardware/biometría y pide autenticarse una vez al activar. Hook `useBiometricLock`
  observa `AppState` y bloquea al volver del segundo plano tras 30 segundos (constante configurable).
  `LockScreen` permite desbloquear con biometría o cerrar sesión. Función pura `shouldLock` con tests.
  Permiso de Face ID en iOS configurado en español. Instalado `zustand`.
- **Dependencias agregadas:** `expo-local-authentication`, `expo-secure-store`, `zustand`
  (pedidos por el prompt / stack del proyecto).
- **Archivos creados o modificados:**
  - `src/features/auth/store/useBiometricStore.ts` (creado)
  - `src/features/auth/hooks/useBiometricLock.ts` (creado)
  - `src/features/auth/components/LockScreen.tsx` (creado)
  - `src/features/auth/utils/biometrics.ts` + `__tests__/biometrics.test.ts` (creados)
  - `app/(tabs)/settings.tsx` (switch de biometría)
  - `app/_layout.tsx` (LockScreen por encima de la navegación)
  - `src/i18n/es.ts` (textos `biometric`)
  - `app.json` (plugin `expo-local-authentication` con `faceIDPermission` en español)
- **Decisiones tomadas:**
  - `isLocked` NO se persiste (un bloqueo no debe sobrevivir como estado almacenado).
  - Al arrancar con biometría activada y sesión, la app bloquea de inmediato (además del bloqueo por
    segundo plano). Si no hay sesión, no se muestra el bloqueo.
  - `shouldLock(enabled, backgroundedAt, now)` es pura y testeada (delay configurable, default 30 s).
  - La comprobación de disponibilidad de biometría usa `hasHardwareAsync` + `isEnrolledAsync`.
  - En Expo Go puede no probarse la biometría indígena en iOS; en Android con huella probablemente sí.
- **Verificación funcional:** Probado en el celular del usuario (Android con huella): activó el
  switch (confirmó con su huella), la app se bloqueó al volver del segundo plano y se desbloqueó con
  la huella desde la pantalla de bloqueo. Funciona en Expo Go.
- **Pendientes:** Ninguno. Siguiente tarea: P4.1 (cuentas).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (39 tests) en verde.

---

### [2026-10-05] Tarea: P4.1 — Cuentas

- **Qué se hizo:** Se implementó la gestión de cuentas en `src/features/accounts`: api
  (`listAccountsWithBalance` sobre la vista `account_balances`, `createAccount`, `updateAccount`,
  `archiveAccount`), hooks de TanStack Query con invalidación, esquema zod con tests, pantalla de
  lista (accesible desde Ajustes) con saldo total, y pantalla de crear/editar (nombre, tipo con
  chips, saldo inicial con `parseMoneyInput` aceptando negativos). Archivar con confirmación y
  protección de la única cuenta activa. Estados de carga/vacío/error.
- **Archivos creados o modificados:**
  - `src/features/accounts/api/accounts.ts`, `hooks/useAccounts.ts`, `utils/schemas.ts` +
    `__tests__/schemas.test.ts`
  - `app/accounts.tsx` (lista), `app/account-form.tsx` (crear/editar)
  - `src/lib/money.ts` (+ `isValidMoneyText`) y `money.test.ts` (+ casos)
  - `app/(tabs)/settings.tsx` (acceso a Cuentas)
  - `src/i18n/es.ts` (textos `accounts` y `accountTypes`)
- **Decisiones tomadas:**
  - La lista usa la vista `account_balances` (saldo calculado), solo cuentas no archivadas, ordenadas
    por nombre. El saldo total se calcula sumando la lista.
  - El formulario trabaja con el texto del saldo y lo valida con `isValidMoneyText`; al guardar se
    parsea con `parseMoneyInput` (permite negativos para tarjetas de crédito).
  - La pantalla para editar recibe la cuenta por query param `id` y la busca en la caché de la lista
    (no se agrega una llamada extra).
  - Las pantallas de Cuentas son rutas del Stack raíz (se apilan sobre las pestañas) y tienen guarda
    de sesión propia.
- **Pendientes:** Probar en el dispositivo (paso manual): crear, editar y archivar una cuenta y ver
  los saldos. Siguiente tarea: P5.1 (categorías).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (49 tests) en verde.

---

### [2026-10-05] Tarea: P5.1 — Categorías

- **Qué se hizo:** Gestión de categorías en `src/features/categories`: api y hooks (listar por kind,
  crear, editar, archivar y reordenar por `sort_order`), pantalla en Ajustes con pestañas Gastos/
  Ingresos, lista con ícono/color/nombre y subcategorías anidadas (un nivel via `parent_id`),
  formulario con selector de íconos (Ionicons) y paleta fija de 12 colores, archivar con
  confirmación, y el componente reutilizable `CategoryPicker`. Estados de carga/vacío/error.
- **Dependencia agregada:** `@expo/vector-icons` (librería de íconos de Expo, pedida por el prompt).
- **Archivos creados o modificados:**
  - `src/features/categories/api/categories.ts`, `hooks/useCategories.ts`,
    `utils/categories.ts` (ICON_SET, COLOR_PALETTE, `groupCategoriesByParent`) +
    `__tests__/categories.test.ts`
  - `src/features/categories/components/CategoryIcon.tsx`, `CategoryPicker.tsx`
  - `app/categories.tsx`, `app/category-form.tsx`
  - `app/(tabs)/settings.tsx` (acceso a Categorías)
  - `src/i18n/es.ts` (textos `categories`)
- **Decisiones tomadas:**
  - El set de íconos usa nombres de Ionicons (los mismos que los datos por defecto de P2.3) y una
    paleta fija de 12 colores.
  - Subcategorías: `parent_id` con un solo nivel; el selector de padre solo ofrece categorías
    principales (y excluye a la propia).
  - `reorderCategories` actualiza cada `sort_order` por id (el `upsert` por lote exigía filas
    completas). La UI de reordenar queda como hook/api por ahora.
  - `CategoryPicker` se apoya en `useCategories(kind)` y se reutilizará en P6.2.
- **Pendientes:** Probar en el dispositivo (paso manual): gestionar categorías (crear, editar,
  subcategoría, archivar) en ambas pestañas. Siguiente tarea: P6.1 (movimientos, capa de datos).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (53 tests) en verde.

---

### [2026-10-05] Tarea: P5.1b — Reglas de negocio de categorías (ajustes aprobados)

- **Qué se hizo:** Implementación de las 3 reglas acordadas tras el análisis funcional:
  1. **Archivo en cascada**: al archivar una categoría madre se archivan también sus subcategorías
     (`archiveCategory` busca los hijos y actualiza `is_archived=true` en lote con `.in('id', ...)`).
  2. **Validación de nombres (formulario/zod)**: una subcategoría NO puede llamarse igual que su
     madre, y no se permiten nombres duplicados entre hermanas ni entre categorías principales del
     mismo kind. Comparación con `trim()` + `toLowerCase()`, en una función pura
     `validateCategoryName` con tests.
  3. Editar una categoría no se rechaza a sí misma (se excluye por `editingId`).
- **Decisiones diferidas (documentadas):**
  - Índices `UNIQUE` parciales en Postgres (padres por `user_id+kind+name WHERE parent_id IS NULL`;
    hermanas por `user_id+parent_id+name WHERE parent_id IS NOT NULL`) se agregarán en P9 tras
    limpiar posibles duplicados en datos reales.
  - Reglas de "desarchivar/reactivar" (no reactivar hijas en cascada; bloquear hija activa bajo madre
    archivada) se implementarán cuando exista la pantalla de desarchivar.
  - El `kind` de una categoría no es editable (no afecta balances: el tipo vive en transactions.type).
- **Verificación funcional (BD):** Con un usuario de prueba y la misma secuencia que ejecuta la app,
  se creó un padre con 2 hijas + 1 categoría aparte; al "archivar" el padre, la madre y las 2 hijas
  quedaron `is_archived=true` y la categoría ajena quedó intacta (RLS `.in()` OK).
- **Pendientes:** Probar en el dispositivo el archivo en cascada y los mensajes de nombre duplicado.
  Siguiente tarea: P6.1 (movimientos, capa de datos).
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (59 tests) en verde.

### [2026-10-05] Nota de incidencias

- El computador se apagó a mitad de la verificación de P5.1b; los cambios de código ya estaban
  aplicados pero pendientes de commit. Se re-verificó (typecheck/lint/test + cascada en BD) y se
  completó el commit en esta sesión.

---

### [2026-10-05] Tarea: P5.1c — Visibilidad de archivadas y restauración

- **Qué se hizo:** Tras la retroalimentación del usuario, se agregó la vista "Ver archivadas" en
  Categorías con botón "Restaurar" (desarchivar), para que el borrado lógico sea reversible y
  comprensible. El formulario abierto desde el botón "+" ahora dice "Nueva subcategoría".
- **Cambios:**
  - `listCategories(kind, { archived })` y hook `useCategories(kind, { archived })`.
  - `restoreCategory(id)` + `useRestoreCategory` (invalida `['categories']`).
  - Pantalla de Categorías: toggle "Ver archivadas (n)"/"Ver activas", lista de archivadas con
    "Restaurar"; se ocultan el botón "Nueva categoría" y el "+" en esa vista.
  - Regla de negocio: no se puede restaurar una subcategoría si su madre sigue archivada (se avisa
    que primero se restaure la madre).
  - Título del formulario distingue "Nueva categoría" vs "Nueva subcategoría".
- **Calidad:** typecheck, lint y `npm test` (59 tests) en verde.
- **Pendientes:** Probar en dispositivo la vista de archivadas y restauración. Siguiente: P6.1.

---

### [2026-10-05] Tarea: Ajustes de integración Categorías ↔ Movimientos (pre-P6)

- **Qué se hizo:** Tres ajustes de arquitectura/UX antes de construir movimientos:
  1. **Selector de categoría preserva la categoría asignada al editar**: `CategoryPicker` acepta
     `additionIds`; tras las activas, incluye la(s) categoría(s) pasadas aunque estén archivadas
     (función pura `mergeCategories` con tests; api `getCategoriesByIds` sin filtrar is_archived).
  2. **Máximo 1 nivel de jerarquía**: al editar una categoría principal que ya tiene subcategorías,
     se oculta el selector de padre y se fuerza `parent_id = null` (imposible crear un 3er nivel).
  3. **Aviso al restaurar una madre**: nuevo componente `Snackbar` (overlay en `Screen`) que, al
     restaurar una categoría madre con subcategorías aún archivadas, muestra:
     "Categoría restaurada. Sus subcategorías continúan archivadas y puedes restaurarlas de forma
     individual.".
- **Archivos**: `CategoryPicker.tsx`, `api/categories.ts` (getCategoriesByIds), `utils/categories.ts`
  (mergeCategories + test), `ui/Snackbar.tsx`, `ui/Screen.tsx` (prop overlay), `app/categories.tsx`,
  `app/category-form.tsx`, `src/i18n/es.ts`.
- **Calidad:** typecheck, lint y `npm test` (62 tests) en verde; bundle Android OK.
- **Pendientes:** Usar `CategoryPicker additionIds` en la edición de movimientos (P6.2). Siguiente
  tarea real: P6.1 (movimientos, capa de datos).

---

### [2026-10-05] Tarea: P6.1 — Capa de datos de movimientos

- **Qué se hizo:** Se implementó la capa de datos de `src/features/transactions` (sin pantallas):
  - `utils/schemas.ts`: esquema zod discriminado por `type` (income/expense/transfer) que replica
    las reglas CHECK (transfer → cuenta destino obligatoria y distinta, sin categoría ni naturaleza;
    income/expense → categoría y naturaleza obligatorias, sin cuenta destino), con mensajes en español.
  - `api/transactions.ts`: `listTransactions` (filtros por rango de fechas, cuenta, categoría, tipo,
    naturaleza y texto en nota; paginación por cursor `occurred_on+id`; incluye categoría, cuenta y
    cuenta destino), `getTransaction`, `createTransaction`, `updateTransaction`, `deleteTransaction`.
  - `hooks/useTransactions.ts`: `useTransactions` (infinite query) y mutaciones que invalidan
    `transactions`, `accounts` y `summary`.
  - `utils/transactions.ts`: `calculateTotals` (ingresos, gastos, balance; transferencias no cuentan)
    y `groupTransactionsByDay` (agrupado por día con total del día).
  - `src/lib/dates.ts`: `isValidISODate` (valida fechas reales, incluidos bisiestos).
- **Archivos creados:** `src/features/transactions/{utils/schemas.ts, utils/transactions.ts,
  api/transactions.ts, hooks/useTransactions.ts}` + tests (`utils/__tests__/schemas.test.ts`,
  `utils/__tests__/transactions.test.ts`), `src/lib/dates.ts` + `dates.test.ts`,
  `src/i18n/es.ts` (bloque `transactions`).
- **Decisiones tomadas:**
  - Paginación por cursor compuesto (`occurred_on` desc, `id` desc) con filtro `or(and(...))`.
  - El filtro por cuenta usa `account_id` (cuenta origen); las transferencias entrantes no se
    incluyen por `transfer_account_id` (se puede ampliar si la UX lo pide).
  - Los mensajes de campos faltantes se personalizan con la opción `error` de zod v4.
  - `getTransaction` incluye las relaciones (categoría/cuentas) y no filtra categorías archivadas,
    para que el historial conserve el nombre.
- **Pendientes:** Pantallas de registro y listado (P6.2 y P6.3). Siguiente tarea: P6.2.
- **Calidad:** `npm run typecheck`, `npm run lint` y `npm test` (86 tests) en verde.

---

### [2026-10-05] Tarea: P6.2 — Pantalla de registrar movimiento

- **Qué se hizo:** Se creó `app/transaction-form.tsx` como modal (mismo formulario para crear y
  editar), con:
  - Monto grande con teclado numérico y autofocus, y el monto formateado mientras se escribe.
  - SegmentedControl Gasto/Ingreso; SegmentedControl Base/Extra con línea de ayuda.
  - `CategoryPicker` filtrado por tipo (con `additionIds` para conservar la categoría asignada al
    editar, aunque esté archivada).
  - Selector de cuenta con la **última cuenta usada** recordada (store Zustand persistido en
    AsyncStorage).
  - Fecha por defecto hoy con atajos Hoy/Ayer; nota opcional.
  - Botones "Guardar" y "Guardar y agregar otro"; validación con el esquema zod de P6.1 mostrando
    errores en línea; feedback con `Snackbar`.
  - Modo edición: carga los datos y permite eliminar con confirmación.
  - Botón flotante (+) en las pestañas Inicio y Movimientos (nuevo componente `Fab`).
- **Archivos creados/modificados:** `app/transaction-form.tsx`, `app/(tabs)/_layout.tsx` (FAB),
  `app/_layout.tsx` (ruta modal), `src/components/ui/Fab.tsx` (+ export),
  `src/features/transactions/store/useTransactionPrefs.ts`,
  `src/features/transactions/utils/form.ts` + test, hook `useTransaction`,
  `src/lib/dates.ts` (`todayISO`), `src/i18n/es.ts` (bloque `transactionForm`).
- **Decisiones tomadas:**
  - La transferencia no se ofrece aún en el selector (llega en P6.4); el formulario solo crea/edita
    ingresos y gastos.
  - La cuenta por defecto es la última usada (o la primera) y se recuerda al guardar.
  - Fecha sin selector de calendario (evita dependencias nuevas): atajos Hoy/Ayer + texto de la fecha.
- **Pendientes:** Probar en el dispositivo (registrar un gasto base en ≤3 toques, ver saldos, editar
  y eliminar). Siguiente tarea: P6.3 (lista de movimientos).
- **Calidad:** `npm run typecheck`, `npm run lint` (1 aviso informativo de React Compiler) y
  `npm test` (91 tests) en verde; bundle Android OK.
