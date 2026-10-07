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
| Cola offline (TanStack Query persistido) | **Planificado (Fase R5)**: solo creación de movimientos; edición/eliminación requieren red. |
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
