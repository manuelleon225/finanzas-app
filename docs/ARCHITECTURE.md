# Arquitectura

Documento de referencia técnico. Si hay conflicto entre lo que dice este documento y el código,
este documento es la fuente de verdad y el código debe corregirse.

## 1. Stack

- **Expo (React Native) + TypeScript estricto + Expo Router**: una sola base de código para Android e iOS.
- **Supabase**: Postgres, Auth y Row Level Security (RLS). Cliente `@supabase/supabase-js`.
- **TanStack Query**: datos del servidor (caché, paginación, invalidación).
- **Zustand**: estado de UI (solo UI, nunca datos del servidor) con persistencia donde aplique.
- **react-hook-form + zod**: formularios y validación.
- **date-fns**: manejo de fechas.
- **jest-expo + @testing-library/react-native**: pruebas.
- **EAS**: builds y publicación.

## 2. Estructura de carpetas

```text
app/                      # rutas de Expo Router
  (auth)/                 # pantallas sin sesión: login, registro, recuperar
  (tabs)/                 # área principal: Inicio, Movimientos, Ajustes
src/
  components/ui/          # componentes reutilizables (Screen, Text, Button, ...)
  features/
    auth/                 # api, hooks, components, utils
    accounts/
    categories/
    transactions/
    recurring/
    summary/
  lib/                    # supabase, queryClient, money, dates
  theme/                  # tokens de color, espaciado, tipografía y useTheme
  i18n/                   # es.ts (todos los textos de UI)
  types/                  # database.ts y tipos compartidos
supabase/migrations/      # migraciones SQL numeradas
docs/                     # documentación del proyecto
```

Cada feature sigue la misma forma: `api/` (acceso a Supabase), `hooks/` (TanStack Query y
hooks de UI), `components/` (UI específica) y `utils/` (lógica pura con tests).

## 3. Capas

```text
Pantalla (app/)  →  hook de feature  →  api de feature  →  Supabase
```

- Las pantallas **no** llaman a Supabase directamente.
- Los hooks encapsulan TanStack Query: claves de caché, paginación e invalidación.
- La carpeta `api` contiene funciones planas que usan el cliente de Supabase y devuelven datos tipados.
- La lógica de negocio (cálculos, agrupaciones, resumen, fechas de recurrencia) vive en `utils`
  como funciones puras y con tests.

## 4. Convenciones

- **Idioma**: documentación y textos de UI en español; código, tablas y columnas en inglés.
- **TypeScript estricto**: sin `any` ni `@ts-ignore` salvo justificación en comentario.
- **Alias de rutas**: `@/` apunta a `src/` (configurado también en Jest).
- **Dinero**: entero de pesos (`bigint`), siempre positivo. El signo lo define el tipo de movimiento.
  Nunca floats. Formateo con `Intl` locale `es-CO`, sin decimales (ej. `$ 25.000`).
- **Fechas de movimiento**: tipo `date`, como texto `'YYYY-MM-DD'` en hora local, para evitar
  bugs de zona horaria.
- **Saldos**: no se almacenan; se calculan desde la vista `account_balances`.
- **Textos**: todos en `src/i18n/es.ts`; nunca strings sueltos en componentes.
- **Estados**: toda pantalla maneja carga, vacío y error.
- **Secretos**: solo en `.env`. Nunca versionar secretos ni usar la `service_role key` en la app.

## 5. Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Expo + Expo Router | Un solo código para Android/iOS, enrutado por archivos, builds con EAS. |
| Supabase | Postgres + Auth + RLS sin backend propio; la seguridad se aplica en la base. |
| TanStack Query | Caché e invalidación declarativas para datos del servidor. |
| Zustand solo para UI | Evita mezclar estado de servidor con estado de cliente. |
| Dinero como entero | Evita errores de punto flotante. |
| Fechas como string `'YYYY-MM-DD'` | Evita corrimientos por zona horaria. |
| Saldos calculados, no guardados | Una sola fuente de verdad; se evita la desincronización. |
| Lógica de negocio en funciones puras | Fácil de testear y de razonar. |
| Fuente **Manrope** (400–700) | Tipografía del sistema de diseño v2; los montos usan números tabulares. |
| Modo de tema (`system \| dark \| light`) | Preferencia persistida (Zustand); por defecto **oscuro**. |
| Gráficos propios con `react-native-svg` | Sin librerías de gráficos externas; los charts se auditan y son accesibles. |
| Cola offline (TanStack Query persistido) | **Implementado (R5.3)**: solo creación de movimientos; edición/eliminación requieren red. |
| Haptics (`expo-haptics`) | Feedback táctil acotado a acciones convencionales (tap/select/success/error/warning). |

## 6. Entornos y configuración

- Variables públicas de Expo: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- `.env` está ignorado por git; solo se versiona `.env.example` con valores vacíos.
- El cliente de Supabase debe fallar con un error claro y legible si faltan las variables.
- Documentos de diseño como fuente de verdad: `docs/DESIGN_SYSTEM.md` y `docs/UX_SPEC.md`.

## 7. Calidad

Scripts previstos en `package.json`:

```text
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (+ Prettier integrado)
npm run format      # formateo
npm test            # jest-expo
```

Antes de cerrar cualquier tarea se ejecutan `typecheck`, `lint` y `test`.

## 8. Offline: creación de movimientos (R5.3)

**Objetivo:** registrar movimientos sin conexión y sincronizarlos al volver la red, sin duplicados.

### Diseño

- **Conectividad:** `onlineManager` de TanStack Query se conecta a NetInfo
  (`src/lib/netinfo.ts`). Queries y mutaciones se pausan/reanudan según la red real.
- **Persistencia:** `PersistQueryClientProvider` con
  `createAsyncStoragePersister` en AsyncStorage (`src/lib/persister.ts`).
  `gcTime` y `maxAge` = **7 días**. Solo se dehydrata:
  - las **mutaciones de creación de movimientos** que quedaron `paused` (offline), y
  - las **queries de lectura** ya resueltas (`status === 'success'`).
  Nunca se persisten tokens: la sesión sigue en el storage de Supabase (fuera de React Query).
- **Identidad e idempotencia:** el `id` del movimiento se genera en el cliente con
  `expo-crypto` (`randomUUID`) y viaja en las **variables** de la mutación (así sobrevive al
  reinicio). El insert envía ese id; ante conflicto de id (`23505`, reintento tras un corte) la
  mutación se trata como **éxito** (se devuelve la fila existente).
- **Reanudación:** `queryClient.setMutationDefaults(['transactions', 'create'], …)` declara la
  `mutationFn` y `networkMode: 'offlineFirst'` para que las mutaciones restauradas puedan correr.
  `resumePausedMutations()` se llama al restaurar el caché (Provider `onSuccess`), al iniciar con
  sesión y al recuperar la conexión (`useOfflineSync`). Al terminar cada mutación se invalidan
  `transactions`, `accounts` y `summary`.

### Límites (documentados)

- **Solo creaciones.** Editar y eliminar usan `networkMode: 'online'`: sin red no se ejecutan (no
  se encolan).
- **Antigüedad de 7 días.** Una creación pendiente más vieja que `maxAge` se descarta junto con el
  resto del caché.
- **Cerrar sesión limpia la cola.** `signOut()` hace `queryClient.clear()` y
  `persister.removeClient()`, de modo que ni el caché ni las mutaciones pendientes sobreviven para
  otro usuario.
- La clasificación de errores de mutación (`classifyMutationError`) queda disponible para la UI de
  estados offline (R5.4); esta fase no agrega UI.

## 9. Deep links de autenticación (R6.2)

**Objetivo:** que los enlaces de correo (recuperación de contraseña y confirmación de correo) abran
la app en la pantalla correcta, sin que el guardia de rutas mande a las pestañas antes de tiempo.

### Flujo PKCE

- El cliente usa `flowType: 'pkce'` (`src/lib/supabase.ts`). Al pedir el correo, Supabase guarda el
  verifier en el storage del cliente (AsyncStorage) y el enlace vuelve a la app con `?code=...`.
- `src/features/auth/api/auth.ts` arma las URLs de vuelta con `Linking.createURL(...)`:
  - recuperación → `Linking.createURL('/reset-password')`
  - confirmación → `Linking.createURL('/confirm-email')`
- `useAuthDeepLink` (montado en `app/_layout.tsx`) escucha `Linking.getInitialURL()` y
  `Linking.addEventListener('url')`, parsea la URL con `parseAuthLink` (función pura) y canja el
  código con `supabase.auth.exchangeCodeForSession(code)`. Si la URL trae tokens (flujo implícito),
  usa `supabase.auth.setSession(...)` como respaldo.
- `parseAuthLink` clasifica: `session` (recuperación o confirmación), `error` (vencido, inválido o
  mal formado) o `none` (no es un enlace de auth).

### Estado y guardias

- `useAuthLinkStore` (Zustand, **en memoria, no persistido**) guarda `isRecoverySession` y el error
  del enlace. En un enlace de recuperación la bandera se activa **antes** de crear la sesión.
- `app/(auth)/_layout.tsx` no redirige a las pestañas si `isRecoverySession` es true.
- `app/(tabs)/_layout.tsx` redirige a `/reset-password` si `isRecoverySession` es true.
- La pantalla `app/(auth)/reset-password.tsx` pide la nueva contraseña (zod, mínimo 8), llama a
  `supabase.auth.updateUser({ password })`, desactiva la bandera y entra con el Snackbar
  "Contraseña actualizada".
- Tras registrarse sin sesión, `app/(auth)/register.tsx` lleva a `app/(auth)/verify-email.tsx`
  ("Revisa tu correo") con el correo; incluye "Reenviar correo" con enfriamiento de 60 s.
- Enlaces vencidos o inválidos muestran `AuthLinkErrorView` con un botón para pedir un enlace nuevo.

### URLs por permitir en Supabase (Authentication → URL Configuration)

- Redirect URLs: `finanzas://**` y `exp://**`.
- Reactivar "Confirm email" y probar los dos flujos con un correo real.

### Limitación en Expo Go (documentada)

- El scheme propio (`finanzas://`) solo funciona completo en un **development build** o app
  compilada. En Expo Go el enlace sale como `exp://<host>/--/<ruta>` y depende de que el dev server
  esté corriendo. `Linking.createURL` resuelve la URL correcta en cada caso; para probar el flujo
  completo conviene un development build.

## 10. Barras del sistema y borde a borde (R7.2)

**Objetivo:** que la app se dibuje de borde a borde y que las barras del sistema (estado y
navegación) no dejen franjas que desentonen con el tema.

### Solución elegida (sin dependencias nuevas)

- **Borde a borde (Android):** en SDK 54 pasó a ser el **predeterminado para proyectos nuevos y
  existentes**, y en Android 16 es **obligatorio**; en SDK 55 se eliminó `edgeToEdgeEnabled` de
  `app.json` (ya no se configura: siempre está activo). Las barras quedan transparentes y el
  contenido se dibuja detrás. En **Expo Go** está siempre activo y **sin opt-out**.
- **Barra de estado:** `expo-status-bar` (`<StatusBar>`), con el estilo que decide la función pura
  `getStatusBarStyle(mode, variant)` (`src/lib/systemBars.ts`): `block` siempre íconos claros;
  `plain` claros en oscuro y oscuros en claro. Con borde a borde, `backgroundColor`/`translucent`
  son **no-ops**; solo `style`/`hidden` tienen efecto.
- **Fondo de las barras / franjas:** `expo-system-ui`
  (`SystemUI.setBackgroundColorAsync(colors.bg)`) pinta la vista raíz (ventana) con el token `bg`; es
  el color que se ve detrás de las barras transparentes. Reacciona al cambio de tema (incluido
  "Sistema").
- **Área de la zona segura superior (R8.1):** `ScreenScaffold` pinta una `View` absoluta de alto
  `insets.top` con `brand` en pantallas con bloque y `bg` en las demás, para que la franja superior
  no quede sin el color correcto. La decisión la toma la función pura `getTopInsetColor(variant)`
  (`src/lib/systemBars.ts`), con tests.
- **Componente:** `<SystemBars variant>` (`src/components/ui/SystemBars.tsx`) aplica el estilo de la
  barra de estado y el fondo de la ventana. Se monta en el layout raíz con `variant="plain"` y en
  cada `ScreenScaffold` con la variante de la pantalla.
- **Zonas seguras:** el contenido usa `react-native-safe-area-context` (`Screen` con
  `SafeAreaView`, `TabBar` con `useSafeAreaInsets`), de modo que nada queda tapado por el notch ni
  la barra de gestos.
- `useTheme()` expone también `mode` (`'dark' | 'light'` efectivo, resuelto desde
  `system`/`dark`/`light`).

### Límites (documentados)

- **Color de fondo de la barra de navegación en Android:** con borde a borde (Android 15+), Android
  deprecó el pintado de la barra de navegación; no se puede fijar su color propio. Lo que se ve
  detrás es el fondo de la app/ventana (token `bg`), que es lo que controlamos.
- **Scrim de contraste (navegación por 3 botones):** Android aplica por defecto un scrim translúcido
  (`android:enforceNavigationBarContrast = true`) que sobre fondo oscuro se ve como una franja gris
  claro. No se puede quitar ni colorear desde JS; se desactiva en build con `enforceContrast: false`
  (plugin de `expo-navigation-bar`). **No tiene efecto en Expo Go**.
- **Íconos de la barra de navegación (Android):** su color lo controla el sistema. `expo-navigation-bar`
  permitiría forzarlo (`setStyle`) solo si `enforceContrast` es `false`; **no está instalado** y la
  tarea pide la solución con menos dependencias. Además, en SDK 55+ sus APIs de color/estilo quedaron
  deprecadas o como no-op.
- **Expo Go:** `expo-system-ui` y borde a borde están incluidos en Expo Go, así que el fondo `bg` y el
  relleno de la zona segura superior deberían verse. El color/scrim de la barra de navegación **no**
  se puede controlar en Expo Go; en un **development build** se verificaría con un plugin
  `enforceContrast: false` (requiere instalar `expo-navigation-bar`, con permiso).


