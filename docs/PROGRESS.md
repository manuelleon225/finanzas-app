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

---

### [2026-10-05] Tarea: P6.3 — Lista de movimientos

- **Qué se hizo:** Se implementó la pestaña Movimientos:
  - `SectionList` agrupada por día (encabezado con "Hoy"/"Ayer"/fecha y total del día). Cada fila:
    ícono/color de categoría, nombre, nota y cuenta, monto con `MoneyText` y etiqueta "Extra".
  - Encabezado con **selector de mes** (anterior/siguiente) y **resumen del mes** (ingresos, gastos,
    balance) calculado con `calculateTotals` sobre una consulta del rango del mes.
  - **Filtros** en hoja inferior (tipo, naturaleza Todos/Base/Extra, cuenta y categoría) con
    indicador de filtros activos y botón para limpiarlos.
  - **Búsqueda** por texto en la nota (con debounce).
  - Toque en fila → editar; mantener presionada → eliminar con confirmación y **Deshacer** (Snackbar
    con acción que reinserta el movimiento).
  - Paginación infinita, pull-to-refresh, estados de carga/vacío/error.
- **Archivos creados/modificados:** `app/(tabs)/movements.tsx`, `src/components/ui/Snackbar.tsx`
  (acción opcional), `src/features/transactions/{api,hooks,utils}/…` (rango, helpers de fecha,
  `toInsertPayload`), `src/i18n/es.ts` (bloque `transactionList`), tests de utilidades.
- **Decisiones tomadas:**
  - El resumen del mes se calcula sobre el rango completo del mes (consulta aparte), sin aplicar los
    filtros de la lista, para que refleje el mes real.
  - Eliminar es definitivo en la app (DELETE), pero se ofrece "Deshacer" reinsertando el movimiento
    (nuevo id) durante 5 s.
  - La transferencia aún no se crea (P6.4); si existiera, se muestra en neutro sin afectar totales.
- **Pendientes:** Probar en dispositivo con varios movimientos, filtros y deshacer. Siguiente tarea:
  P6.4 (transferencias).
- **Calidad:** `npm run typecheck`, `npm run lint` (1 aviso informativo) y `npm test` (97 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P6.4 — Transferencias

- **Qué se hizo:** Se agregó el tipo **Transferencia** al formulario y a la lista:
  - En el modal aparece la opción "Transferencia"; al elegirla se ocultan categoría y naturaleza y
    se muestran **Cuenta origen** y **Cuenta destino** (deben ser distintas). Si hay menos de dos
    cuentas activas, se muestra un mensaje y se deshabilita guardar.
  - El formulario construye el payload de transferencia (`transfer_account_id`, sin categoría ni
    naturaleza) y valida con el esquema zod (que ya contempla la transferencia).
  - En la lista, las transferencias se muestran como **"Origen → Destino"** con ícono propio y color
    neutro, y no afectan los totales (ni del día ni del mes).
- **Archivos modificados:** `app/transaction-form.tsx`, `app/(tabs)/movements.tsx`,
  `src/features/transactions/utils/form.ts` (+ test), `src/i18n/es.ts`.
- **Verificación funcional (BD):** Transferencia de **100.000** de Banco a Efectivo → `account_balances`
  devuelve **Banco -100.000** y **Efectivo +100.000**; los totales del mes no cambian (transferencias
  ignoradas por `calculateTotals`, cubierto con tests).
- **Pendientes:** Probar en el dispositivo. **Fase 6 (Movimientos) completada.** Sugerencia de la
  guía: usar la app unos días antes de seguir con recurrentes (P7.1).
- **Calidad:** `npm run typecheck`, `npm run lint` (1 aviso informativo) y `npm test` (98 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P7.1 — Reglas recurrentes (sin generar movimientos)

- **Qué se hizo:** Gestión de reglas recurrentes en `src/features/recurring` (aún sin generar
  movimientos):
  - `utils/recurrence.ts`: `getOccurrences(rule, from, to)`, `getNextOccurrence(rule, after)` y
    `formatFrequency(rule)` (frecuencia legible en español), respetando las definiciones del modelo
    (weekly/biweekly cada 7/14 días; semimonthly días 15 y último; monthly con día inexistente usa el
    último del mes) y `start_date`/`end_date`.
  - `utils/schemas.ts`: esquema zod de la regla (tipo, naturaleza, monto, cuenta, categoría, nota,
    frecuencia, inicio y fin opcional; fin no anterior al inicio).
  - `api/recurring.ts` y hooks: listar (con categoría/cuenta), crear, editar, activar/desactivar y
    eliminar.
  - Pantallas: `app/recurring.tsx` (lista con nota/nombre, monto, frecuencia legible, próxima fecha y
    switch de activa) y `app/recurring-form.tsx` (crear/editar con todos los campos). Acceso desde
    Ajustes.
- **Tests:** casos exhaustivos de fechas: weekly/biweekly, monthly con día 31 e inicio 29-feb,
  semimonthly en meses de 28/30/31, `end_date`, rangos vacíos y `getNextOccurrence` (117 tests en
  total).
- **Decisiones tomadas:**
  - `getOccurrences` devuelve fechas ordenadas dentro de `[from, to]` ∩ `[start, end]`.
  - `getNextOccurrence` busca estrictamente después de la fecha dada (horizonte de 2 años si no hay
    `end_date`).
  - Mostrar "nombre" = `note` (fallback al nombre de categoría), ya que la tabla no tiene columna de
    nombre.
- **Pendientes:** Generar movimientos (P7.2) y recordatorios (P7.3). Siguiente tarea: P7.2.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (117 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P7.2 — Generación automática de movimientos

- **Qué se hizo:** Se implementó la generación automática a partir de reglas activas:
  - Lógica pura `computeMissingOccurrences` + `retroactiveStart` (máx. 12 meses hacia atrás) y
    `maxOfDates`.
  - `generateDueTransactions()` en `api/recurring.ts`: para cada regla activa calcula las
    ocurrencias desde `max(start_date, hoy-12m)` hasta hoy, descuenta las ya generadas y crea los
    movimientos con `recurring_rule_id` y `occurrence_date` usando `upsert` con
    `ignoreDuplicates`.
  - Hook `useRecurringGeneration()`: ejecuta al abrir la app con sesión y al volver del segundo
    plano, con enfriamiento de 1 hora; si generó algo, invalida transacciones, cuentas y resumen.
  - La lista de movimientos marca con un ícono `repeat` los generados por una regla.
  - Texto de ayuda en el formulario de reglas: los movimientos ya generados no cambian al editar o
    eliminar la regla.
- **Migración 004:** `supabase/migrations/004_recurring_unique.sql` — el índice único de
  recurrentes pasa de **parcial** a **normal** (`(recurring_rule_id, occurrence_date)`), porque
  PostgREST no admite índices parciales como objetivo de `ON CONFLICT`. En Postgres los `NULL` son
  distintos, así que los movimientos manuales no se ven afectados. Se actualizó
  `docs/DATA_MODEL.md`.
- **Hallazgo en la verificación (BD):** con el índice parcial, el `upsert` devolvía
  `42P10 "no unique constraint matching ON CONFLICT"`; por eso se requiere la migración 004.
- **Tests:** `computeMissingOccurrences`, `retroactiveStart`, `maxOfDates` y el caso de aceptación
  (regla mensual con inicio hace 3 meses → 3 o 4 movimientos según la fecha; sin duplicados) (123
  tests en total).
- **Verificación funcional (BD):** Tras aplicar la migración 004, una regla mensual con inicio
  hace 3 meses generó **exactamente 4 movimientos** (jul-05, ago-05, sep-05, oct-05) y al repetir el
  upsert **no se duplicó** (0 insertados).
- **Pendientes:** Probar la generación en el dispositivo (crear una regla y recargar la app).
  Siguiente tarea: P7.3 (recordatorios locales).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (123 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P7.3 — Recordatorios locales de pagos

- **Qué se hizo:** Recordatorios locales con `expo-notifications`:
  - Store persistido `useReminderPrefs` (`remindersEnabled`, `anticipationDays` 0 = mismo día / 1 =
    un día antes).
  - En Ajustes: switch "Recordatorios de pagos" (pide permiso SOLO al activarlo; si no se concede,
    avisa) y selector de anticipación.
  - `computeReminderPlans` (función pura): para cada regla activa de GASTO, calcula las ocurrencias
    de los próximos 30 días y genera el plan (disparo a las 9:00 local, anticipado X días, título
    "Mañana/Hoy vence: …" y cuerpo "… — $ monto").
  - `api/reminders.ts`: canal de Android ("default"), cancela todas las programadas y reprograma;
    omite disparos ya pasados.
  - Hook `useReminderScheduling()` (en el layout raíz): reprograma/ cancela al cambiar la
    configuración, las reglas o la sesión.
- **Archivos:** `src/features/recurring/{store/useReminderPrefs.ts, utils/notifications.ts + test,
  api/reminders.ts, hooks/useReminderScheduling.ts}`, `app/(tabs)/settings.tsx`, `app/_layout.tsx`,
  `src/i18n/es.ts` (bloque `reminders`). Dependencia: `expo-notifications`.
- **Decisiones tomadas:**
  - El permiso se solicita solo al activar el switch (nunca al abrir la app).
  - Se reprograma todo al cambiar config/reglas: primero se cancelan las anteriores (sin duplicar).
  - Los disparos con fecha pasada se omiten.
  - **Expo Go:** expo-notifications ya no funciona ahí (SDK 53+) y lanza un error al importarlo, por
    lo que `remindersSupported()` (expo-constants: no StoreClient) lo **detecta y NO carga el módulo**
    en Expo Go (ni en arranque ni al togglear); el switch avisa que requiere *development build*.
- **Prueba en el dispositivo (paso manual):** requiere un development build (fase de publicación);
  en Expo Go se deja implementado y lazzy-load para no romper la app.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (129 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P8.1 + P8.2 — Lógica del resumen y pantalla de Inicio

- **Qué se hizo:** Se implementó la lógica del resumen mensual y la pantalla de Inicio:
  - `src/features/summary/utils/summary.ts` (pura): `calculateMonthSummary(transactions, rules,
    today)` con desglose Base/Extra de ingresos y gastos, balance, gastos recurrentes pendientes
    (ocurrencias posteriores a hoy dentro del mes), `disponible_mes`, `disponible_hoy` (fórmula de
    DATA_MODEL) y `extraDependency`. Tests exhaustivos (transferencias ignoradas, último día,
    pendientes, negativo → 0, dependencia de extras).
  - `useMonthSummary(month)`: junta movimientos del mes + reglas activas de gasto; devuelve summary,
    movimientos del mes (para "últimos 5"), carga/error/refetch.
  - `useProfile()` (auth): display_name de profiles para el saludo.
  - `app/(tabs)/index.tsx`: saludo + selector de mes, tarjeta **Disponible hoy** (+ ayuda), tarjetas
    Ingresos/Gastos del mes con Base|Extra, indicador **Dependencia de extras** con barra, saldo
    total + cuentas, últimos 5 movimientos con "Ver todos", FAB, skeletons, vacío, error con
    reintento y pull-to-refresh.
  - `getTransactionsInRange` ahora ordena desc para los "últimos 5".
- **Incidencias:** el computador se apagó dos veces durante el trabajo; archivos a medio escribir se
  reconstruyeron, y el `.expo/types/router.d.ts` generado quedó corrupto y se eliminó (lo regenera
  el dev server al arrancar).
- **Pendientes:** Probar en el dispositivo (recargar; el dev server regenerará los tipos de rutas).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (137 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P9.1 — Calidad, accesibilidad y rendimiento

- **Qué se hizo:**
  1. **Estados**: se agregó el estado "sin cuentas" en `app/recurring-form.tsx` (estaba en
     transaction-form pero faltaba en el formulario de reglas).
  2. **Accesibilidad**: botones flotantes y Switch ya tenían label; se añadió `accessibilityLabel`
     a los selectores ‹ › de Inicio y al botón de ayuda "?" de "Disponible hoy".
  3. **Textos**: se verificó que no hay strings de usuario fuera de `src/i18n/es.ts` (solo símbolos,
     nombres de íconos y formato de fecha).
  4. **Limpieza**: se eliminó `app/design-preview.tsx` y el bloque `designPreview` de i18n. No había
     `console.log` ni TODO.
  5. **Rendimiento**: la fila de la lista de movimientos se extrajo a un componente memoizado
     (`MovementRow` con `React.memo`) y `confirmDelete` se envolvió en `useCallback` (antes de los
     returns condicionales); las claves ya eran estables (`item.id`).
- **Hallazgos no corregidos (y por qué):**
  - Contraste: no se midió formalmente (ratios); la paleta usa colores con buen contraste en ambos
    temas, pero la verificación visual final queda como pendiente en la prueba de dispositivo.
  - Escalado de fuente: los textos usan `allowFontScaling` por defecto (escalan con el sistema).
  - Íconos de categoría en listas son decorativos (van acompañados de texto); los táctiles tienen
    label.
  - El placeholder "AAAA-MM-DD" del formulario recurrente es un formato, no un texto de marca.
  - El aviso informativo de React Compiler con `react-hook-form` no se suprime (herramienta, no error).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (137 tests) en
  verde; bundle Android OK.

---

### [2026-10-05] Tarea: P9.2 — Revisión de seguridad

- **Qué se hizo:** Auditoría de seguridad (sin funcionalidades nuevas):
  - Secretos: sin claves/tokens en código ni historial; `.env` ignorado; solo `.env.example`
    versionado. ✅
  - RLS: 5 tablas habilitadas, 21 políticas solo `authenticated`, ninguna `anon`. ✅
  - Logs: no hay `console.*`; no se registran datos financieros ni tokens. ✅
  - `npm audit`: 66 vulnerabilidades (16 mod / 50 altas / 0 críticas), casi todas de dev/build
    tooling; NO se actualizó nada (requeriría cambios que rompen).
  - Reporte: `docs/SECURITY_REVIEW.md`.
  - Script de prueba RLS con dos usuarios: `supabase/tests/002_rls_test.sql` (avisos OK/esperado).
- **Pendientes:** ~~Ejecutar `002_rls_test.sql` en Supabase y confirmar la salida (paso manual).~~
- **Verificación RLS (en vivo):** ejecutado el script con dos usuarios reales (rol A y B): **7/7
  `passed = true`** (A crea datos; B no ve la cuenta ni el movimiento de A; B bloqueado al insertar
  con recursos de A; B no modifica filas de A; anon no ve cuentas; limpieza OK).
- **Calidad:** typecheck, lint y 137 tests en verde.

---

## Rediseño (guía v2: prompts R)

### [2026-10-05] Tarea: R0.1 — Actualizar la memoria del proyecto

- **Qué se hizo (solo documentación, sin código):**
  - Se crearon **`docs/DESIGN_SYSTEM.md`** y **`docs/UX_SPEC.md`** copiando **verbatim** los Anexos
    A y B de la guía de rediseño (no modificados ni parafraseados). Son la fuente de verdad visual.
  - `AGENTS.md`: nueva sección **"4.bis Diseño y UI"** (leer DESIGN_SYSTEM/UX_SPEC antes de tocar
    UI; reglas: "no ver la pantalla" + lista "Para revisar visualmente", prohibido hex fuera de
    `src/theme`, un solo botón primary, ámbar solo para extra).
  - `docs/DECISIONS.md`: registro de decisiones con el formato fecha/decisión/motivo.
  - `docs/DATA_MODEL.md`: se reemplazó la fórmula "Disponible hoy" (v1) por la **v2** (anclada al
    próximo ingreso base) y se agregó "## 7. Cambios planificados" (`accounts.counts_as_liquid`,
    tabla `budgets`, `transactions.status`, `recurring_rules.confirmation_mode`).
  - `docs/PRD.md`: alcance (MVP + rediseño v2 + Fase R5) y fuera de alcance actualizados.
  - `docs/ARCHITECTURE.md`: Manrope, modo de tema, offline planificado (TanStack persistido) y
    gráficos propios (react-native-svg) en decisiones técnicas.
- **Pendientes:** Ejecutar los prompts R1.x (migración 005 + nueva fórmula). Nota: la guía sugiere
  trabajar en una rama `feat/redesign` (decisión del usuario).
- **Calidad:** (solo documentación; `npm run typecheck` y `npm test` se confirman al empezar R1).

### [2026-10-05] Tarea: R1.1 — Cuenta líquida (counts_as_liquid)

- **Qué se hizo:**
  - Migración `005_accounts_liquid.sql`: columna `accounts.counts_as_liquid` (default true),
    actualiza a false las existentes de tipo `savings`/`credit_card`, y recrea `account_balances`
    agregando la columna al final (conservando `security_invoker`).
  - `src/types/database.ts`: campo en accounts (Row/Insert/Update) y en la vista.
  - Capa de cuentas: `AccountWithBalance.counts_as_liquid` y la vista trae el campo.
  - `app/account-form.tsx`: switch **"Cuenta para gastar"** con ayuda; valor por defecto según tipo
    (true para cash/bank, false para savings/credit_card), que se ajusta al cambiar el tipo si el
    usuario no lo tocó (función pura `defaultCountsAsLiquid` con tests).
  - Textos en `src/i18n/es.ts` (`accounts.countsAsLiquid` / `countsAsLiquidHelp`).
- **Pendientes (✋):** ejecutar `005_accounts_liquid.sql` en Supabase y verificar que una cuenta de
  ahorros quedó con el switch apagado (y que las tarjetas de crédito también). Siguiente: R1.2.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (139) en
  verde; bundle Android OK.

### [2026-10-05] Tarea: R1.2 — Función pura "Disponible hoy" v2

- **Qué se hizo:** `src/features/summary/utils/availableToday.ts` con `calculateAvailableToday(input)`
  implementando **exactamente** la fórmula v2 de `docs/DATA_MODEL.md` (saldo líquido, horizonte =
  próximo ingreso base, días al pago, comprometidos, colchón extra, disponible base con/ sin extras,
  gastado hoy, allowance y remaining). Reutiliza `getOccurrences`/`getNextOccurrence` (esta última ya
  es estrictamente posterior, documentado en comentario). Sin UI ni Supabase.
- **Tests:** 21 casos (≥18 pedidos): sin reglas (fallback mes siguiente), quincenal en días 14/15/29,
  mensual, cuentas no líquidas ignoradas, comprometidos, negativo → 0, includeExtras true/false,
  colchón mayor que el disponible, gasto de hoy (remaining vs allowance), último día del mes
  (days=1), regla inactiva, end_date vencida, pendingExpenses, transferencias ignoradas, varias
  reglas de ingreso (la más cercana) y caso integrado.
- **Pendientes:** R1.3 (conectar a la app, aún no tocar la UI). Siguiente: R1.3.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (159) en
  verde.

### [2026-10-05] Tarea: R1.3 — Conectar la nueva fórmula

- **Qué se hizo:**
  - Store `src/features/summary/store/usePreferencesStore.ts` (persistido en AsyncStorage):
    `includeExtrasInAvailable` (default false).
  - Hook `useAvailableToday(month)`: junta cuentas (con `counts_as_liquid`), reglas activas y
    movimientos del mes, lee la preferencia y devuelve `calculateAvailableToday(...)` con carga/error
    /refetch.
  - `utils/explain.ts`: `explainAvailable(result)` → 3–4 frases cortas en español (saldo líquido,
    comprometidos, días al ingreso o fallback, colchón extra) con tests.
  - Inicio: la tarjeta héroe usa `remainingToday` (v2), muestra `availableBase` como secundaria y el
    texto "Crea tu ingreso recurrente…" si `usedFallbackHorizon`; la ayuda "?" muestra las frases de
    `explainAvailable`. Se eliminó el cálculo viejo de `disponible_mes`/`disponible_hoy`.
  - Ajustes: switch "Incluir extras en Disponible hoy" con su ayuda.
  - `calculateMonthSummary` quedó con solo totales/base/extra/dependencia (se quitaron
    `availableMonth`, `availableToday`, `daysRemaining`, `pendingRecurringExpenses` y sus tests).
- **Pendientes (✋ prueba con datos reales):** crear una regla de ingreso base quincenal y revisar que
  "días a tu pago" y el monto tengan sentido; si la fórmula no convence, ajustar
  `docs/DATA_MODEL.md` y la función. Siguiente: R2.1 (sistema de diseño v2).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (158) en
  verde; bundle Android OK.

### [2026-10-05] Tarea: R2.1 — Fundamentos del sistema de diseño v2

- **Qué se hizo:**
  - Fuente **Manrope** (400/500/600/700) cargada al iniciar con `useFonts` + splash visible hasta
    que la fuente está lista (`expo-splash-screen`, `@expo-google-fonts/manrope`).
  - `src/theme` reescrito a los valores EXACTOS de `docs/DESIGN_SYSTEM.md`: colores (oscuro/claro),
    espaciado (4…40), radios, tipografía con lineHeight, `durations` (150/220/320 ms) y
    `componentHeights`. Los nombres antiguos se mantienen como **aliases deprecated** (comentados).
  - Modo de tema: `useThemeModeStore` ('system'|'dark'|'light', default **dark**, persistido);
    `useTheme()` respeta la preferencia.
  - `tint(color, opacity)` en `src/theme` (fondos suaves) con tests.
  - Test de contraste **WCAG** (`contrast.test.ts`): 24 pares en ambos temas, **todos ≥ 4.5:1 sin
    cambios de color** (se respetó el Anexo A tal cual).
  - Regla ESLint (`no-restricted-syntax`) que prohíbe hex/rgb/rgba fuera de `src/theme` y tests.
    Se corrigieron incumplimientos: backdrop → token `scrim`, switches sin `thumbColor` hardcodeado,
    FAB sin sombras (prohibidas por el diseño), paleta de categorías movida a `src/theme/categoryPalette`.
  - `Text` aplica Manrope según el peso (y conserva `allowFontScaling` por defecto de RN).
- **Observación (req. 8):** falta validar visualmente si Manrope alinea bien
  `fontVariant: ['tabular-nums']` en los montos (pendiente de revisión en dispositivo).
- **Pendientes:** R2.2 (componentes base v2) — y revisar en dispositivo el estilo nuevo.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (185) en
  verde; bundle Android OK.

### [2026-10-05] Tarea: R2.2 — Componentes base v2

- **Qué se hizo (props públicas intactas):**
  - `Text`: variantes `displayLg`, `display`, `title`, `subtitle`, `body`, `bodyStrong`, `caption`,
    `micro` (+ `money` como alias), todas con Manrope y `allowFontScaling`.
  - `MoneyText`: nueva prop `size` ('displayLg'|'display'|'bodyStrong'|'caption'), cifras
    tabulares, signo y color por tipo.
  - `Button`: variantes primary (marca), secondary, ghost, **destructive**; alto 52, radio 14,
    pressed con cambio de tono (sin sombras); loading/disabled (opacidad 0.4).
  - `Input`: alto 52, fondo surfaceRaised, borde transparente→brand en foco / expense en error;
    label y mensajes caption.
  - `Chip`: alto 32 pill, fondo surfaceRaised; seleccionado brandSoft+brand; prop nueva `tone`
    ('brand'|'extra') para el chip "Extra" (extraSoft+extra); hitSlop de accesibilidad.
  - `SegmentedControl`: forma píldora (padding 3, alto 40) con **píldora activa animada** (150 ms,
    respeta "reducir movimiento").
  - `AppIcon` (`src/components/ui/AppIcon.tsx`): único acceso a Ionicons (outline, tamaños
    16/20/24, color por token) + **regla ESLint** que prohíbe importar Ionicons fuera de AppIcon.
    Se migraron Fab, lista de movimientos y `CategoryIcon`.
  - Recreada `app/design-preview.tsx` (con switch de tema; se eliminará en R4.5).
  - Tests de render por componente (Text, Chip, SegmentedControl, Button variantes, MoneyText
    tamaño) — se añadió el mock de AsyncStorage y un mock mínimo de Reanimated para Jest.
- **Pendientes:** Revisar `design-preview` en claro/oscuro en el dispositivo (paso manual, 🔍).
  Siguiente: R2.3 (componentes nuevos de visualización).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos) y `npm test` (202) en
  verde; bundle Android OK.

### [2026-10-07] Tarea: R2.3 — Componentes nuevos, parte 1 (visualización)

- **Qué se hizo:** Componentes de visualización en `src/components/ui`:
  - `ListRow`: círculo de ícono de 40 con `tint(color, 0.16)`, título + `Tag` opcional, subtítulo,
    `trailing`, altura mínima 64 y estado presionado (`surfaceRaised`).
  - `Tag`: píldora de alto 20 (`componentHeights.tag`) con variantes `extra` (extraSoft/extra),
    `base` (brandSoft/brand), `neutral` y `pending` (surfaceRaised/textSecondary), texto `micro`.
  - `ProgressBar`: alto 6, radio pill, fondo `surfaceRaised`, relleno animado 200 ms (tolera
    "reducir movimiento"), color configurable y `clampProgress` entre 0 y 1.
  - `StackedBar`: alto 8, segmentos proporcionales con separación de 2, radio pill, leyenda
    opcional y resumen accesible; total 0 → solo el fondo.
  - `Skeleton`: pulso suave (respeta reducir movimiento) con variantes `line`, `circle` y `card`.
  - `EmptyState` v2 (ícono en círculo suave + título + descripción + botón opcional),
    `LoadingState` y `ErrorState` al mismo estilo (con botón "Reintentar").
  - `Snackbar` reestilizado al sistema (`surfaceHigh`, sin sombra, acción en `brand`); misma API.
  - `BottomSheet` propio con `react-native-reanimated` + `react-native-gesture-handler`: scrim,
    handle, cierre al deslizar o tocar fuera, altura por contenido con máximo del 85 % y safe area.
    Se envolvió la app en `GestureHandlerRootView`.
  - `app/design-preview.tsx` muestra todos los componentes nuevos (switch de tema).
- **Tests:** `ProgressBar` (clamp), `StackedBar` (proporciones y total 0), `Tag` y `ListRow`.
- **Decisiones tomadas:**
  - Los `Animated.Value` de `ProgressBar`/`Skeleton` se guardan con `useState` (no
    `useRef(...).current`) para cumplir la regla `react-hooks/refs` del React Compiler.
  - En `BottomSheet`, el gesto se define antes del `useEffect` que anima `translateY` para
    satisfacer `react-hooks/immutability` (falso positivo con shared values de reanimated).
  - Accesibilidad: `ProgressBar` con role `progressbar` + `accessibilityValue`; `StackedBar` con
    resumen accesible; `Tag` con label; `ListRow` con `button` solo si es presionable.
  - `ListRow` usa `tint(..., 0.16)` tal como indica el prompt R2.3 (el Anexo A usa 0.12 en claro).
- **Archivos:** `ProgressBar.tsx`, `StackedBar.tsx`, `Skeleton.tsx`, `Tag.tsx`, `ListRow.tsx`,
  `BottomSheet.tsx` (nuevos), `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`,
  `Snackbar.tsx`, `index.ts` (modificados), `app/_layout.tsx` (GestureHandlerRootView),
  `app/design-preview.tsx`, tests en `src/components/ui/__tests__/`.
- **Pendientes:** Revisar `design-preview` en claro/oscuro en el dispositivo (paso manual, 🔍).
  Siguiente: R2.4 (parte 2 de componentes).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes) y
  `npm test` (218) en verde.

### [2026-10-07] Tarea: R2.4 — Componentes nuevos, parte 2 (interacción)

- **Qué se hizo:** Componentes y utilidades de interacción:
  - `expo-haptics` + `src/lib/haptics.ts` (`tap`, `select`, `success`, `warning`, `error`), todas
    envueltas en `try/catch` y desactivables con `setHapticsEnabled`. Se integró `tap()` en
    `Button`, `select()` en `Chip`/`SegmentedControl` y en las teclas del teclado.
  - `NumericKeypad` (3×4, teclas de 52 px, radio md): `onDigit`/`onBackspace`/`onClear`, mantener
    presionado "borrar" limpia todo, label por tecla. Lógica pura `applyKey(current, key, maxDigits)`
    en `src/components/ui/utils/numericKeypad.ts` (sin ceros a la izquierda; "000" respeta el máximo).
  - `AnimatedNumber`: conteo animado 300–600 ms con Reanimated, respeta "reducir movimiento",
    formatea con `formatCOP`.
  - `SwipeableRow` (+ `SwipeableRowGroup`): fila deslizable a la izquierda que revela una acción
    destructiva "Eliminar"; cierra la fila abierta al tocar otra; acción alternativa por
    `accessibilityActions`.
  - `MonthSelector` (chevrones + etiqueta con `formatMonthLabel`, no permite mes futuro),
    `ScreenHeader` (título/subtítulo + slot de acciones) e `IconButton` (44 px, pressed, badge opcional).
  - Todo agregado a `app/design-preview.tsx`.
- **Dependencia agregada:** `expo-haptics` (pedida por el prompt; instalada con `npx expo install`).
- **Decisiones tomadas:**
  - Haptics como funciones "fire-and-forget": el fallo del módulo nunca rompe la UI.
  - El registro "una sola fila abierta" usa un `Context` con `useRef`: el React Compiler prohíbe
    mutar estado a nivel de módulo (`react-hooks/immutability` / `globals`).
  - Los tests de `AnimatedNumber`/`SwipeableRow` mockean Reanimated y `react-native-gesture-handler`
    (mismo patrón que `SegmentedControl`). Los `fireEvent` se `await`ean (RNTL v14) para evitar
    `act()` solapados.
  - `MonthSelector` importa `formatMonthLabel` de la feature de movimientos (función existente).
- **Archivos:** `src/lib/haptics.ts` (+ test), `src/components/ui/{NumericKeypad,AnimatedNumber,
  SwipeableRow,MonthSelector,ScreenHeader,IconButton}.tsx`, `src/components/ui/utils/numericKeypad.ts`,
  `Button.tsx`/`Chip.tsx`/`SegmentedControl.tsx` (haptics), `index.ts`, `src/i18n/es.ts` (`keypad`),
  `app/design-preview.tsx`, tests en `src/components/ui/__tests__/`.
- **Pendientes (✋ manual):** revisar el teclado (haptics, mantener presionado borrar), deslizar una
  fila y cambiar de mes en el dispositivo. Siguiente: R2.5 (parte 3, si aplica).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes) y
  `npm test` (251) en verde.

### [2026-10-07] Tarea: R3.1 — Nueva barra de pestañas

- **Qué se hizo:**
  - `src/components/ui/TabBar.tsx`: custom `tabBar` de Expo Router con 5 elementos (Inicio,
    Movimientos, (+), Planificar, Más). Alto 64 + safe area, línea superior de 1 px, etiqueta
    `micro`, activo en `brand`, inactivo en `textSecondary`. El (+) es un botón de 52 px en `brand`
    elevado por posición (`translateY: -14`, sin sombra) que abre el modal `/transaction-form`
    (con haptic `tap`).
  - `app/(tabs)/_layout.tsx`: usa `Tabs` de `expo-router/js-tabs` con `tabBar={<TabBar/>}` y las 4
    pestañas; se eliminó Ajustes. Se mantiene la guarda de sesión.
  - `app/(tabs)/plan.tsx`: Planificar con la fila "Pagos e ingresos recurrentes" (→ `/recurring`);
    la fila "Análisis" queda tras un flag y no se muestra hasta que exista la ruta (R5.2).
  - `app/(tabs)/more.tsx`: Más con grupos Organización (Cuentas, Categorías), Preferencias
    (Apariencia Sistema/Oscuro/Claro conectado al store de tema, Incluir extras, Bloqueo biométrico,
    Recordatorios con anticipación), Cuenta (Cerrar sesión) y pie con la versión (`expo-constants`).
    Se movió aquí toda la lógica que estaba en Ajustes y se eliminó `settings.tsx`.
  - Se eliminaron los `Fab` de Inicio y Movimientos y el componente `Fab` (+ su export).
  - `ScreenHeader` ganó un slot `left`; los hijos (accounts, categories, recurring y sus
    formularios) ahora usan `ScreenHeader` con botón atrás de 44 px (`IconButton` chevron).
- **Decisiones tomadas:**
  - Se usa `Tabs` de `expo-router/js-tabs` (el `Tabs` de `expo-router` está deprecado) para poder
    pasar un `tabBar` personalizado.
  - Íconos de la barra solo en estilo contorno (`AppIcon`), como exige el sistema de diseño; el
    estado activo se distingue por color `brand` + etiqueta, no por relleno.
  - El (+) ocupa un slot central (5 columnas) y se eleva por posición, no por sombra.
- **Archivos:** `src/components/ui/TabBar.tsx`, `app/(tabs)/{_layout,plan,more}.tsx`,
  `app/(tabs)/{index,movements}.tsx` (sin Fab), `app/{accounts,categories,recurring,
  account-form,category-form,recurring-form}.tsx` (ScreenHeader), `src/components/ui/ScreenHeader.tsx`,
  `src/components/ui/index.ts`, `src/i18n/es.ts`; eliminados `app/(tabs)/settings.tsx` y
  `src/components/ui/Fab.tsx`.
- **Pendientes (✋ manual):** capturas de la barra en Inicio, Planificar y Más; probar que el (+)
  abre el modal y que la barra respeta el safe area. Siguiente: R3.2.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (251) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R4.1 — Inicio

- **Qué se hizo:** Rediseño de la pestaña Inicio según `docs/UX_SPEC.md` (sección "Inicio"),
  sin tocar la lógica de datos (mismos hooks):
  - Encabezado: saludo (caption) + `MonthSelector` (variante `title`) y, a la derecha, acceso a
    análisis tras un flag (oculto hasta que exista la ruta, R5.2).
  - Tarjeta héroe (Card xl, padding 20): `AnimatedNumber` con `remainingToday`, `ProgressBar` de
    `spentToday/allowanceToday` (brand; expense si se superó), pie "Gastaste X de Y" + "N días a tu
    pago" (o "para fin de mes" con `usedFallbackHorizon`), fila de colchón extra con `Tag extra`, y
    ayuda "?" que abre un `BottomSheet` con `explainAvailable()` + desglose (saldo líquido,
    comprometido, colchón, días).
  - Estado sin margen (`availableBase <= 0`): monto en `expense`, "Sin margen hoy" y línea de ayuda.
  - Tarjeta "Este mes" con bloques Ingresos/Gastos (`MoneyText` + `StackedBar` base/extra con
    leyenda) y pie "Los extras son el {P}% de tus ingresos.".
  - "Cuentas" con saldo total y fila horizontal de tarjetas; "Recientes" con "Ver todos" y hasta 5
    `ListRow` (toque abre la edición).
  - Estados: Skeleton con la forma de cada bloque, vacío de primer uso (EmptyState con "Agregar
    movimiento"), error con reintento y pull-to-refresh.
- **Funciones puras de presentación:** `src/features/summary/utils/home.ts`
  (`heroProgress`, `isOverAllowance`, `isNoMargin`, `heroSpentText`, `daysToPaymentText`,
  `cushionText`, `extraDependencyText`, `heroAccessibilityLabel`) con tests. Se agregó
  `formatPesos` a `src/lib/money.ts` para la etiqueta accesible ("87.500 pesos").
- **Ajustes de componentes:** `AnimatedNumber` acepta `accessibilityLabel`; `MonthSelector` acepta
  `labelVariant`.
- **Accesibilidad:** el monto héroe tiene label completo ("Disponible hoy: 87.500 pesos, de
  108.500 pesos").
- **Archivos:** `app/(tabs)/index.tsx`, `src/features/summary/utils/home.ts` (+ test),
  `src/lib/money.ts` (+ test), `src/components/ui/AnimatedNumber.tsx`,
  `src/components/ui/MonthSelector.tsx`, `src/i18n/es.ts`.
- **Pendientes (✋ manual):** capturas de Inicio con datos reales (oscuro y claro) y con una cuenta
  nueva (estado vacío). Siguiente: R4.2.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (262) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R4.2 — Registro rápido

- **Qué se hizo:** Rediseño de `app/transaction-form.tsx` (alta rápida) conservando la capa de
  datos y la validación (esquema zod discriminado, hooks, invalidaciones):
  - Estructura vertical: encabezado ("Cancelar" + título), `SegmentedControl`
    Gasto|Ingreso|Transferencia, monto `displayLg` ("$ 0" atenuado cuando está vacío), fila de chips
    (Cuenta/Desde, Fecha, Base|Extra, Nota), guía "Toca una categoría para guardar", cuadrícula de
    categorías y `NumericKeypad` fijo al pie.
  - Monto con `NumericKeypad` + `applyKey` (máx. 12 dígitos), formateado con `MoneyText`; sin teclado
    nativo. Cambiar de tipo conserva el monto.
  - Cuadrícula 3×: 5 categorías + mosaico "Más". Orden por uso en 60 días con la función pura
    `rankCategoriesByUsage` (empates y sin uso por `sort_order`). "Más" abre un `BottomSheet` con el
    `CategoryPicker` completo.
  - Tocar categoría: si el monto es 0 → `error()` + sacudida del monto (sin guardar); si es válido →
    guarda, `success()`, cierra y muestra Snackbar "Guardado" con "Deshacer" (elimina lo creado).
  - Chips: Cuenta abre `BottomSheet` (por defecto la última usada, persistida); Fecha abre
    `BottomSheet` Hoy/Ayer/Elegir fecha (`@react-native-community/datetimepicker`); Base/Extra
    excluyentes (por defecto Base, no se recuerda); Nota expande un campo de una línea.
  - Transferencia: oculta categoría y Base/Extra; chips Desde/Hacia y `Button` primary "Guardar
    transferencia" en lugar de la cuadrícula; valida cuentas distintas en línea.
  - Edición: mismo lenguaje, datos cargados, categoría resaltada, "Guardar cambios" (primary) y
    "Eliminar" (destructive, con confirmación); tocar categoría solo selecciona.
  - Modal a pantalla completa (`presentation: 'fullScreenModal'`) con `KeyboardAvoidingView` y safe
    areas.
- **Snackbar global:** `src/lib/snackbar.ts` (Zustand de UI) + `SnackbarHost` en el layout raíz, para
  mostrar el "Guardado"/"Deshacer" después de cerrar el modal. `undoCreatedTransaction` en los hooks
  de movimientos elimina y refresca consultas desde fuera de React.
- **Componentes:** `Chip` ahora acepta `icon`; `SnackbarHost` exportado.
- **Funciones puras:** `rankCategoriesByUsage` (`src/features/transactions/utils/ranking.ts`) con
  tests (orden por uso, desempate, ventana de 60 días, sin categoría).
- **Dependencia agregada:** `@react-native-community/datetimepicker` (instalada con `npx expo install`;
  añadió su config plugin a `app.json`).
- **Archivos:** `app/transaction-form.tsx`, `app/_layout.tsx`, `src/lib/snackbar.ts`,
  `src/components/ui/SnackbarHost.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/index.ts`,
  `src/features/transactions/hooks/useTransactions.ts`,
  `src/features/transactions/utils/ranking.ts` (+ test), `src/i18n/es.ts`.
- **Pendientes (✋ manual):** capturas del modal (gasto, ingreso, transferencia y edición) y medir a
  mano cuántos toques toma registrar un gasto base. Siguiente: R4.3.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (266) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R4.3 — Movimientos

- **Qué se hizo:** Rediseño de la pestaña Movimientos según el Anexo B, conservando paginación,
  filtros y datos:
  - Encabezado con `ScreenHeader` (título "Movimientos"), `MonthSelector` y `IconButton` de búsqueda
    y de filtros (con badge cuando hay filtros activos). Al tocar buscar, el encabezado se transforma
    en un campo de búsqueda con botón de cerrar.
  - Franja resumen del mes: Ingresos, Gastos y Balance (coloreado según el signo).
  - `SectionList` con encabezados de día pegajosos ("Hoy"/"Ayer"/fecha y total del día) y filas con
    `ListRow`: ícono y color de categoría, título (nota o categoría), subtítulo "Categoría · Cuenta",
    monto con signo y color, `Tag` "Extra" y marcador de recurrente; transferencias con ícono propio
    y color neutro.
  - Eliminar con `SwipeableRow` (acción "Eliminar", reemplaza el mantener presionado) y Snackbar
    "Movimiento eliminado" con "Deshacer" (reinserta). Tocar la fila abre la edición.
  - Filtros en `BottomSheet` (cuenta, categoría, tipo, naturaleza) con "Limpiar" y "Aplicar".
  - Estados: Skeleton de filas, vacío con CTA "Agregar movimiento", vacío por filtros ("Nada con
    estos filtros" + "Limpiar filtros"), error con reintento, pull-to-refresh y paginación infinita.
  - Rendimiento: filas memoizadas con `keyExtractor` estable, `getItemLayout` precomputado (filas de
    64, encabezados de 40), `initialNumToRender`/`maxToRenderPerBatch`/`windowSize` y contexto de
    swipe estabilizado (`useMemo`). `ListRow` trunca a una línea.
- **Componentes:** `SwipeableRow` expone `useSwipeableRowGroup` (para cerrar la fila abierta al tocar
  otra); `SwipeableRowGroup` estabiliza su valor con `useMemo`.
- **Seed local:** `scripts/seed-movements.mjs` (300 movimientos de prueba; usa la anon key + un
  usuario real y respeta RLS). **No versionado** (añadido a `.gitignore`); ESLint ignora `scripts/**`.
- **Archivos:** `app/(tabs)/movements.tsx`, `src/components/ui/{ListRow,SwipeableRow,index}.ts(x)`,
  `src/i18n/es.ts`, `eslint.config.js`, `.gitignore`, `scripts/seed-movements.mjs` (local).
- **Pendientes (✋ manual):** capturas de la lista con datos, el menú de filtros y una fila deslizada;
  correr el seed y comprobar fluidez con ~300 movimientos. Siguiente: R4.4.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (266) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R4.4 — Autenticación y estados con personalidad

- **Qué se hizo:**
  - Rediseño de las tres pantallas de auth (login, registro, recuperar contraseña) con un layout
    compartido `AuthScaffold`: wordmark tipográfico "Finanzas" (Manrope, color `brand`), título y
    línea de apoyo cortos, formulario con `Input` v2, `Button` primary de ancho completo y enlaces
    secundarios como `Button` ghost. `KeyboardAvoidingView` + `ScrollView` para que el formulario no
    quede tapado.
  - Mostrar/ocultar contraseña con `IconButton`: nuevo `PasswordInput` (login/registro) que usa el
    nuevo accesorio derecho del `Input`.
  - `Input` v2 ahora acepta `rightAccessory` (contenedor con el campo + accesorio), conservando
    altura 52, label superior y estados de foco/error.
  - Se mantiene la lógica (react-hook-form + zod y errores traducidos).
  - **Estados v2 (revisión completa):** todas las pantallas ya usan `EmptyState`/`LoadingState`/
    `ErrorState` v2 con el microcopy del UX_SPEC. Verificadas y sin cambios pendientes:
    Inicio, Movimientos, Planificar, Más, Cuentas, Categorías, Recurrentes, sus formularios,
    `CategoryPicker`, layout raíz (carga de sesión) y design-preview. Ajustes de microcopy ya hechos
    en tareas previas (p. ej. "Aún no hay movimientos este mes", "Nada con estos filtros",
    "Empieza registrando tu primer movimiento").
- **Textos:** `es.auth.loginSupport`, `es.auth.showPassword`, `es.auth.hidePassword` (tono tuteo,
  frases cortas, sin signos de exclamación).
- **Archivos:** `app/(auth)/{login,register,forgot-password}.tsx`,
  `src/features/auth/components/{AuthScaffold,PasswordInput}.tsx`, `src/components/ui/Input.tsx`,
  `src/i18n/es.ts`.
- **Pendientes (✋ manual):** capturas de login, registro y un estado vacío; probar con teclado
  abierto que el botón siga visible. Siguiente: R4.5.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (266) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R4.5 — Pulido de interacción y accesibilidad

- **Haptics (auditoría, solo lo que faltaba):**
  - `success` también al guardar transferencia y al guardar cambios en edición.
  - `error` cuando falla la validación al guardar (además del monto en 0).
  - `warning` al eliminar desde la edición.
  - Ya existían: `success` en guardado rápido, `select` en chips/segmentado/teclas, `warning` al
    eliminar con deslizar, `tap` en el botón (+).
- **Animaciones:** nuevo `AnimatedEntrance` (fade + desplazamiento de 8 px, 220 ms) que **desactiva**
  la animación con "reducir movimiento". Se aplica a las tarjetas de Inicio con escalonado de 40 ms
  (héroe, Este mes, Cuentas, Recientes) y a las filas de Movimientos. El `BottomSheet` también respeta
  "reducir movimiento".
- **Accesibilidad:** se añadieron `accessibilityLabel` contextuales a las acciones de editar/archivar/
  restaurar (cuentas, categorías, recurrentes), a los selectores de ícono/color del formulario de
  categoría, y al enlace "Ver todos" de Inicio; se ampliaron las áreas táctiles de los enlaces de
  texto con `hitSlop` vertical (≈44) y `hitSlop` en los colores (32→44). Los estados ya dependen de
  texto/forma además del color (montos con signo, Tags con texto, `accessibilityState`).
- **Limpieza:** eliminado `app/design-preview.tsx`; removidas claves de i18n sin uso (`screens`,
  `auth.welcome`, `home.{availableThisMonth,extraDependency,extraDependencyHint,recentMovements,
  totalBalance}`, `transactionForm.{amount,accountOrigin,accountDestination,nature,natureHelp,save,
  saveAndAdd,deleted}`, `transactionList.{activeFilters,close,deleteTitle,deleteMessage,summaryOf}`);
  eliminado el alias deprecated `colors.warning` (sin uso). Sin hex/estilos sueltos (lint verde).
- **Alias deprecated que AÚN se usan (requisito 5):**
  - `colors.primary` → migrar a `colors.brand`: `app/accounts.tsx`, `app/account-form.tsx`,
    `app/recurring.tsx`, `app/categories.tsx`, `app/category-form.tsx`,
    `src/features/categories/components/CategoryPicker.tsx`.
  - `colors.onPrimary` → migrar a `colors.onBrand`: `app/category-form.tsx`,
    `src/features/categories/components/CategoryPicker.tsx`.
  - `colors.background` → migrar a `colors.bg`: `app/_layout.tsx`, `app/(tabs)/movements.tsx`,
    `src/components/ui/Screen.tsx`, `src/components/ui/TabBar.tsx`,
    `src/features/auth/components/LockScreen.tsx`.
- **Archivos:** `src/components/ui/AnimatedEntrance.tsx` (nuevo), `app/(tabs)/{index,movements}.tsx`,
  `app/{accounts,categories,recurring,category-form,transaction-form}.tsx`,
  `src/components/ui/{BottomSheet,index}.ts(x)`, `src/theme/colors.ts`, `src/i18n/es.ts`; eliminado
  `app/design-preview.tsx`.
- **Pendientes (✋ manual):** recorrer la app en oscuro/claro, con letra grande y "reducir movimiento";
  capturas de Inicio, Movimientos, Registro rápido y Planificar.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (266) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.1 — Presupuestos

- **Qué se hizo:** Presupuestos mensuales por categoría principal de gasto.
  - **Migración `006_budgets.sql`:** tabla `budgets` (id, `user_id` default `auth.uid()` →
    `auth.users on delete cascade`, `category_id` → `categories on delete cascade`, `amount bigint
    > 0`, `is_active` default true, timestamps, `unique (user_id, category_id)`), índices, trigger
    `updated_at` y RLS con políticas separadas por operación; el `WITH CHECK` verifica con `EXISTS`
    que la categoría es del usuario, de tipo `expense` y con `parent_id` nulo.
  - `src/types/database.ts`: tabla `budgets` (Row/Insert/Update).
  - `supabase/tests/002_rls_test.sql`: cubre budgets (A crea; B no ve; B bloqueado al crear con
    categoría de A; B no modifica filas de A; limpieza).
  - **Capa de datos `src/features/budgets`:** api (listar con categoría, crear, editar, eliminar),
    hooks con invalidación de `['budgets']`, y `useBudgetProgress(month)` que junta presupuestos +
    categorías + movimientos del mes.
  - **Función pura `calculateBudgetProgress(budgets, categories, transactions)`:** devuelve por
    presupuesto `{ spent, remaining, ratio, status }` y los totales. El gasto de subcategorías se
    acumula en la madre; transferencias e ingresos no cuentan; umbrales ok/near/over
    (<85%, 85–100%, >100%). Tests exhaustivos (subcategorías, transferencias, ratio>1, sin gasto,
    categoría archivada, inactivos y totales).
  - **Pantalla `app/budgets.tsx`:** MonthSelector, lista con `ListRow` + `ProgressBar` +
    "$ gastado de $ presupuesto" y "te quedan/te pasaste $ X" (colores: ok brand, near expense 0.65,
    over expense), botón agregar, estados de carga/vacío/error. Crear/editar en `BottomSheet`
    (categoría principal sin presupuesto, monto con `NumericKeypad`, "Guardar" y "Eliminar").
  - **Planificar:** tarjeta "Presupuestos" con el resumen (total gastado de total presupuestado con
    `ProgressBar`) que abre `/budgets`; sin presupuestos muestra la invitación.
- **Textos:** bloque `budgets` y `plan.budgets` en `src/i18n/es.ts`.
- **Archivos:** `supabase/migrations/006_budgets.sql`, `supabase/tests/002_rls_test.sql`,
  `src/types/database.ts`, `src/features/budgets/{api,hooks,utils}/*` (+ test), `app/budgets.tsx`,
  `app/(tabs)/plan.tsx`, `src/i18n/es.ts`.
- **Pendientes (✋ manual):** ejecutar `006_budgets.sql` en Supabase y luego el script RLS con dos
  usuarios (confirmar que ninguno ve presupuestos del otro). Capturas de Planificar con presupuestos
  y de la pantalla de presupuestos. Siguiente: R5.2.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (276) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.2 — Análisis

- **Qué se hizo:** Pantalla de análisis con gráficos propios (sin librerías de gráficos).
  - **Dependencia:** `react-native-svg` (instalada con `npx expo install`).
  - **Funciones puras `src/features/analysis/utils`:** `spendingByCategory` (agrupa subcategorías en
    la madre y el resto en "Otros"; monto y porcentaje; soporta `kind`), `monthlyTrend` (6 meses con
    ingresos, gastos y base/extra de ingresos), `extraShareByMonth` y `buildInsights` (2–3 frases
    según reglas: variación vs mes anterior, categoría que más pesa, dependencia de extras; sin
    comparar si faltan datos). `pagination.ts` (`hasMorePages`, `nextOffset`) con tests.
  - **Componentes `src/components/charts`:** `DonutChart` (monto central + leyenda/tabla),
    `GroupedBarChart` (ingresos vs gastos por mes) y se reutiliza `StackedBar`. Colores solo de
    tokens/paleta; cada gráfico con `accessibilityLabel` resumen y tabla de datos en texto.
  - **Capa de datos:** `getTransactionsForRange` pagina en bloques de 1000 filas (límite de
    PostgREST) para no truncar los 6 meses; `useAnalysis(month, kind)` junta la consulta de 6 meses +
    categorías y calcula todo.
  - **Pantalla `app/analysis.tsx`:** MonthSelector, bloque de insights, SegmentedControl
    Gastos | Ingresos con `DonutChart` y lista de categorías, "Últimos 6 meses" con
    `GroupedBarChart` y "Base y extras" (porcentaje de extras por mes con `ProgressBar`). Estados de
    carga (Skeleton), vacío ("Registra movimientos para ver tu análisis") y error.
  - **Enlaces:** Planificar (fila "Análisis") e Inicio (IconButton de análisis en el encabezado).
- **Textos:** bloque `analysis` en `src/i18n/es.ts`.
- **Archivos:** `src/features/analysis/{api,hooks,utils}/*` (+ tests), `src/components/charts/*`,
  `app/analysis.tsx`, `app/(tabs)/{plan,index}.tsx`, `src/i18n/es.ts`, `package.json`.
- **Pendientes (✋ manual):** captura completa de Análisis (modo oscuro); confirmar que los totales
  del donut coinciden con los de Movimientos del mismo mes. Siguiente: R5.3.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (290) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.3 — Registro sin conexión (infraestructura)

- **Qué se hizo (solo creación offline; sin UI nueva):**
  - **Dependencias:** `@tanstack/react-query-persist-client`,
    `@tanstack/query-async-storage-persister`, `@react-native-community/netinfo` y `expo-crypto`.
  - **Conectividad:** `setupOnlineManager()` conecta `onlineManager` con NetInfo (`src/lib/netinfo.ts`).
  - **Persistencia:** `src/lib/persister.ts` (AsyncStorage) y `PersistQueryClientProvider` en el
    layout raíz con `gcTime`/`maxAge` de 7 días. Dehydrate solo de mutaciones de creación de
    movimientos `paused` y de queries de lectura `success`; nunca tokens (la sesión sigue en su
    storage de Supabase).
  - **Idempotencia:** `createTransaction` usa `expo-crypto` (`randomUUID`) y trata el conflicto de id
    (`23505`) como éxito. El id viaja en las variables de la mutación (se genera en el formulario),
    así un reintento tras reiniciar no duplica.
  - **Reanudación:** `setMutationDefaults(['transactions','create'], { mutationFn, networkMode:
    'offlineFirst', onSuccess: invalidar transactions/accounts/summary })`; `resumePausedMutations`
    al restaurar (Provider `onSuccess`), al iniciar con sesión y al reconectar (`useOfflineSync`).
    `useCreateTransaction` ahora usa `mutationKey: ['transactions','create']` y `offlineFirst`.
  - **Cierre de sesión:** `signOut()` limpia el caché en memoria (`queryClient.clear()`) y el
    persistido (`persister.removeClient()`), incluidas las mutaciones pendientes.
  - **`classifyMutationError(error)`** puro (`network` | `server` | `validation`) con tests (red
    caída, 4xx, 5xx, constraint).
  - **Formulario:** el payload de creación incluye `id` de cliente; un `mountedRef` evita navegar o
    mostrar Snackbar si la pantalla ya se cerró al reanudarse una mutación.
  - **Documentación:** nueva sección "8. Offline" en `docs/ARCHITECTURE.md` con diseño y límites.
- **Archivos:** `src/lib/{queryClient,netinfo,persister}.ts`, `app/_layout.tsx`,
  `src/features/transactions/{api/transactions.ts, offline.ts, hooks/useTransactions.ts,
  hooks/useOfflineSync.ts, utils/mutationError.ts (+ test)}`, `src/features/auth/api/auth.ts`,
  `app/transaction-form.tsx`, `docs/ARCHITECTURE.md`, `package.json`.
- **Pendientes (✋ manual):** modo avión → crear 2 gastos → reiniciar → quitar modo avión → verificar
  en Supabase que llegan **2 filas** (no 4). Nota: la UI de estados offline (banner, "Por
  sincronizar", etc. del UX_SPEC) queda para una tarea de UI posterior; esta fase no cambia pantallas.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (295) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.4 — Registro sin conexión (experiencia de usuario)

- **Qué se hizo:** Se hizo visible el estado de conexión y la cola de pendientes.
  - `useConnectivity()` (vía `useSyncExternalStore` sobre `onlineManager`).
  - `ConnectivityPill` (píldora discreta) en Inicio y Movimientos: "Sin conexión" o
    "Sin conexión · N por sincronizar"; con conexión y pendientes, "Sincronizando…"; luego desaparece.
  - **Cola visible en Movimientos** con `useMutationState` (filtro `mutationKey: ['transactions',
    'create']`, sin tocar el caché de la lista): las creaciones pendientes aparecen como filas con Tag
    "Sin sincronizar" al inicio del día correspondiente (la función pura `mergePendingByDay` inserta
    los pendientes y crea el día si hace falta).
  - **Errores no transitorios** (`classifyMutationError !== 'network'`): la fila pasa a "No se guardó"
    y al tocarla abre un `BottomSheet` con "Reintentar" (reencola con el mismo id) y "Descartar"
    (quita la mutación de la cola).
  - **Registro rápido offline:** guarda y cierra de inmediato (encola) con Snackbar "Guardado. Se
    sincronizará cuando haya conexión.".
  - **Editar/eliminar offline:** se bloquea con Snackbar "Necesitas conexión para esto." (lista de
    Movimientos, recientes de Inicio y formulario de edición).
  - **Inicio:** bajo la tarjeta héroe, si hay pendientes, "Hay N movimientos sin sincronizar; tus
    saldos se actualizarán al conectarte.". Los saldos y totales no cambian hasta sincronizar.
- **Funciones puras de presentación:** `src/features/transactions/utils/offlinePresentation.ts`
  (`connectivityText`, `pendingNoticeText`, `mergePendingByDay`) con tests.
- **Archivos:** `src/lib/useConnectivity.ts`, `src/components/ui/ConnectivityPill.tsx` (+ export),
  `src/features/transactions/hooks/usePendingTransactions.ts`,
  `src/features/transactions/utils/offlinePresentation.ts` (+ test), `app/(tabs)/{movements,index}.tsx`,
  `app/transaction-form.tsx`, `src/i18n/es.ts`.
- **Pendientes (✋ manual):** captura de Movimientos con una fila pendiente y la píldora; probar los
  cuatro estados (sin conexión, con pendientes, sincronizando, error) en un development build.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (303) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.5 — Recurrentes con confirmación

- **Qué se hizo:**
  - **Migración `007_pending_transactions.sql`:** enum `transaction_status` ('posted','pending'),
    `transactions.status` (not null default 'posted'), enum
    `recurring_confirmation_mode` ('auto','confirm'), `recurring_rules.confirmation_mode` (not null
    default 'auto'), índice `(user_id, status)` y vista `account_balances` recreada sumando **solo**
    `status = 'posted'` (mismo orden de columnas, `security_invoker = true`).
  - `src/types/database.ts` (enums + columnas) y `recurringRuleSchema` (`confirmation_mode`).
  - **Auditoría de agregaciones (todas filtran `posted`):**
    1. Vista `account_balances` (SQL).
    2. `getTransactionsInRange` (resumen, presupuestos, disponible) → `.eq('status','posted')`.
    3. `getTransactionsForRange` (análisis) → `.eq('status','posted')`.
    4. `listTransactions` (Movimientos) → filtro `status: 'posted'`; los pendientes van en su sección.
    5. `calculateTotals` (y por tanto `groupTransactionsByDay`) ignora `pending`.
    6. `calculateMonthSummary` ignora `pending`.
    7. `calculateBudgetProgress` ignora `pending`.
    8. `spendingByCategory` y `monthlyTrend` (análisis) ignoran `pending`.
    9. `calculateAvailableToday` ignora `pending` en `monthTransactions`; su efecto entra por
       `pendingExpenses`.
    10. (Exportación futura: pendiente de implementar; deberá filtrar `posted`.)
  - **Generación:** `buildGeneratedRows(rule, dates)` (puro) crea `status 'pending'` para reglas
    `confirm` y `'posted'` para `auto`; `generateDueTransactions` lo usa (sigue idempotente por el
    índice único).
  - **Formulario de reglas:** switch "Pedir confirmación cada vez" (solo gastos) con su ayuda.
  - **Inicio:** banner "N pagos por confirmar" bajo la tarjeta héroe → `BottomSheet` con la lista;
    cada ítem abre un `BottomSheet` con `NumericKeypad` para ajustar el monto y "Confirmar"
    (`status 'posted'` + monto) o "Descartar" (elimina).
  - **Movimientos:** sección "Por confirmar" al inicio con Tag 'Por confirmar' (`status 'pending'`).
  - **Disponible hoy:** `pendingExpenses` = suma de gastos pendientes del mes.
- **Tests:** `buildGeneratedRows` (auto/confirm), `confirmationUpdate`, y `pendingTotals.test.ts`
  (un `pending` no altera `calculateTotals`, `calculateMonthSummary`, `calculateBudgetProgress`,
  `spendingByCategory`, `monthlyTrend` ni `calculateAvailableToday`).
- **Archivos:** `supabase/migrations/007_pending_transactions.sql`, `src/types/database.ts`,
  `src/features/{transactions,summary,budgets,analysis,recurring}/**`,
  `app/recurring-form.tsx`, `app/(tabs)/{index,movements}.tsx`, `src/i18n/es.ts`,
  `docs/DATA_MODEL.md`.
- **Pendientes (✋ manual):** ejecutar `007_pending_transactions.sql` y el script de RLS; comparar el
  saldo de las cuentas antes y después (deben ser idénticos).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (312) y `npx expo export --platform android` en verde.

### [2026-10-07] Tarea: R5.6 — Exportar movimientos a CSV

- **Qué se hizo:**
  - **Dependencias:** `expo-file-system` y `expo-sharing` (con `expo install`; sharing añadió su
    config plugin). Se usó la **API nueva** de `expo-file-system` (`File`, `Paths`) y
    `Sharing.isAvailableAsync()` / `shareAsync`.
  - **Función pura `transactionsToCsv(rows)`** (`src/features/transactions/utils/csv.ts`): columnas
    fecha, tipo, naturaleza, categoría, subcategoría, cuenta, cuenta_destino, monto, nota, recurrente;
    separador `;`, BOM UTF-8, escape de comillas/separadores/saltos de línea, monto entero sin
    formato, fecha `YYYY-MM-DD`, tildes; omite movimientos `pending`. Deriva categoría/subcategoría
    (si la categoría tiene padre, la madre es "categoría" y la hija "subcategoría").
  - **Exportación** (`src/features/transactions/api/export.ts`): consulta paginada en bloques de 1000
    (`status='posted'`, con categoría + padre), genera el CSV en el directorio de caché, abre la hoja
    de compartir y elimina el archivo temporal. `exportRangeBounds` (puro) para Este mes / Este año /
    Todo.
  - **UI:** en Más, grupo **"Datos"** con "Exportar movimientos" → `ExportSheet` (BottomSheet) con
    selector de rango, botón "Exportar", estado "Exportando…", vacío ("No hay movimientos en este
    rango") y error con reintento (el botón permanece).
- **Tests:** `transactionsToCsv` (BOM/encabezados, montos, categoría/subcategoría, escape de
  comillas/`;`/saltos, pendientes omitidos, transferencias, recurrente, tildes) y `exportRangeBounds`.
- **Archivos:** `src/features/transactions/utils/csv.ts` (+ test), `utils/exportRange.ts` (+ test),
  `api/export.ts`, `components/ExportSheet.tsx`, `app/(tabs)/more.tsx`, `src/i18n/es.ts`,
  `package.json`/`app.json`.
- **Pendientes (✋ manual):** probar en un development build que el CSV abre en Excel y Google Sheets
  con columnas, tildes y montos correctos (requiere módulos nativos).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (322) y `npx expo export --platform android` en verde.

### [2026-10-15] Tarea: R6.1 — Eliminar cuenta dentro de la app

- **Qué se hizo:** Eliminación de cuenta con una Edge Function de Supabase (las tiendas la exigen):
  - **Edge Function** `supabase/functions/delete-account/index.ts` (Deno): valida el JWT del
    encabezado `Authorization` creando un cliente con ese token y llamando a `auth.getUser()`; si es
    inválido responde `401`. Con un cliente administrador (`SUPABASE_URL` y
    `SUPABASE_SERVICE_ROLE_KEY`, inyectadas automáticamente por Supabase) llama a
    `auth.admin.deleteUser(user.id)`. Responde JSON de éxito/error y no registra datos personales.
    Las filas se borran en cascada (`on delete cascade` a `auth.users` en `profiles`, `accounts`,
    `categories`, `transactions`, `recurring_rules` y `budgets`; verificado en las migraciones 001 y
    006).
  - **`supabase/functions/README.md`:** instrucciones de despliegue con la Supabase CLI
    (`login`, `link`, `deploy`) y alternativa pegando el código en el editor del panel.
  - **App:** fila destructiva "Eliminar cuenta" en **Más → Cuenta** que abre
    `app/delete-account.tsx`: explica en 3 líneas qué se borra y que es irreversible, ofrece
    "Exportar mis datos primero" (abre el `ExportSheet` de R5.6), pide escribir `ELIMINAR` para
    habilitar el botón destructivo e invoca `supabase.functions.invoke('delete-account')`. Al
    responder bien limpia todo el estado local y va a login con Snackbar "Tu cuenta se eliminó.".
  - **Limpieza de estado** (`src/features/auth/api/deleteAccount.ts` +
    `src/features/auth/utils/deleteAccount.ts`): cierra la sesión en local
    (`signOut({ scope: 'local' })`), vacía el caché en memoria (`queryClient.clear()`), el persistido
    y la cola de mutaciones (`clearPersistedCache`, R5.3), cancela las notificaciones programadas y
    restablece los stores de Zustand (biometría en SecureStore, recordatorios, preferencias, última
    cuenta usada y tema). `resetLocalState(deps)` se inyecta por dependencias para poder testearlo.
  - **Manejo de errores:** sin conexión → "Necesitas conexión para eliminar tu cuenta."; fallo del
    servidor → mensaje claro con reintento. **No se cierra sesión si la eliminación falla.**
- **Funciones puras con tests:** `isDeleteConfirmationValid` (acepta `ELIMINAR` con trim y sin
  distinguir mayúsculas; rechaza vacío/incompleto/otra palabra) y `resetLocalState` (con mocks:
  llama a todas las dependencias, vacía el caché antes de resetear stores y tolera fallos de
  cierre de sesión/cancelación de notificaciones). 8 tests nuevos (330 en total).
- **Configuración:** `tsconfig.json` y `eslint.config.js` excluyen `supabase/functions` (código de
  Deno, no de la app).
- **Archivos:** `supabase/functions/delete-account/index.ts`, `supabase/functions/README.md`,
  `app/delete-account.tsx`, `app/(tabs)/more.tsx`, `src/features/auth/api/deleteAccount.ts`,
  `src/features/auth/utils/deleteAccount.ts` (+ test), `src/i18n/es.ts`, `tsconfig.json`,
  `eslint.config.js`, `docs/SECURITY_REVIEW.md`.
- **Pendientes (✋ manual):** desplegar la función (ver `supabase/functions/README.md`) y probarla con
  un usuario de prueba: verificar en Authentication → Users que desaparece y en el Table Editor que
  no quedan sus filas. Google Play además pide una URL pública con la explicación (P10.1).
- **Nota:** los tipos de rutas de Expo (`app/delete-account`) se regeneran al arrancar el dev server.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes) y
  `npm test` (330) en verde.

### [2026-10-15] Tarea: R6.2 — Enlaces profundos (confirmar correo y recuperar contraseña)

- **Qué se hizo:** Se implementó el flujo completo de deep links de autenticación:
  - **Scheme:** se mantuvo el `scheme` ya configurado (`finanzas`) en `app.json`. `expo-linking` ya
    estaba instalado.
  - **PKCE:** el cliente de Supabase usa `flowType: 'pkce'` (`src/lib/supabase.ts`); los enlaces de
    correo vuelven con `?code=` y se canjean con `exchangeCodeForSession` (con `setSession` como
    respaldo del flujo implícito).
  - **Función pura `parseAuthLink(url)`** (`src/features/auth/utils/authLink.ts`): clasifica la URL
    entrante en `session` (recuperación `type=recovery`/ruta `/reset-password`, o confirmación
    `type=signup|email|...`/ruta `/confirm-email`), `error` (vencido `otp_expired`, inválido o mal
    formado) o `none` (no es de auth). Reconoce el enlace de Expo Go (`exp://.../--/<ruta>`) y los
    tokens del hash (implícito).
  - **`useAuthDeepLink`** (montado en `app/_layout.tsx`): escucha `Linking.getInitialURL()` y los
    eventos `url`, marca `isRecoverySession` ANTES de crear la sesión, canja el código y traduce
    fallos a un estado de error.
  - **Store en memoria** `useAuthLinkStore` (`isRecoverySession` + error del enlace, no persistido).
  - **Guardias:** `(auth)/_layout` no redirige a las pestañas si hay recuperación activa;
    `(tabs)/_layout` manda a `/reset-password` en ese caso.
  - **Pantallas:** `app/(auth)/reset-password.tsx` (nueva contraseña + confirmación con zod, mínimo 8;
    "Guardar contraseña" → `updateUser`, desactiva la bandera, entra con Snackbar "Contraseña
    actualizada"), `app/(auth)/confirm-email.tsx` (canjea y entra), `app/(auth)/verify-email.tsx`
    ("Revisa tu correo", con el correo, "Reenviar correo" con enfriamiento de 60 s y volver a login) y
    el componente `AuthLinkErrorView` para enlaces vencidos/inválidos con botón para pedir uno nuevo.
  - **Registro:** tras `signUp` sin sesión navega a "Revisa tu correo" con el correo.
- **Tests:** `parseAuthLink` (válidas PKCE/Expo Go/`type`/hash, vencidas, inválidas, mal formadas y de
  otro tipo) y `resetPasswordSchema`. 14 tests nuevos (344 en total).
- **Docs:** `docs/ARCHITECTURE.md` sección 9 con el flujo, las URLs por permitir en Supabase
  (`finanzas://**` y `exp://**`) y la limitación en Expo Go.
- **Archivos:** `app/_layout.tsx`, `app/(auth)/{_layout,register,reset-password,confirm-email,verify-email}.tsx`,
  `src/features/auth/hooks/useAuthDeepLink.ts`, `src/features/auth/store/useAuthLinkStore.ts`,
  `src/features/auth/utils/authLink.ts` (+ test), `src/features/auth/api/auth.ts`,
  `src/features/auth/utils/schemas.ts` (+ test), `src/features/auth/components/AuthLinkError.tsx`,
  `src/lib/supabase.ts`, `src/i18n/es.ts`, `docs/ARCHITECTURE.md`.
- **Pendientes (✋ manual):** en Supabase (Authentication → URL Configuration) agregar a Redirect URLs
  `finanzas://**` y `exp://**`; reactivar "Confirm email"; probar los dos flujos con un correo real, de
  preferencia en un development build (en Expo Go el scheme propio depende del dev server).
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (344) y `npx expo export --platform android` en verde.

### [2026-10-15] Tarea: R6.3 — Seguridad y dependencias

- **Qué se hizo:** Re-auditoría posterior a R6.1/R6.2, sin agregar funcionalidades:
  - **RLS ampliado:** nuevo `supabase/tests/003_rls_test_v2.sql` (ejecutable en el SQL Editor). Usa
    los dos primeros usuarios de `auth.users`, reporta PASS/FAIL por caso en `_rls_results` y cubre
    **todas** las tablas (profiles, accounts, categories, transactions, recurring_rules, budgets),
    el acceso cruzado en SELECT/INSERT/UPDATE/DELETE, `budgets` (solo categoría de gasto principal),
    `transactions.status` (default `'posted'` y que `account_balances` ignora `'pending'`),
    `recurring_rules.confirmation_mode` (default `'auto'`), `account_balances` con `counts_as_liquid`
    y el aislamiento del rol `anon`. Limpia sus filas de prueba al final.
  - **Secretos:** re-búsqueda en el árbol y en el historial de git (`eyJhbGci` para JWT, `sb_secret`,
    `service_role`): sin coincidencias. La `service_role key` sigue existiendo **solo** en el entorno
    de la Edge Function.
  - **Logs/fugas:** sin `console.*`, `error.message` crudo ni `Alert.alert` en `app/` ni `src/`; los
    textos de `i18n` no interpolan correo/montos/token. El caché persistido (`finanzas-query-cache`,
    R5.3) guarda solo queries/mutaciones (sin tokens) y se borra al cerrar sesión.
  - **Dependencias:** `npx.cmd expo install --fix` alineó 8 paquetes de Expo al SDK 57 (solo
    parches; sin cambios de API). Se eliminó `eas-cli` de `devDependencies` (lo señalaba
    expo-doctor; EAS no está configurado y puede usarse con `npx eas-cli`), lo que quitó 340
    paquetes. `npm audit fix` sin `--force` no cambió el resultado restante.
- **Archivos:** `supabase/tests/003_rls_test_v2.sql`, `docs/SECURITY_REVIEW.md`, `package.json`,
  `package-lock.json`.
- **Resultado de dependencias:** `npm audit` → 67 (17 moderadas, 50 altas, 0 críticas);
  `npm audit --omit=dev` → 63. Todos los advisories restantes son de tooling de build/test, salvo
  `decode-uri-component` vía `expo-router` (moderado, DoS). Sin fixes compatibles (exigirían saltar
  de SDK). `expo-doctor` 21/21 y `expo install --check` en verde.
- **Pendientes (✋ manual):** ejecutar `003_rls_test_v2.sql` en Supabase con **dos usuarios reales** y
  confirmar que todas las filas salen en `TRUE`. (De R6.1/R6.2 siguen pendientes: desplegar la Edge
  Function `delete-account`, configurar las Redirect URLs y reactivar "Confirm email".)
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes),
  `npm test` (344) y `npx expo export --platform android` en verde.

### [2026-10-15] Tarea: R6.4 — Checklist de QA y cierre

- **Qué se hizo:** Preparación del cierre del rediseño, sin agregar funcionalidades:
  - **`docs/QA_CHECKLIST.md` (nuevo):** 72 casos manuales agrupados en 13 secciones (autenticación y
    recuperación, cuentas, categorías, registro rápido, movimientos, recurrentes, "Disponible hoy"
    con casos de fórmula y números esperados, presupuestos, análisis, sin conexión, exportar, eliminar
    cuenta, temas/accesibilidad/bloqueo), cada uno con pasos y resultado esperado en formato casilla.
  - **`docs/APP_GUIDE.md` reescrito por completo** al estado actual: fórmula v2, migraciones 005–007,
    RLS en 6 tablas/24 políticas, navegación de 5 elementos, sistema de diseño v2, features nuevas
    (presupuestos, análisis, offline, recurrentes con confirmación, exportar, eliminar cuenta, deep
    links), Edge Function, reglas de trabajo del agente ciego y lista "Para revisar visualmente".
    Se conservó su estructura de 12 secciones y se actualizó la tabla de historial con los prompts R
    (R0.1–R6.4) además de los P. Se corrigieron datos obsoletos (5 tabs, 137 tests, fórmula vieja,
    `eas-cli`, etc.).
  - **Código muerto eliminado:** `useReorderCategories` y `reorderCategories` (nunca usados),
    `isHapticsEnabled`/`setHapticsEnabled` y el flag `enabled` de `src/lib/haptics.ts` (sin UI que
    los use) y `calculateExtraDependency` (envoltorio trivial sin uso). Tests ajustados
    (`haptics.test.ts`, `summary.test.ts`).
  - **Sin TODOs resueltos pendientes:** la búsqueda en `app/`, `src/` y `supabase/` no encontró
    comentarios `TODO/FIXME/XXX/HACK` reales (solo texto "pegar TODO este archivo" en cabeceras SQL).
  - **Dependencias sin uso (detectadas, NO desinstaladas — pendiente de confirmación):**
    `expo-image`, `expo-web-browser`, `expo-device` (sin imports ni uso indirecto). `expo-system-ui`
    se deja (probablemente requerido por `userInterfaceStyle` en Android). `@expo/ui`,
    `expo-glass-effect`, `expo-symbols`, `react-native-screens`, `react-native-worklets`, `react-dom`
    y `react-native-web` se conservan por ser dependencias/peers indirectas o por soporte web.
- **Discrepancias docs vs código:** se documentan en la respuesta de la tarea (docs/DESIGN_SYSTEM.md y
  docs/UX_SPEC.md **no** se modificaron; queda a decisión del usuario).
- **Archivos:** `docs/QA_CHECKLIST.md` (nuevo), `docs/APP_GUIDE.md`, `src/features/categories/api/categories.ts`,
  `src/features/categories/hooks/useCategories.ts`, `src/lib/haptics.ts`, `src/lib/haptics.test.ts`,
  `src/features/summary/utils/summary.ts`, `src/features/summary/utils/__tests__/summary.test.ts`,
  `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** ejecutar `docs/QA_CHECKLIST.md` en un dispositivo real y enviar capturas
  finales; decidir sobre las dependencias sin uso y las discrepancias de diseño listadas.
- **Calidad:** `npm run typecheck`, `npm run lint` (2 avisos informativos preexistentes) y
  `npm test` (343) en verde.

### [2026-10-15] Tarea: R7.0 — Rama y documentos del diseño v3

- **Qué se hizo:** Preparación del rediseño v3, sin escribir código de la app:
  - Confirmada la rama `feat/ui-v3` (creada desde `feat/redesign`, commit `dedbe65`).
  - Copia exacta de los documentos v2 a `docs/archive/DESIGN_SYSTEM_v2.md` y
    `docs/archive/UX_SPEC_v2.md` (verificada byte a byte con SHA256 contra el commit `dedbe65`).
  - Copia mecánica de los Anexos de `guia-prompts-ui-v3-app-finanzas.md`: Anexo A →
    `docs/DESIGN_SYSTEM.md` (169 líneas) y Anexo B → `docs/UX_SPEC.md` (112 líneas). Verificada
    línea por línea contra el original (primera y última línea coinciden).
  - `AGENTS.md`: se precisó la regla de íconos ("Ionicons solo a través de `AppIcon`, con relleno
    permitido en `IconTile` y pestaña activa"), se agregó que esta etapa **solo cambia la capa
    visual** (no lógica de negocio, hooks de datos, `api` ni migraciones) y "si el diseño no cubre
    algo, pregunta antes de inventar". Se mantienen las reglas de colores fuera de `src/theme`, un
    solo botón primario por vista y ámbar solo para "extra".
  - `docs/DECISIONS.md`: cinco decisiones del v3 (bloque de color, íconos rellenos sin nueva librería,
    oscuro por defecto con claro soportado, degradado sutil con `react-native-svg` sin dependencias
    nuevas, formato compacto de montos grandes en resúmenes).
- **Archivos creados o modificados:** `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, `docs/UX_SPEC.md`,
  `docs/DECISIONS.md`, `docs/PROGRESS.md`, `docs/archive/DESIGN_SYSTEM_v2.md` (nuevo),
  `docs/archive/UX_SPEC_v2.md` (nuevo).
- **Nota:** la guía quedó dentro del repo (`guia-prompts-ui-v3-app-finanzas.md`, commit `dedbe65`),
  no en una carpeta hermana; se usó esa copia como fuente.
- **Pendientes (✋ manual):** revisar la extracción de los Anexos y arrancar R7.1.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (343) en verde. Solo cambios de documentación; no se tocó código de la app.

### [2026-10-15] Tarea: R7.1 — Tokens v3

- **Qué se hizo:** Tokens del tema alineados al diseño v3 sin romper la API de `useTheme()` ni las
  pantallas:
  - **Colores (`src/theme/colors.ts`):** valores exactos de la sección 3.1 del Anexo (oscuro y
    claro) y tokens nuevos: `brandDeep`, `onBrandMuted`, `blockTrack`, `blockSoft`, `blockDecor`,
    `brandText`, `extraFill`, `dangerSoft`. Se conservan `background`, `primary` y `onPrimary` como
    alias deprecated apuntando a `bg`, `brand` y `onBrand`.
  - **Tipografía:** `displayLg` 44/52 y `title` 24/30 (sección 4); el resto sin cambios.
  - **Radios:** `xl` pasa a 20 y se agrega `sheet` 28 (sección 5); `sm/md/lg/pill/button` sin cambios.
  - **Espaciado:** nuevo token `spacing.screen = 20` (margen lateral de pantalla).
  - **Nueva `src/theme/tilePalette.ts`:** las 12 fichas de la sección 3.2 con
    `{ darkBg, darkIcon, lightBg, lightIcon }`, `getTileColors(key, mode)` y la función pura
    `resolveTileKey(input)` (categorías por nombre por defecto §3.3, color guardado → clave más
    cercana en tono, cuentas por tipo; fallback `gray`). Exportada desde `src/theme/index.ts`.
  - **Tests:** `contrast.test.ts` ampliado (19 pares de texto a 4.5:1 en ambos modos + 12 fichas a
    3:1 en ambos modos) y nuevo `tilePalette.test.ts` (categorías por defecto, color desconocido,
    personalizadas y cuentas). +64 tests (407 en total).
- **Decisiones tomadas:**
  - `radii.xl` ya existía con 24 (lo usan `Card` y `BottomSheet`); con visto bueno se alineó a 20
    (sección 5) y se añadió `sheet` 28. `BottomSheet` quedará en 20 hasta que R7.4 lo pase a `sheet`.
  - Nuevo token de espaciado llamado `screen` (20).
  - En `resolveTileKey` el mapeo por **nombre** de las categorías por defecto tiene prioridad sobre
    el color guardado: los colores de las categorías por defecto son heredados (p. ej. `Extra` es
    verde #22C55E pero la sección 3.3 pide `yellow`), así que sin esa precedencia no se cumpliría la
    sección 3.3. Para categorías personalizadas se usa el color.
- **Contraste:** todos los pares pasan con los valores EXACTOS del Anexo, sin ajustes de luminosidad.
- **Archivos:** `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/radii.ts`,
  `src/theme/spacing.ts`, `src/theme/tilePalette.ts` (nuevo), `src/theme/index.ts`,
  `src/theme/__tests__/contrast.test.ts`, `src/theme/__tests__/tilePalette.test.ts` (nuevo),
  `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar en el dispositivo (ver lista en la respuesta) y continuar con R7.2.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (407) en verde.

### [2026-10-15] Tarea: R7.2 — Barras del sistema

- **Qué se hizo:** borde a borde y barras del sistema alineadas al tema, sin dependencias nuevas:
  - **`src/lib/systemBars.ts` (nuevo):** función pura `getStatusBarStyle(mode, variant)` (`block` =
    siempre íconos claros; `plain` = claros en oscuro, oscuros en claro) + tests.
  - **`src/components/ui/SystemBars.tsx` (nuevo):** componente `<SystemBars variant>` que aplica el
    estilo de la barra de estado con `expo-status-bar` y el color de fondo del sistema (vista raíz)
    con `SystemUI.setBackgroundColorAsync(colors.bg)`; reacciona al cambio de tema (incluido
    "Sistema"). Exportado desde `@/components/ui`.
  - **`useTheme()`** ahora expone `mode` (`'dark' | 'light'` efectivo) para que las barras sepan el
    modo resuelto.
  - **Layout raíz:** se reemplazó `<StatusBar style="auto" />` por `<SystemBars variant="plain" />` y
    se le dio `backgroundColor` al contenedor raíz.
  - **Docs:** `docs/ARCHITECTURE.md` sección 10 con la solución y sus límites (color de la barra de
    navegación deprecado en Android 15+, íconos de la barra de navegación controlados por el sistema
    y nota de Expo Go / development build).
  - **Tests:** +2 (409 en total).
- **Decisiones tomadas:**
  - Solución con lo ya instalado (`expo-status-bar` + `expo-system-ui`); **no** se agregó
    `expo-navigation-bar` (sería dependencia nueva y su personalización de fondo está deprecada con
    borde a borde).
  - El "fondo de la barra de navegación" se logra pintando la vista raíz con el token `bg` (lo que se
    ve detrás de la barra transparente en borde a borde).
- **Archivos:** `src/lib/systemBars.ts` (nuevo), `src/lib/systemBars.test.ts` (nuevo),
  `src/components/ui/SystemBars.tsx` (nuevo), `src/components/ui/index.ts`, `src/theme/useTheme.ts`,
  `app/_layout.tsx`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar en el dispositivo (capturas arriba/abajo en oscuro y claro) y
  continuar con R7.3.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (409) en verde.

### [2026-10-15] Tarea: R7.3 — Íconos rellenos y fichas de color

- **Qué se hizo:** variante rellena de íconos + componente de ficha con color:
  - **`AppIcon`:** nueva prop `filled` (por defecto `false`) y función pura exportada
    `resolveIconName(name, filled)` (resuelve el sufijo `-outline` a su versión rellena si existe en el
    mapa de Ionicons; si no, cae al contorno o al glifo por defecto). Se añadió `hasGlyph(name)` (puro)
    para consultar el mapa sin importar Ionicons fuera de este archivo. `AppIcon` sigue siendo el único
    archivo que importa Ionicons. La prop `size` pasa de `IconSize` a `number` (sin romper llamadas) para
    permitir el tamaño del ícono de la ficha.
  - **`src/components/ui/IconTile.tsx` (nuevo):** ficha cuadrada `{ icon, tileKey, size }` con
    `size: 32 | 40 | 48` (por defecto 40), radios 10/12/14 según tamaño, fondo y color de ícono desde
    `getTileColors(tileKey, mode)`, ícono **relleno** al 55% del lado (18/22/26 px). Accesibilidad:
    decorativa (`accessible={false}`) salvo que se pase `accessibilityLabel` (rol `image`).
  - **`src/components/ui/tileHelpers.ts` (nuevo):** helpers puros `resolveCategoryTile(category)` y
    `resolveAccountTile(account)` + hooks `useCategoryTile` / `useAccountTile` que devuelven
    `{ icon, tileKey }`. Combinan `resolveTileKey` con el ícono guardado. Ícono por tipo de cuenta:
    `cash=wallet`, `bank=business`, `savings=piggy-bank si existe en Ionicons o cash`, `credit_card=card`.
  - **`app/dev-preview.tsx` (nuevo):** pantalla solo-dev (redirige a `/` si `!__DEV__`, sin enlace desde
    la app) con las 12 fichas en los 3 tamaños y un interruptor oscuro/claro. Se eliminará en R7.14.
  - **Exports:** `IconTile`, `resolveIconName`, `hasGlyph`, `useCategoryTile`, `useAccountTile`,
    `resolveCategoryTile`, `resolveAccountTile` y tipos desde `@/components/ui`.
  - **Tests:** `AppIcon.test.ts` (`resolveIconName`, `hasGlyph`), `IconTile.test.tsx` (tamaños, radios y
    color por modo, accesibilidad) y `tileHelpers.test.ts` (categorías, cuentas y hook). +15 (424 total).
- **Decisiones tomadas:**
  - `resolveIconName` y `hasGlyph` viven en `AppIcon.tsx` para que siga siendo el único archivo que
    importa Ionicons (regla de `eslint.config.js`).
  - Ionicons **no** trae `piggy-bank` (verificado en el mapa de glifos), así que `savings` cae a
    `wallet` (ícono de `cash`) como respaldo, según lo pedido en el prompt.
  - El ícono de la ficha se calcula al 55% y se redondea: 32→18, 40→22, 48→26.
- **Archivos:** `src/components/ui/AppIcon.tsx`, `src/components/ui/IconTile.tsx` (nuevo),
  `src/components/ui/tileHelpers.ts` (nuevo), `src/components/ui/index.ts`, `app/dev-preview.tsx` (nuevo),
  `src/components/ui/__tests__/AppIcon.test.ts` (nuevo),
  `src/components/ui/__tests__/IconTile.test.tsx` (nuevo),
  `src/components/ui/__tests__/tileHelpers.test.ts` (nuevo), `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** abrir `dev-preview` y enviar capturas de las fichas en oscuro y claro;
  continuar con R7.4.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (424) en verde.

### [2026-10-15] Tarea: R7.4 — Piezas base (bloque, hoja, interruptor, avatar, variantes)

- **Qué se hizo:** nuevas piezas base del diseño v3 + variantes opcionales en componentes existentes,
  sin cambiar props actuales (solo se agregan opcionales):
  - **`BlockHeader` (nuevo):** bloque de marca a todo ancho con degradado vertical brand→brandDeep
    dibujado con `react-native-svg` (ya instalado, sin dependencias nuevas) y dos círculos decorativos
    translúcidos (`blockDecor`) arriba a la derecha. `paddingTop = zona segura + 12`, `paddingBottom = 44`;
    `overflow: hidden`. Expone `children`.
  - **`Sheet` (nuevo):** contenedor con fondo `bg`, radios superiores `sheet` (28), `marginTop -28` para
    solapar el bloque y padding horizontal = `spacing.screen` (20).
  - **`ScreenScaffold` (nuevo):** variante `block` (BlockHeader con slot `header` + Sheet con scroll) o
    `plain` (encabezado normal sobre bg). Incluye `SystemBars` con la variante correspondiente
    (`block`/`plain`) y respeta la zona segura inferior (`insets.bottom + spacing.xl`).
  - **`Avatar` (nuevo):** círculo con inicial, tamaños 32/36/44, fondo `blockTrack` sobre el bloque y
    `brand` fuera, texto `onBrand`. Decorativo salvo `accessibilityLabel`.
  - **`Switch` (nuevo):** riel 44×26 y perilla 20, encendido `brand` / apagado `surfaceHigh`, animación de
    150 ms con `react-native-reanimated` que respeta "reducir movimiento", `accessibilityRole="switch"`
    con `checked`/`disabled` y haptic de selección.
  - **`Card`:** radio `xl` (20) y padding 16; borde de 1 px solo en modo claro (en oscuro sin borde).
  - **`SegmentedControl`:** prop `tone` `default | onBlock` (contenedor `blockSoft`, activo fondo
    `onBrand` y texto `brand`, inactivo `onBrandMuted`).
  - **`MonthSelector`:** prop `tone` `default | onBlock` (mes y chevrones en `onBrand`).
  - **`Button`:** variante `onBrand` (fondo `onBrand`, texto `brand`); base con radio 16 (`radii.lg`).
  - **`ListRow`:** prop `leading` (nodo) que reemplaza el círculo; `icon`/`iconColor` ahora opcionales;
    alto mínimo 64 (ya existía).
  - **`ProgressBar`:** props `tone` `default | onBlock` (riel `blockTrack`, relleno `onBrand`) y `status`
    `ok | near | over` (brand; expense al 65%; expense). Riel por defecto pasa a `surfaceHigh` (§6).
  - **`StackedBar`:** el único consumidor (Inicio) usa `extraFill` para el segmento "extra" (§6).
  - **`dev-preview`:** bloque + hoja de ejemplo con Avatar, Switch (también el toggle de tema),
    SegmentedControl `onBlock`, ProgressBar `onBlock` y los tres estados, Button `onBrand` y la
    cuadrícula de fichas.
  - **Tests:** nuevos de `BlockHeader`, `Sheet`, `ScreenScaffold`, `Avatar`, `Switch`, `Card` y pruebas de
    las props nuevas en `Button`, `ListRow`, `ProgressBar`, `SegmentedControl` y `MonthSelector`.
    +21 (445 en total).
- **Decisiones tomadas:**
  - `react-native-svg` ya estaba instalado (lo usan los charts), así que no hizo falta agregar nada.
  - Tamaños/posiciones de los círculos decorativos del bloque no venían en el Anexo: se definieron como
    constantes nombradas (`DECOR_WIDTH`, radios) y se recortan con `overflow: hidden`.
  - Como la barra de pestañas ocupa su espacio en el layout de `Tabs`, `ScreenScaffold` solo agrega la
    zona segura inferior; si una pantalla necesita más aire puede usar `contentContainerStyle`.
  - `BottomSheet` **no** se toca en esta tarea (no está en la lista del prompt); sigue en radio 20 y su
    paso a `radii.sheet` (28) queda pendiente para su prompt correspondiente.
  - Se aplicó el radio 16 del Button a todas las variantes (§6 "Button: alto 52, radio 16").
- **Archivos:** `src/components/ui/BlockHeader.tsx` (nuevo), `Sheet.tsx` (nuevo),
  `ScreenScaffold.tsx` (nuevo), `Avatar.tsx` (nuevo), `Switch.tsx` (nuevo), `Card.tsx`,
  `SegmentedControl.tsx`, `MonthSelector.tsx`, `Button.tsx`, `ListRow.tsx`, `ProgressBar.tsx`,
  `index.ts`, `app/dev-preview.tsx`, `app/(tabs)/index.tsx` (StackedBar `extraFill`),
  `src/components/ui/__tests__/BlockHeader.test.tsx` (nuevo), `Sheet.test.tsx` (nuevo),
  `ScreenScaffold.test.tsx` (nuevo), `Avatar.test.tsx` (nuevo), `Switch.test.tsx` (nuevo),
  `Card.test.tsx` (nuevo), `Button.test.tsx`, `ListRow.test.tsx`, `ProgressBar.test.tsx`,
  `SegmentedControl.test.tsx`, `MonthSelector.test.tsx`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** abrir `dev-preview` y enviar capturas del bloque con hoja en oscuro y claro;
  continuar con R7.5.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (445) en verde.

### [2026-10-15] Tarea: R7.5 — Barra de pestañas v3

- **Qué se hizo:** rediseño visual de `src/components/ui/TabBar.tsx` sin tocar rutas ni comportamiento
  (el botón central sigue abriendo `/transaction-form`):
  - **Pestañas:** 5 elementos (Inicio, Movimientos, botón central, Planificar, Más), etiquetas completas
    en variante `micro` (11 px). Activa: ícono **relleno** y color `brandText`; inactiva: ícono de
    **contorno** y color `textSecondary`. Se resolvió con `AppIcon filled={focused}` y nombres base
    (`home`, `list`, `pie-chart`, `ellipsis-horizontal`).
  - **Botón central:** anillo de 64 px de color `bg` con el círculo de 56 px `brand` dentro (deja 4 px de
    anillo alrededor, efecto de recorte sin sombra), ícono `add` relleno en `onBrand`, desplazado 14 px
    hacia arriba y con haptic `tap()`.
  - **Barra:** fondo `bg`, línea superior de 1 px (`border`), alto 64 + zona segura inferior; cada pestaña
    con `accessibilityRole="button"`, `accessibilityLabel` y `selected`.
  - **Tests:** nuevo `TabBar.test.tsx` (etiquetas + botón central, pestaña activa y color, navegación al
    pulsar, apertura del registro rápido). +4 (449 en total).
- **Decisiones tomadas:**
  - Los íconos se guardan por nombre base (`home`, no `home-outline`) y `AppIcon` decide relleno/contorno
    según el estado, reutilizando `resolveIconName` de R7.3.
  - El "anillo de 4 px" se implementó como un contenedor `bg` de 64 px alrededor del círculo `brand` de
    56 px (no como `borderWidth`, para que el color sea exactamente el token `bg`).
  - Se cambió la línea superior de `hairlineWidth` a 1 px según §6.
- **Archivos:** `src/components/ui/TabBar.tsx`, `src/components/ui/__tests__/TabBar.test.tsx` (nuevo),
  `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar la barra en el dispositivo sobre Inicio (con bloque) y sobre
  Movimientos (sin bloque), en oscuro y claro; continuar con R7.6.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (449) en verde.

### [2026-10-15] Tarea: R7.6 — Inicio

- **Qué se hizo:** rediseño visual de `app/(tabs)/index.tsx` con `ScreenScaffold variant="block"`, sin
  tocar la lógica de datos (mismos hooks: `useAvailableToday`, `useMonthSummary`, `useAccounts`,
  `useBudgets`, `usePendingConfirmations`, `usePendingTransactions`, `useProfile`, `useConnectivity`).
  - **Bloque** (`src/features/summary/components/HomeHero.tsx`): saludo `Hola, {nombre}` (caption,
    `onBrandMuted`), `MonthSelector tone="onBlock"` ("octubre 2026" con chevrones) y `Avatar` 36 a la
    derecha; etiqueta "Disponible hoy" con ícono de ayuda (abre el `BottomSheet` de desglose ya
    existente); monto con `AnimatedNumber` variante `display` en `onBrand`; `ProgressBar tone="onBlock"`;
    pie "Gastaste X de Y" / "N días a tu pago" (o "N días para fin de mes") en `onBrandMuted`; píldora
    "Colchón extra {monto}" (fondo `blockSoft`, texto `onBrand`) cuando aplica.
  - **Sin margen:** el monto sigue en `onBrand` y el texto "Sin margen hoy. Revisa tus pagos próximos."
    va en `onBrandMuted` (nunca coral/verde sobre el bloque). **Primer uso:** monto "$ 0" y texto
    "Registra tu ingreso base para calcularlo".
  - **Hoja, en orden:** banner de pendientes (`PendingBanner`) → píldora de conexión (`ConnectivityPill`)
    → tarjeta "Empieza en 3 pasos" (`OnboardingCard`, 3 filas con `IconTile` 32 y check al cumplirse) →
    "Este mes" (`MonthSummaryCard`, Ingresos y Gastos con `StackedBar` base/extra y pie de % de extras) →
    "Cuentas" (`AccountsSection`, total a la derecha y fila horizontal de tarjetas con `IconTile` por
    tipo) → "Recientes" (`RecentSection`, hasta 5 `ListRow` con `IconTile` de categoría y enlace
    "Ver todos").
  - **Estados:** `Skeleton` con la forma de cada sección (incluido el bloque azul, con el nuevo
    `Skeleton tone="onBlock"`), error con `ErrorState`/reintento y pull-to-refresh (`ScreenScaffold`
    gana un prop opcional `refreshControl`).
  - **Navegación de los pasos:** "Agrega tu ingreso base" abre `/transaction-form?type=income`;
    "Registra tu primer gasto" abre `/transaction-form`; "Ponle tope a un gasto" abre `/budgets`.
- **Decisiones tomadas (confirmadas con la persona):**
  - Se permitió un cambio mínimo en `app/transaction-form.tsx` para aceptar `?type=income|expense|transfer`
    y preseleccionar el segmento (el formulario solo leía `id`).
  - La tarjeta "Empieza en 3 pasos" se muestra **mientras falte algún paso** (no solo en primer uso) y se
    oculta cuando los tres están cumplidos. `hasIncome`/`hasExpense` salen de los movimientos del mes ya
    cargados; `hasBudget` de `useBudgets`.
  - Íconos y fichas de los pasos: ingreso `cash`/green, gasto `cart`/coral, presupuesto `flag`/yellow.
  - `getOnboardingSteps`/`isOnboardingDone` son puras, en `src/features/summary/utils/onboarding.ts`.
  - Los componentes de sección importan los componentes de UI por archivo directo (no por el barrel),
    para no arrastrar `TabBar`/`BottomSheet` en los tests; hay precedente en `CategoryIcon.tsx`.
  - Microcopy: `noMarginHelp` pasa a "Revisa tus pagos próximos." según Anexo B.
- **Archivos:** `app/(tabs)/index.tsx`, `app/transaction-form.tsx`,
  `src/components/ui/ScreenScaffold.tsx`, `src/components/ui/Skeleton.tsx`, `src/i18n/es.ts`,
  `src/features/summary/utils/onboarding.ts` (nuevo),
  `src/features/summary/utils/__tests__/onboarding.test.ts` (nuevo),
  `src/features/summary/components/{HomeHero,OnboardingCard,MonthSummaryCard,AccountsSection,RecentSection,PendingBanner,index}.tsx|ts` (nuevos),
  `src/features/summary/components/__tests__/HomeSections.test.tsx` (nuevo), `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** Inicio con datos y en cuenta nueva, en oscuro y claro (capturas) comparando
  con los mockups; continuar con R7.7.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (462) en verde.

### [2026-10-15] Tarea: R7.7 — Registro rápido

- **Qué se hizo:** rediseño visual de `app/transaction-form.tsx` con `ScreenScaffold variant="block"`
  (`scroll={false}`), sin tocar la lógica (zod, hooks, guardado offline, quick-save, transferencias,
  edición y haptics se mantienen).
  - **Bloque:** fila con "Cancelar" (`onBrandMuted`, absoluto a la izquierda) y título "Nuevo
    movimiento"/"Editar movimiento" (`onBrand`); `SegmentedControl tone="onBlock"` (Gasto/Ingreso/
    Transferencia); monto con `MoneyText size="displayLg"` (44/52, blanco tabular, "$ 0" en
    `onBrandMuted` cuando está vacío) dentro de un `Animated.View` que conserva la sacudida; línea
    centrada con "Cuenta · Fecha", cada parte tappable (abre su propia hoja) con chevron pequeño.
    En transferencia la línea muestra "Desde {A} → {B} · {fecha}".
  - **Hoja:** fila centrada de `Chip` (Base seleccionada por defecto `brandSoft`/`brandText`, Extra
    `extraSoft`/`extra`, Nota que despliega un campo de una línea); rejilla de categorías de 3 columnas
    (tarjetas con `IconTile` 40 + nombre, borde 1.5px `brand` cuando está seleccionada, toque = guardado
    rápido en creación y solo selección en edición) + mosaico "Más"; `NumericKeypad` al pie.
  - **Transferencia:** chips "Desde"/"Hacia" en la hoja y botón primario "Guardar transferencia" en
    lugar de la rejilla.
  - **Edición:** primario "Guardar cambios" y destructivo "Eliminar" con confirmación (`Alert`).
  - El monto usa `adjustsFontSizeToFit` con `minimumFontScale` 28/44 y `numberOfLines={1}` para no
    recortarse con 12 dígitos.
- **Componentes/tokens ajustados:**
  - `MoneyText`: `SIZE_STYLE` ahora sale de los tokens `fontSizes`/`lineHeights` (`displayLg` pasó de
    40/48 a 44/52) y su `style` se combina con el tamaño en vez de reemplazarlo (corrige que el
    `textAlign` de la llamada anulara el tamaño).
  - `NumericKeypad`: teclas con radio `radii.lg` (16), fondo `colors.surface`, `testID="keypad-key"`.
- **Guardrails (tests):** `MoneyText.test.tsx` verifica que la variante grande usa `fontSize` 44 (y
  `lineHeight` 52); `NumericKeypad.test.tsx` verifica 12 teclas de 52 px de alto.
- **Decisión (confirmada con la persona):** en transferencia se mantiene la fecha tappable, así que la
  línea del bloque es "Desde {A} → {B} · {fecha}".
- **Archivos:** `app/transaction-form.tsx`, `src/components/ui/MoneyText.tsx`,
  `src/components/ui/NumericKeypad.tsx`, `src/components/ui/__tests__/MoneyText.test.tsx`,
  `src/components/ui/__tests__/NumericKeypad.test.tsx`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** registrar un gasto base en ≤ 3 toques, en oscuro y claro; probar
  ingreso, transferencia, edición y eliminación, y el monto con 12 dígitos; comparar con los mockups.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (463) en verde.

### [2026-10-16] Tarea: R7.8 — Movimientos

- **Qué se hizo:** rediseño visual de `app/(tabs)/movements.tsx` (v3) sin tocar la lógica:
  paginación, filtros, búsqueda, deslizar para eliminar con deshacer, sección "Por confirmar" y
  filas offline se conservan igual.
  - **Cabecera (plana):** `ScreenHeader` con título y `IconButton` de búsqueda y de opciones (con
    `badge` cuando hay filtros activos); debajo, `MonthSelector` centrado. Al abrir búsqueda, la
    cabecera se sustituye por un `Input` con `autoFocus` y un `IconButton` de cerrar.
  - **Resumen:** `Card` con fondo `colors.brand` y radio `radii.xl`; tres columnas (Ingresos, Gastos,
    Balance) con etiqueta `onBrandMuted` (caption) y valor `onBrand` (`MoneyText`), todo con
    `formatCompactCOP`; el balance lleva prefijo `+` cuando es positivo.
  - **Lista:** `SectionList` por día con cabeceras fijas (etiqueta a la izquierda con "Hoy"/"Ayer"/
    "mar 7 oct" y total del día a la derecha en caption con signo). Filas con `ListRow` y `IconTile`
    de 40 al frente; título = nota o categoría; subtítulo "Categoría · Cuenta"; `Tag "Extra"` cuando
    `nature === 'extra'`; marcador de recurrente al final. Las transferencias usan ficha gris con
    icono de intercambio, título "Origen → Destino" y monto neutro.
  - Se conserva `getItemLayout`/`initialNumToRender`/`onEndReached`/pull-to-refresh; los esqueletos
    de carga toman la forma de la fila (círculo 40 + líneas) y los estados vacío/error usan los
    componentes v3.
  - **Hoja de filtros:** orden cuenta → categoría → tipo → naturaleza con "Limpiar"/"Aplicar".
  - **Deshacer:** se migra de `Snackbar` local con overlay a la tienda global de snackbar
    (`useSnackbarStore` + `SnackbarHost`), porque `ScreenScaffold` no expone `overlay`.
- **Lógica pura nueva:** `movementRowModel(item)` en
  `src/features/transactions/utils/movementRow.ts` deriva ficha, título, subtítulo, tipo y banderas
  (extra/recurrente) de cada movimiento; el modelo decide la ficha por nombre y, si no, por color,
  y cae a la ficha de ingreso/gasto por defecto.
- **Ajustes menores:** `formatDayHeader` pasa a `'EEE d MMM'` (p. ej. "mar 7 oct"); en
  `src/theme` se reutiliza `componentHeights.listRow` y `spacing` (sin valores sueltos). Se añade
  `es.transactionList.clear` ("Limpiar").
- **Corrección:** `src/lib/money.test.ts` tenía un bloque `formatPesos` mal formado que rompía la
  suite; se reescribió y se añadieron pruebas de `formatCompactCOP`.
- **Archivos:** `app/(tabs)/movements.tsx`, `src/features/transactions/utils/movementRow.ts`,
  `src/features/transactions/utils/__tests__/movementRow.test.ts`,
  `src/features/transactions/utils/transactions.ts`,
  `src/features/transactions/utils/__tests__/format.test.ts`, `src/lib/money.test.ts`,
  `src/i18n/es.ts`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** con 300 movimientos, comprobar fluidez de scroll y cabeceras fijas;
  combinar filtros (cuenta + categoría + tipo + naturaleza) y confirmar que el resultado no cambia
  respecto a antes; revisar resumen, transferencias, etiqueta "Extra", filas offline y "Por
  confirmar" en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (475) en verde.

### [2026-10-16] Tarea: R7.9 — Planificar y Presupuestos

- **Qué se hizo:** rediseño visual de `app/(tabs)/plan.tsx` y `app/budgets.tsx` (v3) sin tocar la
  lógica: `calculateBudgetProgress`, hooks de presupuestos, `BottomSheet` de crear/editar (categoría
  principal sin presupuesto, teclado numérico, "Guardar" y "Eliminar") y haptics se conservan.
  - **Planificar (encabezado plano "Planificar"):** tarjeta de fondo `brand` con "Presupuestos de
    {mes}" (caption `onBrandMuted`), el monto gastado (`onBrand`) seguido de "de {presupuestado}"
    (`onBrandMuted`) y `ProgressBar tone="onBlock"`. Sin presupuestos: "Ponle un tope a lo que más
    gastas" y botón `onBrand` "Crear presupuesto".
  - **Tarjeta de presupuestos principales:** hasta 3 (los de mayor uso, ordenados por `ratio` y luego
    por `spent`); cada fila con `IconTile` 32, nombre de categoría, texto a la derecha ("Te quedan…" o
    "Te pasaste…" en `expense`) y `ProgressBar` con `status` ok/near/over. Enlace "Ver todos ›" si hay
    más de 3.
  - **Filas de acceso** (`ListRow` con `IconTile` 40): "Pagos recurrentes" (ficha violet, subtítulo
    "Próximo: {nombre} · {fecha}" de la regla activa más próxima o "Automatiza lo que se repite cada
    mes.") y "Análisis" (ficha teal, primera frase de `buildInsights` o "Tus gastos por categoría y
    por mes.").
  - **Estados:** carga con `Skeleton` (tarjeta del bloque `tone="onBlock"` + tarjeta), error con
    `ErrorState` y reintento; el estado vacío de presupuestos vive dentro de la tarjeta del bloque.
  - **Presupuestos:** `MonthSelector`, lista de `Card` con `ListRow` (leads `IconTile` 40, subtítulo
    "{gastado} de {presupuesto}", a la derecha "Te quedan…"/"Te pasaste…") + `ProgressBar` con
    `status`; agregar con `IconButton "+"` en el encabezado (atrás a la izquierda); vacío con
    `EmptyState` y botón; carga con `Skeleton` y error con `ErrorState`.
- **Lógica pura nueva:** `src/features/plan/utils/planText.ts` con `recurringSubtitle(rules, today)`,
  `analysisSubtitle(insights)` y `featuredBudgets(items, max=3)` (subset de presupuestos principales),
  más pruebas en `src/features/plan/utils/__tests__/planText.test.ts`.
- **Textos (i18n):** `plan.budgetsOf`, `plan.spentDe`, `plan.recurringNext`, `plan.recurringFallback`,
  `plan.viewAll`, `plan.createBudget`; `plan.recurring` pasa a "Pagos recurrentes".
- **Decisión:** "los de mayor uso" se interpreta como mayor `ratio` (porcentaje de uso del tope),
  desempatando por gasto absoluto. Si se prefiere ordenar por gasto, es un cambio de una línea en
  `featuredBudgets`.
- **Archivos:** `app/(tabs)/plan.tsx`, `app/budgets.tsx`,
  `src/features/plan/utils/planText.ts`,
  `src/features/plan/utils/__tests__/planText.test.ts`, `src/i18n/es.ts`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar Planificar con y sin presupuestos y la pantalla de Presupuestos
  con 1, 3 y 4+ presupuestos (aparición de "Ver todos"); comprobar los colores de las barras a 85 % y
  por encima del 100 %; ver el subtítulo "Próximo…" con reglas activas, y el de Análisis según
  insights; en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (486) en verde.

### [2026-10-16] Tarea: R7.10 — Más

- **Qué se hizo:** rediseño visual de `app/(tabs)/more.tsx` (v3) conservando TODA la funcionalidad:
  tema, incluir extras, biometría (con su diálogo), recordatorios (permisos y build), exportar,
  cerrar sesión y eliminar cuenta, y la versión.
  - **Encabezado plano "Más"** y **tarjeta de perfil**: `Avatar` 44 con la inicial, nombre
    (`display_name`, con respaldo al correo) y caption "Cuenta personal"; no es tocable.
  - **Grupos** (título en caption + una `Card` por grupo, filas con `IconTile` 32 según el Anexo B):
    Organización (Cuentas = blue, Categorías = violet), Preferencias (Apariencia = yellow, Incluir
    extras = yellow, Biometría = green, Recordatorios = orange), Datos (Exportar = sky) y Cuenta
    (Cerrar sesión = gray, Eliminar cuenta = ficha danger).
  - **Apariencia:** fila con el valor actual a la derecha y chevron; abre un `BottomSheet` con
    Sistema/Oscuro/Claro (se cierra al elegir).
  - **Switches:** ahora usan el `Switch` v3 (riel brand/`surfaceHigh`), sin `trackColor`; la fila de
    recordatorios despliega la anticipación (Chips "El mismo día"/"1 día antes") cuando está activa.
  - **Pie:** "Versión {x}".
- **Componentes nuevos y con tests:** `src/features/more/components/ProfileCard.tsx` y
  `src/features/more/components/AppearanceOptions.tsx` (selector de apariencia con roles radio),
  más sus pruebas de render en `.../__tests__/`.
- **Textos (i18n):** `more.personalAccount` = "Cuenta personal".
- **Decisión (conflicto prompt ↔ Anexo B):** el prompt pedía "texto y ficha en danger" para el grupo
  Cuenta, pero el Anexo B §3.3 define "Cerrar sesión = gray". Se siguió el Anexo B (fuente de verdad):
  Cerrar sesión = ficha gray; Eliminar cuenta = ficha y texto en danger. No existe una ficha `danger`
  en la paleta (§3.2), así que la de Eliminar cuenta se dibuja con los tokens `dangerSoft`/`danger`
  (geometría de `IconTile` 32). Si se quiere, se cambia Cerrar sesión a danger.
- **Archivos:** `app/(tabs)/more.tsx`, `src/features/more/components/ProfileCard.tsx`,
  `src/features/more/components/AppearanceOptions.tsx`,
  `src/features/more/components/__tests__/ProfileCard.test.tsx`,
  `src/features/more/components/__tests__/AppearanceOptions.test.tsx`, `src/i18n/es.ts`,
  `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar Más completa (dos capturas) y el selector de apariencia; comprobar
  que Cuentas/Categorías navegan, que Apariencia cambia el tema y persiste, que cada Switch funciona
  (extras, biometría con su mensaje, recordatorios con anticipación), exportar, cerrar sesión y
  eliminar cuenta; en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (492) en verde.

### [2026-10-16] Tarea: R7.11 — Cuentas y Categorías

- **Qué se hizo:** rediseño visual v3 de `app/accounts.tsx`, `app/categories.tsx`,
  `app/account-form.tsx` y `app/category-form.tsx` sin tocar la lógica de datos (archivar con reglas,
  restaurar archivadas, validaciones, subcategorías de un nivel).
  - **Cuentas:** encabezado plano con atrás y `+` a la derecha; tarjeta de saldo total con fondo
    `brand` y texto `onBrand`; lista con `ListRow` + `IconTile` 40 por tipo, subtítulo y saldo a la
    derecha. Tocar abre la edición; deslizar (`SwipeableRow` con etiqueta "Archivar") pide
    confirmación y bloquea archivar la última cuenta activa. Se quitaron los enlaces de texto
    "Editar"/"Archivar". Carga con `Skeleton`, error con `ErrorState` y vacío con `EmptyState` + botón.
  - **Categorías:** encabezado plano con atrás y `+`; `SegmentedControl` Gastos | Ingresos; filas con
    `IconTile` 40 (subtítulo "N subcategorías" si las tiene) y subcategorías anidadas con sangría e
    `IconTile` 32. Cada fila tiene un `IconButton` "⋯" que abre un `BottomSheet` con "Editar",
    "Agregar subcategoría" (solo principales) y "Archivar" (danger); en la vista de archivadas el menú
    ofrece "Restaurar". Enlace "Ver archivadas" al final. Se quitaron los enlaces de texto de cada
    fila. Snackbar vía `useSnackbarStore` (global) porque `ScreenScaffold` no expone `overlay`.
  - **Formulario de cuenta:** `ScreenScaffold` + `Input` v3 y `Switch` v3 (se eliminó el `Switch` de
    React Native y su `trackColor`); un solo botón primary al pie.
  - **Formulario de categoría:** `ScreenScaffold` + `Input` v3; vista previa con `IconTile` 48 y
    cuadrícula de color con `IconTile` 32; rejilla de íconos con `AppIcon` sobre `surfaceRaised`/brand;
    un solo botón primary al pie.
- **Lógica pura nueva:** `accountSubtitle` (`src/features/accounts/utils/accountRow.ts`) y
  `categorySubtitle` + `colorTileKey` (`src/features/categories/utils/categories.ts`), con tests.
- **Componente extendido:** `SwipeableRow` acepta `actionLabel`/`actionIcon` (por defecto
  "Eliminar"/`trash-outline`, retrocompatible con Movimientos) para soportar "Archivar".
- **Textos (i18n):** `accounts.doesNotCountAsLiquid`, `categories.moreActions`,
  `categories.subcategoryOne`/`subcategoryMany`, `categories.archivedEmptyTitle`/`…Description`.
- **Caracteres rotos (punto 6):** no se encontró ningún texto de interfaz con caracteres rotos en el
  código (el único `ó` está en la guía y en la migración 008, que es dato/BD y queda fuera de alcance).
- **Decisión:** la parrilla de color mantiene los 12 valores de `categoryPalette` (para no cambiar los
  datos guardados) pero se dibuja con fichas `IconTile`; el preview usa el color elegido. El botón al
  pie usa "Guardar" (`es.common.save`) en ambos formularios, como pide la spec.
- **Archivos:** `app/accounts.tsx`, `app/categories.tsx`, `app/account-form.tsx`,
  `app/category-form.tsx`, `src/components/ui/SwipeableRow.tsx`,
  `src/features/accounts/utils/accountRow.ts` (+ test),
  `src/features/categories/utils/categories.ts` (+ test), `src/i18n/es.ts`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar Cuentas (con y sin saldo, 1 cuenta vs varias, swipe), Categorías
  (menú "⋯" abierto, subcategorías, archivadas) y los dos formularios (preview, cuadrícula de color e
  íconos, switch); en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (502) en verde.

### [2026-10-16] Tarea: R7.12 — Autenticación y estados vacíos y de error

- **Qué se hizo:** capa visual de las pantallas de auth y rediseño v3 de los estados vacío/error,
  sin tocar la lógica (react-hook-form + zod, textos de error traducidos, enlaces profundos,
  reenvío con enfriamiento, guardia de sesión y `isRecoverySession` se conservan).
  - **AuthScaffold:** ahora usa `ScreenScaffold variant="block" scroll={false}`. En el bloque va el
    wordmark tipográfico "Finanzas" (`display`, `onBrand`), el título (`title`, `onBrand`) y la
    línea de apoyo (`caption`, `onBrandMuted`); en la hoja, el formulario dentro de un
    `KeyboardAvoidingView` + `ScrollView` (`flexGrow: 1`, `keyboardShouldPersistTaps="handled"`) para
    que el teclado no tape el formulario y el botón primario quede alcanzable.
  - **Pantallas de auth:** `login`, `register`, `forgot-password`, `reset-password` y `verify-email`
    ya lo hacían a través de `AuthScaffold`; `confirm-email` y el estado de carga de `reset-password`
    pasan también al bloque (con `LoadingState` dentro) en lugar de una `Screen` plana.
  - **Input:** el radio pasa de `radii.md` (12) a `radii.lg` (16) según la spec (altura 52 se mantiene
    con `componentHeights.input`). Afecta a todos los formularios.
  - **PasswordInput:** conserva el `IconButton` ver/ocultar como accesorio; sin cambios de lógica.
  - **AuthLinkError:** el ícono de alerta ahora va en una ficha coral suave (`dangerSoft`/`danger`)
    coherente con `ErrorState`; se mantiene su botón "Pedir un enlace nuevo".
  - **EmptyState v3:** ficha de 64 px con radio 18 y color `brandSoft`/`brandText` (equivalente al
    `IconTile` 48 escalado), título, línea de apoyo y botón con verbo. Ahora `icon` es obligatorio: se
    eliminó el valor por defecto `sparkles-outline` para forzar un ícono contextual en cada llamada.
  - **ErrorState v3:** ficha de 64 px coral suave con ícono de alerta relleno (`alert-circle`),
    frase de qué pasó + qué hacer y botón "Reintentar".
- **Estados revisados (íconos contextuales añadidos):** Inicio (`home` no aplica: su vacío es por
  sección), Análisis (`bar-chart-outline`), Movimientos (`receipt-outline`, o `search-outline` con
  filtros activos), Planificar/Presupuestos (`pie-chart-outline`), Cuentas (`wallet-outline`),
  Categorías (`pricetags-outline` y `archive-outline` para archivadas), Recurrentes
  (`repeat-outline`) y los formularios que piden tener una cuenta (`wallet-outline`). Todos los
  errores de pantalla usan `ErrorState` y todas las cargas usan `Skeleton`/`LoadingState`.
- **Pendiente menor:** el vacío interno de secciones ("Recientes" en Inicio y `CategoryPicker`) sigue
  siendo una línea de `caption`, no una ficha; y el pie "cargar más" de Movimientos usa un
  `ActivityIndicator` propio (paginación, no estado de pantalla).
- **Archivos:** `src/components/ui/EmptyState.tsx`, `src/components/ui/ErrorState.tsx`,
  `src/components/ui/Input.tsx`, `src/features/auth/components/AuthScaffold.tsx`,
  `src/features/auth/components/AuthLinkError.tsx`, `app/(auth)/confirm-email.tsx`,
  `app/(auth)/reset-password.tsx`, `app/analysis.tsx`, `app/accounts.tsx`, `app/budgets.tsx`,
  `app/categories.tsx`, `app/recurring.tsx`, `app/recurring-form.tsx`, `app/transaction-form.tsx`,
  `app/(tabs)/movements.tsx`, `docs/PROGRESS.md`. (Sin cambios en `es.ts`: los textos existentes ya
  siguen el tono del Anexo.)
- **Pendientes (✋ manual):** revisar login, registro, recuperar y nueva contraseña en oscuro y claro,
  con el teclado abierto (que el botón primario quede visible), el ver/ocultar contraseña, los errores
  de formulario y el "enlace no sirve"; y los estados vacío/error de cada pantalla.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (502) en verde.

### [2026-10-16] Tarea: R7.13 — Análisis

- **Qué se hizo:** rediseño visual v3 de `app/analysis.tsx` con `ScreenScaffold variant="block"`, sin
  tocar la lógica ni los datos: `spendingByCategory`, `monthlyTrend`, `extraShareByMonth` y
  `buildInsights` siguen calculando lo mismo, y la consulta sigue trayendo solo `posted`.
  - **Bloque:** botón atrás (`onBrand`), título "Análisis" (`title`, `onBrand`), `MonthSelector
    tone="onBlock"` y la primera frase de `buildInsights` (`caption`, `onBrandMuted`); si no hay
    frases, "Registra movimientos para ver tu análisis".
  - **Hoja:** `SegmentedControl` Gastos | Ingresos; tarjeta del donut con monto central y la lista de
    categorías con `IconTile` 32, nombre, porcentaje y monto; "Últimos 6 meses"
    (`GroupedBarChart` con `income`/`expense`); "Base y extras" con el porcentaje de extras por mes
    y un `StackedBar` (base = `brand`, extra = `extraFill`) además de la leyenda.
  - **Colores del donut:** nueva función pura `sliceTileKey`/`sliceColor` en
    `src/features/analysis/utils/sliceColors.ts`, que reutiliza el mismo mapeo que las filas de
    categoría (por nombre y, si no, por color) para que cada categoría tenga siempre el mismo color
    (el color de ícono de la ficha del modo actual). "Otros" queda en gray.
  - **Estados:** carga con `Skeleton` (segmento + 3 tarjetas), error con `ErrorState` y reintento, y
    vacío con `EmptyState` (`bar-chart-outline`); con estados, el contenido se centra
    (`contentContainerStyle` con `flexGrow: 1`). Se quitó la tarjeta "Insights" porque la primera
    frase ya vive en el bloque (según la spec de la hoja).
  - **Datos:** `AnalysisCategory` y `CategoryFlow` ganan `icon` (aditivo) para pintar la `IconTile` de
    cada categoría en la lista; el ícono de "Otros" cae a `ellipsis-horizontal`.
  - **DonutChart:** nuevo prop opcional `legend` (por defecto `true`) para ocultar su leyenda interna
    y usar la lista v3 de la pantalla; su resumen accesible se conserva.
- **Tests:** `sliceColors.test.ts` verifica que la misma categoría pinta igual aunque cambien monto u
  orden, que el color sale de la ficha del modo actual, que "Otros" es gray y que oscuro ≠ claro.
- **Textos (i18n):** `analysis.base` ("Base") y `analysis.extra` ("Extra").
- **Archivos:** `app/analysis.tsx`, `src/components/charts/DonutChart.tsx`,
  `src/features/analysis/utils/analysis.ts`, `src/features/analysis/utils/sliceColors.ts` (nuevo),
  `src/features/analysis/utils/__tests__/sliceColors.test.ts` (nuevo),
  `src/features/analysis/utils/__tests__/analysis.test.ts`,
  `src/features/analysis/hooks/useAnalysis.ts`, `src/i18n/es.ts`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar Análisis con datos y en cuenta nueva (dos capturas con scroll),
  cambiar el mes y el segmento Gastos/Ingresos, comprobar que los totales del donut cuadran con
  Movimientos del mismo mes, el color de cada porción frente a su `IconTile`, "Otros" en gray, y los
  gráficos de 6 meses y de extras; en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (509) en verde.

### [2026-10-16] Tarea: R7.14 — Auditoría final y limpieza

- **Qué se hizo:** auditoría de consistencia del rediseño v3 frente a `docs/DESIGN_SYSTEM.md` y
  `docs/UX_SPEC.md`, y limpieza de código muerto/obsoleto. Sin tocar lógica de negocio, hooks de
  datos, `api` ni migraciones.
  - **Limpieza:** eliminado `app/dev-preview.tsx` (preview temporal de R7.3).
  - **Tokens obsoletos:** se migraron los últimos usos de los alias deprecated y se eliminaron de
    `src/theme/colors.ts`: `background`→`bg` (`app/_layout.tsx`, `src/components/ui/Screen.tsx`,
    `src/features/auth/components/LockScreen.tsx`), `primary`→`brand` (`app/recurring.tsx`,
    `src/features/categories/components/CategoryPicker.tsx`) y `onPrimary`→`onBrand` (CategoryPicker).
    Se quitó `radii.button` (14, sin uso y fuera de la spec). Se quitaron de `src/theme/typography.ts`
    las claves deprecated de `fontSizes` y `lineHeights` (`xs, sm, md, lg, xl, xxl`).
  - **Componentes:** se retiró el prop `overlay` de `Screen` (sin uso en v3); se reemplazó el `Switch`
    nativo de React Native (con `trackColor`) por el `Switch` v3 en `app/recurring.tsx` y
    `app/recurring-form.tsx`; `Input` pasó su `fontSize: 15` literal a `fontSizes.body`;
    `SegmentedControl` ganó `hitSlop` vertical para llegar a 44 px de área táctil (el control mide 40).
  - **Auditoría (sin hallazgos nuevos):** sin hex/rgb/`rgba()` fuera de `src/theme` (regla de lint);
    ámbar (`extra*`) solo en la naturaleza "extra"; un solo botón primario por vista; Ionicons solo
    vía `AppIcon`; `EmptyState`/`ErrorState`/`Skeleton` presentes en las pantallas; títulos/enlaces
    con `accessibilityRole`; sin `TODOs`, `console.*` ni caracteres rotos (mojibake) en el código.
- **Documentación:** `docs/APP_GUIDE.md` y `CLAUDE.md` actualizados al estado v3 (tokens, componentes
  v3, rama `feat/ui-v3`, historial R7.0–R7.14, estado real de la BD 001–007 aplicadas). Nueva
  `docs/QA_VISUAL.md`: checklist de QA visual por pantalla (oscuro/claro, texto grande, reducir
  movimiento) con los puntos del Anexo B.
- **Diferencias docs ↔ código (no se modificaron los docs):** `recurring*` y `delete-account` sin
  prompt R7 (estructura v2); `Screen` (v2) aún en uso por esas pantallas; `Snackbar` con posición
  fija que puede solapar la barra de pestañas; `fontSize: 36`/`lineHeight: 44` literales en
  `app/recurring-form.tsx`. Detalle en `CLAUDE.md` §17.3.
- **Archivos:** `app/dev-preview.tsx` (borrado), `src/theme/{colors,radii,typography}.ts`,
  `src/components/ui/{Screen,Input,SegmentedControl}.tsx`, `app/_layout.tsx`,
  `app/recurring.tsx`, `app/recurring-form.tsx`,
  `src/features/categories/components/CategoryPicker.tsx`,
  `src/features/auth/components/LockScreen.tsx`, `docs/APP_GUIDE.md`, `CLAUDE.md`,
  `docs/QA_VISUAL.md` (nuevo), `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** recorrer `docs/QA_VISUAL.md` en dispositivo real (oscuro y claro) y
  enviar capturas de las pantallas principales.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (509) en verde.

### [2026-10-16] Tarea: R8.0 — Geometría del bloque y de la hoja

**Diagnóstico R8.0**

**(1) El bloque azul termina antes del ancho y el círculo decorativo desborda.**

- Causa raíz: la decoración se dibuja en un **segundo `Svg` aparte**, posicionado en absoluto y con
  ancho/alto en **píxeles fijos** (`src/components/ui/BlockHeader.tsx:11-14`:
  `DECOR_WIDTH = 220`, `DECOR_HEIGHT = 170`; `:48-51`: `styles.decor = { position: 'absolute',
  top: 0, right: 0 }`). Sus círculos usan coordenadas **fuera del viewport** de ese SVG
  (`cx = DECOR_WIDTH - 18 = 202`, `r = 112`; `cx = DECOR_WIDTH - 132 = 88`, `r = 46`) y solo quedan
  contenidos si el padre los recorta. En Android un `Svg` nativo posicionado en absoluto no se
  recorta de forma fiable con el `overflow: 'hidden'` del contenedor, así que la mitad sobresaliente
  cae sobre el fondo oscuro (`colors.bg`) y se ve el "círculo gris"; el borde de esa capa queda
  junto al avatar (`HomeHero.tsx:76`), de ahí la "costura".
- Además, el `Svg` del degradado (`BlockHeader.tsx:38-46`) no define `viewBox` ni
  `preserveAspectRatio`, y el contenedor raíz tampoco declara `width: '100%'` (solo
  `alignSelf: 'stretch'`, `:60`), por lo que el relleno a todo el ancho/alto no está garantizado.
- Confirmación/descarte de las causas probables:
  - "ancho calculado una sola vez con `Dimensions` o con `onLayout`": **descartada**.
    `BlockHeader.tsx` no usa `Dimensions` ni `onLayout`; `Dimensions.get` solo aparece en
    `BottomSheet.tsx` (`useWindowDimensions`), fuera de este flujo.
  - "SVG con `width` y `height` fijos en lugar de 100%": **confirmada** para el SVG decorativo
    (`BlockHeader.tsx:48`); el del degradado sí usa 100%.
  - "círculos decorativos como `View` absolutas fuera de un contenedor con `overflow: hidden`":
    **parcial**. No son `View` sino `<Circle>` dentro de un `Svg` posicionado en absoluto
    (`styles.decor`, `:63-67`), sin `viewBox` ni capa de recorte propia, por lo que pueden
    desbordarse.
  - "`paddingBottom` del bloque sobrescrito o ausente": **descartada**. Existe y vale 44
    (`BlockHeader.tsx:9,32`).
  - "textos pasados como hijos de la hoja y no del bloque": **descartada**. Los textos de apoyo ya
    llegan a `BlockHeader` por `header` (`app/(tabs)/index.tsx:190-207` → `HomeHero.tsx:108-110`;
    `app/transaction-form.tsx:594-610`; `app/analysis.tsx:74-92`).
  - "márgenes o paddings horizontales aplicados al contenedor externo del bloque": **confirmada**.
    El `paddingHorizontal` está en la raíz (`BlockHeader.tsx:33`) en vez de en una `View` interna.
  - "`marginTop` negativo de la hoja absorbiendo el relleno inferior del bloque": **riesgo
    confirmado**. `Sheet` solapa 28 px (`Sheet.tsx:22`) y el bloque rellena 44 (`BlockHeader.tsx:32`);
    los 16 px teóricos son correctos, pero al no garantizarse el relleno a todo el ancho/alto, los
    textos inferiores caen sobre la zona oscura.

**(2) Los textos de apoyo quedan fuera del bloque, sobre el fondo oscuro.**

- No es un problema de ubicación en el árbol (los textos ya son hijos del `header`, ver arriba): el
  relleno inferior del bloque **no llega a pintarse de azul**. El degradado no tiene `viewBox`
  (`BlockHeader.tsx:38-46`) y la decoración vive en una capa absoluta aparte, de modo que la franja
  inferior del bloque (donde van "Registra tu ingreso base para calcularlo", la línea
  "{Cuenta} · {Fecha}" de Registro rápido y la frase de Análisis) queda sobre el `bg` oscuro. Con un
  único `Svg` a `absoluteFill` + `viewBox "0 0 100 100"` + `preserveAspectRatio="none"`, más el
  relleno de 44 y el solape de 28, quedan 16 px libres de azul bajo el último texto.

**(3) La hoja con esquinas superiores redondeadas no se aprecia.**

- Es consecuencia de (1)/(2): si la parte baja del bloque no es azul sólido, las esquinas
  redondeadas de la hoja (`Sheet.tsx:20-22`) no tienen azul detrás contra el que contrastar y
  desaparecen. Además, la hoja no declara `flex` ni `overflow: 'hidden'` y lleva el
  `paddingHorizontal` en su raíz (`Sheet.tsx:23`) en lugar de su contenido. Con la hoja a `flex: 1`,
  `overflow: 'hidden'` y el relleno horizontal movido al contenido interno, las esquinas se recortan
  y se aprecian sobre el bloque azul.

**Corrección aplicada (PASO B):** `src/components/ui/BlockHeader.tsx` (raíz `width: '100%'`,
`overflow: 'hidden'`, sin padding horizontal; un único `Svg` `absoluteFill` con
`viewBox "0 0 100 100"` y `preserveAspectRatio="none"` con el degradado y los dos círculos dentro;
contenido interno con `paddingTop = safeTop + 12`, `paddingBottom = 44`, `paddingHorizontal = 20`),
`src/components/ui/Sheet.tsx` (`marginTop -28`, radios `sheet`, `flex: 1`, `overflow: 'hidden'`,
padding horizontal en el contenido interno) y `src/components/ui/ScreenScaffold.tsx` (hoja a todo
ancho, `contentContainerStyle` sin padding horizontal).

- **Qué se hizo (PASO B):**
  - **`BlockHeader`:** contenedor raíz con `width: '100%'`, `alignSelf: 'stretch'` y
    `overflow: 'hidden'`, sin margen ni padding horizontal. Un **único `Svg`** a
    `StyleSheet.absoluteFill` con `width/height="100%"`, `viewBox "0 0 100 100"` y
    `preserveAspectRatio="none"` que dibuja el `LinearGradient` (de `brand` a `brandDeep`), el
    `Rect` de fondo y **los dos círculos** decorativos (`blockDecor`) dentro del mismo `Svg`
    (`cx=88, cy=8, r=24` y `cx=100, cy=30, r=30`). Se eliminaron las `View`/constantes de píxeles
    (`DECOR_WIDTH/HEIGHT/RADIO`) y el segundo `Svg` en absoluto. El contenido va en una `View` interna
    con `paddingTop = safeTop + 12`, `paddingBottom = 44` y `paddingHorizontal = 20`.
  - **`Sheet`:** `marginTop: -radii.sheet` (28), `borderTopLeft/RightRadius = radii.sheet`, fondo
    `bg`, `flex: 1` y `overflow: 'hidden'`; el `paddingHorizontal` (20) pasa a una `View` interna
    (`sheet-content`).
  - **`ScreenScaffold`:** la hoja ocupa todo el ancho y el `contentContainerStyle` del `ScrollView`
    no lleva padding horizontal (el padding lo aporta el contenido interno de la hoja). El bloque y
    la hoja se siguen renderizando en ese orden (`BlockHeader` → `Sheet`), con el solape de 28.
  - **Pantallas:** se revisó `app/(tabs)/index.tsx`, `app/transaction-form.tsx` y `app/analysis.tsx`:
    ya pasan sus textos de apoyo por `header` (van al bloque) y no añaden contenedores ni márgenes
    propios, por lo que **no requirieron cambios**. La fila superior de `HomeHero` (saludo +
    `MonthSelector` + `Avatar`) ya usa `row` + `space-between` dentro del contenido interno, así que
    el avatar queda dentro de los márgenes de 20.
  - **Lint:** nueva regla `no-restricted-properties` (objeto `Dimensions`, propiedad `get`) acotada a
    `src/components/ui/BlockHeader.tsx` en `eslint.config.js`. Verificada: marca el error al usar
    `Dimensions.get`.
  - **Tests:** `BlockHeader.test.tsx` (children dentro del raíz y del contenido; raíz `width '100%'` +
    `overflow 'hidden'`; contenido con `paddingBottom 44`, `paddingTop = safeTop + 12` y
    `paddingHorizontal 20`; un solo `Svg` con `preserveAspectRatio="none"` → `align 'none'`,
    `viewBox` 100×100, y los dos círculos dentro por `testID`) y `Sheet.test.tsx` (fondo `bg`, radios
    28, `marginTop -28`, `flex 1`, `overflow 'hidden'` y padding horizontal en el contenido). +4
    tests (513 en total).
- **Solo estructura y geometría:** no se tocaron colores, tipografía ni textos.
- **Archivos:** `src/components/ui/BlockHeader.tsx`, `src/components/ui/Sheet.tsx`,
  `src/components/ui/ScreenScaffold.tsx`, `src/components/ui/__tests__/BlockHeader.test.tsx`,
  `src/components/ui/__tests__/Sheet.test.tsx`, `eslint.config.js`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar en el dispositivo (lista "Para revisar visualmente" en la
  respuesta): bloque a todo el ancho sin franja oscura ni círculo desbordado, textos de apoyo sobre el
  azul y esquinas superiores redondeadas de la hoja, en las tres pantallas y en oscuro y claro.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (513) en verde.

### [2026-10-16] Tarea: R8.1 — Barras del sistema

**Diagnóstico R8.1**

**Versiones y configuración activa (leídas).**

- `expo` `~57.0.30` (SDK 57), `react-native` `0.86.3`, `expo-status-bar` `~57.0.1`,
  `expo-system-ui` `~57.0.4` (`package.json`).
- `app.json`: `userInterfaceStyle: "automatic"`; el bloque `android` solo tiene `adaptiveIcon` y
  `predictiveBackGestureEnabled`. **No** hay `edgeToEdgeEnabled`, **no** hay `androidStatusBar`, **no**
  hay `androidNavigationBar` ni `backgroundColor` de raíz.
- Uso actual:
  - `expo-status-bar`: solo `<StatusBar style animated>` (`src/components/ui/SystemBars.tsx:25`).
  - `expo-system-ui`: solo `SystemUI.setBackgroundColorAsync(colors.bg)` (vista raíz/ventana), dentro
    de un `useEffect` que depende de `colors.bg` y por tanto reacciona al tema (incluido "Sistema")
    (`SystemBars.tsx:21-23`). `getStatusBarStyle(mode, variant)` sigue decidiendo el estilo de los
    íconos (`src/lib/systemBars.ts`).
  - `SystemBars` se monta dos veces: en la raíz con `variant="plain"` (`app/_layout.tsx:131`) y en
    cada `ScreenScaffold` con `variant` según la pantalla (`ScreenScaffold.tsx:50`).

**Borde a borde (edge-to-edge) en Android: qué manda hoy.**

- En SDK 54 el borde a borde pasó a ser el **predeterminado para proyectos nuevos y existentes**, y
  con Android 16 es **obligatorio** (Google quitó el opt-out). En SDK 55 se **eliminó**
  `edgeToEdgeEnabled` de `app.json`: ya no se configura, siempre está activo (changelog SDK 54 y SDK
  55). Por tanto, en SDK 57 el borde a borde está activo y **no se puede desactivar**.
- Con borde a borde, Android **deprecó** el color propio de la barra de estado y de la de navegación:
  `expo-status-bar` `backgroundColor`/`translucent` y `expo-navigation-bar`
  `backgroundColor`/`borderColor`/`behavior`/`position` pasaron a ser **no-ops** (changelog SDK 55 y
  blog de borde a borde). Lo único controlable es: estilo de íconos (`style`) y visibilidad
  (`hidden`) de la barra de estado, y `setStyle`/visibilidad de la de navegación (y su `setStyle`
  solo tiene efecto si `enforceContrast` es `false`).
- **Expo Go:** el borde a borde está **siempre activo y sin opt-out** (blog). La barra de estado y la
  de navegación son **transparentes**; lo que se ve detrás es el contenido de la app (la vista raíz
  la pinta `expo-system-ui` con `bg`).
- El proyecto **no define `androidStatusBar`**. Según la referencia de `app.json`, el color de la
  barra por defecto para `light-content` sería `#00000088` (negro semitransparente) y `translucent`
  por defecto `true`; en borde a borde ese color se ignora, pero si un runtime volviera al
  comportamiento previo a borde a borde mostraría esa franja.

**Diagnóstico de los síntomas.**

- **Franja negra arriba + contenido debajo del borde (el bloque no llega arriba):** con borde a
  borde activo, la barra de estado es transparente y el bloque **debería** pintarse desde `y = 0`
  (`BlockHeader` es el primer hijo de `ScreenScaffold`, que a su vez llena la pantalla; el contenido
  del bloque ya deja `paddingTop = safeTop + 12`). Si se observa una franja opaca/oscura, significa
  que en ese run la barra de estado **no** se está comportando como borde a borde (versión de Expo Go
  o cliente que no aplica la transparencia); eso **no se puede forzar desde JS** con la API vigente.
  Un intento previo, `SystemUI.setBackgroundColorAsync(colors.bg)`, pinta la ventana, no la barra.
- **Franja gris clara abajo en modo oscuro:** es la barra de navegación. En navegación por
  **gestos** es transparente (se vería el `bg` que ya extiende el `TabBar`:
  `backgroundColor: colors.bg` + `paddingBottom: insets.bottom`, `src/components/ui/TabBar.tsx:62-71`).
  En navegación por **3 botones**, Android aplica por defecto un **scrim translúcido de contraste**
  (`android:enforceNavigationBarContrast = true`); sobre un fondo oscuro ese scrim se percibe como una
  franja gris claro. Ese scrim **no** se puede quitar ni colorear desde JS; se desactiva en tiempo de
  build con `enforceContrast: false` (plugin de `expo-navigation-bar`), que **no tiene efecto en Expo
  Go** y requiere instalar esa dependencia (no está en el proyecto).

**Solución con menos dependencias (la aplicada).**

1. **Barra de estado (arriba):** mantener `getStatusBarStyle` y añadir un **relleno de la zona
   segura superior**: una `View` absoluta, de alto `insets.top`, con `brand` en pantallas con bloque y
   `bg` en las demás. Garantiza que la franja superior sea del color correcto cuando el contenido sí
   subyace a la barra. La decisión de color es una función pura nueva,
   `getTopInsetColor(variant)` (`src/lib/systemBars.ts`), con tests.
2. **Barra de navegación (abajo):** con la API vigente **no** se puede fijar su color ni quitar el
   scrim desde JS, y `expo-navigation-bar` no está instalado (y en borde a borde su color es no-op).
   Lo que sí controlamos es que la ventana y el pie (hoja/`TabBar`) sean `bg`, que ya ocurre. El
   scrim de 3 botones queda **documentado** con lo que se verificaría en un development build.
3. **Sin dependencias nuevas** y sin tocar lógica de negocio, hooks de datos, `api` ni migraciones.

- **Qué se hizo (PASO B):**
  - **Función pura nueva:** `getTopInsetColor(variant): 'brand' | 'bg'` en `src/lib/systemBars.ts`.
    Decide el color del área de la zona segura superior: `brand` en pantallas con bloque, `bg` en las
    demás. `getStatusBarStyle` y sus tests se mantienen intactos.
  - **`ScreenScaffold`:** nueva `View` absoluta de relleno de la zona segura superior
    (`testID="top-inset-fill"`, `pointerEvents="none"`, `top/left/right: 0`, alto `insets.top`) con
    `colors[getTopInsetColor(variant)]`. Se renderiza como primer hijo (por detrás del bloque y del
    encabezado), así que no altera el contenido; garantiza que la franja superior sea `brand`/`bg`
    en lugar del fondo oscuro. Reacciona al tema porque sale de `useTheme()`.
  - **Barra de navegación:** no se pudo colorear ni quitar el scrim con la API vigente (deprecada en
    borde a borde) y `expo-navigation-bar` no está instalado; se documenta y se deja para verificar en
    un development build. La ventana ya se pinta con `SystemUI.setBackgroundColorAsync(colors.bg)` y el
    `TabBar` ya extiende `bg` hasta el borde inferior.
  - **`app.json`:** sin cambios (no hay `edgeToEdgeEnabled` que poner: se eliminó en SDK 55; tampoco
    `androidStatusBar`/`androidNavigationBar`, deprecados).
  - **`docs/ARCHITECTURE.md`:** sección "Barras del sistema" actualizada a la realidad de SDK 57
    (borde a borde obligatorio, no-ops, relleno de la zona segura superior, scrim de 3 botones y qué
    se verificaría en un development build).
  - **Tests:** `systemBars.test.ts` (color del área superior por variante) y `ScreenScaffold.test.tsx`
    (relleno con `brand` en `block` y `bg` en `plain`, con el alto de la zona segura). +4 tests (517).
- **Archivos:** `src/lib/systemBars.ts`, `src/lib/systemBars.test.ts`,
  `src/components/ui/ScreenScaffold.tsx`, `src/components/ui/__tests__/ScreenScaffold.test.tsx`,
  `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar en el dispositivo si desaparece la franja negra arriba (o queda
  el fondo del sistema, no atribuible a la app) y confirmar que la franja inferior responde a la
  barra de navegación del dispositivo; en un development build, verificar el scrim de 3 botones.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (517) en verde.

### [2026-10-16] Tarea: R8.2 — Acciones rápidas y "Últimos 7 días" en Inicio

- **Qué se hizo (PARTE 1 — acciones rápidas):**
  - Fila de tres acciones de igual ancho, separadas 12 px, al inicio de la hoja (antes de "Este mes"):
    "Gasto" (ficha coral, `arrow-up`), "Ingreso" (ficha verde, `arrow-down`) y "Transferir" (ficha
    azul, `swap-horizontal`). Cada columna es un `Pressable` con `IconTile` 40 y el texto debajo
    (caption), con `minHeight` 44 y `haptics.tap()` al pulsar.
  - Cada acción abre Registro rápido con el tipo elegido: `router.push({ pathname:
    '/transaction-form', params: { type } })`. El botón central (+) sigue abriendo sin parámetro
    (queda `'expense'` por defecto).
  - **Registro rápido:** el parámetro `type` se valida ahora con zod (`z.enum(['expense','income',
    'transfer']).safeParse`); si falta o es inválido cae a `'expense'`. Se mantiene el
    `SegmentedControl` con el tipo inicial.
  - **Accesibilidad:** cada acción es `role="button"` con etiqueta "Registrar un gasto" / "Registrar
    un ingreso" / "Hacer una transferencia".
- **Qué se hizo (PARTE 2 — "Últimos 7 días"):**
  - **Funciones puras nuevas** en `src/features/summary/utils/dailySpending.ts`: `getDailySpending`
    (gastos publicados por día en la ventana de 7 días, una fila por día de más antiguo a más
    reciente, en cero si no hubo gasto; ignora ingresos, transferencias y no publicados),
    `getDailyAverage` (promedio entero hacia abajo, contando los días en cero) y `getWeekdayInitial`
    (inicial en español, con "X" para miércoles), más `shiftISODate` (sin depender de zona horaria).
  - **Tarjeta** `DailySpendingCard`: título "Últimos 7 días" y a la derecha "Promedio {monto}/día";
    siete columnas de igual ancho con la barra del día (altura proporcional al máximo, entre 4 y 64;
    la de hoy en `brand`, el resto en `surfaceHigh`) y la inicial del día debajo. Al tocar una barra
    se muestra encima su monto compacto y `haptics.select()`; tocar otra mueve la etiqueta y tocar la
    misma la oculta. Sin gastos: "Aún no hay gastos esta semana".
  - **Datos:** hook `useDailySpending` que reutiliza `useTransactionsInRange` con `[hoy − 6, hoy]`
    (la API ya filtra `posted`); sin consultas nuevas.
  - **Estados:** carga con `Skeleton` con la forma de la tarjeta y error con `ErrorState` y reintento.
  - **Accesibilidad:** cada barra es `role="button"` con "{día}: {monto en palabras}"; el encabezado
    resume "Gastaste {total} en los últimos 7 días; promedio {promedio} por día".
- **Orden de la hoja (Inicio):** banner de pendientes, píldora de conexión, acciones rápidas,
  "Empieza en 3 pasos" (primer uso), "Este mes", "Últimos 7 días", "Cuentas", "Recientes". Actualizada
  la sección "Inicio" de `docs/UX_SPEC.md`.
- **Textos (i18n):** `home.quickExpense/quickIncome/quickTransfer`, `quickExpenseA11y/quickIncomeA11y/
  quickTransferA11y`, `last7Days`, `dailyAverage`, `dailyEmpty`, `dailyBar`, `dailySummary`.
- **Tests:** `dailySpending.test.ts` (ventana sin gastos, varios gastos el mismo día, ingresos y
  transferencias ignorados, no publicados ignorados, fuera de ventana, número de días, promedio,
  fronteras de mes y año, iniciales) y casos nuevos en `HomeSections.test.tsx` para `QuickActions` y
  `DailySpendingCard` (título y promedio, vacío, revelar monto al tocar, carga y error). +19 (536).
- **Archivos:** `src/features/summary/utils/dailySpending.ts` (nuevo),
  `src/features/summary/utils/__tests__/dailySpending.test.ts` (nuevo),
  `src/features/summary/hooks/useDailySpending.ts` (nuevo),
  `src/features/summary/components/QuickActions.tsx` (nuevo),
  `src/features/summary/components/DailySpendingCard.tsx` (nuevo),
  `src/features/summary/components/index.ts`,
  `src/features/summary/components/__tests__/HomeSections.test.tsx`, `app/(tabs)/index.tsx`,
  `app/transaction-form.tsx`, `src/i18n/es.ts`, `docs/UX_SPEC.md`, `docs/PROGRESS.md`.
- **Pendientes (✋ manual):** revisar las acciones rápidas (que abren Registro rápido con el tipo
  correcto) y el botón (+) central; la tarjeta "Últimos 7 días" con y sin gastos; tocar barras
  (mostrar/mover/ocultar el monto); en oscuro y claro, y con texto grande.
- **Calidad:** `npm run typecheck` en verde, `npm run lint` (0 errores, 2 avisos preexistentes) y
  `npm test` (536) en verde.

### [2026-10-17] Tarea: R8.3 - Categoría sugerida y movimientos frecuentes

- **Funciones puras nuevas** en `src/features/transactions/utils/suggestions.ts`: `normalizeText`,
  `suggestCategories`, `getFrequentTransactions`, con tests en `suggestions.test.ts`.
- **UI en `app/transaction-form.tsx`**: sugerencia con debounce 250 ms, reorden de cuadrícula,
  etiqueta "Sugerida" y pulso; fila horizontal "Frecuentes" con chips de un toque (guardado rápido
  con deshacer, respeta modo sin conexión).
- **Datos:** se amplió la ventana de `useTransactionsInRange` a 180 días para el historial; ranking
  sigue usando 60 días.
- **Textos:** `src/i18n/es.ts` (`suggested`, `frequentTitle`).
- **Calidad:** `npm run typecheck`, `npm run lint` (0 errores, avisos preexistentes) y `npm test`
  (552) en verde.

### [2026-10-17] Tarea: R8.4 - Análisis encabezado y barras interactivas

- **Encabezado** de `app/analysis.tsx`: IconButton volver con `arrow-back`, título centrado,
  MonthSelector con chevrones de 20 px, frase de insight solo si hay datos.
- **Función pura** `buildBarChartLayout` en `src/components/charts/layout.ts` con tests.
- **GroupedBarChart** interactivo: selección por columna, opacidad 0.45 en no seleccionados,
  accesibilidad por grupo, tabla alternativa.
- **Sincronización:** seleccionar mes en el gráfico actualiza `monthAnchor` y el resumen del mes.
- **Calidad:** `npm run typecheck`, `npm run lint` (0 errores, avisos preexistentes) y `npm test`
  (557) en verde.

### [2026-10-17] Tarea: R8.5 - Flujo del mes interactivo

- **Funciones puras** en `src/features/analysis/utils/cashFlow.ts`: `cumulativeBalanceByDay`,
  `buildLineChartLayout`, `nearestIndex`, con tests.
- **Componente** `CashFlowChart` en `src/components/charts/CashFlowChart.tsx` con arrastre horizontal,
  guía, etiqueta y punto; estado vacío.
- **Integración** en `app/analysis.tsx`: tarjeta "Flujo del mes" antes del donut con balance acumulado.
- **Calidad:** `npm run typecheck`, `npm run lint` (0 errores, avisos preexistentes) y `npm test`
  (567) en verde.

### [2026-10-17] Tarea: R8.6 - Micro-interacciones e ilustraciones

- **PressableScale** en `src/components/ui/PressableScale.tsx`; aplicado en ListRow y QuickActions.
- **EmptyIllustration** en `src/components/ui/EmptyIllustration.tsx` con variantes list/chart/target/wallet.
- **EmptyState** acepta prop `illustration`; aplicado en Movimientos, Análisis, Presupuestos, Cuentas y
  Recurrentes.
- **Snackbar** con entrada/salida animada (220/150 ms), respetando reducir movimiento.
- **Calidad:** `npm run typecheck`, `npm run lint` (0 errores, avisos preexistentes) y `npm test`
  (567) en verde.


### [2026-10-17] Tarea: Corrección de codificación UTF-8

- Escaneo del repositorio: corregido CLAUDE.md (bytes inválidos), PROGRESS.md, guia-prompts-ui-v3-app-finanzas.md, plan-maestro-r8-correcciones-y-evolucion.md.
- AGENTS.md: agregada regla de codificación Windows.
- Prueba automática: src/__tests__/encoding.test.ts.
- Migración: supabase/migrations/008_fix_text_encoding.sql.
- Calidad: typecheck, lint (0 errores) y test en verde.


## Verificación R8.0 y R8.1

| Requisito | Archivo | Estado |
|---|---|---|
| BlockHeader width 100% + overflow hidden | src/components/ui/BlockHeader.tsx | PASS |
| Fondo Svg absoluteFill width/height 100% preserveAspectRatio none | src/components/ui/BlockHeader.tsx | PASS |
| Decor circles inside Svg (cx 88/100) | src/components/ui/BlockHeader.tsx | PASS |
| Content padding bottom 44 | src/components/ui/BlockHeader.tsx | PASS |
| Sheet marginTop -28 + radios sheet | src/components/ui/Sheet.tsx | PASS |
| ScreenScaffold block structure | src/components/ui/ScreenScaffold.tsx | PASS |
| System bars getStatusBarStyle/getTopInsetColor | src/lib/systemBars.ts | PASS |
| Tests BlockHeader/Sheet/systemBars | src/components/ui/__tests__/* | PASS |


### [2026-10-17] Tarea: R8.0/R8.1 verificación + reducir movimiento centralizado + animaciones

- Verificación R8.0/R8.1: todos los requisitos PASS (tabla arriba).
- Creado src/lib/useReducedMotion.ts como fuente única.
- Migrados PressableScale, ProgressBar, Skeleton, Snackbar, transaction-form pulse.
- GroupedBarChart: barras crecen 320ms con stagger 40ms.
- CashFlowChart: línea/área se dibujan 400ms.
- Calidad: typecheck, lint (0 errores), tests (570) en verde.
