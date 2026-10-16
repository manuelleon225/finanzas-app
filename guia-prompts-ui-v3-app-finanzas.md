# Guía de prompts v3: rediseño visual "bloque de color"

Implementa la dirección C que aprobaste (bloque azul + hoja + fichas de color) sobre la app que ya tienes. Solo toca la capa visual: **no cambia la base de datos ni la lógica de negocio**.

Contiene **15 prompts (R7.0 a R7.14)** y dos anexos con la especificación exacta (Anexo A: sistema de diseño v3; Anexo B: especificación de pantallas v3).

---

## 1. Por qué esta vez debería quedar como los mockups

El agente no ve pantallas. Por eso esta guía no le pide "que se vea bien": le da valores exactos (colores, tamaños, estructura, textos) y le pone pruebas que sí puede verificar (contraste, tamaños de texto, orden de elementos). Tú eres los ojos: después de cada prompt visual comparas con los mockups y, en los puntos 📸, me mandas capturas.

Marcas: ✋ paso tuyo · 🔍 revisión obligatoria · 📸 mándame capturas.

---

## 2. Antes de empezar (checklist)

- ✋ Las migraciones 006 y 007 deben estar aplicadas (ya lo hiciste).
- ✋ Recomendado: haber corrido el prompt de corrección de "EducaciÃ³n" (migración 008) y pegado ese SQL en Supabase. No bloquea el rediseño.
- ✋ Guarda **este archivo** en la misma carpeta (fuera del repositorio) donde guardaste las guías anteriores. El prompt R7.0 le dice al agente que lo busque ahí.
- El botón azul con engranaje que flota en tus capturas es de Expo Go, no de tu app. No lo arreglamos; desaparece en la app publicada.

---

## 3. Reglas de uso

- Un prompt a la vez, con el **PIE COMÚN v3** (sección 4) pegado al final.
- Un prompt = un commit. Trabajas en la rama `feat/ui-v3` (la crea R7.0 a partir de `feat/redesign`).
- Si el agente falla dos veces en lo mismo: pídele primero el diagnóstico sin tocar código (prompt de rescate de la sección 6) y, si no se resuelve, me pasas el error y el número del prompt.
- Con el trabajo ya en git, `git restore .` solo vuelve al último commit; aun así, prefiere pedirle al agente que revierta.
- Si el diseño no cubre algo, el agente **pregunta**; no inventa.

---

## 4. PIE COMÚN v3 (se agrega al final de CADA prompt)

```text
AL TERMINAR:
1. Ejecuta `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd test`. Corrige todo error antes de responder.
2. No agregues dependencias que no estén listadas en este prompt sin preguntarme antes. Las del ecosistema Expo se instalan con `npx.cmd expo install`.
3. No modifiques archivos fuera del alcance de esta tarea ni la lógica de negocio, hooks de datos, api ni migraciones. Esta guía solo cambia la capa visual.
4. No uses colores hexadecimales, rgb()/rgba() ni valores de diseño "mágicos" fuera de src/theme: todo sale de los tokens de docs/DESIGN_SYSTEM.md. Ionicons solo a través de AppIcon.
5. No puedes ver la pantalla. Nunca afirmes que algo "se ve bien". Verifica con tipos, tests y lint, y termina con una lista "Para revisar visualmente" con lo que debo mirar yo en el dispositivo.
6. Si docs/DESIGN_SYSTEM.md o docs/UX_SPEC.md no cubren algo que necesitas, pregúntame. No inventes.
7. Actualiza docs/PROGRESS.md.
8. Responde solo con: (a) resumen breve, (b) archivos tocados, (c) pasos manuales para mí, (d) lista "Para revisar visualmente", (e) mensaje de commit sugerido (Conventional Commits).
9. Detente. No empieces la siguiente tarea.
```

---

## 5. Mapa de prompts

| Prompt | Qué hace | 📸 |
|---|---|---|
| R7.0 | Rama, documentos del diseño v3, reglas | |
| R7.1 | Tokens v3 (colores, tipografía, radios, paleta de fichas) y tests de contraste | |
| R7.2 | Barras del sistema (adiós franjas negra y blanca) | 📸 |
| R7.3 | Íconos rellenos y fichas de color (IconTile) | 📸 |
| R7.4 | Piezas base: bloque, hoja, interruptor, avatar, variantes | 📸 |
| R7.5 | Barra de pestañas v3 | 📸 |
| R7.6 | Inicio | 📸 |
| R7.7 | Registro rápido | 📸 |
| R7.8 | Movimientos | 📸 |
| R7.9 | Planificar y Presupuestos | 📸 |
| R7.10 | Más | 📸 |
| R7.11 | Cuentas y Categorías | 📸 |
| R7.12 | Login, registro y estados vacíos y de error | 📸 |
| R7.13 | Análisis | 📸 |
| R7.14 | Auditoría final y limpieza | 📸 |

Orden obligatorio: R7.0 a R7.5 antes de cualquier pantalla.

---

# FASE R7: implementación

### R7.0: Rama y documentos del diseño v3

```text
ROL: Eres un arquitecto de software senior.

CONTEXTO: Vamos a implementar un rediseño visual (diseño v3, "bloque de color") sobre la app de finanzas. Esta tarea NO escribe código de la app: prepara la rama y los documentos.

TAREA:
1. Verifica que la rama actual es feat/redesign y que el árbol de trabajo está limpio (git status). Si no es así, detente y avísame. Si todo está bien, crea la rama feat/ui-v3 desde ahí.
2. Guarda copias de los documentos actuales: docs/archive/DESIGN_SYSTEM_v2.md y docs/archive/UX_SPEC_v2.md (copia exacta, crea la carpeta si no existe).
3. Copia los Anexos de forma MECÁNICA, sin transcribir ni reescribir. Con un script de PowerShell, extrae el contenido que hay dentro de cada bloque de código de cuatro acentos graves con la etiqueta markdown del archivo guia-prompts-ui-v3-app-finanzas.md (búscalo en la carpeta hermana del repositorio donde guardamos las guías; si no lo encuentras, pregúntame la ruta): el que sigue al título "ANEXO A" va a docs/DESIGN_SYSTEM.md y el que sigue a "ANEXO B" va a docs/UX_SPEC.md (reemplazando los actuales). Verifica que coinciden con el original (número de líneas, primera y última línea) y muéstrame los conteos.
4. Actualiza AGENTS.md: reemplaza la regla "Ionicons solo outline" por "Ionicons solo a través de AppIcon; se permite la variante rellena en fichas de categoría (IconTile) y en la pestaña activa". Mantén: prohibidos colores hexadecimales fuera de src/theme, un solo botón primary por vista, ámbar solo para "extra". Agrega: "Si el diseño no cubre algo, pregunta antes de inventar" y "Esta etapa solo cambia la capa visual: no tocar lógica de negocio, hooks de datos, api ni migraciones".
5. Actualiza docs/DECISIONS.md con estas decisiones: (a) dirección visual v3 "bloque de color" (bloque azul de marca a todo ancho con la hoja encima); (b) íconos con Ionicons rellenos dentro de fichas de color, sin nueva librería de íconos (AppIcon permite cambiarla después en un solo archivo); (c) oscuro por defecto con claro soportado; (d) degradado sutil del bloque con react-native-svg, sin dependencias nuevas; (e) formato compacto de montos grandes en resúmenes.
6. Registra la tarea en docs/PROGRESS.md.
```

🔍 Revisa que los conteos de líneas coinciden.

### R7.1: Tokens v3

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (completo, secciones 3 a 6) y src/theme actual.

TAREA: Actualiza los tokens del tema al diseño v3 SIN romper la API actual de useTheme() ni las pantallas existentes.

REQUISITOS:
1. Colores: reemplaza los valores y agrega los tokens nuevos EXACTAMENTE según la tabla de la sección 3 del Anexo (oscuro y claro). Los nombres antiguos que ya no existan se conservan como alias deprecated apuntando al token nuevo más cercano, con un comentario "deprecated: migrar a X". No renombres ni elimines tokens usados.
2. Tipografía: ajusta displayLg a 44/52 y title a 24/30 según la sección 4. Las demás variantes no cambian.
3. Radios y espaciado: agrega xl 20 y sheet 28 a los radios, y el token de margen lateral de pantalla (20) según la sección 5. No cambies los existentes.
4. Paleta de fichas: crea src/theme/tilePalette.ts con las 12 entradas de la sección 3.2 del Anexo (orange, coral, blue, violet, yellow, teal, sky, pink, purple, indigo, green, gray), cada una con { darkBg, darkIcon, lightBg, lightIcon }, y la función `getTileColors(key, mode)`.
5. Función pura `resolveTileKey(input)` en el mismo archivo: dado { name, kind, color } de una categoría (o { type } de una cuenta), devuelve la clave de ficha. Inspecciona primero src/theme/categoryPalette.ts y los valores de `color` que guardan las categorías actuales: mapea cada color existente a la clave de ficha más cercana en tono, SIN cambiar los datos guardados. Para las categorías por defecto aplica el mapeo de la sección 3.3 del Anexo como respaldo por nombre. Si nada coincide, devuelve gray. Cuentas: cash=blue, bank=green, savings=violet, credit_card=pink.
6. Tests: actualiza src/theme/__tests__/contrast.test.ts para cubrir, en ambos modos y con mínimo 4.5:1: textPrimary, textSecondary sobre bg, surface y surfaceRaised; textMuted sobre bg y surface; onBrand y onBrandMuted sobre brand y sobre brandDeep; brandText sobre bg y sobre surface; brandText sobre brandSoft; income, expense y extra sobre surface; danger sobre surface. Y mínimo 3:1 para cada par ícono/fondo de la paleta de fichas. Si algún par falla, ajusta mínimamente solo la luminosidad del color, indica los valores finales en tu respuesta y no cambies nada más del Anexo.
7. Tests de resolveTileKey (categorías por defecto, color desconocido, cuentas).

CRITERIOS DE ACEPTACIÓN:
- La app compila y arranca igual que antes (aún sin cambios visibles grandes); calidad en verde; tests de contraste pasando.
```

### R7.2: Barras del sistema

```text
Lee AGENTS.md y docs/DESIGN_SYSTEM.md (sección 7, "Barras del sistema").

PROBLEMA: En Android la app deja una franja negra arriba (barra de estado) y una franja blanca abajo (barra de navegación), que desentonan con el fondo oscuro de la app.

TAREA: Haz que la app se dibuje de borde a borde y que las barras del sistema respeten el tema. Consulta la documentación vigente de Expo para el SDK instalado y elige la solución con menos dependencias; si necesitas una dependencia nueva, pregúntame antes.

REQUISITOS:
1. Función pura `getStatusBarStyle(mode, variant)` en src/lib/systemBars.ts con tests: variant 'block' (pantallas con bloque azul) siempre devuelve íconos claros; variant 'plain' devuelve claros en modo oscuro y oscuros en modo claro.
2. Componente o hook `SystemBars` (variant) que aplique el estilo de la barra de estado y el color de fondo de la barra de navegación del sistema (token bg del tema), y que reaccione al cambio de tema (incluido el modo "Sistema").
3. Aplícalo en el layout raíz con variant 'plain' por ahora; las pantallas con bloque lo cambiarán en sus prompts.
4. Asegura que el contenido respeta las zonas seguras (notch, barra de gestos) sin dejar franjas.
5. Documenta en docs/ARCHITECTURE.md qué solución elegiste y sus límites (por ejemplo, qué no funciona en Expo Go).

CRITERIOS DE ACEPTACIÓN:
- Con el tema oscuro no quedan franjas negra ni blanca desentonadas. Calidad en verde.
```

📸 Captura de cualquier pantalla (arriba y abajo) en modo oscuro y en claro. Si en Expo Go aún se ve la franja, dime; puede requerir un development build.

### R7.3: Íconos rellenos y fichas de color

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (secciones 3.2, 3.3 y 8) y src/components/ui/AppIcon.tsx.

TAREA: Agrega la variante rellena a AppIcon y crea el componente IconTile.

REQUISITOS:
1. AppIcon: nueva prop `filled` (boolean, por defecto false). Con filled=true, el nombre guardado (que normalmente termina en "-outline") se resuelve a su versión rellena (sin el sufijo) si existe en el mapa de glifos de Ionicons; si no existe, usa la versión de contorno. Sigue siendo el único archivo que importa Ionicons. Función pura `resolveIconName(name, filled)` con tests (nombre con sufijo, sin sufijo, inexistente).
2. IconTile en src/components/ui/IconTile.tsx: props { icon, tileKey, size: 32 | 40 | 48 (por defecto 40) }. Ficha cuadrada con esquinas redondeadas (radio 10, 12 y 14 según tamaño), fondo y color de ícono de getTileColors(tileKey, modo actual), ícono relleno de 55% del lado de la ficha. Accesibilidad: decorativo (sin etiqueta) salvo que se pase `accessibilityLabel`.
3. Hook o helper `useCategoryTile(category)` que combine resolveTileKey con el ícono guardado de la categoría y devuelva { icon, tileKey }. Y lo mismo para cuentas (ícono por tipo: cash=wallet, bank=business, savings=Piggy si existe en Ionicons o cash como respaldo, credit_card=card).
4. Crea una pantalla de desarrollo app/dev-preview.tsx (solo accesible si __DEV__ es true y sin enlace desde la app; se eliminará en R7.14) que muestre: una cuadrícula con las 12 fichas en los 3 tamaños con un ícono representativo cada una, en el tema actual, y un interruptor para alternar oscuro y claro.
5. Tests de render de IconTile (tamaños, colores según modo).

CRITERIOS DE ACEPTACIÓN:
- La pantalla de desarrollo muestra las fichas coloreadas en ambos temas. Calidad en verde.
```

📸 Abre `dev-preview` (el agente te dirá cómo llegar) y mándame la captura de las fichas en oscuro y claro.

### R7.4: Piezas base

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (secciones 1, 5 y 6) y src/components/ui actual.

TAREA: Crea y ajusta las piezas base del diseño v3. Mantén la compatibilidad hacia atrás: las props actuales de los componentes existentes NO cambian; solo se agregan opcionales.

NUEVOS COMPONENTES (src/components/ui):
1. BlockHeader: bloque de marca a todo ancho. Fondo con degradado vertical sutil de brand a brandDeep dibujado con react-native-svg (sin dependencias nuevas) y dos círculos decorativos translúcidos (token blockDecor) en la esquina superior derecha. Se extiende bajo la barra de estado: padding superior = zona segura + 12; padding inferior 44 (para que la hoja lo solape). Todo el texto sobre él usa onBrand / onBrandMuted. Expone `children`.
2. Sheet: contenedor de contenido con fondo bg, radios superiores sheet (28) y margen superior negativo de 28 para solapar el bloque; padding horizontal = margen de pantalla.
3. ScreenScaffold: variante 'block' (BlockHeader con slot `header` + Sheet con el contenido, con scroll) o 'plain' (encabezado normal sobre bg). Incluye SystemBars con la variante correspondiente (R7.2) y respeta la zona segura inferior y la barra de pestañas.
4. Avatar: círculo con la inicial; tamaños 32/36/44; fondo blockTrack cuando está sobre el bloque y brand en otros casos; texto onBrand.
5. Switch: interruptor propio (riel 44x26, perilla 20 blanca): encendido riel brand, apagado riel surfaceHigh; animación de 150 ms que respeta "reducir movimiento"; accesibilidad role switch con estado.

AJUSTES A EXISTENTES (props opcionales nuevas):
6. Card: radio xl (20), padding 16; en modo claro borde de 1 px (token border), en oscuro sin borde.
7. SegmentedControl: prop `tone` 'default' | 'onBlock'. onBlock: contenedor blockSoft, segmento activo blanco con texto brandText sobre fondo onBrand… (activo: fondo onBrand y texto brand), inactivo texto onBrandMuted.
8. MonthSelector: prop `tone` 'default' | 'onBlock' (texto y chevrones onBrand).
9. Button: variante nueva 'onBrand' (fondo onBrand, texto brand) para usar sobre el bloque. Mantén las otras. Alto 52, radio 16.
10. ListRow: nueva prop `leading` (nodo) para usar IconTile; si se pasa, reemplaza el círculo de ícono actual. Alto mínimo 64.
11. ProgressBar: prop `tone` 'default' | 'onBlock' (onBlock: riel blockTrack y relleno onBrand) y `status` 'ok' | 'near' | 'over' (ok = brand, near = expense a 0.65 de opacidad, over = expense). StackedBar: base = brand, extra = extraFill.
12. Agrega todo a app/dev-preview.tsx: un BlockHeader con hoja y contenido de ejemplo, Avatar, Switch, SegmentedControl onBlock, ProgressBar en sus estados.
13. Tests de render de cada componente nuevo y de las nuevas props.

CRITERIOS DE ACEPTACIÓN:
- Las pantallas existentes siguen funcionando; la pantalla de desarrollo muestra el bloque con hoja en ambos temas. Calidad en verde.
```

📸 Captura de `dev-preview` con el bloque y la hoja en oscuro y claro.

### R7.5: Barra de pestañas v3

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (componente "Barra de pestañas") y docs/UX_SPEC.md (sección "Navegación").

TAREA: Rediseña la barra de pestañas (src/components/ui/TabBar.tsx) sin cambiar las rutas ni el comportamiento (el botón central sigue abriendo el modal de registro).

REQUISITOS:
1. Cinco elementos: Inicio, Movimientos, botón central (+), Planificar, Más. Etiquetas completas (micro, 11 px), no abreviadas.
2. Pestaña activa: ícono relleno y color brandText; inactiva: ícono de contorno y color textSecondary. Íconos: home, list, pie-chart, ellipsis-horizontal (rellenos o de contorno según estado).
3. Botón central: círculo de 56 px con fondo brand, ícono add blanco (onBrand), desplazado 14 px hacia arriba, con un anillo de 4 px del color bg alrededor (efecto de recorte, sin sombra). Haptic tap al pulsarlo.
4. Barra: fondo bg, línea superior de 1 px (border), alto 64 más zona segura inferior. Áreas táctiles de 44 mínimo y accessibilityLabel/role/estado seleccionado en cada pestaña.
5. Debe verse bien sobre las pantallas con bloque y sin él.
6. Tests de render (pestaña activa, botón central, accesibilidad).

CRITERIOS DE ACEPTACIÓN:
- La navegación funciona igual que antes. Calidad en verde.
```

### R7.6: Inicio

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Inicio", completa).

TAREA: Rediseña la pestaña Inicio EXACTAMENTE según docs/UX_SPEC.md, usando ScreenScaffold variante 'block'. NO cambies la lógica de datos: usa los hooks actuales (useAvailableToday, useMonthSummary, cuentas, últimos movimientos, pendientes por confirmar, píldora de conexión).

REQUISITOS:
1. Bloque: saludo, MonthSelector tone 'onBlock', Avatar a la derecha; etiqueta "Disponible hoy" con ícono de ayuda (abre el BottomSheet existente con el desglose); monto con AnimatedNumber (variante display, color onBrand); ProgressBar tone 'onBlock'; pie con "Gastaste X de Y" y "N días a tu pago" (o "N días para fin de mes") en onBrandMuted; fila "Colchón extra" si aplica, como píldora (fondo blockSoft, texto onBrand).
2. Estado sin margen: monto en onBrand y texto "Sin margen hoy. Revisa tus pagos próximos." en onBrandMuted (nunca rojo sobre el bloque).
3. Primer uso (sin movimientos): el bloque se mantiene con "$ 0" y el texto "Registra tu ingreso base para calcularlo"; la hoja muestra la tarjeta "Empieza en 3 pasos" con tres filas (IconTile 32): "Agrega tu ingreso base" (abre el registro en modo ingreso), "Registra tu primer gasto" (abre el registro) y "Ponle tope a un gasto" (abre presupuestos). Cada paso muestra un check cuando se cumple (existe algún ingreso; existe algún gasto; existe algún presupuesto); la tarjeta se oculta cuando los 3 están cumplidos. Función pura `getOnboardingSteps(...)` con tests.
4. Hoja con datos, en este orden: banner de pendientes (si hay); píldora de conexión (si aplica); tarjeta "Este mes" (Ingresos y Gastos, cada uno con monto y StackedBar base/extra; pie "Los extras son el X% de tus ingresos"); sección "Cuentas" con total a la derecha y fila horizontal de tarjetas (IconTile por tipo, nombre y saldo); sección "Recientes" con hasta 5 ListRow (leading = IconTile de la categoría) y enlace "Ver todos".
5. Estados de carga (Skeleton con la forma de cada bloque, incluido el bloque azul), error con reintento y pull-to-refresh.
6. Todo con tokens y componentes del sistema; cero valores sueltos. Textos en src/i18n/es.ts. Accesibilidad: el monto del bloque tiene accessibilityLabel completo en palabras.
7. Tests de las funciones puras nuevas y de render de las secciones.

CRITERIOS DE ACEPTACIÓN:
- La estructura y el orden coinciden con la sección "Inicio" del Anexo B, en ambos temas y en primer uso.
```

📸 Captura de Inicio con datos y de Inicio en cuenta nueva, en oscuro y claro. Compárala con los mockups.

### R7.7: Registro rápido

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Registro rápido", completa).

TAREA: Rediseña app/transaction-form.tsx con el bloque de color. Mantén intactas la validación (zod), los hooks y la lógica de guardado, el orden por uso de categorías, el guardado al tocar categoría, el modo edición, las transferencias y el modo sin conexión.

REQUISITOS:
1. Bloque (ScreenScaffold 'block'): fila con "Cancelar" (texto onBrandMuted) y título "Nuevo movimiento" (onBrand); SegmentedControl tone 'onBlock' (Gasto, Ingreso, Transferencia); el monto con variante displayLg (44/52, blanco, centrado, cifras tabulares; vacío "$ 0" en onBrandMuted); debajo una línea centrada "{Cuenta} · {Fecha}" donde cada parte es tocable (abre su BottomSheet) con un chevron pequeño.
2. Hoja: fila de chips centrada (Base, Extra, Nota; Base seleccionado por defecto con brandSoft/brandText, Extra seleccionado con extraSoft/extra); cuadrícula de categorías de 3 columnas con tarjetas (IconTile 40 + nombre; la seleccionada con borde de 1.5 px en brand; en alta rápida tocar guarda; en edición solo selecciona) y mosaico "Más"; teclado numérico al pie con teclas de 52 px de alto, radio 16, fondo surface.
3. Transferencia: chips "Desde" y "Hacia" en la hoja y botón primary "Guardar transferencia" en lugar de la cuadrícula; la línea del bloque muestra "Desde {A} → {B}".
4. Edición: mismo diseño, botón primary "Guardar cambios" y botón destructive "Eliminar" con confirmación.
5. Guardrail: agrega un test que verifique que el texto del monto usa la variante displayLg con fontSize 44, y otro que verifique que el teclado tiene teclas de alto 52.
6. El monto no debe cortarse con 12 dígitos: ajusta el tamaño con adjustsFontSizeToFit sin bajar de 28.
7. Haptics y animación de sacudida existentes se conservan. Textos en src/i18n/es.ts.
8. En modo claro y oscuro deben cumplirse los contrastes de los tokens.

CRITERIOS DE ACEPTACIÓN:
- Registrar un gasto base sigue tomando 3 toques o menos. Calidad en verde.
```

📸 Captura del modal en gasto, ingreso, transferencia y edición, con un monto de 25.000 escrito.

### R7.8: Movimientos

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Movimientos", completa).

TAREA: Rediseña la pestaña Movimientos, conservando paginación, filtros, búsqueda, deslizar para eliminar con deshacer, sección "Por confirmar" y filas sin conexión.

REQUISITOS:
1. Función pura `formatCompactCOP(amount)` en src/lib/money.ts: menos de 1.000.000 devuelve el formato completo ("$ 850.000"); desde 1.000.000 devuelve millones con una decimal con coma y sin ".0" ("$ 3,2 M", "$ 3 M"). Maneja negativos con el signo delante. Tests exhaustivos (0, 999.999, 1.000.000, 3.250.000, 12.000.000, negativos).
2. Encabezado plain: título "Movimientos" a la izquierda e IconButtons de búsqueda y filtros (con badge si hay filtros) a la derecha; debajo, MonthSelector centrado.
3. Resumen: tarjeta de fondo brand con texto onBrand, tres columnas (Ingresos, Gastos, Balance) usando formatCompactCOP; el balance con signo.
4. Lista por día con encabezados pegajosos (etiqueta a la izquierda; total del día a la derecha en caption). Fila: ListRow con leading IconTile de la categoría (ícono relleno), título (nota o nombre de categoría) con Tag "Extra" si aplica, subtítulo "Categoría · Cuenta", monto a la derecha con signo y color (income/expense), marcador de recurrente si aplica. Transferencias: IconTile gray con ícono de intercambio, título "Origen → Destino" y monto neutro.
5. Gestos, búsqueda, filtros (BottomSheet) y estados vacíos, de carga y de error se conservan, con los componentes del diseño v3 (Skeleton con forma de fila).
6. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- La lista sigue fluida con 300 movimientos y los filtros combinados no cambian de comportamiento. Calidad en verde.
```

📸 Captura de Movimientos con varios movimientos (incluye uno Extra y una transferencia), y con el menú de filtros abierto.

### R7.9: Planificar y Presupuestos

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (secciones "Planificar" y "Presupuestos").

TAREA: Rediseña la pestaña Planificar y la pantalla de Presupuestos. Conserva la lógica (calculateBudgetProgress, hooks, formularios en BottomSheet).

REQUISITOS:
1. Planificar (encabezado plain "Planificar"): tarjeta de fondo brand con texto onBrand: "Presupuestos de {mes}" (caption onBrandMuted), monto "$ gastado de $ presupuestado" (el segundo en onBrandMuted) y ProgressBar tone 'onBlock'. Sin presupuestos: la tarjeta muestra "Ponle un tope a lo que más gastas" y un botón 'onBrand' "Crear presupuesto".
2. Debajo, tarjeta con los presupuestos principales (hasta 3, los de mayor uso): fila con IconTile 32, nombre, texto a la derecha ("te quedan $X" o "te pasaste $X", este último en expense) y ProgressBar con status ok/near/over. Enlace "Ver todos" si hay más.
3. Filas de acceso con IconTile 40: "Pagos recurrentes" (subtítulo: "Próximo: {nombre} · {fecha}" si hay reglas activas; si no, "Automatiza lo que se repite cada mes.") y "Análisis" (subtítulo: la primera frase de buildInsights si existe; si no, "Tus gastos por categoría y por mes."). Función pura que construya esos subtítulos, con tests.
4. Pantalla de Presupuestos: MonthSelector, lista con ListRow (leading IconTile), ProgressBar por status y los textos de la sección "Presupuestos" del Anexo B; agregar con IconButton "+" en el encabezado y, vacío, EmptyState con botón.
5. Estados de carga, vacío y error. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Los colores de las barras cambian en 85% y 100% según la regla del diseño. Calidad en verde.
```

📸 Captura de Planificar con y sin presupuestos y de la pantalla de Presupuestos.

### R7.10: Más

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Más", completa).

TAREA: Rediseña la pestaña Más. Conserva TODA la funcionalidad actual (tema, incluir extras, biometría, recordatorios, exportar, cerrar sesión, eliminar cuenta, versión).

REQUISITOS:
1. Encabezado plain "Más". Tarjeta de perfil: Avatar 44 con la inicial, nombre (display_name) y caption "Cuenta personal". Sin chevron ni acción (no es tocable).
2. Grupos con título en caption y una tarjeta por grupo, cada fila con IconTile 32 de color distinto según el Anexo B:
   - Organización: Cuentas, Categorías.
   - Preferencias: "Apariencia" (valor actual a la derecha y chevron; abre un BottomSheet con Sistema, Oscuro y Claro), "Incluir extras en Disponible hoy" (Switch, con su texto de ayuda en caption), "Bloquear con biometría" (Switch), "Recordatorios de pagos" (Switch; si está activo, fila adicional para la anticipación).
   - Datos: "Exportar movimientos".
   - Cuenta: "Cerrar sesión" y "Eliminar cuenta" (texto y ficha en danger).
3. Los Switch usan el componente nuevo; filas de navegación con chevron.
4. Pie con "Versión {x}".
5. Estados y textos en src/i18n/es.ts. Tests de render de la tarjeta de perfil y del selector de apariencia.

CRITERIOS DE ACEPTACIÓN:
- Todo lo que funcionaba sigue funcionando. Calidad en verde.
```

📸 Captura de Más completa (haz scroll y manda dos capturas) y del selector de apariencia.

### R7.11: Cuentas y Categorías

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (secciones "Cuentas" y "Categorías").

TAREA: Rediseña las pantallas de Cuentas y Categorías y sus formularios, sin cambiar la lógica (archivar con reglas, restaurar archivadas, validaciones, subcategorías de un nivel).

REQUISITOS:
1. Encabezados con botón atrás (IconButton de 44) y título; acción de agregar como IconButton "+" a la derecha (no como botón primary de ancho completo). Con lista vacía, EmptyState con botón.
2. Cuentas: tarjeta de saldo total con fondo brand y texto onBrand; lista de cuentas con IconTile por tipo, nombre, subtítulo con el tipo en español ("Efectivo", "Banco", "Ahorros", "Tarjeta de crédito"; si el nombre coincide con el tipo, muestra en su lugar "Cuenta para gastar" o "No cuenta en Disponible hoy" según corresponda) y saldo a la derecha. Tocar abre la edición; archivar con deslizar (SwipeableRow) con confirmación y respetando la regla de no archivar la última cuenta activa. Quita los enlaces de texto "Editar" y "Archivar".
3. Categorías: SegmentedControl Gastos | Ingresos; lista con IconTile de la categoría, nombre y, si tiene subcategorías, "N subcategorías" en caption; las subcategorías anidadas con sangría y IconTile 32. Cada fila tiene un IconButton "⋯" que abre un BottomSheet con "Editar", "Agregar subcategoría" (solo categorías principales) y "Archivar". Enlace "Ver archivadas" al final de la lista. Quita los enlaces de texto de cada fila.
4. Formularios (cuenta, categoría): encabezado con atrás y título, Inputs v3 y un solo botón primary al pie ("Guardar"). El selector de ícono y color de categoría usa IconTile para la vista previa y una cuadrícula de las fichas de la paleta.
5. Estados de carga, vacío y error. Textos en src/i18n/es.ts.
6. Corrige de paso, sin tocar datos, cualquier texto de interfaz con caracteres rotos que encuentres en el código (no en la base de datos).

CRITERIOS DE ACEPTACIÓN:
- No quedan enlaces de texto sueltos en las filas; todas las acciones previas siguen disponibles. Calidad en verde.
```

📸 Captura de Cuentas, Categorías (con el menú "⋯" abierto) y el formulario de categoría.

### R7.12: Autenticación y estados vacíos y de error

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (secciones "Autenticación" y "Estados y microcopy").

TAREA: Rediseña login, registro, recuperar contraseña, nueva contraseña, confirmar correo y verificar correo con el bloque de color, y unifica los estados vacíos y de error de toda la app. Conserva la lógica (RHF + zod, errores traducidos, deep links, enfriamiento de reenvío).

REQUISITOS:
1. Pantallas de auth con ScreenScaffold 'block': en el bloque, wordmark tipográfico "Finanzas" (onBrand, sin imágenes), título y una línea de apoyo; en la hoja, el formulario con Inputs v3 (alto 52, radio 16), mostrar u ocultar contraseña con IconButton, un solo botón primary de ancho completo y los enlaces secundarios como ghost. El teclado no tapa el formulario y el botón primary siempre queda visible.
2. EmptyState v3: ficha grande de 64 px (IconTile tamaño 48 escalado o equivalente) con ícono contextual (no el ícono de destellos genérico), título que nombra el espacio, una línea de apoyo y botón con verbo. ErrorState: ícono de alerta en ficha coral suave, frase de qué pasó y qué hacer, botón "Reintentar".
3. Revisa TODAS las pantallas y reemplaza estados vacíos, de carga y de error por estos componentes; al final de tu respuesta lista cuáles tocaste y cuáles quedan pendientes.
4. Textos en src/i18n/es.ts con el tono del Anexo.

CRITERIOS DE ACEPTACIÓN:
- Ninguna pantalla conserva un estado vacío o de error con el estilo anterior. Calidad en verde.
```

📸 Captura de login, registro y de un estado vacío y uno de error.

### R7.13: Análisis

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Análisis").

TAREA: Rediseña app/analysis.tsx y los gráficos con la paleta v3. Conserva las funciones puras y los datos (spendingByCategory, monthlyTrend, extraShareByMonth, buildInsights).

REQUISITOS:
1. ScreenScaffold 'block': título "Análisis", MonthSelector tone 'onBlock' y la primera frase de buildInsights bajo el título (onBrandMuted); si no hay frases, "Registra movimientos para ver tu análisis".
2. Hoja: SegmentedControl Gastos | Ingresos; DonutChart con monto central y colores tomados de la paleta de fichas (el color del ícono en oscuro y el de fondo/ícono del modo actual, según corresponda; "Otros" en gray); lista de categorías con IconTile 32, nombre, monto y porcentaje.
3. "Últimos 6 meses": GroupedBarChart con ingresos en income y gastos en expense; "Base y extras": porcentaje de extras por mes con StackedBar o barras base=brand y extra=extraFill.
4. Cada gráfico conserva su resumen accesible y su alternativa en texto.
5. Estados de carga (Skeleton), vacío y error. Textos en src/i18n/es.ts.
6. Tests de la función pura que asigna color a cada porción (misma categoría, mismo color siempre; "Otros" en gray).

CRITERIOS DE ACEPTACIÓN:
- Los totales siguen coincidiendo con los de Movimientos para el mismo mes. Calidad en verde.
```

📸 Captura completa de Análisis (dos capturas con scroll).

### R7.14: Auditoría final y limpieza

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md.

TAREA: Auditoría de consistencia y limpieza. No agregues funcionalidades.

REQUISITOS:
1. Recorre TODAS las pantallas y verifica contra los documentos: uso de tokens (cero hex, rgb o valores sueltos fuera de src/theme), un solo botón primary por vista, ámbar solo para "extra", Ionicons solo vía AppIcon, tamaños mínimos de texto, áreas táctiles de 44 y etiquetas de accesibilidad. Corrige lo que incumpla y lista lo corregido.
2. Elimina app/dev-preview.tsx, los alias deprecated del tema que ya no se usen (lista los que sigan en uso y dónde), componentes sin uso y código muerto.
3. Verifica que no queden textos con caracteres rotos en el código.
4. Revisa las diferencias entre docs/UX_SPEC.md / docs/DESIGN_SYSTEM.md y lo implementado. NO modifiques los documentos: lístalas para que yo decida.
5. Actualiza docs/APP_GUIDE.md y CLAUDE.md con el estado actual (diseño v3, rama feat/ui-v3, prompts R7).
6. Crea docs/QA_VISUAL.md: lista de verificación visual manual (pantalla por pantalla, oscuro y claro, letra grande, reducir movimiento) en formato de casillas, con los puntos del Anexo B.

CRITERIOS DE ACEPTACIÓN:
- Calidad en verde, lista de diferencias entregada, QA_VISUAL.md creada.
```

✋ Pasa la lista de `docs/QA_VISUAL.md` en tu celular. 📸 Mándame capturas finales de las pantallas principales en oscuro y claro. Después: abre un pull request de `feat/ui-v3` hacia `feat/redesign` y luego a `main`, y retoma la publicación (P10.1).

---

## 6. Prompt de rescate (si algo falla)

```text
Algo falló. NO cambies código todavía.
1. Lee el error y explícame en lenguaje simple qué pasó y por qué.
2. Propón la corrección mínima y dime qué archivos tocarías.
3. Espera mi "adelante" para aplicarla.
```

## 7. Si el resultado no se parece a los mockups

Mándame la captura y dime el prompt (por ejemplo, "R7.6"). Hay tres causas típicas y las arreglamos así:

- El agente usó un valor distinto al del Anexo: te doy un prompt de corrección puntual con el valor exacto.
- El Anexo no cubría un caso: lo agregamos al Anexo y reejecutamos solo esa parte.
- Una limitación de Expo Go (barras del sistema, íconos, vibración): se confirma en un development build antes de dar el diseño por fallido.

---

# ANEXO A: contenido de `docs/DESIGN_SYSTEM.md`

> Copia TODO lo que está dentro del siguiente bloque a `docs/DESIGN_SYSTEM.md` (lo hace el agente en R7.0, de forma mecánica).

````markdown
# Sistema de diseño v3: Finanzas ("bloque de color")

Fuente de verdad del diseño visual. Si una pantalla necesita algo que no está aquí, se pregunta; no se inventa.

## 1. Principios

1. Un protagonista por pantalla: el bloque azul de marca con el número principal.
2. Color con significado: azul de marca = identidad, acciones primarias y "base"; verde = dinero que entra; coral = dinero que sale; ámbar = "extra". Las fichas de categoría tienen su propio color, solo como identidad de la categoría (nunca para montos).
3. Profundidad por capas: bloque, hoja y tarjetas. Sin sombras. La única "profundidad" decorativa es el degradado sutil del bloque y dos círculos translúcidos.
4. Números primero: cifras tabulares, grandes y legibles.
5. Rápido: valores por defecto inteligentes, gestos visibles, pocos toques.
6. Accesible: contraste AA, áreas táctiles de 44 px, texto que escala, nada depende solo del color.

## 2. Modo de tema

Preferencia: Sistema, Oscuro o Claro. Valor por defecto: Oscuro. El bloque azul se mantiene igual en ambos modos.

## 3. Color

### 3.1 Tokens

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| bg | #0E1118 | #F4F6FB | Fondo de pantalla y de la hoja |
| surface | #171B26 | #FFFFFF | Tarjetas |
| surfaceRaised | #1F2433 | #EEF1F7 | Chips, campos, teclas |
| surfaceHigh | #2A3042 | #E3E7F0 | Segmento activo, presionado, riel apagado |
| border | #232938 | #E3E6EB | Líneas finas (1 px) |
| textPrimary | #F2F4FA | #12141A | Texto principal |
| textSecondary | #9AA3B8 | #5B6270 | Texto de apoyo |
| textMuted | #7C849A | #646B79 | Placeholders y metadatos (solo sobre bg y surface) |
| brand | #2F5BFF | #2F5BFF | Bloque, botón primario, botón central, barras "base" |
| brandDeep | #2449E0 | #2449E0 | Final del degradado del bloque |
| onBrand | #FFFFFF | #FFFFFF | Texto e íconos sobre brand |
| onBrandMuted | #EEF3FF | #EEF3FF | Texto secundario sobre el bloque |
| blockTrack | #5A80FF | #5A80FF | Riel de barras y avatar sobre el bloque |
| blockSoft | #1F45D6 | #1F45D6 | Contenedor de segmentos y píldoras sobre el bloque |
| blockDecor | rgba(255,255,255,0.08) | rgba(255,255,255,0.10) | Círculos decorativos del bloque |
| brandSoft | #26305A | #E3EBFF | Fondo suave de marca (chip "Base" seleccionado) |
| brandText | #9DB4FF | #2347D6 | Texto e íconos de marca sobre bg (pestaña activa, enlaces) |
| income | #4ADE9A | #0F7A45 | Dinero que entra |
| expense | #FF7A6B | #C73A2B | Dinero que sale |
| extra | #F5B544 | #9A5B00 | Texto de naturaleza "extra" |
| extraFill | #F5B544 | #F2A93B | Relleno de barras "extra" |
| extraSoft | #3A3217 | #FFF0C2 | Fondo suave de extra |
| danger | #FF6B6B | #C73A2B | Acciones destructivas |
| dangerSoft | #3A1E1E | #FFE3E0 | Fondo suave destructivo |
| scrim | rgba(0,0,0,0.6) | rgba(0,0,0,0.4) | Fondo de modales y sheets |

Reglas:
- Contraste mínimo 4.5:1 en todo texto y 3:1 en pares ícono/fondo (hay tests; si un par falla se ajusta solo la luminosidad).
- Sobre el bloque azul solo se usan onBrand, onBrandMuted, blockTrack, blockSoft y blockDecor. Nunca coral ni verde sobre el bloque.
- Ámbar es exclusivo de "extra". Las advertencias (p. ej. presupuesto cerca del límite) usan expense con opacidad 0.65.
- Una ficha de categoría nunca se usa para colorear un monto.

### 3.2 Paleta de fichas de categoría

Cada entrada: fondo y color de ícono para modo oscuro y claro.

| Clave | Oscuro (fondo / ícono) | Claro (fondo / ícono) |
|---|---|---|
| orange | #3A2A1C / #FFA25C | #FFE3CC / #B8480F |
| coral | #3A2418 / #FF8A5C | #FFE0D4 / #B83C0F |
| blue | #1C2A3F / #6EA8FF | #D9E6FF / #1B4FB8 |
| violet | #2B2447 / #A78BFA | #E7DEFF / #5B34C7 |
| yellow | #3A3217 / #F5C542 | #FFF0C2 / #8A6100 |
| teal | #153A36 / #3DD6C0 | #CFF3EC / #0B7A6A |
| sky | #162E45 / #4FB7FF | #D5ECFF / #0B6AAE |
| pink | #3A1F33 / #FF7AC8 | #FFD9EE / #B0206F |
| purple | #2E2147 / #C084FC | #EBD9FF / #7A2FC7 |
| indigo | #1F2A44 / #7C9BFF | #DCE4FF / #2F4BC0 |
| green | #1C3A2C / #4ADE9A | #D4F1DF / #0F7A45 |
| gray | #232938 / #9AA3B8 | #E3E7F0 / #5B6270 |

### 3.3 Mapeo por defecto

Gastos: Comida = orange, Mercado = coral, Transporte = blue, Vivienda = violet, Servicios = yellow, Salud = teal, Educación = sky, Entretenimiento = pink, Ropa = purple, Suscripciones = indigo, Otros = gray.
Ingresos: Salario = green, Extra = yellow, Ventas = teal, Regalos = pink, Otros = gray.
Cuentas: efectivo = blue, banco = green, ahorros = violet, tarjeta de crédito = pink.
Filas de Más: Cuentas = blue, Categorías = violet, Apariencia = yellow, Incluir extras = yellow, Biometría = green, Recordatorios = orange, Exportar = sky, Cerrar sesión = gray, Eliminar cuenta = danger. Planificar: Pagos recurrentes = violet, Análisis = teal.

## 4. Tipografía

Fuente: Manrope (400, 500, 600, 700). Cifras monetarias con números tabulares.

| Variante | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| displayLg | 44 / 52 | 600 | Monto en registro rápido |
| display | 34 / 40 | 600 | Monto del bloque de Inicio |
| title | 24 / 30 | 600 | Títulos de pantalla |
| subtitle | 17 / 24 | 500 | Títulos de tarjeta y secciones |
| body | 15 / 22 | 400 | Texto general |
| bodyStrong | 15 / 22 | 600 | Énfasis, botones, montos en filas |
| caption | 12 / 16 | 400 | Apoyo y etiquetas |
| micro | 11 / 14 | 500 | Tags y etiquetas de pestañas |

Todo el texto escala con la configuración del sistema.

## 5. Espaciado, radios y tamaños

- Espaciado: 4, 8, 12, 16, 20, 24, 32, 40.
- Radios: sm 8, md 12, lg 16, xl 20, sheet 28, pill 999.
- Margen lateral de pantalla: 20. Separación vertical entre tarjetas: 12.
- Área táctil mínima: 44 x 44 (hitSlop si el elemento visual es menor).
- Alturas: botón 52, campo 52, chip 32, tag 20, fila de lista (mínimo) 64, tecla del teclado 52, barra de pestañas 64 más zona segura.
- Fichas (IconTile): 32 (radio 10), 40 (radio 12), 48 (radio 14); ícono relleno al 55% del lado.
- Íconos: 16, 20 y 24. Se usan siempre mediante AppIcon.

## 6. Componentes

- BlockHeader: ancho completo, degradado vertical de brand a brandDeep (react-native-svg), dos círculos decorativos (blockDecor) arriba a la derecha, se extiende bajo la barra de estado; padding superior = zona segura + 12, inferior 44.
- Sheet (hoja): fondo bg, radios superiores 28, solapa 28 px el bloque, padding horizontal 20.
- Card: fondo surface, radio 20, padding 16. Modo claro: borde de 1 px (border). Sin sombra.
- Button: alto 52, radio 16, texto bodyStrong. primary = fondo brand y texto onBrand (UN solo primary por vista). onBrand = fondo onBrand y texto brand (solo sobre el bloque o tarjetas brand). secondary = surfaceRaised. ghost = sin fondo y texto brandText. destructive = fondo danger. Presionado: tono más oscuro, sin sombra. Disabled: opacidad 0.4.
- Input: alto 52, radio 16, fondo surfaceRaised, borde de 1 px transparente que pasa a brand en foco y a expense en error; label arriba (caption, textSecondary).
- Chip: alto 32, pill, padding horizontal 12, fondo surfaceRaised, texto caption. Seleccionado: brandSoft y brandText. "Extra" seleccionado: extraSoft y extra.
- SegmentedControl: alto 40, pill. default = contenedor surface con segmento activo surfaceHigh. onBlock = contenedor blockSoft, segmento activo con fondo onBrand y texto brand, inactivo onBrandMuted.
- Switch: riel 44 x 26, perilla 20 blanca; encendido brand, apagado surfaceHigh.
- IconTile: ver 3.2 y 5.
- ListRow: IconTile 40 a la izquierda, título body, subtítulo caption textSecondary, contenido a la derecha; alto mínimo 64.
- Tag: alto 20, pill, padding horizontal 8, micro. extra = extraSoft/extra; base = brandSoft/brandText; neutral = surfaceRaised/textSecondary.
- ProgressBar: alto 6, pill. default: riel surfaceHigh. onBlock: riel blockTrack y relleno onBrand. status ok = brand, near = expense a 0.65, over = expense.
- StackedBar: alto 8, segmentos separados 2, pill. base = brand, extra = extraFill.
- Avatar: círculo con inicial (onBrand); fondo blockTrack sobre el bloque y brand en otros casos.
- BottomSheet: fondo surface, radios superiores 28, handle de 4 x 36, scrim detrás, máximo 85% de alto.
- Snackbar: fondo surfaceHigh, texto textPrimary, radio 12, acción brandText; aparece 12 px sobre la barra de pestañas; dura 4 s.
- Barra de pestañas: fondo bg, línea superior de 1 px (border), alto 64 más zona segura. Cinco elementos: Inicio (home), Movimientos (list), botón central, Planificar (pie-chart), Más (ellipsis-horizontal). Activa: ícono relleno y brandText. Inactiva: ícono de contorno y textSecondary. Botón central: círculo de 56 px brand con ícono add onBrand, 14 px más arriba, con anillo de 4 px del color bg.
- MoneyText: tabular. Gasto: signo "-" y color expense. Ingreso: signo "+" y color income. Neutro: textPrimary. Formato "$ 87.500", espacio no separable, sin decimales. Compacto en resúmenes: desde 1.000.000, "$ 3,2 M".

## 7. Barras del sistema

La app se dibuja de borde a borde. Barra de estado: íconos claros sobre pantallas con bloque; en pantallas sin bloque, claros en oscuro y oscuros en claro. Barra de navegación del sistema: color bg del tema. Sin franjas desentonadas.

## 8. Íconos

Ionicons mediante AppIcon. Fichas de categoría, cuentas y filas: ícono relleno. Pestaña activa: relleno. Inactiva y controles: contorno. Prohibido importar Ionicons fuera de AppIcon.

## 9. Movimiento y haptics

- Duraciones: rápida 150 ms, estándar 220 ms, lenta 320 ms; salida suave.
- Conteo animado de cifras: 300 a 600 ms.
- Con "reducir movimiento" las animaciones se desactivan (no se acortan).
- Haptics: tap (botón principal y +), selección (chips, segmentos, teclas), éxito (guardar), advertencia (eliminar), error (validación fallida).

## 10. Accesibilidad

- Contraste AA en ambos temas.
- Todo elemento táctil con role y label. Los montos principales tienen label completo en palabras ("87.500 pesos").
- Nada depende solo del color: los montos llevan signo, los estados llevan texto.
- Orden de lectura lógico (bloque primero).
- Cada gráfico con resumen accesible y alternativa en texto.

## 11. Microcopy

- Tuteo ("tú"), frases cortas, oraciones en minúscula salvo la primera palabra.
- Botones: verbo primero ("Guardar", "Agregar movimiento").
- Errores: qué pasó y qué hacer, en una frase.
- Vacíos: invitan, no se disculpan.
- Sin "por favor", sin signos de exclamación en textos del sistema, sin "exitosamente".

## 12. Prohibido

- Colores hexadecimales, rgb() o valores de estilo sueltos fuera de src/theme.
- Sombras.
- Más de un botón primary por vista.
- Ámbar para algo distinto de "extra".
- Importar Ionicons directamente (usar AppIcon).
- Texto menor a 11 px.
- Coral o verde sobre el bloque azul.
````

---

# ANEXO B: contenido de `docs/UX_SPEC.md`

> Copia TODO lo que está dentro del siguiente bloque a `docs/UX_SPEC.md` (lo hace el agente en R7.0, de forma mecánica).

````markdown
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
3. Primer uso: tarjeta "Empieza en 3 pasos" con tres filas (IconTile 32): "Agrega tu ingreso base", "Registra tu primer gasto", "Ponle tope a un gasto". Cada una con check al cumplirse; la tarjeta se oculta al cumplirse las tres.
4. Tarjeta "Este mes": "Ingresos" con monto y StackedBar base/extra; "Gastos" con monto y StackedBar base/extra; pie "Los extras son el {P}% de tus ingresos."
5. Sección "Cuentas" con el total a la derecha; fila horizontal desplazable de tarjetas (IconTile por tipo, nombre, saldo).
6. Sección "Recientes" con enlace "Ver todos" y hasta 5 ListRow.
7. Estados: Skeleton con la forma de cada bloque (incluido el azul); error con reintento; pull-to-refresh.

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
Hoja: SegmentedControl Gastos | Ingresos; DonutChart con monto central y colores de la paleta de fichas; lista de categorías con IconTile 32, monto y porcentaje (máximo 6 más "Otros"); "Últimos 6 meses" (barras agrupadas de ingresos y gastos); "Base y extras" (porcentaje de extras por mes). Estados: Skeleton, vacío y error con reintento.

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
````
