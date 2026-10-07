# AGENTS.md

Reglas permanentes para cualquier agente de IA que trabaje en este proyecto.

## 0. Antes de empezar cualquier tarea

Lee, en este orden:

1. `AGENTS.md` (este archivo).
2. `docs/ARCHITECTURE.md`
3. `docs/DATA_MODEL.md`
4. `docs/PROGRESS.md`

No empieces a escribir código sin haber leído los cuatro.

## 1. Resumen del proyecto

App móvil de finanzas personales (Android e iOS) para registrar ingresos y gastos.
Mercado inicial: **Colombia** (COP, ingresos por quincena, primas, ingresos irregulares).

Diferenciadores:

- **Naturaleza del movimiento**: cada ingreso y gasto es `BASE` (esperado/recurrente) o `EXTRA` (ocasional/imprevisto). Permite ver el ingreso base real y cuánto depende de los extras.
- **"Disponible hoy"**: cuánto se puede gastar hoy sin romper el mes.
- **Registro rápido**: agregar un movimiento en 2 o 3 toques.

El detalle de producto está en `docs/PRD.md`.

## 2. Stack

- **Expo (React Native) + TypeScript estricto + Expo Router**.
- **Supabase**: Postgres, Auth y Row Level Security. Cliente `@supabase/supabase-js`.
- **TanStack Query** para datos del servidor.
- **Zustand** para estado de UI (solo UI, nunca datos del servidor).
- **react-hook-form + zod** para formularios. **date-fns** para fechas.
- **jest-expo + @testing-library/react-native** para tests.
- **EAS** para builds y publicación.

## 3. Estructura de carpetas

```text
app/                      # rutas de Expo Router
src/components/ui/        # componentes de UI reutilizables
src/features/<feature>/   # auth, accounts, categories, transactions, recurring, summary
  ├── api/                # llamadas a Supabase
  ├── hooks/              # TanStack Query y hooks de la feature
  ├── components/         # componentes específicos de la feature
  └── utils/              # lógica pura
src/lib/                  # supabase, queryClient, money, dates
src/theme/                # tokens de diseño
src/i18n/                 # textos (es.ts)
src/types/                # tipos, incl. database.ts
supabase/migrations/      # migraciones SQL
docs/                     # documentación del proyecto
```

## 4. Convenciones de código

- **Idioma**: la documentación y los textos de UI en español; el código, nombres de tablas y columnas en inglés.
- **TypeScript estricto**: prohibido `any` y `@ts-ignore` salvo justificación en comentario.
- **Dinero**: se guarda como entero en pesos (`bigint`), siempre positivo; el signo lo define el tipo de movimiento (`income`/`expense`). Nunca usar floats para dinero. Formateo con `Intl` locale `es-CO`.
- **Fechas de movimiento**: tipo `date`, manejadas como texto `'YYYY-MM-DD'` en hora local. Evitar bugs de zona horaria.
- **Saldos**: NO se guardan, se calculan (vista `account_balances`).
- **Pantallas**: no llaman a Supabase directamente. Usan hooks que usan las funciones de la carpeta `api` de su feature.
- **Lógica de negocio**: en funciones puras, con tests.
- **Textos de UI**: todos centralizados en `src/i18n/es.ts`. Nunca strings sueltos en componentes.
- **Secretos**: solo en `.env`, nunca en el repositorio. Jamás usar la `service_role key` en la app.

## 4.bis Diseño y UI

- Antes de tocar cualquier UI, lee `docs/DESIGN_SYSTEM.md` (fuente de verdad visual) y la sección
  correspondiente de `docs/UX_SPEC.md` (estructura y textos de cada pantalla). No los modifiques ni
  los parafrasees: si una pantalla necesita algo que no está ahí, pregunta, no inventes.
- **No puedes ver la pantalla**: nunca afirmes que algo "se ve bien". Verifica con tipos, tests y
  lint, y entrega siempre una lista "Para revisar visualmente" con lo que la persona debe mirar.
- **Prohibidos colores hexadecimales, `rgb()` y valores de diseño sueltos fuera de `src/theme`**:
  todo sale de los tokens.
- **Un solo botón primario por vista**.
- **Ámbar solo para la naturaleza "extra"**, nunca para advertencias.
- Reglas de accesibilidad y microcopy según `docs/UX_SPEC.md` (sección "Estados y microcopy").

## 5. Reglas de trabajo

- Antes de cada tarea, lee `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` y `docs/PROGRESS.md`.
- Haz solo lo que la tarea pide. Cambios pequeños y enfocados.
- No refactorices código existente que no se te pidió tocar.
- No modifiques archivos fuera del alcance de la tarea.
- No agregues dependencias sin permiso explícito.
- Maneja siempre estados de carga, vacío y error en las pantallas.
- Nunca imprimas, guardes ni subas secretos.
- Si algo es ambiguo, pregunta antes de inventar.
- Al terminar, actualiza `docs/PROGRESS.md`.

## 6. Cierre de cada tarea

Al terminar:

1. Ejecuta `npm run typecheck`, `npm run lint` y `npm test` (cuando existan). Corrige todo error.
2. Actualiza `docs/PROGRESS.md`.
3. Responde con: resumen breve, archivos tocados, comandos a ejecutar por la persona y un mensaje de commit sugerido (Conventional Commits).
4. Detente. No empieces la siguiente tarea.
