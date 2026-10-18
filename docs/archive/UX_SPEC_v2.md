# Especificación de UX: Finanzas

Describe la estructura, el orden y los textos de cada pantalla. Los valores visuales (colores, tamaños, tipografía) están en docs/DESIGN_SYSTEM.md.

## Navegación

Barra de pestañas de 5 elementos: Inicio, Movimientos, (+), Planificar, Más. El (+) no es una pestaña: abre el modal de registro rápido. Las pantallas secundarias (cuentas, categorías, recurrentes, presupuestos, análisis, exportar, eliminar cuenta) se abren sobre la pila con botón atrás.

## Inicio

Orden de arriba hacia abajo:
1. Encabezado: "Hola, {nombre}" (caption, textSecondary); debajo MonthSelector con el mes (title). A la derecha, IconButton de análisis (gráfico) si la ruta existe.
2. Tarjeta héroe "Disponible hoy" (Card xl, padding 20):
   - Etiqueta "Disponible hoy" (caption) con ícono de ayuda (abre BottomSheet con el desglose y la explicación en frases cortas).
   - Monto (display) con conteo animado.
   - ProgressBar del gasto de hoy sobre lo permitido de hoy (color brand; si se superó, expense).
   - Pie en una fila: izquierda "Gastaste {X} de {Y}"; derecha "{N} días a tu pago" (o "{N} días para fin de mes" si no hay ingreso recurrente).
   - Si hay colchón extra: fila "Colchón extra {monto}" con Tag extra.
   - Si no hay margen: el monto en expense, texto "Sin margen hoy" y la ayuda "Revisa tus pagos próximos o ajusta tus gastos."
   - Sin ingreso recurrente: texto de ayuda "Crea tu ingreso recurrente para un cálculo más preciso."
3. Banner "N pagos por confirmar" (solo si hay pendientes; abre BottomSheet).
4. Tarjeta "Este mes": dos bloques. "Ingresos" con monto y StackedBar base/extra y leyenda ("Base {monto}" y "Extra {monto}"); "Gastos" con monto y StackedBar base/extra. Pie: "Los extras son el {P}% de tus ingresos."
5. "Cuentas {total}": fila horizontal desplazable de tarjetas pequeñas (nombre, saldo).
6. "Recientes" con enlace "Ver todos" y hasta 5 ListRow.
7. Estados: Skeleton con la forma de cada bloque; error con reintento; pull-to-refresh.
8. Primer uso (sin movimientos): la tarjeta héroe se reemplaza por EmptyState "Empieza registrando tu primer movimiento" con botón "Agregar movimiento".

## Registro rápido (modal)

Modal a pantalla completa. De arriba hacia abajo:
1. Encabezado: "Cancelar" (ghost) a la izquierda y título "Nuevo movimiento" centrado.
2. SegmentedControl: Gasto, Ingreso, Transferencia.
3. Monto (displayLg) centrado. Vacío: "$ 0" en textMuted. Máximo 12 dígitos.
4. Fila de chips centrada: Cuenta (ícono billetera y nombre), Fecha ("Hoy"), Naturaleza ("Base" y "Extra", excluyentes, por defecto Base), Nota (ícono). Nota expande un campo de una línea.
5. Texto guía "Toca una categoría para guardar" (caption, textSecondary).
6. Cuadrícula de 3 columnas: 5 categorías más usadas en 60 días y un mosaico "Más". "Más" abre BottomSheet con todas las categorías y subcategorías.
7. Teclado numérico propio (3 x 4: 1 a 9, "000", 0, borrar) al pie. Mantener presionado borrar limpia el monto.

Comportamiento:
- Tocar una categoría con monto mayor a 0 guarda, cierra el modal y muestra Snackbar "Guardado" con acción "Deshacer".
- Con monto 0: la cifra se sacude y no se guarda.
- Cuenta: BottomSheet con lista, por defecto la última usada.
- Fecha: BottomSheet con "Hoy", "Ayer" y "Elegir fecha".
- Transferencia: se ocultan categorías y Base/Extra; chips "Desde" y "Hacia"; botón primary "Guardar transferencia" en lugar de la cuadrícula. Las cuentas deben ser distintas ("Elige cuentas distintas").
- Edición: mismo diseño con datos cargados, categoría resaltada; tocar una categoría solo la selecciona; botón primary "Guardar cambios" y botón destructivo "Eliminar" (con confirmación).

## Movimientos

1. Encabezado: título "Movimientos", MonthSelector, IconButtons de búsqueda y filtros (badge si hay filtros activos).
2. Franja resumen: Ingresos, Gastos, Balance del mes (el balance coloreado según signo).
3. Lista agrupada por día con encabezado pegajoso: "Hoy", "Ayer" o "mar 7 oct" a la izquierda y el total del día a la derecha (caption).
4. Fila: círculo de ícono de la categoría; título = nota o nombre de categoría (con Tag "Extra" si aplica); subtítulo "Categoría · Cuenta" (con ícono pequeño de recurrente si aplica); monto con signo y color a la derecha. Transferencias: ícono de flechas, título "Cuenta origen → Cuenta destino", monto neutro.
5. Gestos: tocar abre la edición; deslizar a la izquierda muestra la acción "Eliminar". Tras eliminar: Snackbar "Movimiento eliminado" con "Deshacer".
6. Sección "Por confirmar" al inicio si hay pendientes.
7. Búsqueda: el encabezado se convierte en campo de búsqueda con botón cerrar.
8. Filtros en BottomSheet: cuenta, categoría, tipo, naturaleza (Todos, Base, Extra); botones "Limpiar" y "Aplicar".
9. Vacíos: sin movimientos "Aún no hay movimientos este mes" con botón "Agregar movimiento"; con filtros "Nada con estos filtros" con botón "Limpiar filtros".

## Planificar

Encabezado "Planificar". Tarjetas/filas:
1. "Presupuestos": resumen (total gastado de total presupuestado con ProgressBar). Abre la pantalla de presupuestos. Sin presupuestos: "Ponle un tope a lo que más gastas."
2. "Pagos e ingresos recurrentes": cantidad de reglas activas y próxima fecha. Abre recurrentes.
3. "Análisis": acceso a la pantalla de análisis.

## Presupuestos

MonthSelector. Lista de presupuestos (ListRow con ProgressBar): nombre de categoría, "{gastado} de {presupuesto}", y "te quedan {monto}" o "te pasaste {monto}". Colores: menos de 85% brand; de 85% a 100% expense con opacidad 0.65; más de 100% expense. Botón "Agregar presupuesto". Crear y editar en BottomSheet: categoría principal de gasto sin presupuesto, monto con teclado numérico, "Guardar", y en edición "Eliminar".

## Análisis

1. Bloque de insights: 2 a 3 frases cortas.
2. SegmentedControl Gastos | Ingresos y DonutChart con monto central; debajo lista de categorías con monto y porcentaje (máximo 6 más "Otros").
3. "Últimos 6 meses": gráfico de barras agrupadas de ingresos y gastos.
4. "Base y extras": porcentaje de extras por mes.
5. Estados: Skeleton, vacío "Registra movimientos para ver tu análisis", error con reintento.

## Recurrentes

Lista de reglas con nombre o nota, monto, frecuencia legible, próxima fecha y switch de activa. Formulario: tipo, naturaleza, monto, categoría, cuenta, nota, frecuencia, inicio, fin opcional y, en gastos, el switch "Pedir confirmación cada vez" con la ayuda "Úsalo para pagos que cambian de monto, como los servicios."

## Sin conexión

- Píldora discreta bajo el encabezado en Inicio y Movimientos: "Sin conexión" o "Sin conexión · N por sincronizar"; al reconectar: "Sincronizando…" y desaparece.
- Filas pendientes en Movimientos con Tag "Sin sincronizar"; las fallidas con Tag "No se guardó" y acciones "Reintentar" y "Descartar".
- Editar o eliminar sin conexión: Snackbar "Necesitas conexión para esto."
- Guardar sin conexión: Snackbar "Guardado. Se sincronizará cuando haya conexión."

## Más

Lista agrupada, cada fila con ícono, título y chevron:
- Organización: Cuentas, Categorías.
- Preferencias: Apariencia (Sistema, Oscuro, Claro), "Incluir extras en Disponible hoy" (switch), "Bloqueo biométrico" (switch), "Recordatorios de pagos" (switch y anticipación).
- Datos: "Exportar movimientos".
- Cuenta: "Cerrar sesión" y "Eliminar cuenta" (destructiva).
- Pie: versión de la app.

## Autenticación

Encabezado con wordmark "Finanzas" (tipográfico), título y una línea de apoyo ("Inicia sesión", "Crea tu cuenta", "Recupera tu contraseña"). Campos con label arriba; botón primary de ancho completo; enlaces secundarios en ghost. Mostrar/ocultar contraseña con IconButton. El formulario no queda tapado por el teclado.

## Estados y microcopy

- Cargando: Skeleton con la forma del contenido; nunca pantalla en blanco.
- Vacío: ícono grande en círculo suave, título que nombra el espacio, una línea de apoyo, botón con verbo.
- Error: una frase que dice qué pasó y qué hacer, y botón "Reintentar".
- Éxito: Snackbar breve ("Guardado", "Eliminado"), nunca "exitosamente".
- Tono: tuteo, frases cortas, sin "por favor" ni signos de exclamación.