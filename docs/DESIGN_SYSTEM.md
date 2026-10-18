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
