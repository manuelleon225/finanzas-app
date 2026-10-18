# Plan maestro R8: correcciones y evolución visual (Finanzas personales)

Continuación de la guía v3 (R7.0 a R7.14). Parte de las capturas nuevas del dispositivo Android: ya se ve el bloque azul, las fichas de color y el registro rápido grande, pero hay defectos de geometría y faltan las piezas que separan una app correcta de una app de nivel Revolut, Monarch o YNAB.

**Stack real (distinto del de la plantilla original):** Expo + React Native + TypeScript + Expo Router. No hay Tailwind ni CSS: los estilos usan `StyleSheet` y los tokens de `src/theme`. Por eso los prompts hablan de tokens y componentes, no de clases.

---

## 1. Diagnóstico y hallazgos actuales

### 1.1 Lo que ya funciona (no tocar)

| Pantalla | Qué está bien |
|---|---|
| Registro rápido | Monto grande (44 px), fichas de color con ícono relleno, teclado de teclas altas, texto guía claro. Es la pantalla más lograda. |
| Movimientos | Tarjeta azul de resumen a todo el ancho, ficha de ícono en el estado vacío. |
| Inicio (primer uso) | Tarjeta "Empieza en 3 pasos" con fichas de color: guía clara para quien llega con $0. |

### 1.2 Defectos detectados en las capturas nuevas

| # | Gravedad | Dónde | Hallazgo | Se corrige en |
|---|---|---|---|---|
| 1 | Crítica | Inicio, Registro rápido, Análisis | El bloque azul termina a ~90% del ancho y deja una franja oscura a la derecha, con un círculo decorativo gris desbordado. El avatar queda justo sobre la costura. | Prompt #1 |
| 2 | Crítica | Inicio, Registro rápido, Análisis | Los textos de apoyo quedan **fuera** del bloque, sobre fondo oscuro: "Registra tu ingreso base para calcularlo", "Efectivo · Hoy" y la frase de Análisis. El bloque no tiene su relleno inferior. | Prompt #1 |
| 3 | Alta | Todas las pantallas con bloque | La hoja con esquinas superiores redondeadas no se aprecia: el contenido parece pegado al bloque. | Prompt #1 |
| 4 | Alta | Todas | Barra de estado negra (el bloque no llega arriba) y franja gris clara en la barra de navegación inferior. Puede ser un límite de Expo Go. | Prompt #2 |
| 5 | Media | Análisis | Dos chevrones "<" apilados (atrás y mes) que se confunden; la frase del estado vacío se repite en dos lugares. | Prompt #6 |
| 6 | Media | Planificar, Más, Cuentas, Categorías | Siguen con el estilo anterior (tarjetas grises, enlaces de texto "Editar" y "Archivar"). Corresponden a R7.9, R7.10 y R7.11 de la guía v3. | Guía v3 |
| 7 | Media | Categorías | Texto roto: "EducaciÃ³n" (error de codificación en la base de datos). | Migración 008 (ya tienes el prompt) |
| 8 | Baja | Todas | El botón azul con engranaje flotante es de Expo Go, no de la app. | No aplica |

### 1.3 Brecha frente a las apps líderes

| Qué hacen Revolut, Monarch, YNAB y Wallet | Qué falta en tu app |
|---|---|
| Un gráfico o tendencia ya en la pantalla principal | Inicio solo muestra cifras y barras de progreso |
| Acciones rápidas (gasto, ingreso, transferir) a un toque desde el inicio | Todo pasa por el botón (+) |
| Gráficos que se tocan o arrastran y explican cada punto | Los gráficos son estáticos |
| Sugerencias: categoría probable, gastos que se repiten | El usuario siempre elige a mano |
| Retroalimentación al tocar (escala, háptica, transiciones) | Solo vibración en algunos puntos |
| Estados vacíos con ilustración | Estados vacíos con un ícono dentro de una ficha |

### 1.4 Decisión de estilo: lo que NO recomiendo

- **Neomorfismo:** sus bordes y sombras suaves tienen contraste muy bajo y fallan WCAG; además los sombreados son caros de dibujar en React Native. Se descarta.
- **Glassmorphism generalizado:** requiere desenfoque nativo (`expo-blur`), consume batería y legibilidad. Se descarta; si en el futuro se quiere, solo en hojas modales.
- **Lo que sí:** diseño plano con capas (bloque, hoja, tarjetas), degradado sutil en el bloque y color con significado. Es lo que usan las apps fintech que mejor envejecen.

---

## 2. Cómo usar este plan

### 2.1 Reglas

- Un prompt a la vez, con el **PIE COMÚN v3** (sección 2.2) pegado al final. Un prompt = un commit.
- Trabaja en la rama `feat/ui-v3`.
- Si el agente falla dos veces, usa el prompt de rescate (sección 8) y me pasas el error con el número del prompt.
- Los prompts #1 y #2 **deben ir antes** de continuar con R7.9 en adelante, porque Análisis y el resto de pantallas con bloque dependen de que el bloque esté bien.

### 2.2 PIE COMÚN v3 (se agrega al final de CADA prompt)

```text
AL TERMINAR:
1. Ejecuta `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd test`. Corrige todo error antes de responder.
2. No agregues dependencias que no estén listadas en este prompt sin preguntarme antes. Las del ecosistema Expo se instalan con `npx.cmd expo install`.
3. No modifiques archivos fuera del alcance de esta tarea ni la lógica de negocio, hooks de datos, api ni migraciones, salvo que el prompt lo pida de forma explícita.
4. No uses colores hexadecimales, rgb()/rgba() ni valores de diseño "mágicos" fuera de src/theme: todo sale de los tokens de docs/DESIGN_SYSTEM.md. Ionicons solo a través de AppIcon.
5. No puedes ver la pantalla. Nunca afirmes que algo "se ve bien". Verifica con tipos, tests y lint, y termina con una lista "Para revisar visualmente" con lo que debo mirar yo en el dispositivo.
6. Si docs/DESIGN_SYSTEM.md o docs/UX_SPEC.md no cubren algo que necesitas, pregúntame. No inventes.
7. Actualiza docs/PROGRESS.md.
8. Responde solo con: (a) resumen breve, (b) archivos tocados, (c) pasos manuales para mí, (d) lista "Para revisar visualmente", (e) mensaje de commit sugerido (Conventional Commits).
9. Detente. No empieces la siguiente tarea.
```

### 2.3 Orden recomendado

| Orden | Prompt | Qué hace |
|---|---|---|
| 1 | #1 (R8.0) | Geometría del bloque y la hoja |
| 2 | #2 (R8.1) | Barras del sistema |
| 3 | R7.9, R7.10, R7.11, R7.12 | Pantallas pendientes de la guía v3 |
| 4 | R7.13 | Análisis (guía v3) |
| 5 | #3 (R8.2) | Inicio: acciones rápidas y últimos 7 días |
| 6 | #4 (R8.3) | Registro: sugerencias y frecuentes |
| 7 | #5 (R8.4) | Análisis: barras interactivas |
| 8 | #6 (R8.5) | Análisis: flujo del mes interactivo |
| 9 | #7 (R8.6) | Micro-interacciones e ilustraciones |
| 10 | R7.14 y #8 (R8.7) | Auditoría final |

---

## 3. Sistema de diseño: estado y correcciones (Fase 0)

**Análisis de UX.** El bloque azul es la identidad de la app: si no cubre todo el ancho ni contiene sus propios textos, el diseño parece roto aunque los colores sean correctos. Antes de agregar nada, hay que dejar la geometría sólida. El sistema de diseño v3 (tokens, tipografía, fichas) ya está bien; lo que falla es el contenedor.

### Prompt Maestro #1 (R8.0): geometría del bloque y de la hoja

```text
ROL: Eres un ingeniero senior de React Native (Expo) con ojo de diseñador de producto.

CONTEXTO: App de finanzas personales (Expo, React Native, TypeScript, Expo Router). El diseño v3 está en docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md. En las capturas del dispositivo Android se ven estos defectos en las pantallas con bloque azul (Inicio, Registro rápido y Análisis):
(1) el bloque azul termina a cerca del 90% del ancho y deja una franja oscura a la derecha, con un círculo decorativo gris desbordado; el avatar queda sobre esa costura;
(2) los textos de apoyo del bloque quedan FUERA del bloque, sobre el fondo oscuro ("Registra tu ingreso base para calcularlo", la línea "Efectivo · Hoy" y la frase de Análisis): al bloque le falta su relleno inferior;
(3) la hoja con esquinas superiores redondeadas no se aprecia.

PASO A, diagnóstico (NO cambies código todavía):
1. Lee src/components/ui/BlockHeader.tsx, src/components/ui/Sheet.tsx, src/components/ui/ScreenScaffold.tsx y su uso en app/(tabs)/index.tsx, app/transaction-form.tsx y app/analysis.tsx.
2. Escribe en docs/PROGRESS.md, bajo el título "Diagnóstico R8.0", la causa raíz concreta de (1), (2) y (3), citando archivo y línea. Confirma o descarta cada una de estas causas probables: ancho calculado una sola vez con Dimensions o con un onLayout inicial; SVG con width y height fijos en lugar de 100%; círculos decorativos como View absolutas fuera de un contenedor con overflow hidden; paddingBottom del bloque sobrescrito o ausente; textos pasados como hijos de la hoja y no del bloque; márgenes o paddings horizontales aplicados al contenedor externo del bloque; marginTop negativo de la hoja absorbiendo el relleno inferior del bloque.

PASO B, corrección (aplica TODO lo siguiente):
1. BlockHeader: el contenedor raíz tiene width '100%', alignSelf 'stretch', overflow 'hidden', y NINGÚN margen ni padding horizontal. El padding horizontal (token de margen de pantalla, 20) se aplica solo en una View interna de contenido.
2. Fondo del bloque: UN solo componente Svg con StyleSheet.absoluteFill, width="100%", height="100%", preserveAspectRatio="none" y viewBox "0 0 100 100". El degradado (LinearGradient con x1=0, y1=0, x2=0, y2=1, de brand a brandDeep) y los DOS círculos decorativos (color blockDecor) se dibujan DENTRO de ese mismo Svg con coordenadas del viewBox: círculo 1 con cx=88, cy=8, r=24; círculo 2 con cx=100, cy=30, r=30. Como están dentro del Svg y el contenedor tiene overflow hidden, no pueden desbordarse. Prohibido usar Dimensions.get en este componente y prohibidas las View absolutas para decorar.
3. Contenido interno del bloque: paddingTop = zona segura superior + 12, paddingBottom = 44, paddingHorizontal = 20. TODO lo que debe verse sobre el azul se pasa como hijo de BlockHeader: fila superior, etiquetas, monto, barras y los textos de apoyo (incluidos "Registra tu ingreso base para calcularlo", la línea "{Cuenta} · {Fecha}" del registro rápido y la frase de insight de Análisis). Mueve cualquier texto que hoy esté en la hoja pero pertenezca al bloque.
4. Sheet: marginTop -28, borderTopLeftRadius y borderTopRightRadius del token sheet (28), backgroundColor bg, flex 1, overflow 'hidden'. Se renderiza DESPUÉS del bloque para que lo solape; con el relleno inferior de 44 y el solape de 28 quedan 16 px libres bajo el último texto del bloque. El padding horizontal de 20 va dentro del contenido de la hoja, no en la hoja.
5. ScreenScaffold: raíz con flex 1 y fondo bg; ScrollView con contentContainerStyle sin padding horizontal; el bloque y la hoja ocupan el ancho completo de la pantalla. La fila superior (saludo, selector de mes, avatar) usa flexDirection row y justifyContent space-between DENTRO del contenido interno del bloque, de modo que el avatar queda dentro de los márgenes de 20 y nunca en el borde.
6. Revisa Inicio, Registro rápido y Análisis para que usen esta estructura sin duplicar contenedores ni márgenes.
7. Tests (@testing-library/react-native): (a) BlockHeader renderiza sus children dentro del contenedor raíz; (b) el estilo raíz tiene width '100%' y overflow 'hidden'; (c) el contenido interno tiene paddingBottom 44; (d) el Svg recibe preserveAspectRatio "none" y los dos círculos están dentro del Svg (por testID); (e) Sheet tiene marginTop -28 y los radios del token sheet. Agrega un test o regla de lint que impida usar Dimensions.get('window') en src/components/ui/BlockHeader.tsx.
8. No cambies colores, tipografía ni textos: solo la estructura y la geometría.

CRITERIOS DE ACEPTACIÓN:
- El bloque ocupa el 100% del ancho sin franja oscura a la derecha; no hay círculo gris desbordado.
- Todos los textos de apoyo quedan sobre el azul.
- La hoja se ve con esquinas superiores redondeadas sobre el bloque.
- Calidad en verde.
```

🔍 Revisa en Inicio, Registro rápido y Análisis: bloque a todo el ancho, textos dentro del azul, esquinas redondeadas de la hoja. 📸 Mándame una captura de cada una.

### Prompt Maestro #2 (R8.1): barras del sistema

```text
Lee AGENTS.md, docs/ARCHITECTURE.md (sección de barras del sistema), src/lib/systemBars.ts y app.json.

PROBLEMA: En Android la barra de estado se ve como una franja negra y el contenido empieza debajo de ella (el bloque azul no llega hasta arriba); la barra de navegación inferior del sistema se ve como una franja gris clara que desentona con el fondo oscuro.

PASO A, diagnóstico (NO cambies código todavía):
1. Lee app.json (plugins, bloque android, userInterfaceStyle, configuración de borde a borde si existe), la versión instalada del SDK de Expo y de react-native, y cómo se usan expo-status-bar y expo-system-ui hoy.
2. Consulta la documentación vigente de Expo para esa versión sobre borde a borde (edge-to-edge), expo-status-bar y expo-system-ui.
3. Escribe en docs/PROGRESS.md, bajo "Diagnóstico R8.1": qué configuración está activa, si el comportamiento observado es esperable en Expo Go o es un fallo de configuración, y cuál es la solución con menos dependencias.

PASO B, corrección:
1. Barra de estado: que el bloque azul llegue hasta el borde superior de la pantalla en las pantallas con bloque, con íconos claros. Si en el entorno actual (Expo Go) la barra de estado no puede ser translúcida, entonces pinta el área de la zona segura superior con el color brand: una View absoluta de alto igual a la zona segura superior con fondo brand, solo en pantallas con bloque, y con el color bg en las demás. El objetivo es que no haya franja negra.
2. Barra de navegación del sistema: color de fondo igual al token bg del tema actual (oscuro o claro) y estilo de íconos acorde, siguiendo la API vigente. Debe reaccionar al cambio de tema, incluido el modo Sistema.
3. Mantén getStatusBarStyle y los tests existentes; agrega tests para cualquier función pura nueva (por ejemplo, la que decide el color del área superior según la variante).
4. Si algo no se puede lograr en Expo Go, documéntalo en docs/ARCHITECTURE.md y en tu respuesta, indicando qué se verificaría en un development build. NO instales expo-dev-client ni cambies el flujo de ejecución sin preguntarme.

CRITERIOS DE ACEPTACIÓN:
- Sin franja negra arriba en pantallas con bloque ni franja clara desentonada abajo en modo oscuro, o documentado por qué no es posible en Expo Go. Calidad en verde.
```

📸 Captura de Inicio completa (arriba y abajo), en oscuro y claro.

---

## 4. Fase 1: Dashboard principal y resumen financiero

**Análisis de UX.** Hoy Inicio responde una sola pregunta ("¿cuánto puedo gastar hoy?") con un número. Las apps líderes añaden dos cosas que reducen fricción y dan contexto: acciones rápidas a un toque (el usuario no debería tener que abrir el modal y cambiar el tipo cada vez) y una mirada breve a la tendencia reciente (¿gasto más de lo normal esta semana?). Con ambas, el dashboard pasa de "cifras" a "decisiones".

### Prompt Maestro #3 (R8.2): acciones rápidas y últimos 7 días

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Inicio"), app/(tabs)/index.tsx y app/transaction-form.tsx.

TAREA: Agrega a la hoja de Inicio una fila de acciones rápidas y una tarjeta "Últimos 7 días". No cambies la lógica de Disponible hoy ni de los hooks existentes.

PARTE 1: acciones rápidas
1. Fila de tres acciones de igual ancho al inicio de la hoja (antes de "Este mes"), con 12 px de separación. Cada una: IconTile de 40 centrada y debajo una etiqueta caption centrada. Acciones: "Gasto" (ficha coral, ícono arrow-up), "Ingreso" (ficha green, ícono arrow-down) y "Transferir" (ficha blue, ícono swap-horizontal). Área táctil de toda la columna, mínimo 44 px de alto, haptics tap al pulsar.
2. Cada acción abre la ruta del registro rápido con un parámetro de ruta opcional `type` con valores 'expense' | 'income' | 'transfer'. En app/transaction-form.tsx lee el parámetro con validación (zod safeParse); si falta o es inválido, usa 'expense'. El tipo inicial del SegmentedControl corresponde al parámetro. El botón (+) central sigue abriendo sin parámetro.
3. Accesibilidad: cada acción con role button y accessibilityLabel ("Registrar un gasto", "Registrar un ingreso", "Hacer una transferencia").

PARTE 2: tarjeta "Últimos 7 días"
1. Funciones puras en src/features/summary/utils/dailySpending.ts, con tests exhaustivos:
   - `getDailySpending(transactions, today, days = 7)`: devuelve un arreglo de { date: 'YYYY-MM-DD', total: number } ordenado del más antiguo al más reciente, con una entrada por día (cero si no hay gasto). Cuenta solo gastos publicados (status 'posted', type 'expense'); ignora transferencias e ingresos.
   - `getDailyAverage(daily)`: promedio entero de los días con el total completo (incluye días en cero), redondeado hacia abajo.
   - `getWeekdayInitial(date)`: inicial en español del día de la semana ('L', 'M', 'X' para miércoles, 'J', 'V', 'S', 'D').
   Tests: semana sin gastos, gastos en un solo día, cruce de fin de mes, cruce de fin de año, transferencias ignoradas, pendientes ignorados.
2. Datos: obtén los gastos de [hoy - 6 días, hoy] con el hook de rango de movimientos que ya existe (pagina internamente si hace falta). No crees consultas nuevas si ya hay un hook que sirve.
3. Tarjeta (Card, padding 16): fila superior con el título "Últimos 7 días" (subtitle) a la izquierda y "Promedio {monto compacto}/día" (caption, textSecondary) a la derecha. Debajo, 7 columnas de igual ancho con 8 px de separación: cada columna es una barra (View con radio sm) de altura proporcional al máximo de la semana, con altura máxima 64 y mínima 4; la barra de hoy usa brand y las demás surfaceHigh. Debajo de cada barra, la inicial del día (caption, textMuted).
4. Interacción: tocar una barra muestra sobre ella una pequeña etiqueta con el monto compacto (fondo surfaceHigh, texto textPrimary, radio 8, micro) y vibración haptics select; tocar otra mueve la etiqueta; tocar la misma la oculta.
5. Sin gastos en los 7 días: en lugar de las barras muestra el texto "Aún no hay gastos esta semana" (caption, textSecondary) centrado en la tarjeta.
6. Accesibilidad: cada barra con accessibilityRole button y accessibilityLabel "{día}: {monto en palabras}"; la tarjeta con un resumen ("Gastaste {total} en los últimos 7 días; promedio {promedio} por día").
7. Estado de carga: Skeleton con la forma de la tarjeta. Estado de error: ErrorState compacto con reintento.
8. Orden final de la hoja de Inicio: banner de pendientes, píldora de conexión, acciones rápidas, tarjeta "Empieza en 3 pasos" (solo primer uso), "Este mes", "Últimos 7 días", "Cuentas", "Recientes". Actualiza la sección "Inicio" de docs/UX_SPEC.md con este orden y estos dos bloques nuevos (única edición de documentos permitida en esta tarea).
9. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Las tres acciones abren el registro con el tipo correcto. La tarjeta muestra la semana correcta y la etiqueta responde al toque. Calidad en verde.
```

📸 Captura de Inicio con datos reales de al menos 3 días distintos.

---

## 5. Fase 2: Flujo de transacciones

**Análisis de UX.** El registro rápido ya requiere pocos toques. El siguiente salto es reducir los toques a cero o uno en lo repetitivo: la mayoría de las personas repite el mismo puñado de gastos (almuerzo, bus, café) y escribe notas que ya escribió antes. Dos funciones lo resuelven sin IA de pago: sugerir la categoría a partir de la nota escrita y ofrecer "frecuentes" que se guardan con un solo toque. Ambas son deterministas, rápidas y con deshacer.

### Prompt Maestro #4 (R8.3): categoría sugerida y movimientos frecuentes

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Registro rápido"), app/transaction-form.tsx y la función rankCategoriesByUsage existente.

TAREA: Agrega al registro rápido (solo en modo NUEVO) la categoría sugerida a partir de la nota y la fila de movimientos frecuentes. No cambies validaciones, guardado, deshacer ni modo sin conexión.

PARTE 1: funciones puras, con tests exhaustivos, en src/features/transactions/utils/suggestions.ts
1. `normalizeText(text)`: pasa a minúsculas, quita tildes (normalización NFD y eliminación de marcas diacríticas), reemplaza todo carácter que no sea letra o número por espacio, divide en palabras, descarta las de menos de 3 letras y estas palabras vacías: de, del, la, las, el, los, con, por, para, una, uno, que, mis, mi, y, en, al.
2. `suggestCategories({ note, history, categories, type, today })`:
   - history es una lista de { note, categoryId, type, occurredOn, amount }.
   - Considera solo movimientos del mismo `type` (gasto o ingreso) con fecha dentro de los últimos 180 días.
   - Calcula las palabras de la nota actual con normalizeText. Si no hay palabras, devuelve [].
   - Para cada movimiento del historial, cuenta cuántas palabras comparte con la nota actual; si es mayor que cero, suma (coincidencias * 3) al puntaje de su categoría.
   - Si el puntaje total de todas las categorías es cero, devuelve [].
   - Devuelve hasta 3 { categoryId, score } ordenados por puntaje descendente y, en empate, por fecha más reciente del movimiento que coincidió. Ignora categorías archivadas o que no existan en `categories`.
3. `getFrequentTransactions({ history, today, limit = 3 })`:
   - Agrupa los movimientos de tipo gasto o ingreso de los últimos 60 días por la combinación (type, categoryId, amount, nota normalizada unida con espacios).
   - Conserva los grupos con 2 o más ocurrencias; ordénalos por número de ocurrencias descendente y, en empate, por fecha más reciente; devuelve hasta `limit` con { type, categoryId, amount, note, accountId (el de la ocurrencia más reciente), count }.
   Tests: tildes y mayúsculas, palabras vacías, nota vacía, sin coincidencias, empate, categoría archivada, fuera de ventana de fechas, grupos de una sola ocurrencia, límite.
4. Los datos del historial salen del mismo hook que ya alimenta rankCategoriesByUsage (últimos 90 a 180 días); no crees consultas nuevas si ya existe una que sirve, amplía su ventana si hace falta sin romper sus tests.

PARTE 2: categoría sugerida (UI)
1. Cuando el usuario escribe en el campo Nota, con retardo (debounce) de 250 ms, calcula suggestCategories para el tipo actual.
2. Si hay sugerencia: la categoría de mayor puntaje pasa a la PRIMERA posición de la cuadrícula (si no estaba entre las 5 mostradas, reemplaza la quinta), con una micro-etiqueta "Sugerida" (Tag variante base) bajo su nombre y un pulso único de escala 1 a 1.04 y de vuelta (220 ms, desactivado con "reducir movimiento"). Si el usuario borra la nota o cambia de tipo, la cuadrícula vuelve al orden normal.
3. Tocar una categoría sigue guardando igual; la sugerida no se selecciona sola.

PARTE 3: frecuentes (UI)
1. Solo si el modo es NUEVO, el tipo no es Transferencia y el monto está vacío, muestra sobre la cuadrícula una fila horizontal desplazable "Frecuentes" (caption, textSecondary como título) con hasta 3 chips de alto 40: ficha de la categoría de 24 px, el texto "{nota o nombre de categoría} · {monto compacto}" (se acorta con puntos suspensivos a 20 caracteres). Si no hay frecuentes, no se muestra nada (ni título).
2. Al tocar un chip: guarda de inmediato un movimiento nuevo con el mismo tipo, categoría, monto, nota, naturaleza Base y cuenta (si la cuenta sigue activa; si no, la última usada) y fecha de hoy; haptics success; cierra el modal; Snackbar "Guardado" con acción "Deshacer". En cuanto el usuario escribe un dígito, la fila desaparece.
3. Respeta el modo sin conexión como el resto del guardado rápido.

Accesibilidad: cada chip frecuente con accessibilityLabel "Repetir {descripción}, {monto en palabras}". Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Escribir "almuerzo" tras haber registrado antes notas parecidas sugiere la misma categoría; un gasto repetido 2 o más veces aparece como frecuente y se guarda con un toque, con deshacer. Calidad en verde.
```

📸 Captura del registro rápido con la fila de frecuentes visible y otra con la nota escrita y la categoría sugerida.

---

## 6. Fase 3: Visualización de datos y analíticas

**Análisis de UX.** Un gráfico que solo se mira dice poco; uno que se toca responde preguntas ("¿qué pasó en agosto?"). El objetivo es que el usuario pase de "veo barras" a "entiendo por qué": tocar un mes lo selecciona y actualiza el resto de la pantalla (explorar por capas), y arrastrar el dedo sobre el flujo del mes muestra el saldo acumulado día por día.

### Prompt Maestro #5 (R8.4): Análisis, encabezado y barras interactivas

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Análisis"), app/analysis.tsx y src/components/charts.

TAREA: Corrige el encabezado de Análisis y haz interactivo el gráfico de barras de los últimos 6 meses. Conserva las funciones puras existentes (spendingByCategory, monthlyTrend, extraShareByMonth, buildInsights).

PARTE 1: encabezado y estado vacío
1. En el bloque, usa 4 filas en este orden: (a) IconButton de volver, solo con el ícono arrow-back (distinto del chevron de los meses), alineado a la izquierda; (b) el título "Análisis" (variante title, onBrand); (c) MonthSelector tone onBlock centrado, con chevrones de 20 px; (d) la frase principal de buildInsights (caption, onBrandMuted) solo si existe y si hay datos del mes.
2. Si el mes no tiene movimientos: la fila (d) NO se muestra y el contenido de la hoja es únicamente el EmptyState ("Registra movimientos para ver tu análisis"); no repitas la frase en dos sitios.

PARTE 2: barras interactivas (GroupedBarChart)
1. Función pura `buildBarChartLayout({ data, width, height, barWidth = 10, innerGap = 4 })` en src/components/charts/layout.ts que devuelva, por mes, las posiciones x de cada grupo, el alto y la posición y de las barras de ingresos y gastos (escala común al máximo de todos los valores, con la base en el borde inferior; si el máximo es 0, todas las barras miden 2 px), y el rectángulo táctil del grupo (columna completa de alto `height`). Tests: máximo cero, un mes, seis meses, valores iguales, barra mínima.
2. Gráfico: alto 180, sin eje vertical, línea base de 1 px (border), grupos de 2 barras (ingresos en income, gastos en expense, radio sm arriba), etiqueta de mes abreviada bajo cada grupo (caption, textMuted).
3. Selección: tocar cualquier punto de la columna de un grupo lo selecciona (haptics select). El grupo seleccionado se dibuja con opacidad 1 y los demás con 0.45. Por defecto está seleccionado el mes que muestra el MonthSelector.
4. Resumen del mes seleccionado SOBRE el gráfico, dentro de la tarjeta: texto "{mes año}" (subtitle) y tres datos en fila "Ingresos {monto compacto}", "Gastos {monto compacto}", "Balance {monto compacto con signo}" (caption; el balance en income o expense según signo). Al cambiar la selección, el texto se actualiza con un fundido de 150 ms (sin animar si "reducir movimiento" está activo).
5. Exploración por capas: al seleccionar un mes en el gráfico, se actualiza también el mes de la pantalla (el mismo estado que usa el MonthSelector), de modo que el donut y la lista de categorías muestran ese mes. El MonthSelector sigue funcionando y mantiene el gráfico sincronizado.
6. Animación de entrada: las barras crecen desde 0 hasta su altura en 320 ms con escalonado de 40 ms entre grupos (Reanimated); desactivada con "reducir movimiento".
7. Accesibilidad: cada grupo con role button y label "{mes}: ingresos {monto en palabras}, gastos {monto en palabras}"; la tarjeta con una alternativa en texto (tabla breve por mes) bajo el gráfico, como ya existe.
8. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Tocar un mes resalta sus barras, actualiza el resumen y cambia el donut y la lista a ese mes. Calidad en verde.
```

📸 Captura de Análisis con un mes seleccionado distinto al actual (necesitas datos de varios meses; si no los tienes, pídele a un prompt aparte que cree datos de prueba locales no versionados).

### Prompt Maestro #6 (R8.5): flujo del mes interactivo

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Análisis"), app/analysis.tsx y src/components/charts.

TAREA: Agrega a Análisis la tarjeta "Flujo del mes": un gráfico de línea con el balance acumulado día por día, que se puede arrastrar para ver cada día.

PARTE 1: funciones puras en src/features/analysis/utils/cashFlow.ts, con tests exhaustivos
1. `cumulativeBalanceByDay({ transactions, month, today })`: devuelve [{ day: number, balance: number }] desde el día 1. El balance de cada día es la suma acumulada de (ingresos - gastos) publicados de ese mes hasta ese día, ignorando transferencias y movimientos pendientes. Si `month` es el mes actual, devuelve solo hasta el día de `today`; si es un mes pasado, todos sus días.
2. `buildLineChartLayout({ points, width, height, padding = 12 })`: devuelve { path: string, areaPath: string, coordinates: {x, y}[], zeroY: number | null }. Escala x: reparto uniforme entre padding y width - padding (si hay un solo punto, x en el centro). Escala y: dominio [mínimo entre 0 y el mínimo de los balances, máximo entre 0 y el máximo de los balances] ampliado un 10% por arriba y por abajo; si el dominio tiene amplitud 0, usa [-1, 1]. `zeroY` es la posición y de la línea cero si el dominio la cruza, o null.
3. `nearestIndex(x, coordinates)`: índice del punto con x más cercano.
Tests: mes sin movimientos, un solo día, saldo siempre positivo, siempre negativo, cruce por cero, dominio plano, mes actual a mitad, mes pasado completo, transferencias y pendientes ignorados, nearestIndex en extremos.

PARTE 2: gráfico (react-native-svg, react-native-gesture-handler, react-native-reanimated; ya instalados)
1. Tarjeta (Card) con título "Flujo del mes" (subtitle) a la izquierda y, a la derecha, el balance acumulado actual con signo (bodyStrong, color income si es 0 o positivo y expense si es negativo). Altura del gráfico: 140. Se coloca en la hoja de Análisis justo antes del donut.
2. Dibujo: línea (stroke brand, 2.5, strokeLinejoin round, strokeLinecap round); área bajo la línea con degradado vertical de brand con opacidad 0.25 arriba a 0 abajo, dibujado en el mismo Svg; línea cero punteada (stroke border, 1) si zeroY no es null; punto final de radio 4 en brand con un anillo de 8 px en brandSoft.
3. Interacción: un gesto de arrastre horizontal (Pan) sobre el gráfico mueve una guía vertical de 1 px (textMuted) y el punto, ajustándolos al día más cercano con nearestIndex; sobre la guía aparece una etiqueta "{día} {mes abreviado}: {monto}" (fondo surfaceHigh, texto textPrimary, radio 8, micro). Haptics select cada vez que cambia el día. Al soltar, la guía y la etiqueta desaparecen y el punto vuelve al último día. Un toque simple también selecciona un día. El gesto no debe bloquear el desplazamiento vertical de la pantalla (activa el arrastre solo con movimiento horizontal predominante).
4. Mes sin movimientos: dibuja una línea plana en cero (stroke border) y el texto "Sin movimientos este mes" (caption, textSecondary) centrado; sin gesto.
5. "Reducir movimiento": sin animación de dibujo; la interacción sigue funcionando. Con movimiento permitido, la línea se dibuja con un recorte animado de izquierda a derecha en 400 ms.
6. Accesibilidad: la tarjeta con accessibilityLabel que resume ("Balance acumulado del mes: {monto en palabras}; mínimo {monto}; máximo {monto}") y acciones de accesibilidad para leer el balance de la primera, mitad y última fecha.
7. Textos en src/i18n/es.ts. Actualiza la sección "Análisis" de docs/UX_SPEC.md para incluir esta tarjeta (única edición de documentos permitida en esta tarea).

CRITERIOS DE ACEPTACIÓN:
- Arrastrar el dedo por el gráfico muestra el balance de cada día y el scroll vertical sigue funcionando. Calidad en verde.
```

📸 Captura del gráfico en reposo y otra mientras arrastras el dedo (con la etiqueta visible).

---

## 7. Fase 4: pulido y cierre

**Análisis de UX.** La diferencia entre "funciona" y "se siente bien" está en la respuesta al toque y en los estados vacíos. Tres detalles bastan: que lo tocable reaccione con una escala mínima, que los avisos entren con suavidad, y que los estados vacíos tengan una ilustración simple en lugar de un ícono suelto. Todo con formas vectoriales propias, sin imágenes ni librerías.

### Prompt Maestro #7 (R8.6): micro-interacciones e ilustraciones

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (secciones 3, 9 y 10) y docs/UX_SPEC.md (sección "Estados y microcopy").

TAREA: Agrega respuesta al toque, entrada suave de avisos y estados vacíos con ilustración.

PARTE 1: PressableScale
1. Crea src/components/ui/PressableScale.tsx: envuelve Pressable y anima con Reanimated la escala a 0.97 al presionar (100 ms) y de vuelta a 1 al soltar (150 ms). Con "reducir movimiento" activo no anima la escala (cambia el tono de fondo como estado presionado, sin escala). Conserva todas las props de Pressable, accesibilidad incluida.
2. Úsalo en: ListRow presionables, Card con onPress, tarjetas de categoría del registro rápido, acciones rápidas de Inicio, tarjetas de cuenta de Inicio y filas de Planificar y Más. No lo uses en botones (ya tienen estado presionado) ni en elementos de menos de 44 px.

PARTE 2: Snackbar
1. Entrada: desplazamiento vertical de 16 px a 0 con fundido de 0 a 1 en 220 ms; salida en 150 ms. Sin animación con "reducir movimiento".

PARTE 3: ilustraciones vectoriales
1. Crea src/components/ui/EmptyIllustration.tsx con la prop `variant`: 'list' | 'chart' | 'target' | 'wallet'. Todo con react-native-svg, viewBox "0 0 120 96", ancho 120 y alto 96, colores solo de tokens del tema (y de la paleta de fichas para los acentos). Base común: círculo cx=60, cy=48, r=44 con fill brandSoft. Composiciones:
   - list: rectángulo x=30, y=22, ancho 60, alto 52, rx=10, fill surface, stroke border de 1; tres filas para i = 0, 1, 2: cuadrado de ficha x=38, y=30+14*i, ancho 10, alto 10, rx=3 (relleno con el color de ícono de las fichas orange, blue y green respectivamente); línea larga x=54, y=32+14*i, ancho 26, alto 3, rx=1.5, fill textMuted; línea corta x=54, y=37.5+14*i, ancho 16, alto 2.5, rx=1.25, fill border.
   - chart: el mismo rectángulo de tarjeta; tres barras: x=40, y=50, ancho 8, alto 16, rx=2 (color de ícono blue); x=56, y=40, ancho 8, alto 26, rx=2 (brand); x=72, y=30, ancho 8, alto 36, rx=2 (extraFill); línea base x1=36, x2=84, y1=68, y2=68, stroke border de 1.
   - target: círculo cx=60, cy=48, r=26, fill surface, stroke border 1; círculo r=17, fill none, stroke brand 3; círculo r=9, fill none, stroke brand 3; círculo r=3, fill brand.
   - wallet: rectángulo x=28, y=30, ancho 64, alto 42, rx=10, fill surface, stroke border 1; franja x=28, y=38, ancho 64, alto 9, fill brandSoft; círculo de cierre cx=80, cy=60, r=5, fill brand.
   Es decorativa: accessibilityElementsHidden y importantForAccessibility "no-hide-descendants".
2. EmptyState: nueva prop opcional `illustration` (una de las variantes). Si se pasa, reemplaza a la ficha de ícono grande y se muestra centrada sobre el título con 16 px de separación. Usa: 'list' en Movimientos vacío y en listas de recurrentes; 'chart' en Análisis vacío; 'target' en Presupuestos vacío; 'wallet' en Cuentas vacío.
3. Tests de render de EmptyIllustration (cada variante contiene los elementos esperados, por testID) y de PressableScale (escala y modo reducir movimiento).

CRITERIOS DE ACEPTACIÓN:
- Las filas y tarjetas tocables reaccionan con la escala, los avisos entran suavemente y los estados vacíos muestran su ilustración en ambos temas. Calidad en verde.
```

📸 Captura de dos estados vacíos (por ejemplo Movimientos y Análisis) en oscuro y claro.

### Prompt Maestro #8 (R8.7): auditoría final

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md.

TAREA: Auditoría de consistencia y calidad posterior a R8. No agregues funcionalidades.

REQUISITOS:
1. Recorre TODAS las pantallas y verifica contra los documentos: uso de tokens (cero hex, rgb o valores sueltos fuera de src/theme), un solo botón primary por vista, ámbar solo para "extra", Ionicons solo vía AppIcon, tamaños mínimos de texto, áreas táctiles de 44 y accessibilityLabel en todo lo tocable. Corrige lo que incumpla y lista lo corregido.
2. Ejecuta de nuevo los tests de contraste y confirma que pasan en ambos modos. Verifica en código que las pantallas con bloque usan la misma estructura (BlockHeader con contenido interno, Sheet con solape) y no hay contenedores duplicados.
3. Verifica "reducir movimiento": todas las animaciones nuevas (PressableScale, Snackbar, barras, línea del flujo, pulso de categoría sugerida, conteo de cifras) se desactivan. Lista cualquier animación que no respete la preferencia y corrígela.
4. Verifica rendimiento básico: listas con keys estables y memoización donde corresponda, gráficos sin recrear arreglos grandes en cada render, y gestos del gráfico del flujo del mes sin trabajo pesado en el hilo de JS en cada movimiento.
5. Verifica que no queden textos con caracteres rotos en el código de la app y lista las pantallas que aún usan el estilo anterior (si quedan), citando archivo.
6. Elimina código muerto, archivos sin uso, alias deprecated sin uso (lista los que sigan en uso y dónde) y la ruta de desarrollo app/dev-preview.tsx si todavía existe.
7. Actualiza docs/APP_GUIDE.md y CLAUDE.md con el estado actual (R8 aplicado) y crea o actualiza docs/QA_VISUAL.md con casillas por pantalla (oscuro y claro, letra grande, reducir movimiento) incluyendo: bloque a todo ancho, textos dentro del bloque, hoja con esquinas redondeadas, acciones rápidas, tarjeta de 7 días, sugerida y frecuentes, barras interactivas, flujo del mes arrastrable, ilustraciones, escala al tocar.
8. NO modifiques docs/DESIGN_SYSTEM.md ni docs/UX_SPEC.md: lista las diferencias entre ellos y lo implementado para que yo decida.

CRITERIOS DE ACEPTACIÓN:
- Calidad en verde, lista de diferencias entregada y QA_VISUAL.md actualizada.
```

✋ Pasa `docs/QA_VISUAL.md` en tu celular. 📸 Mándame capturas finales (Inicio, Registro rápido, Movimientos, Planificar, Análisis y Más) en oscuro y claro.

---

## 8. Prompt de rescate (si algo falla)

```text
Algo falló. NO cambies código todavía.
1. Lee el error y explícame en lenguaje simple qué pasó y por qué.
2. Propón la corrección mínima y dime qué archivos tocarías.
3. Espera mi "adelante" para aplicarla.
```

## 9. Datos de prueba (para gráficos y análisis)

Los gráficos de los prompts #3, #5 y #6 necesitan datos de varios meses para evaluarse. Si no los tienes, pega esto en una sesión nueva del agente. Es solo para desarrollo, no se versiona y no toca la base de datos de producción:

```text
Necesito datos de prueba SOLO PARA DESARROLLO. No ejecutes nada contra la base de datos todavía.
1. Crea el archivo supabase/seed-dev.sql (agrégalo a .gitignore) que, para el usuario de prueba cuyo correo te daré, inserte unos 120 movimientos realistas de los últimos 6 meses: ingresos base quincenales, algunos ingresos extra, gastos diarios en las categorías por defecto (comida, mercado, transporte, servicios, vivienda), con montos en pesos colombianos entre 3.000 y 800.000 y notas repetidas ("almuerzo", "bus", "arriendo") para probar los frecuentes y las sugerencias.
2. Deja el correo del usuario como un marcador claro al inicio del archivo (por ejemplo, :user_email) para que yo lo reemplace al pegarlo en el SQL Editor de Supabase.
3. Explícame cómo borrar esos datos después (una sola sentencia que elimine solo los movimientos con una marca identificable en la nota o en una columna existente).
Detente al terminar.
```

Después de pegar ese SQL tú mismo en Supabase, la app mostrará barras, flujo y donut con datos reales de 6 meses.
