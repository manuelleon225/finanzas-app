# Especificación de UX v3: Finanzas

Estructura, orden y textos de cada pantalla. Los valores visuales están en docs/DESIGN_SYSTEM.md.

## Navegación

Barra de 5 elementos: Inicio, Movimientos, botón central (+), Planificar, Más. El (+) no es una pestaña: abre el modal de registro rápido. Las pantallas secundarias (cuentas, categorías, recurrentes, presupuestos, análisis, exportar, eliminar cuenta) se abren sobre la pila con botón atrás.

## Estructura de pantalla

- Pantallas con bloque (Inicio, Registro rápido, Análisis, autenticación): bloque azul a todo ancho arriba con el contenido principal y la hoja (bg) encima, con esquinas superiores redondeadas.
- Pantallas sin bloque (Movimientos, Planificar, Más, listas y formularios): encabezado sobre bg con título (title) y acciones a la derecha como IconButton.

## Inicio

Bloque:
1. Fila superior: a la izquierda "Hola, {nombre}" (caption, onBrandMuted) y debajo el MonthSelector tone onBlock ("octubre 2026" con chevrones); a la derecha un Avatar 36.
2. "Disponible hoy" (caption, onBrandMuted) con ícono de ayuda (abre un BottomSheet con el desglose y la explicación).
3. Monto (display, onBrand) con conteo animado.
4. ProgressBar onBlock: gasto de hoy sobre lo permitido de hoy.
5. Pie: izquierda "Gastaste {X} de {Y}"; derecha "{N} días a tu pago" (o "{N} días para fin de mes" si no hay ingreso recurrente). Caption, onBrandMuted.
6. Si hay colchón extra: píldora "Colchón extra {monto}" (fondo blockSoft, texto onBrand).
7. Sin margen: monto en onBrand y texto "Sin margen hoy. Revisa tus pagos próximos." Primer uso: monto "$ 0" y texto "Registra tu ingreso base para calcularlo".

Hoja, de arriba hacia abajo:
1. Banner "N pagos por confirmar" (solo si hay pendientes; abre BottomSheet).
2. Píldora de conexión (solo si aplica).
3. Fila de tres acciones rápidas de igual ancho: "Gasto" (ficha coral, flecha arriba), "Ingreso" (ficha verde, flecha abajo) y "Transferir" (ficha azul, flechas de intercambio). Cada una con IconTile 40 y su texto debajo; al tocar abre Registro rápido con el tipo elegido.
4. Primer uso: tarjeta "Empieza en 3 pasos" con tres filas (IconTile 32): "Agrega tu ingreso base", "Registra tu primer gasto", "Ponle tope a un gasto". Cada una con check al cumplirse; la tarjeta se oculta al cumplirse las tres.
5. Tarjeta "Este mes": "Ingresos" con monto y StackedBar base/extra; "Gastos" con monto y StackedBar base/extra; pie "Los extras son el {P}% de tus ingresos."
6. Tarjeta "Últimos 7 días": título y a la derecha "Promedio {monto}/día"; siete columnas de igual ancho con la barra de gasto de cada día (la de hoy en color de marca) y la inicial del día debajo. Al tocar una barra se muestra su monto compacto encima. Sin gastos: "Aún no hay gastos esta semana".
7. Sección "Cuentas" con el total a la derecha; fila horizontal desplazable de tarjetas (IconTile por tipo, nombre, saldo).
8. Sección "Recientes" con enlace "Ver todos" y hasta 5 ListRow.
9. Estados: Skeleton con la forma de cada bloque (incluido el azul); error con reintento; pull-to-refresh.

## Registro rápido (modal)

Bloque:
1. Fila: "Cancelar" (izquierda, onBrandMuted) y título "Nuevo movimiento" (centrado, onBrand).
2. SegmentedControl onBlock: Gasto, Ingreso, Transferencia.
3. Monto (displayLg, onBrand, centrado). Vacío: "$ 0" en onBrandMuted. Máximo 12 dígitos (ajusta tamaño sin bajar de 28).
4. Línea centrada "{Cuenta} · {Fecha}" (onBrandMuted); cada parte es tocable y abre su BottomSheet (cuentas; Hoy, Ayer, Elegir fecha).

Hoja:
1. Fila de chips centrada: Base, Extra (excluyentes, por defecto Base) y Nota (expande un campo de una línea).
2. Texto guía "Toca una categoría para guardar" (caption).
3. Cuadrícula de 3 columnas: 5 categorías más usadas en 60 días y un mosaico "Más" (abre BottomSheet con todas y sus subcategorías). Cada tarjeta: IconTile 40 y nombre.
4. Teclado numérico (3 x 4: 1 a 9, "000", 0, borrar) al pie. Mantener presionado borrar limpia el monto.

Comportamiento:
- Tocar una categoría con monto mayor a 0 guarda, cierra y muestra Snackbar "Guardado" con "Deshacer". Con monto 0, la cifra se sacude y no guarda.
- Transferencia: se ocultan categorías y Base/Extra; chips "Desde" y "Hacia" y botón primary "Guardar transferencia". Cuentas distintas ("Elige cuentas distintas").
- Edición: mismo diseño con datos cargados; tocar una categoría solo la selecciona; botón primary "Guardar cambios" y botón destructivo "Eliminar" (con confirmación).
- Sin conexión: guarda y cierra de inmediato con Snackbar "Guardado. Se sincronizará cuando haya conexión."

## Movimientos

1. Encabezado: título "Movimientos" a la izquierda; IconButtons de búsqueda y filtros (badge si hay filtros activos) a la derecha. Debajo, MonthSelector centrado.
2. Resumen: tarjeta de fondo brand con tres columnas: Ingresos, Gastos, Balance (formato compacto desde 1.000.000).
3. Lista agrupada por día con encabezado pegajoso ("Hoy", "Ayer" o "mar 7 oct" a la izquierda; total del día a la derecha).
4. Fila: IconTile 40 de la categoría; título = nota o nombre de categoría (con Tag "Extra" si aplica); subtítulo "Categoría · Cuenta"; monto con signo y color a la derecha. Transferencias: IconTile gray, título "Origen → Destino", monto neutro.
5. Gestos: tocar abre la edición; deslizar a la izquierda muestra "Eliminar". Tras eliminar: Snackbar "Movimiento eliminado" con "Deshacer".
6. Sección "Por confirmar" al inicio si hay pendientes. Filas sin conexión con Tag "Sin sincronizar" y fallidas con Tag "No se guardó".
7. Búsqueda: el encabezado se convierte en campo de búsqueda con botón cerrar. Filtros en BottomSheet: cuenta, categoría, tipo, naturaleza; botones "Limpiar" y "Aplicar".
8. Vacíos: "Aún no hay movimientos este mes" con botón "Agregar movimiento"; con filtros "Nada con estos filtros" con botón "Limpiar filtros".

## Planificar

1. Encabezado "Planificar".
2. Tarjeta de fondo brand: "Presupuestos de {mes}" (caption, onBrandMuted); "$ gastado de $ presupuestado" (el segundo en onBrandMuted); ProgressBar onBlock. Sin presupuestos: texto "Ponle un tope a lo que más gastas" y botón onBrand "Crear presupuesto".
3. Tarjeta con hasta 3 presupuestos: IconTile 32, nombre, texto a la derecha ("te quedan {monto}" o "te pasaste {monto}" en expense) y ProgressBar con status. Enlace "Ver todos" si hay más.
4. Filas con IconTile 40: "Pagos recurrentes" (subtítulo "Próximo: {nombre} · {fecha}" o "Automatiza lo que se repite cada mes.") y "Análisis" (subtítulo: la primera frase de insights o "Tus gastos por categoría y por mes.").

## Presupuestos

MonthSelector. Lista de presupuestos (ListRow con IconTile, ProgressBar con status): "{gastado} de {presupuesto}" y "te quedan {monto}" o "te pasaste {monto}". Umbrales: ok menos de 85%, near de 85% a 100%, over más de 100%. Agregar con IconButton "+" en el encabezado. Crear y editar en BottomSheet: categoría principal de gasto sin presupuesto, monto con teclado numérico, "Guardar" y, en edición, "Eliminar".

## Análisis

Bloque: título "Análisis", MonthSelector onBlock y la primera frase de insights (o "Registra movimientos para ver tu análisis").
Hoja: SegmentedControl Gastos | Ingresos; DonutChart con monto central y colores de la paleta de fichas; tarjeta "Flujo del mes" (balance acumulado dia a dia, arrastrable); lista de categorías con IconTile 32, monto y porcentaje (máximo 6 más "Otros"); "Últimos 6 meses" (barras agrupadas de ingresos y gastos); "Base y extras" (porcentaje de extras por mes). Estados: Skeleton, vacío y error con reintento.

## Más

Encabezado "Más". Tarjeta de perfil: Avatar 44, nombre y "Cuenta personal" (no tocable). Grupos, una tarjeta por grupo, cada fila con IconTile 32:
- Organización: Cuentas, Categorías (chevron).
- Preferencias: "Apariencia" (valor actual y chevron; abre BottomSheet con Sistema, Oscuro, Claro), "Incluir extras en Disponible hoy" (Switch, con ayuda), "Bloquear con biometría" (Switch), "Recordatorios de pagos" (Switch; si está activo, fila de anticipación).
- Datos: "Exportar movimientos" (chevron).
- Cuenta: "Cerrar sesión" y "Eliminar cuenta" (danger).
Pie: "Versión {x}".

## Cuentas

Encabezado con atrás, título y "+" a la derecha. Tarjeta de saldo total (fondo brand, texto onBrand). Lista: IconTile por tipo, nombre, subtítulo con el tipo en español (si el nombre coincide con el tipo: "Cuenta para gastar" o "No cuenta en Disponible hoy") y saldo a la derecha. Tocar abre la edición; deslizar para archivar (con confirmación; no se archiva la última cuenta activa). Sin enlaces de texto en las filas.

## Categorías

Encabezado con atrás, título y "+". SegmentedControl Gastos | Ingresos. Lista con IconTile, nombre y "N subcategorías"; subcategorías anidadas con sangría. Cada fila tiene un IconButton "⋯" que abre un BottomSheet con "Editar", "Agregar subcategoría" (solo categorías principales) y "Archivar". "Ver archivadas" al final.

## Formularios (cuenta, categoría, recurrente)

Encabezado con atrás y título; campos con Input; un solo botón primary al pie ("Guardar"). Categoría: vista previa con IconTile y cuadrícula de fichas de color.

## Autenticación

Bloque con wordmark "Finanzas" (onBrand), título ("Inicia sesión", "Crea tu cuenta", "Recupera tu contraseña") y una línea de apoyo. Hoja con el formulario: campos, mostrar u ocultar contraseña con IconButton, un solo botón primary de ancho completo y enlaces secundarios ghost. El teclado no tapa el formulario y el botón siempre es visible.

## Estados y microcopy

- Cargando: Skeleton con la forma del contenido; nunca pantalla en blanco.
- Vacío: ficha grande con ícono contextual, título que nombra el espacio, una línea de apoyo y botón con verbo.
- Error: ficha de alerta, una frase que dice qué pasó y qué hacer, y botón "Reintentar".
- Éxito: Snackbar breve ("Guardado", "Eliminado"), nunca "exitosamente".
- Tono: tuteo, frases cortas, sin "por favor" ni signos de exclamación.
