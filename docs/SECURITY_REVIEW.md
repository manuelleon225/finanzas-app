# Revisión de seguridad (Fase 9 — P9.2, actualizada en R6.3)

Fecha original: 2026-10-05. Última actualización: 2026-10-15 (R6.3).
Alcance: auditoría sin agregar funcionalidades.

## 1. Secretos en código e historial

- **Estado: ✅ PASA**
- No hay claves ni tokens en `src/`, `app/` ni archivos de configuración.
- La anon/publishable key y la Project URL solo viven en `.env` (no versionado).
- Búsqueda en todo el historial de git (`-S 'sb_publishable_…'`): **sin coincidencias**.
- Únicas menciones a `service_role` están en documentación instruccional (nunca se usa en la app).
- R6.3: búsquedas adicionales en el historial (`-S 'eyJhbGci'` para JWT, `-S 'sb_secret'`) **sin
  coincidencias**; la única aparición de `EXPO_PUBLIC_SUPABASE_ANON_KEY=` es el placeholder vacío
  de `.env.example`. La `service_role key` sigue existiendo **solo** en el entorno de la Edge
  Function (ver sección 5).
- El `project-id` que aparece en `docs/PROGRESS.md` (para regenerar tipos) es un identificador
  público incluido en la URL del proyecto, no un secreto.

## 2. `.env` vs `.env.example`

- **Estado: ✅ PASA**
- `.env` está en `.gitignore` (`git check-ignore .env` → ignorado).
- Solo `.env.example` está versionado (`git ls-files` lo confirma), con valores vacíos.
- `.env` local sí contiene la clave publishable (de desarrollo).

## 3. Row Level Security

- **Estado: ✅ PASA (código); ⏳ pendiente de re-ejecutar la prueba ampliada en vivo**
- Las 6 tablas (profiles, accounts, categories, transactions, recurring_rules, budgets) tienen
  `enable row level security`.
- Políticas de SELECT/INSERT/UPDATE/DELETE por tabla (4 cada una), **todas** concedidas solo al
  rol `authenticated`; **ninguna** para `anon`.
- Las políticas de escritura verifican que `account_id`, `transfer_account_id`, `category_id` y
  `parent_id` pertenezcan al mismo usuario; `budgets` exige además categoría de gasto principal
  (`kind = 'expense'` y `parent_id is null`).
- `account_balances` es una vista con `security_invoker = true`: respeta el RLS del usuario que
  consulta.
- Script de prueba con dos usuarios: `supabase/tests/002_rls_test.sql` (7 casos básicos; 7/7 en la
  auditoría original) y, desde R6.3, `supabase/tests/003_rls_test_v2.sql`, que amplía la cobertura a
  **todas** las tablas y al acceso cruzado (SELECT/INSERT/UPDATE/DELETE), a `budgets`, a
  `transactions.status`, a `recurring_rules.confirmation_mode` y a
  `account_balances`/`counts_as_liquid` (incluye el filtro de movimientos `pending`). Ambos se
  ejecutan en el SQL Editor y reportan PASS/FAIL por caso en `_rls_results`.
- **Pendiente:** ejecutar `003_rls_test_v2.sql` en Supabase con dos usuarios reales y confirmar que
  todas las filas salen en `TRUE`.

## 4. Registro de datos financieros o tokens

- **Estado: ✅ PASA**
- No hay `console.log`/`console.warn`/`console.error` en `app/` ni `src/` (verificado de nuevo en
  R6.3 sobre el árbol completo).
- Tampoco se usa `error.message` crudo ni `Alert.alert` en las pantallas: los errores se mapean a
  textos de `src/i18n/es.ts`. Ningún mensaje interpola correo, montos ni token (las claves de
  `authErrors`/`email` son cadenas fijas).
- El cliente de Supabase (`src/lib/supabase.ts`) configura `autoRefreshToken` y persiste la sesión
  en AsyncStorage **bajo la clave propia del cliente**; el token no se imprime en ningún punto.
- El caché persistido de TanStack Query (`finanzas-query-cache`, `src/lib/persister.ts`, R5.3)
  guarda **solo** estado de queries y mutaciones (nunca la sesión/token, que vive en el storage del
  cliente de Supabase). Se borra al cerrar sesión con `clearPersistedCache()`.
- No se registran montos ni datos financieros en logs.

## 5. Eliminación de cuenta y `service_role key` (R6.1)

- **Estado: ✅ PASA**
- La eliminación de cuenta se hace con la Edge Function
  `supabase/functions/delete-account/index.ts`, porque borrar un usuario de
  `auth.users` exige privilegios de servidor.
- La **`service_role key` solo existe en el entorno de la Edge Function** (la
  inyecta Supabase como `SUPABASE_SERVICE_ROLE_KEY`). **Nunca** está en el
  código de la app, en `.env`, en el bundle ni en el repositorio.
- La función valida el JWT del encabezado `Authorization` con `auth.getUser()`
  (cliente creado con ese token); si es inválido responde `401`. Solo después,
  con un cliente administrador, llama a `auth.admin.deleteUser(user.id)`.
- La app invoca `supabase.functions.invoke('delete-account')`, que adjunta el
  token de la sesión; jamás usa la `service_role key`.
- Las filas del usuario se borran en cascada por las llaves foráneas
  `on delete cascade` a `auth.users` de `profiles`, `accounts`, `categories`,
  `transactions`, `recurring_rules` y `budgets` (verificado en las migraciones
  001 y 006).
- No se registran datos personales en los logs de la función.

## 6. `npm audit` y dependencias (actualizado en R6.3)

- **Estado: ✅ Correcciones compatibles aplicadas; ⚠️ advisories de tooling pendientes**
- Antes (P9.2): **66** vulnerabilidades (16 moderadas, 50 altas, 0 críticas).
- En R6.3 se ejecutó `npx.cmd expo install --fix`, que alineó `@expo/ui`, `expo`, `expo-constants`,
  `expo-linking`, `expo-notifications`, `expo-router`, `expo-splash-screen` y `jest-expo` a las
  versiones compatibles con el SDK 57. Después, `npx.cmd expo install --check` responde
  "Dependencies are up to date" y `npx.cmd expo-doctor` pasa **21/21 checks**.
- Se eliminó `eas-cli` de `devDependencies` (lo señalaba expo-doctor y era la mayor fuente de
  advisories; EAS no está configurado —no hay `eas.json`— y puede invocarse con `npx eas-cli`).
  Esto quitó 340 paquetes del árbol.
- Resultado actual: `npm.cmd audit` → **67** (17 moderadas, 50 altas, 0 críticas);
  `npm.cmd audit --omit=dev` → **63** (17 moderadas, 46 altas).
- `npm.cmd audit fix` (sin `--force`) no cambió el resultado: las correcciones restantes exigen
  `--force` y **romperían** el SDK (p. ej. expo-router@58, jest@30, expo@44). **No se forzó nada.**
- Clasificación de los advisories restantes:
  - **Solo desarrollo/build/test:** todo el árbol de `jest`/`jest-expo` (`braces`/`micromatch`
    ReDoS, `sprintf-js`, `js-yaml`), `metro`/`@expo/cli`/`@expo/config-plugins` (`node-forge`,
    `uuid`, `xcode`), `@react-native/metro-config`/`react-native-worklets` y `@types/jest`. No
    entran al bundle de la app.
  - **Producción (alcanzable en runtime):** `decode-uri-component` (moderado) vía
    `expo-router` → `query-string`: DoS al decodificar entrada percent-encoded malformada. Riesgo
    acotado (DoS), sin corrección compatible sin subir de SDK.
- Recomendación: mantener el SDK 57; revisar estos advisories al planear el salto al SDK 58 y
  re-ejecutar el audit en la fase de publicación.

## 7. R6.3 — Resumen de la re-auditoría

- **Hallazgos:** sin secretos nuevos ni fugas en logs; RLS y `service_role` siguen correctos; las
  dependencias de build/test acumulan advisories que no se pueden corregir sin romper el SDK.
- **Correcciones aplicadas (compatibles):**
  - `npx.cmd expo install --fix`: 8 paquetes alineados al SDK 57 (solo parches; sin cambios de API).
  - `eas-cli` eliminado de `devDependencies` (recomendación de expo-doctor; −340 paquetes).
  - `supabase/tests/003_rls_test_v2.sql` añadido (cobertura ampliada de RLS).
- **Verificación:** `npm.cmd run typecheck` ✅, `npm.cmd run lint` ✅ (2 warnings preexistentes de
  `react-hooks/incompatible-library`), `npm.cmd test` ✅ (344/344), `npx.cmd expo-doctor` ✅ (21/21),
  `npx.cmd expo install --check` ✅.
- **Pendientes (requieren acción humana):**
  - Ejecutar `supabase/tests/003_rls_test_v2.sql` en el SQL Editor con **dos usuarios reales** y
    confirmar que todas las filas salen en `TRUE`.
  - Advisories de tooling de build/test: aceptados hasta el salto al SDK 58 (ver sección 6).
  - (De R6.1/R6.2, siguen pendientes) desplegar la Edge Function `delete-account` y, en Supabase,
    configurar las Redirect URLs `finanzas://**` y `exp://**` y reactivar "Confirm email".

## Resumen

| Ítem | Estado |
|---|---|
| Secretos en código/historial | ✅ PASA |
| `.env` ignorado / solo `.env.example` versionado | ✅ PASA |
| RLS completo y sin `anon` | ✅ PASA (código) |
| Sin logs financieros/tokens ni en el caché persistido | ✅ PASA |
| `service_role key` solo en la Edge Function | ✅ PASA |
| `expo-doctor` / `expo install --check` | ✅ PASA (21/21) |
| `npm audit` | ⚠️ Parcial: solo tooling de dev/build sin fix compatible |
| Prueba RLS con dos usuarios en vivo | ⏳ Re-ejecutar `003` con 2 usuarios (7/7 en la original) |