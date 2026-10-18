# QA visual v3 — Finanzas ("bloque de color")

Lista de verificación **manual** para revisar el rediseño v3 en un dispositivo real. Se marca
únicamente lo que se ve en pantalla (el agente de IA no ve la app). Fuente de verdad visual:
`docs/DESIGN_SYSTEM.md`; estructura y textos: `docs/UX_SPEC.md`.

## Cómo usar esta lista

- [ ] Marca cada casilla solo si se cumple en el dispositivo.
- [ ] Anota al lado cualquier desviación (o abre una fila "Observación" al pie).
- [ ] Adjunta capturas de cada pantalla principal en **oscuro** y en **claro**.

## R8: casillas adicionales

- [ ] Bloque a todo ancho en pantallas con bloque (Inicio, Registro rápido, Análisis).
- [ ] Textos dentro del bloque legibles.
- [ ] Hoja con esquinas redondeadas.
- [ ] Acciones rápidas (Inicio) abren registro con tipo correcto.
- [ ] Tarjeta "Últimos 7 días" muestra semana y responde al toque.
- [ ] Categoría sugerida y frecuentes en registro rápido.
- [ ] Barras interactivas en Análisis actualizan donut/lista.
- [ ] Flujo del mes arrastrable muestra balance por día.
- [ ] Ilustraciones en estados vacíos.
- [ ] Escala al tocar en filas/tarjetas.

## Entornos a revisar (para cada pantalla)

- [ ] **Tema oscuro** (por defecto).
- [ ] **Tema claro** (Más → Apariencia → Claro).
- [ ] **Texto grande** (Ajustes del sistema → Pantalla → Tamaño de texto al máximo razonable): nada se corta ni se solapa.
- [ ] **Reducir movimiento** activado (Ajustes del sistema → Accesibilidad): las animaciones se desactivan, la app sigue usable.
- [ ] Teléfono con **notch / isla** y con **barra de gestos**: el bloque entra bajo las barras del sistema sin franjas de color equivocado.
- [ ] Al menos una prueba con **teclado abierto** en los formularios.

---

## Globales (aplican a todas las pantallas)

- [ ] Un **solo botón primario** por vista.
- [ ] El **ámbar** aparece solo en la naturaleza "extra" (nunca como advertencia).
- [ ] **Sin sombras**: la jerarquía se logra por tonos, tamaño y espacio.
- [ ] **Sin colores sueltos**: todo color/tamaño proviene del tema (fichas de color solo en `IconTile` y pestaña activa).
- [ ] Íconos **Ionicons** solo a través de `AppIcon` (variante rellena en fichas de color y pestaña activa).
- [ ] Áreas táctiles de **44 px** como mínimo (chips y segmentos incluidos).
- [ ] Foco/estado presionado visible al tocar botones, chips y segmentos.
- [ ] Textos legibles sobre sus fondos (contraste) en claro y oscuro.

---

## Inicio

Bloque:
- [ ] Fila superior: a la izquierda "Hola, {nombre}" (caption, tenue) y debajo el selector de mes "octubre 2026" con chevrones sobre el bloque; a la derecha **Avatar 36**.
- [ ] "Disponible hoy" (caption tenue) con ícono de ayuda que abre un BottomSheet con el desglose y la explicación.
- [ ] Monto con **conteo animado** (display, sobre el bloque).
- [ ] **ProgressBar** sobre el bloque: gasto de hoy sobre lo permitido de hoy.
- [ ] Pie: izquierda "Gastaste {X} de {Y}"; derecha "{N} días a tu pago" (o "{N} días para fin de mes" si no hay ingreso recurrente).
- [ ] Si hay colchón extra: píldora "Colchón extra {monto}".
- [ ] Sin margen: monto y texto "Sin margen hoy. Revisa tus pagos próximos."
- [ ] Primer uso: monto "$ 0" y "Registra tu ingreso base para calcularlo".

Hoja (de arriba hacia abajo):
- [ ] Banner "N pagos por confirmar" (solo si hay pendientes) que abre el BottomSheet.
- [ ] Píldora de conexión (solo si aplica).
- [ ] Primer uso: tarjeta "Empieza en 3 pasos" con tres filas y fichas: "Agrega tu ingreso base", "Registra tu primer gasto", "Ponle tope a un gasto"; cada una con check al cumplirse y la tarjeta desaparece al completar las tres.
- [ ] Tarjeta "Este mes": "Ingresos" con monto y StackedBar base/extra; "Gastos" con monto y StackedBar base/extra; pie "Los extras son el {P}% de tus ingresos."
- [ ] Sección "Cuentas" con el total a la derecha y fila horizontal de tarjetas (ficha por tipo, nombre, saldo).
- [ ] Sección "Recientes" con enlace "Ver todos" y hasta 5 filas.
- [ ] Estados: Skeleton con la forma de cada bloque (incluido el azul); error con reintento; pull-to-refresh.

---

## Registro rápido (modal)

Bloque:
- [ ] "Cancelar" a la izquierda y título "Nuevo movimiento" centrado.
- [ ] SegmentedControl sobre el bloque: Gasto, Ingreso, Transferencia.
- [ ] Monto grande y centrado; vacío "$ 0"; máximo 12 dígitos (no baja de 28 de tamaño).
- [ ] Línea "{Cuenta} · {Fecha}" centrada; cada parte es tocable y abre su BottomSheet (cuentas; Hoy, Ayer, Elegir fecha).

Hoja:
- [ ] Fila de chips centrada: Base, Extra (excluyentes, por defecto Base) y Nota (expande un campo de una línea).
- [ ] Texto guía "Toca una categoría para guardar".
- [ ] Cuadrícula de 3 columnas: 5 categorías más usadas en 60 días + mosaico "Más" (abre BottomSheet con todas y sus subcategorías); cada tarjeta con ficha 40 y nombre.
- [ ] Teclado numérico 3 x 4 (1–9, "000", 0, borrar) al pie; mantener presionado borrar limpia el monto.

Comportamiento:
- [ ] Tocar una categoría con monto > 0 guarda, cierra y muestra Snackbar "Guardado" con "Deshacer". Con monto 0 la cifra se sacude y no guarda.
- [ ] Transferencia: se ocultan categorías y Base/Extra; chips "Desde" y "Hacia" y botón primario "Guardar transferencia"; cuentas distintas.
- [ ] Edición: tocar una categoría solo la selecciona; botón primario "Guardar cambios" y botón destructivo "Eliminar" (con confirmación).
- [ ] Sin conexión: guarda y cierra con Snackbar "Guardado. Se sincronizará cuando haya conexión."

---

## Movimientos

- [ ] Encabezado "Movimientos" a la izquierda; IconButtons búsqueda y filtros (con badge si hay filtros activos) a la derecha; MonthSelector centrado.
- [ ] Resumen: tarjeta de fondo marca con Ingresos, Gastos, Balance (formato compacto desde 1.000.000).
- [ ] Lista agrupada por día con encabezado pegajoso ("Hoy", "Ayer" o "mar 7 oct" a la izquierda; total del día a la derecha).
- [ ] Fila: ficha 40 de la categoría; título = nota o categoría (con Tag "Extra" si aplica); subtítulo "Categoría · Cuenta"; monto con signo y color. Transferencias: ficha gris, "Origen → Destino", monto neutro.
- [ ] Tocar abre la edición; deslizar a la izquierda muestra "Eliminar"; tras eliminar, Snackbar "Movimiento eliminado" con "Deshacer".
- [ ] Sección "Por confirmar" al inicio si hay pendientes; filas sin conexión con Tag "Sin sincronizar" y fallidas con Tag "No se guardó".
- [ ] Búsqueda: el encabezado se convierte en campo con botón cerrar. Filtros en BottomSheet: cuenta, categoría, tipo, naturaleza; botones "Limpiar" y "Aplicar".
- [ ] Vacíos: "Aún no hay movimientos este mes" con botón "Agregar movimiento"; con filtros, "Nada con estos filtros" con botón "Limpiar filtros".

---

## Planificar

- [ ] Encabezado "Planificar".
- [ ] Tarjeta de fondo marca: "Presupuestos de {mes}"; "$ gastado de $ presupuestado"; ProgressBar sobre el bloque. Sin presupuestos: "Ponle un tope a lo que más gastas" y botón "Crear presupuesto".
- [ ] Tarjeta con hasta 3 presupuestos: ficha 32, nombre, texto a la derecha ("te quedan {monto}" o "te pasaste {monto}") y ProgressBar con status; enlace "Ver todos" si hay más.
- [ ] Filas con ficha 40: "Pagos recurrentes" (subtítulo "Próximo: {nombre} · {fecha}" o "Automatiza lo que se repite cada mes.") y "Análisis" (subtítulo: primera frase de insights o "Tus gastos por categoría y por mes.").

---

## Presupuestos

- [ ] MonthSelector.
- [ ] Lista con ficha, ProgressBar con status: "{gastado} de {presupuesto}" y "te quedan {monto}" o "te pasaste {monto}".
- [ ] Umbrales correctos: ok < 85%, near 85%–100%, over > 100%.
- [ ] Agregar con IconButton "+" en el encabezado.
- [ ] Crear y editar en BottomSheet: categoría principal de gasto sin presupuesto, monto con teclado numérico, "Guardar" y, en edición, "Eliminar".

---

## Análisis

Bloque:
- [ ] Título "Análisis", MonthSelector sobre el bloque y la primera frase de insights (o "Registra movimientos para ver tu análisis").

Hoja:
- [ ] SegmentedControl Gastos | Ingresos.
- [ ] DonutChart con monto central y colores de la paleta de fichas; lista de categorías con ficha 32, monto y porcentaje (máximo 6 + "Otros").
- [ ] "Últimos 6 meses" (barras agrupadas de ingresos y gastos).
- [ ] "Base y extras" (porcentaje de extras por mes).
- [ ] Estados: Skeleton, vacío y error con reintento.

---

## Más

- [ ] Encabezado "Más".
- [ ] Tarjeta de perfil: Avatar 44, nombre y "Cuenta personal" (no tocable).
- [ ] Una tarjeta por grupo, cada fila con ficha 32:
  - [ ] Organización: Cuentas, Categorías (chevron).
  - [ ] Preferencias: "Apariencia" (valor actual + chevron; BottomSheet con Sistema, Oscuro, Claro), "Incluir extras en Disponible hoy" (Switch + ayuda), "Bloquear con biometría" (Switch), "Recordatorios de pagos" (Switch; si está activo, fila de anticipación).
  - [ ] Datos: "Exportar movimientos" (chevron).
  - [ ] Cuenta: "Cerrar sesión" y "Eliminar cuenta" (danger).
- [ ] Pie: "Versión {x}".

---

## Cuentas

- [ ] Encabezado con atrás, título y "+" a la derecha.
- [ ] Tarjeta de saldo total (fondo marca, texto sobre marca).
- [ ] Lista: ficha por tipo, nombre, subtítulo con el tipo en español (o "Cuenta para gastar"/"No cuenta en Disponible hoy" si el nombre coincide con el tipo) y saldo a la derecha.
- [ ] Tocar abre la edición; deslizar para archivar (con confirmación; no se archiva la última cuenta activa).
- [ ] Sin enlaces de texto en las filas.

---

## Categorías

- [ ] Encabezado con atrás, título y "+".
- [ ] SegmentedControl Gastos | Ingresos.
- [ ] Lista con ficha, nombre y "N subcategorías"; subcategorías anidadas con sangría.
- [ ] Cada fila con IconButton "⋯" que abre BottomSheet: "Editar", "Agregar subcategoría" (solo principales) y "Archivar".
- [ ] "Ver archivadas" al final.

---

## Formularios (cuenta, categoría, recurrente)

- [ ] Encabezado con atrás y título; campos con Input; un solo botón primario al pie ("Guardar").
- [ ] Categoría: vista previa con ficha y cuadrícula de colores de ficha.
- [ ] El teclado no tapa el campo activo ni el botón.

---

## Autenticación (login, registro, recuperar contraseña, confirmar correo, verificar correo)

- [ ] Bloque con wordmark "Finanzas", título ("Inicia sesión", "Crea tu cuenta", "Recupera tu contraseña") y una línea de apoyo.
- [ ] Hoja con el formulario: campos, mostrar/ocultar contraseña con IconButton, un solo botón primario de ancho completo y enlaces secundarios ghost.
- [ ] El teclado no tapa el formulario y el botón primario siempre es visible.

---

## Estados y microcopy

- [ ] Cargando: Skeleton con la forma del contenido (nunca pantalla en blanco).
- [ ] Vacío: ficha grande con ícono contextual, título que nombra el espacio, línea de apoyo y botón con verbo.
- [ ] Error: ficha de alerta, frase que dice qué pasó y qué hacer, botón "Reintentar".
- [ ] Éxito: Snackbar breve ("Guardado", "Eliminado"), nunca "exitosamente".
- [ ] Tono: tuteo, frases cortas, sin "por favor" ni signos de exclamación.

---

## Notas conocidas (revisar con el equipo, no son fallas nuevas)

- Recurrentes (`app/recurring.tsx`, `app/recurring-form.tsx`) y **Eliminar cuenta**
  (`app/delete-account.tsx`) **no** tienen prompt de rediseño en esta fase: conservan la estructura
  v2. No se esperan con el bloque + Sheet.
- El **Snackbar** se muestra con una posición fija que puede solapar la barra de pestañas en las
  pantallas con pestañas.
- `app/recurring-form.tsx` usa un tamaño de monto literal fuera de tokens.
