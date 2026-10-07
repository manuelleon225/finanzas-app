# Registro de decisiones (architecture decision records)

Formato: **fecha · decisión · motivo**. Se agrega una entrada por decisión importante, antes o junto
al cambio correspondiente.

## 2026-10-05 — Nueva fórmula de "Disponible hoy" (v2)

- **Decisión:** `availableBase = max(0, liquidBalance - committed)` y
  `remainingToday = max(0, floor(max(0, availableBase + spentToday) / daysToIncome) - spentToday)`.
  Los extras se muestran aparte como **colchón** y por defecto **no inflan** el número
  (`includeExtras = false`).
- **Motivo:** la fórmula v1 dividía el resto del mes en partes iguales sin considerar cuándo llega el
  próximo ingreso base, y mezclaba los extras con el dinero "seguro". La v2 amarra el gasto al ciclo
  real de ingresos y hace visible (pero opcional) el colchón de extras.

## 2026-10-05 — Rediseño visual v2

- **Decisión:** tema **oscuro por defecto**; marca **índigo** distinta de los colores semánticos
  (income/expense/extra); fuente Manrope; diseño plano (sin sombras).
- **Motivo:** la UI anterior se escribió con adjetivos y salió genérica; la v2 especifica valores
  exactos (docs/DESIGN_SYSTEM.md) y separa la marca de los significados del dinero para que el color
  "diga algo".

## 2026-10-05 — Navegación de 5 elementos

- **Decisión:** Inicio, Movimientos, botón **(+) central**, Planificar, Más (sustituye la pestaña
  Ajustes y los botones flotantes).
- **Motivo:** agrupa lo nuevo (planificar: presupuestos/analysis) y centraliza la acción más
  frecuente (registrar) en un botón siempre visible.

## 2026-10-05 — Registro rápido

- **Decisión:** monto con teclado numérico propio; al tocar una categoría (con monto > 0) queda
  guardado sin botón extra.
- **Motivo:** cumplir el objetivo de registrar en pocos toques y con valores recordados.

## 2026-10-05 — Presupuestos y análisis antes de publicar

- **Decisión:** incorporar presupuestos por categoría y pantalla de análisis **antes** de la
  publicación.
- **Motivo:** son el valor diferencial de "planificar"; se consideran imprescindibles para salir a
  tiendas.

## 2026-10-05 — Registro de movimientos sin conexión (solo creación)

- **Decisión:** permitir **crear** movimientos sin conexión con una **cola de sincronización**
  (TanStack Query persistido); editar/eliminar siguen requiriendo conexión.
- **Motivo:** el registro es la acción más frecuente y no debe fallar por red; los límites mantienen
  el riesgo acotado.

## 2026-10-05 — Recurrentes con modo "pedir confirmación"

- **Decisión:** `recurring_rules.confirmation_mode`: `'auto'` (publica) o `'confirm'` (genera
  `status='pending'` que el usuario confirma o descarta).
- **Motivo:** pagos de monto variable (servicios) necesitan confirmar antes de afectar los saldos.

## 2026-10-05 — Fuera de alcance por ahora

- **Decisión:** tarjetas de crédito y deudas, metas de ahorro, registro por voz, foto de recibo,
  cuentas compartidas y login social quedan **fuera del alcance**.
- **Motivo:** enfocar el alcance actual en el core (registro, recurrencias, disponible hoy) y en los
  bloqueantes de publicación sin dispersar el esfuerzo.