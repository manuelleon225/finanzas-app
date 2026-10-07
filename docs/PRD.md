# PRD — App de Finanzas Personales

## 1. Resumen

Aplicación móvil (Android e iOS) de finanzas personales para registrar ingresos y gastos,
pensada primero para uso personal y luego para publicarse. El mercado inicial es **Colombia**:
moneda COP, ingresos por quincena, primas y fuentes de ingreso irregulares.

El objetivo es responder con claridad a dos preguntas:

1. ¿Cuál es mi **ingreso base real** y cuánto de lo que gano depende de ingresos extra?
2. ¿Cuánto puedo **gastar hoy** sin romper el mes?

## 2. Usuario objetivo

Persona que maneja sus finanzas desde el celular y que en Colombia cobra por quincena,
con ingresos variables (horas extra, trabajos puntuales, ventas, regalos) y gastos recurrentes
(arriendo, servicios, suscripciones). No busca contabilidad formal: busca control diario rápido.

## 3. Problema

Las apps de finanzas típicas tratan todos los ingresos y gastos por igual. Eso oculta que:

- Parte del ingreso es estable (base) y parte es impredecible (extra).
- El gasto disponible real depende de los pagos recurrentes que aún no ocurren.

## 4. Diferenciadores

1. **Naturaleza del movimiento** (`base` / `extra`): cada ingreso y gasto se marca como esperado
   o como ocasional/imprevisto. Permite calcular el ingreso base real y la dependencia de extras.
2. **"Disponible hoy"**: indicador diario de cuánto se puede gastar sin romper el mes.
3. **Registro rápido**: agregar un movimiento debe tomar 2 o 3 toques como máximo.

## 5. Alcance

Registrado y en producción de desarrollo (MVP original):

- Autenticación con email y contraseña (y bloqueo biométrico opcional).
- Cuentas (efectivo, banco, ahorros, tarjeta de crédito) con saldo calculado.
- Categorías de ingreso y gasto, con subcategorías de un nivel.
- Movimientos: ingreso, gasto y transferencia.
- Reglas recurrentes y generación automática de movimientos.
- Pantalla de inicio con resumen del mes y "Disponible hoy".
- Recordatorios locales de pagos próximos.

Rediseño v2 (en curso, ver `docs/APP_GUIDE.md` / guías R): navegación de 5 elementos, fórmula v2 de
"Disponible hoy" anclada al próximo ingreso base, sistema de diseño v2 (tema oscuro por defecto) y
registro rápido con teclado numérico propio.

Añadido antes de publicar (Fase R5):

- Presupuestos por categoría de gasto.
- Análisis (gráficos propios: gastos por categoría, tendencia mensual, base vs. extras, insights).
- Registro de movimientos sin conexión (solo creación) con cola de sincronización.
- Recurrentes con modo "pedir confirmación" (pagos de monto variable).
- Exportar movimientos a CSV.
- Eliminar cuenta desde la app (Edge Function) y deep links (recuperar contraseña / confirmar correo).

## 6. Fuera de alcance por ahora (futuro)

- Tarjetas de crédito y deudas dedicadas.
- Metas de ahorro.
- Registro por voz.
- Foto de recibo.
- Cuentas compartidas.
- Login social (Google/Apple) y plan premium.

Roadmap posterior tras el núcleo:

- **V1.5**: metas de ahorro, deudas y tarjetas, reportes avanzados.
- **V2**: registro por voz, foto de recibo, exportar datos (PDF).
- **V3**: login con Google/Apple, plan premium, cuentas compartidas.

## 7. Fases del proyecto

| Fase | Contenido |
|---|---|
| 0 | Preparación manual (Node, Git, Supabase, Expo Go) |
| 1 | Documentación base (este conjunto de docs) |
| 2 | Proyecto base (Expo, calidad, sistema de diseño, cliente Supabase) |
| 3 | Base de datos (esquema, RLS, usuario nuevo, tipos) |
| 4 | Autenticación (registro, login, sesión, biometría) |
| 5 | Cuentas y categorías |
| 6 | Movimientos (capa de datos, registro, lista, transferencias) |
| 7 | Recurrentes (reglas, generación, recordatorios) |
| 8 | Pantalla de inicio (resumen y "Disponible hoy") |
| 9 | Endurecimiento (calidad, accesibilidad, seguridad) |
| 10 | Publicación (EAS, tiendas) |

## 8. Principios de UX

- **Rapidez ante todo**: registrar un movimiento es la acción más frecuente y debe ser casi instantánea.
- **Claridad del dinero**: montos formateados en COP, sin decimales, con color según tipo.
- **Lo base vs. lo extra siempre visible**: es el corazón del producto.
- **Sin sorpresas**: toda pantalla maneja estados de carga, vacío y error.
- **Nunca se pierden datos**: los movimientos se archivan, no se borran cuando tienen historia; las cuentas y categorías con movimientos se archivan.
- **Accesible**: áreas táctiles de mínimo 44x44, buen contraste en modo claro y oscuro.
