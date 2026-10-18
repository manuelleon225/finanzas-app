# Finanzas App — Resumen técnico del código (para análisis externo)

## 1. Visión general

App móvil de finanzas personales (Android/iOS) para registrar ingresos y gastos.
Mercado inicial: Colombia (COP, ingresos por quincena, primas, ingresos irregulares).

Diferenciadores:
- **Naturaleza del movimiento**: cada ingreso/gasto es `BASE` (esperado/recurrente) o `EXTRA` (ocasional).
- **"Disponible hoy"**: cuánto se puede gastar hoy sin romper el mes.
- **Registro rápido**: agregar un movimiento en 2-3 toques.

## 2. Stack

- Expo (React Native) + TypeScript estricto + Expo Router.
- Supabase: Postgres, Auth, RLS. Cliente `@supabase/supabase-js`.
- TanStack Query para datos del servidor.
- Zustand para estado de UI (solo UI, nunca datos del servidor).
- react-hook-form + zod para formularios. date-fns para fechas.
- jest-expo + @testing-library/react-native para tests.
- EAS para builds.

## 3. Estructura de carpetas

```
app/                      # rutas de Expo Router
  (tabs)/                 # Inicio, Movimientos, Planificar, Más
  transaction-form.tsx     # registro rápido (modal)
  analysis.tsx            # Análisis
  accounts.tsx, budgets.tsx, categories.tsx, recurring.tsx, etc.
src/components/ui/        # componentes de UI reutilizables
src/components/charts/     # DonutChart, GroupedBarChart, CashFlowChart
src/features/<feature>/   # auth, accounts, categories, transactions, recurring, summary, analysis, budgets, more, plan
  api/                    # llamadas a Supabase
  hooks/                  # TanStack Query y hooks de la feature
  components/             # componentes específicos
  utils/                  # lógica pura + tests
src/lib/                  # supabase, queryClient, money, dates, haptics, snackbar
src/theme/                # tokens de diseño (colors, spacing, radii, typography, tilePalette)
src/i18n/es.ts            # textos de UI (español)
src/types/database.ts     # tipos generados de Supabase
supabase/migrations/      # migraciones SQL
docs/                     # documentación
```

## 4. Convenciones de código

- Documentación y UI en español; código, tablas y columnas en inglés.
- TypeScript estricto: prohibido `any` y `@ts-ignore`.
- Dinero: entero en pesos (bigint), siempre positivo; el signo lo define el tipo (income/expense). Nunca floats. Formateo con Intl locale `es-CO`.
- Fechas de movimiento: tipo `date`, manejadas como texto `'YYYY-MM-DD'` en hora local.
- Saldos: no se guardan, se calculan (vista `account_balances`).
- Pantallas no llaman a Supabase directamente; usan hooks → funciones `api`.
- Lógica de negocio en funciones puras, con tests.
- Textos de UI centralizados en `src/i18n/es.ts`.
- Secretos solo en `.env`; nunca `service_role` en la app.
- Sin colores hex/rgb fuera de `src/theme`; todo sale de tokens.
- Ionicons solo vía `AppIcon`.

## 5. Modelo de datos (resumen)

Tablas principales: `users/profiles`, `accounts`, `categories`, `transactions`, `recurring_rules`, `budgets`.
- `transactions`: type (income/expense/transfer), nature (base/extra/null para transfer), status (posted/pending), amount (bigint), account_id, transfer_account_id, category_id, occurred_on (date), note, recurring_rule_id, occurrence_date.
- Saldos calculados por vista `account_balances`.
- RLS por `user_id`.

## 6. Features y módulos

### auth
- `AuthProvider`, `useSession`, `useProfile`.
- Login, registro, reset password, confirm email, biometría, lock screen.

### accounts
- CRUD de cuentas, archivado.
- `account_balances` vista para saldos.

### categories
- CRUD, jerarquía (parent_id), kind (income/expense).

### transactions
- `listTransactions` (paginación por cursor), `getTransactionsInRange`, `create/update/delete`.
- Hooks: `useTransactions`, `useTransaction`, `useTransactionsInRange`, `usePendingConfirmations`, `useCreateTransaction`, etc.
- Utils: `transactions.ts` (monthRange, formatMonthLabel), `ranking.ts` (rankCategoriesByUsage), `form.ts`, `schemas.ts`, `confirm.ts`, `movementRow.ts`, `suggestions.ts` (normalizeText, suggestCategories, getFrequentTransactions).

### recurring
- Reglas recurrentes, generación de ocurrencias, confirmaciones pendientes.

### budgets
- Presupuestos por categoría y periodo.

### summary (Inicio)
- `useAvailableToday`, `useMonthSummary`, `useDailySpending`.
- Componentes: HomeHero, PendingBanner, QuickActions, OnboardingCard, MonthSummaryCard, DailySpendingCard, AccountsSection, RecentSection.
- Utils: onboarding, explain, home, dailySpending.

### analysis
- `useAnalysis(month, kind)`: byCategory, trend (6 meses), extraShare, insights.
- Utils: spendingByCategory, monthlyTrend, extraShareByMonth, buildInsights, cashFlow (cumulativeBalanceByDay, buildLineChartLayout, nearestIndex).
- Charts: DonutChart, GroupedBarChart, CashFlowChart.

### more / plan
- Apariencia, preferencias, exportar, eliminar cuenta.

## 7. Componentes UI clave

- `ScreenScaffold` (variant plain/block), `Card`, `Button`, `IconButton`, `IconTile`, `Tag`, `Chip`, `Text`, `MoneyText`, `ListRow`, `SegmentedControl`, `MonthSelector`, `BottomSheet`, `Sheet`, `Skeleton`, `EmptyState`, `EmptyIllustration`, `ErrorState`, `PressableScale`, `AppIcon`, `Snackbar`, `ConnectivityPill`, `ProgressBar`, `NumericKeypad`, `SwipeableRow`, `TabBar`, `SystemBars`.

## 8. Librerías internas (src/lib)

- `money.ts`: formatCOP, formatCompactCOP, formatPesos, parseMoneyInput.
- `dates.ts`: todayISO, isValidISODate.
- `haptics.ts`: tap, select, success, warning, error.
- `snackbar.ts`: store Zustand.
- `useConnectivity.ts`, `systemBars.ts`.

## 9. Testing

- Jest + jest-expo + @testing-library/react-native.
- 75 suites, 567 tests (último run).
- Tests unitarios en `utils/__tests__` y componentes en `components/__tests__`.
- Tests de contraste en `src/theme/__tests__/contrast.test.ts`.

## 10. Animaciones y accesibilidad

- PressableScale, AnimatedEntrance, AnimatedNumber, BottomSheet, SwipeableRow, ProgressBar, Snackbar, pulse de categoría sugerida.
- Respeto a "reducir movimiento" vía AccessibilityInfo / useReducedMotion.
- accessibilityLabel en elementos tocables.

## 11. Problemas conocidos / deuda técnica

- PressableScale no aplicado en todas las superficies tocables (tarjetas de cuenta, Planificar, Más).
- Animaciones de entrada de GroupedBarChart y dibujo de CashFlowChart no implementadas.
- EmptyIllustration testIDs pueden no coincidir con tests ocultos.
- PressableScale consulta AccessibilityInfo async; primera animación puede ejecutarse antes.
- Algunas pantallas aún usan estilo anterior (verificar visualmente).
- Posible duplicación de consultas en Análisis (useTransactionsInRange además de useAnalysis).

## 12. Comandos

- typecheck: `npm run typecheck`
- lint: `npm run lint`
- tests: `npm test`
- dev: `npm start`

## 13. Sugerencias de mejora (para análisis externo)

- Unificar consultas de datos en Análisis para evitar fetch duplicado.
- Aplicar PressableScale de forma consistente en todas las superficies tocables.
- Implementar animaciones faltantes (barras, línea de flujo) con respeto a reduce motion.
- Añadir tests de componentes para CashFlowChart y DailySpendingCard (interacción).
- Revisar performance de listas grandes (memoización, keys estables).
- Centralizar manejo de reduce motion en un hook reutilizable.
- Considerar extracción de lógica de formularios a hooks.
- Mejorar cobertura de accesibilidad (roles, labels) en gráficos.
- Evaluar code splitting / lazy loading para pantallas pesadas.
- Revisar manejo de errores de red y reintentos en todos los hooks.
