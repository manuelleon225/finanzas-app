# Checklist de QA manual — cierre del rediseño (R6.4)

Lista de casos de prueba manuales para cerrar el rediseño antes de unir `feat/redesign` a `main`
y ejecutar la publicación (P10.1).

**Cómo usarlo**

- Ejecuta la checklist en un **dispositivo real** (Android o iOS), no en simulador, salvo los casos
  que indiquen lo contrario.
- Ideal: dos usuarios de prueba para los casos que toquen datos de otro usuario (RLS) y para
  verificar la eliminación de cuenta.
- Marca `[x]` solo cuando el resultado observado coincida con el esperado. Si algo falla, anota el
  caso, la pantalla y una captura.
- Los textos entre comillas son los que debe mostrar la app (fuente: `src/i18n/es.ts`).
- Los casos con **📸** son buenos candidatos para captura final.

Total: **72 casos**.

---

## 1. Autenticación y recuperación (11)

- [ ] **1.1 Registro con correo nuevo**
  - Pasos: abrir la app sin sesión → "Crear cuenta" → ingresar nombre, correo nuevo y contraseña de 8+ caracteres → enviar.
  - Esperado: si la confirmación de correo está activa, se navega a "Revisa tu correo" (`verify-email`); si no, se entra a la app.
- [ ] **1.2 Contraseña corta**
  - Pasos: en el registro, escribir una contraseña de menos de 8 caracteres → enviar.
  - Esperado: mensaje de validación "Mínimo 8 caracteres" bajo el campo; no se envía.
- [ ] **1.3 Correo con formato inválido**
  - Pasos: escribir un correo sin `@` → enviar.
  - Esperado: error de validación en el campo; no se envía.
- [ ] **1.4 Confirmación de correo**
  - Pasos: abrir el enlace del correo de confirmación.
  - Esperado: la app abre e inicia sesión, entrando a Inicio (sin quedar en la pantalla de auth).
- [ ] **1.5 Reenviar correo con enfriamiento**
  - Pasos: en "Revisa tu correo", tocar "Reenviar correo" dos veces seguidas.
  - Esperado: el primer toque reenvía; el botón queda bloqueado ~60 s (con conteo) y no permite reenviar antes.
- [ ] **1.6 Inicio de sesión correcto**
  - Pasos: escribir correo y contraseña válidos → "Iniciar sesión".
  - Esperado: se entra a Inicio y se cargan los datos del usuario.
- [ ] **1.7 Credenciales incorrectas**
  - Pasos: escribir contraseña errónea → iniciar sesión.
  - Esperado: mensaje traducido (sin jerga técnica), el formulario no se limpia y se puede reintentar.
- [ ] **1.8 Mostrar/ocultar contraseña**
  - Pasos: tocar el IconButton de ojo en el campo de contraseña.
  - Esperado: alterna visibilidad del texto sin perder lo escrito.
- [ ] **1.9 Recuperar contraseña envía correo**
  - Pasos: en login → "¿Olvidaste tu contraseña?" → ingresar correo → enviar.
  - Esperado: mensaje de confirmación de envío; llega el correo.
- [ ] **1.10 Enlace de recuperación abre la pantalla correcta**
  - Pasos: abrir el enlace de recuperación del correo.
  - Esperado: abre `reset-password` y **no** redirige a las pestañas antes de cambiar la contraseña. Al guardar una contraseña válida, entra a la app con Snackbar "Contraseña actualizada".
- [ ] **1.11 Enlace inválido o vencido**
  - Pasos: abrir un enlace de auth vencido o alterado.
  - Esperado: vista de error con mensaje claro y botón para pedir un enlace nuevo (no pantalla en blanco).
- [ ] **1.12 Cerrar sesión**
  - Pasos: Más → "Cerrar sesión".
  - Esperado: vuelve a login y, al reingresar, no quedan datos del usuario anterior.

## 2. Cuentas (6)

- [ ] **2.1 Lista y total**
  - Pasos: Más → "Cuentas".
  - Esperado: lista de cuentas activas con su saldo y el total de todas; las archivadas no aparecen.
- [ ] **2.2 Crear cuenta**
  - Pasos: "Agregar cuenta" → nombre, tipo (Efectivo/Banco/Ahorros/Tarjeta), saldo inicial → guardar.
  - Esperado: la cuenta aparece con el saldo indicado; el total se actualiza.
- [ ] **2.3 Saldo inicial negativo**
  - Pasos: crear una cuenta con saldo inicial negativo (p. ej. tarjeta de crédito).
  - Esperado: se acepta y el saldo se muestra negativo sin error.
- [ ] **2.4 Switch "Cuenta para gastar" según tipo**
  - Pasos: en el formulario de cuenta, alternar el tipo y observar el switch "Cuenta para gastar".
  - Esperado: al elegir Efectivo/Banco viene activado; al elegir Ahorros/Tarjeta viene apagado (hasta que el usuario lo toque). El estado refleja "Cuenta el saldo de esta cuenta en tu Disponible hoy."
- [ ] **2.5 Editar cuenta**
  - Pasos: abrir una cuenta → cambiar nombre y saldo inicial → guardar.
  - Esperado: los cambios se reflejan; el saldo del Disponible hoy se recalcula si la cuenta es líquida.
- [ ] **2.6 Archivar cuenta y regla de la última**
  - Pasos: archivar una cuenta con movimientos; luego intentar archivar la única cuenta activa restante.
  - Esperado: la primera se archiva (pide confirmación); la segunda **no** se permite (aviso de que no puedes quedarte sin cuentas).

## 3. Categorías (7)

- [ ] **3.1 Lista por tipo**
  - Pasos: Más → "Categorías"; alternar Gasto/Ingreso.
  - Esperado: se listan las categorías principales del tipo y sus subcategorías.
- [ ] **3.2 Crear categoría principal**
  - Pasos: "Agregar categoría" → nombre, ícono y color → guardar.
  - Esperado: aparece en la lista y queda disponible en el registro rápido.
- [ ] **3.3 Crear subcategoría**
  - Pasos: agregar una categoría eligiendo una madre.
  - Esperado: se muestra anidada bajo su madre; máximo un nivel.
- [ ] **3.4 Validación de nombres**
  - Pasos: intentar crear una subcategoría con el mismo nombre que su madre; intentar duplicar una hermana.
  - Esperado: se bloquea con mensaje (compara sin distinguir mayúsculas/espacios).
- [ ] **3.5 Archivar en cascada**
  - Pasos: archivar una categoría que tiene subcategorías.
  - Esperado: se archiva la madre y también sus subcategorías (con confirmación).
- [ ] **3.6 Ver archivadas y restaurar**
  - Pasos: activar "Ver archivadas"; restaurar una hija cuya madre sigue archivada; restaurar una madre.
  - Esperado: no se puede restaurar la hija si la madre sigue archivada; al restaurar la madre se avisa que las hijas siguen archivadas.
- [ ] **3.7 Editar categoría con subcategorías**
  - Pasos: editar una categoría madre que ya tiene subcategorías.
  - Esperado: no permite convertirla en subcategoría (se conserva el límite de un nivel).

## 4. Registro rápido (modal) (15)

- [ ] **4.1 Gasto en 3 toques o menos**
  - Pasos: tocar **(+) central** → dígitos del monto → tocar una categoría.
  - Esperado: guarda, cierra el modal y muestra Snackbar "Guardado" con acción "Deshacer". 📸
- [ ] **4.2 Gasto con naturaleza Extra**
  - Pasos: en el modal, tocar chip "Extra" y luego una categoría.
  - Esperado: guarda con naturaleza extra; en la lista aparece el Tag "Extra" en color ámbar.
- [ ] **4.3 Ingreso**
  - Pasos: SegmentedControl → "Ingreso" → monto → categoría de ingreso.
  - Esperado: guarda como ingreso; aparece con signo "+" y color verde en Inicio y Movimientos.
- [ ] **4.4 Transferencia**
  - Pasos: SegmentedControl → "Transferencia" → elegir "Desde" y "Hacia" → "Guardar transferencia".
  - Esperado: se ocultan categorías y Base/Extra; guarda; en Movimientos se ve con ícono de flechas, "Origen → Destino" y monto neutro.
- [ ] **4.5 Transferencia con cuentas iguales**
  - Pasos: elegir la misma cuenta en "Desde" y "Hacia".
  - Esperado: "Las cuentas de origen y destino deben ser distintas." y no guarda así.
- [ ] **4.6 Monto en 0**
  - Pasos: tocar una categoría sin haber escrito monto.
  - Esperado: la cifra se sacude y **no** guarda (queda en "$ 0" atenuado).
- [ ] **4.7 Límite de 12 dígitos**
  - Pasos: escribir más de 12 dígitos.
  - Esperado: no se aceptan más de 12 dígitos.
- [ ] **4.8 Borrar con pulsación larga**
  - Pasos: mantener presionada la tecla de borrar.
  - Esperado: se limpia todo el monto de una vez.
- [ ] **4.9 Recordar cuenta**
  - Pasos: guardar un gasto con una cuenta B; cerrar y abrir de nuevo el modal.
  - Esperado: el chip de cuenta abre por defecto en la última cuenta usada (B).
- [ ] **4.10 Fecha**
  - Pasos: chip "Fecha" → "Hoy", "Ayer" y "Elegir fecha".
  - Esperado: cada opción fija la fecha correcta y se muestra en el chip.
- [ ] **4.11 Nota**
  - Pasos: chip "Nota" → expandir → escribir una nota → guardar.
  - Esperado: la nota aparece como título de la fila en Movimientos.
- [ ] **4.12 Deshacer tras guardar**
  - Pasos: guardar un movimiento y tocar "Deshacer" en el Snackbar.
  - Esperado: el movimiento desaparece (no queda en la lista ni en los totales).
- [ ] **4.13 Mosaico "Más" de categorías**
  - Pasos: en la cuadrícula, tocar "Más".
  - Esperado: BottomSheet con todas las categorías y subcategorías del tipo; al elegir una, guarda según la regla.
- [ ] **4.14 Edición: seleccionar sin guardar**
  - Pasos: abrir un movimiento existente → tocar otra categoría.
  - Esperado: solo cambia la selección resaltada; **no** guarda hasta tocar "Guardar cambios".
- [ ] **4.15 Edición: eliminar con confirmación**
  - Pasos: abrir un movimiento → "Eliminar movimiento" → confirmar.
  - Esperado: pide confirmación y, al aceptar, elimina y vuelve con Snackbar con "Deshacer". 📸

## 5. Movimientos (12)

- [ ] **5.1 Encabezado y selector de mes**
  - Pasos: abrir pestaña "Movimientos"; cambiar de mes con el MonthSelector.
  - Esperado: el título, la búsqueda, los filtros y la lista se actualizan al mes elegido; no permite ir a meses futuros.
- [ ] **5.2 Franja resumen**
  - Pasos: revisar la franja superior.
  - Esperado: muestra Ingresos, Gastos y Balance del mes; el balance va coloreado según su signo.
- [ ] **5.3 Agrupación por día**
  - Pasos: revisar los encabezados de la lista.
  - Esperado: "Hoy", "Ayer" o la fecha abreviada (p. ej. "mar 7 de oct"); el total del día a la derecha.
- [ ] **5.4 Fila con Tag Extra y recurrente**
  - Pasos: buscar una fila de movimiento extra y una generada por recurrencia.
  - Esperado: el extra lleva Tag "Extra"; el recurrente muestra el ícono pequeño de recurrente.
- [ ] **5.5 Filas de transferencia**
  - Pasos: revisar una transferencia.
  - Esperado: ícono de flechas, "Origen → Destino" y monto neutro (ni gasto ni ingreso).
- [ ] **5.6 Tocar fila abre edición**
  - Pasos: tocar una fila.
  - Esperado: abre el modal en modo edición con los datos cargados.
- [ ] **5.7 Deslizar para eliminar + deshacer**
  - Pasos: deslizar una fila a la izquierda → "Eliminar"; luego tocar "Deshacer".
  - Esperado: la acción se revela al deslizar; al eliminar muestra Snackbar "Movimiento eliminado" con "Deshacer" que reinserta la fila. 📸
- [ ] **5.8 Búsqueda**
  - Pasos: tocar el IconButton de búsqueda → escribir parte de una nota.
  - Esperado: el encabezado se convierte en campo de búsqueda con botón de cerrar; filtra en vivo.
- [ ] **5.9 Filtros**
  - Pasos: IconButton de filtros → combinar tipo, naturaleza, cuenta y categoría → "Aplicar"; luego "Limpiar filtros".
  - Esperado: aplica la combinación, muestra badge en el ícono cuando hay filtros activos y "Limpiar filtros" los quita todos.
- [ ] **5.10 Sección "Por confirmar"**
  - Pasos: con movimientos pendientes (recurrentes en modo confirmar), abrir Movimientos.
  - Esperado: aparece la sección "Por confirmar" al inicio con Tag "Por confirmar".
- [ ] **5.11 Estados vacíos**
  - Pasos: revisar un mes sin movimientos y una búsqueda sin resultados.
  - Esperado: "Aún no hay movimientos este mes" con botón "Agregar movimiento"; y "Nada con estos filtros" con botón "Limpiar filtros".
- [ ] **5.12 Pull-to-refresh y paginación**
  - Pasos: deslizar hacia abajo para recargar; desplazarse hasta el final con muchos movimientos.
  - Esperado: recarga sin saltos; la lista carga más filas al llegar al final (sin duplicados ni huecos).

## 6. Recurrentes (7)

- [ ] **6.1 Lista de reglas**
  - Pasos: Planificar → "Pagos e ingresos recurrentes".
  - Esperado: cada regla muestra nombre/nota, monto, frecuencia legible, próxima fecha y switch de activa.
- [ ] **6.2 Crear regla automática (auto)**
  - Pasos: crear una regla de gasto mensual sin activar "Pedir confirmación cada vez".
  - Esperado: al vencer, se genera el movimiento publicado y cuenta en saldos y totales.
- [ ] **6.3 Generación automática**
  - Pasos: con una regla vencida, abrir la app / volver del segundo plano.
  - Esperado: se generan las ocurrencias debidas, una sola vez (sin duplicados), y aparecen marcadas como recurrentes.
- [ ] **6.4 Modo "Pedir confirmación" (gasto)**
  - Pasos: activar "Pedir confirmación cada vez" y guardar.
  - Esperado: el switch solo aparece en reglas de gasto, con la ayuda "Úsalo para pagos que cambian de monto, como los servicios."; al vencer genera un movimiento "Por confirmar" que **no** altera saldos ni totales.
- [ ] **6.5 Confirmar o descartar un pendiente**
  - Pasos: en Inicio, tocar el banner "N pagos por confirmar"; editar el monto y "Confirmar"; repetir con "Descartar".
  - Esperado: confirmar lo publica con el monto indicado (ahora sí cuenta en saldos); descartar lo elimina. Mientras está pendiente sí reduce el Disponible hoy.
- [ ] **6.6 Desactivar una regla**
  - Pasos: apagar el switch de una regla.
  - Esperado: no genera nuevas ocurrencias; las ya generadas permanecen.
- [ ] **6.7 Recordatorios**
  - Pasos: Más → "Recordatorios de pagos" → activar y elegir anticipación.
  - Esperado: se programan recordatorios para reglas de gasto (no funciona en Expo Go; requiere development build).

## 7. Disponible hoy — fórmula (9)

Fórmula documentada en `docs/DATA_MODEL.md` (§6). Datos base del escenario: hoy **2026-10-15**;
una cuenta líquida con saldo **1.000.000**; una regla de ingreso base quincenal cuya próxima
ocurrencia es **2026-10-30**; una regla de gasto "Arriendo" el **2026-10-20** por **200.000**; un
gasto publicado de hoy de **50.000**.

- [ ] **7.1 Caso base**
  - Datos: escenario base, sin extras ni pendientes.
  - Esperado: `liquidBalance` 1.000.000 · `daysToIncome` 15 · `committed` 200.000 · `allowanceToday` 56.666 · `remainingToday` **6.666**. La tarjeta muestra "$ 6.666", "Gastaste 50.000 de 56.666" y "15 días a tu pago".
- [ ] **7.2 Cuentas no líquidas se ignoran**
  - Datos: base + cuenta de Ahorros con saldo 500.000 y "Cuenta para gastar" apagado.
  - Esperado: el número **no cambia** (6.666); la cuenta de ahorros no aporta.
- [ ] **7.3 Colchón extra, switch apagado**
  - Datos: base + ingreso extra publicado de 300.000 (gastos extra 0); "Incluir extras" apagado.
  - Esperado: `extraCushion` 300.000; `availableBase` 500.000; `allowanceToday` 36.666; `remainingToday` **0**. Se muestra la fila "Colchón extra 300.000" con Tag extra y el estado "Sin margen hoy".
- [ ] **7.4 Colchón extra, switch encendido**
  - Datos: igual a 7.3 pero con "Incluir extras en Disponible hoy" activado.
  - Esperado: `availableBase` 800.000; `allowanceToday` 56.666; `remainingToday` **6.666**.
- [ ] **7.5 Gastos pendientes comprometen**
  - Datos: base + un gasto pendiente de confirmar de 120.000.
  - Esperado: `committed` 320.000; `availableTotal` 680.000; `remainingToday` **0**. El pendiente aún no apareció en saldos, pero sí redujo el disponible.
- [ ] **7.6 Sin ingreso recurrente (fallback)**
  - Datos: base pero sin ninguna regla de ingreso base.
  - Esperado: `horizonDate` = primer día del mes siguiente (2026-11-01); `daysToIncome` 17; se muestra "17 días para fin de mes" y la ayuda "Crea tu ingreso recurrente para un cálculo más preciso."
- [ ] **7.7 Horizonte a 1 día**
  - Datos: hoy 2026-10-29, con ingreso base el 2026-10-30; sin gastos comprometidos.
  - Esperado: `daysToIncome` 1; `allowanceToday` = `availableBase` + `spentToday` en un solo día.
- [ ] **7.8 Disponible negativo → 0**
  - Datos: cuenta líquida con saldo 100.000 y `committed` 200.000.
  - Esperado: `allowanceToday` 0 y `remainingToday` **0**; nunca negativos.
- [ ] **7.9 Ayuda y desglose**
  - Pasos: tocar el ícono de ayuda de la tarjeta.
  - Esperado: BottomSheet con la explicación en frases cortas (`explainAvailable`) y el desglose numérico (saldo líquido, comprometido, colchón, días). 📸
- [ ] **7.10 Reacción al registrar un gasto**
  - Pasos: registrar un gasto hoy y volver a Inicio.
  - Esperado: `spentToday` sube; `remainingToday` baja sin cambiar `allowanceToday`.

## 8. Presupuestos (6)

- [ ] **8.1 Resumen en Planificar**
  - Pasos: Planificar → tarjeta "Presupuestos"; con y sin presupuestos.
  - Esperado: con presupuestos muestra "gastado de presupuestado" con ProgressBar; sin ellos, "Ponle un tope a lo que más gastas."
- [ ] **8.2 Crear presupuesto**
  - Pasos: abrir presupuestos → "Nuevo presupuesto" → elegir categoría principal de gasto sin presupuesto → monto → "Guardar".
  - Esperado: aparece en la lista con su barra y su texto "{gastado} de {presupuesto}".
- [ ] **8.3 Subcategorías acumulan**
  - Pasos: registrar un gasto en una subcategoría de una madre con presupuesto.
  - Esperado: el progreso de la madre sube (las subcategorías suman a su presupuesto).
- [ ] **8.4 Umbrales de color**
  - Pasos: gastar por debajo del 85%, entre 85% y 100%, y superar el 100%.
  - Esperado: menos de 85% color de marca; 85%–100% expense con opacidad 0.65; más de 100% expense. Nunca ámbar.
- [ ] **8.5 Textos de restante/exceso**
  - Pasos: revisar un presupuesto por debajo y otro por encima.
  - Esperado: "Te quedan {monto}" o "Te pasaste {monto}" según corresponda.
- [ ] **8.6 Editar y eliminar**
  - Pasos: abrir un presupuesto → cambiar monto → "Guardar"; luego "Eliminar".
  - Esperado: el monto se actualiza; eliminar pide confirmación y lo quita de la lista.

## 9. Análisis (6)

- [ ] **9.1 Accesos**
  - Pasos: abrir Análisis desde Planificar y desde el encabezado de Inicio.
  - Esperado: llega a la misma pantalla de análisis.
- [ ] **9.2 Donut por categoría**
  - Pasos: revisar Gastos | Ingresos y el DonutChart.
  - Esperado: monto central correcto; lista de categorías con monto y porcentaje; máximo 6 y el resto agrupado en "Otros".
- [ ] **9.3 Totales coinciden con Movimientos**
  - Pasos: comparar el total del mes en Análisis con la franja de Movimientos del mismo mes.
  - Esperado: los totales coinciden.
- [ ] **9.4 Últimos 6 meses**
  - Pasos: revisar el gráfico de barras agrupadas.
  - Esperado: barras de ingresos y gastos por mes; los meses sin datos no rompen el gráfico.
- [ ] **9.5 Base y extras**
  - Pasos: revisar la sección "Base y extras".
  - Esperado: porcentaje de extras por mes; coincide con la dependencia de extras de Inicio.
- [ ] **9.6 Insights y estados**
  - Pasos: revisar el bloque de insights; luego un mes sin datos.
  - Esperado: 2–3 frases cortas (o ninguna si no hay datos suficientes); con mes vacío, "Registra movimientos para ver tu análisis". 📸

## 10. Sin conexión (6)

- [ ] **10.1 Crear gasto sin conexión**
  - Pasos: activar modo avión → registrar un gasto.
  - Esperado: guarda y cierra de inmediato con Snackbar "Guardado. Se sincronizará cuando haya conexión."; los saldos no cambian todavía.
- [ ] **10.2 Píldora de conexión**
  - Pasos: estando sin conexión, revisar Inicio y Movimientos.
  - Esperado: píldora "Sin conexión" y, si hay pendientes, "Sin conexión · N por sincronizar".
- [ ] **10.3 Fila pendiente**
  - Pasos: revisar Movimientos sin conexión.
  - Esperado: la fila pendiente aparece con Tag "Sin sincronizar" en el día correspondiente.
- [ ] **10.4 Sincronización sin duplicados**
  - Pasos: con 2 pendientes creados, reiniciar la app, quitar modo avión.
  - Esperado: "Sincronizando…" y luego desaparece; llegan exactamente 2 movimientos (no 4) y los saldos se actualizan.
- [ ] **10.5 Editar/eliminar sin conexión**
  - Pasos: sin conexión, intentar editar y eliminar.
  - Esperado: se bloquea con Snackbar "Necesitas conexión para esto."
- [ ] **10.6 Error no transitorio**
  - Pasos: provocar un error de servidor en una creación pendiente.
  - Esperado: la fila pasa a Tag "No se guardó" con acciones "Reintentar" y "Descartar" (al tocarla).

## 11. Exportar (4)

- [ ] **11.1 Exportar este mes**
  - Pasos: Más → "Exportar movimientos" → rango "Este mes" → "Exportar".
  - Esperado: se genera el CSV y se abre la hoja de compartir; el archivo temporal se elimina después.
- [ ] **11.2 Contenido del CSV**
  - Pasos: abrir el CSV en Excel/Google Sheets.
  - Esperado: columnas fecha, tipo, naturaleza, categoría, subcategoría, cuenta, cuenta_destino, monto, nota, recurrente; separador `;`; tildes correctas; monto entero sin formato; solo movimientos publicados.
- [ ] **11.3 Rangos**
  - Pasos: exportar "Este año" y "Todo".
  - Esperado: cada rango incluye exactamente los movimientos correspondientes.
- [ ] **11.4 Rango sin datos**
  - Pasos: exportar un rango sin movimientos.
  - Esperado: "No hay movimientos en este rango"; no genera archivo.

## 12. Eliminar cuenta (5)

- [ ] **12.1 Acceso y advertencia**
  - Pasos: Más → "Eliminar cuenta".
  - Esperado: pantalla que explica en 3 líneas qué se borra, que es irreversible, y ofrece "Exportar mis datos primero".
- [ ] **12.2 Confirmación por palabra**
  - Pasos: escribir la palabra de confirmación en minúsculas / incorrecta; luego correcta.
  - Esperado: el botón destructivo solo se habilita con la palabra exacta (ELIMINAR).
- [ ] **12.3 Eliminación exitosa**
  - Pasos: con un usuario de prueba, confirmar la eliminación.
  - Esperado: se limpia el estado local (sesión, biometría, notificaciones) y vuelve a login con "Tu cuenta se eliminó". En Supabase desaparecen el usuario y sus filas.
- [ ] **12.4 Sin conexión**
  - Pasos: sin conexión, intentar eliminar la cuenta.
  - Esperado: "Necesitas conexión para eliminar tu cuenta"; no cierra sesión.
- [ ] **12.5 Fallo del servidor**
  - Pasos: simular un fallo de la función.
  - Esperado: mensaje claro con reintento; **no** cierra sesión.

## 13. Temas, accesibilidad y bloqueo (6)

- [ ] **13.1 Tema oscuro/claro/sistema**
  - Pasos: Más → "Apariencia" → alternar Sistema, Oscuro y Claro.
  - Esperado: toda la app cambia de tema de inmediato; la preferencia se conserva al reiniciar; el valor por defecto es Oscuro. 📸
- [ ] **13.2 Contraste en ambos temas**
  - Pasos: revisar textos, montos e íconos en ambos temas.
  - Esperado: legibles y con contraste AA (hay test automático de tokens; revisar visualmente los casos límite).
- [ ] **13.3 Letra grande**
  - Pasos: activar el tamaño de letra grande en el sistema y recorrer la app.
  - Esperado: el texto escala sin cortarse ni solaparse; nada queda inutilizable.
- [ ] **13.4 Reducir movimiento**
  - Pasos: activar "reducir movimiento" en el sistema y recorrer Inicio, Movimientos y el registro.
  - Esperado: las animaciones se **desactivan** (no se acortan): conteos, barras, transiciones y sacudida.
- [ ] **13.5 Bloqueo biométrico**
  - Pasos: Más → "Bloqueo biométrico" → activar; enviar la app a segundo plano más de 30 s y volver.
  - Esperado: aparece la pantalla de bloqueo; la huella/Face ID desbloquea; una lectura fallida mantiene el bloqueo.
- [ ] **13.6 Bloqueo y modales**
  - Pasos: con el bloqueo activo, abrir el registro rápido y mandar la app a segundo plano.
  - Esperado: al volver, los modales se cierran y se fuerza Inicio tras desbloquear.
