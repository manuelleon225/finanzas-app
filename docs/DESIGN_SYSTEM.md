# Sistema de diseño v2: Finanzas

Fuente de verdad del diseño visual. Si una pantalla necesita algo que no está aquí, se pregunta; no se inventa.

## 1. Principios

1. Un foco por pantalla: un solo elemento protagonista; todo lo demás lo apoya.
2. El color significa algo: marca = acciones y "base"; verde = dinero que entra; coral = dinero que sale; ámbar = "extra". Nada más usa esos colores.
3. Plano y aireado: sin sombras. La jerarquía se logra con tonos de superficie, tamaño y espacio.
4. Números primero: las cifras son tabulares, grandes y legibles.
5. Rápido: valores por defecto inteligentes, gestos visibles, pocos toques.
6. Accesible: contraste AA, áreas táctiles de 44 px, texto que escala, nada depende solo del color.

## 2. Modo de tema

Preferencia del usuario: Sistema, Oscuro o Claro. Valor por defecto: Oscuro.

## 3. Color

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| bg | #0F1115 | #F6F7F9 | Fondo de pantalla |
| surface | #181B22 | #FFFFFF | Tarjetas |
| surfaceRaised | #1F232C | #F0F2F5 | Chips, campos, segmentos inactivos |
| surfaceHigh | #2A2F3A | #E6E9EE | Segmento activo, estado presionado |
| border | #262A33 | #E3E6EB | Líneas finas (1 px) |
| textPrimary | #F2F3F5 | #12141A | Texto principal |
| textSecondary | #9AA0AB | #5B6270 | Texto de apoyo |
| textMuted | #858B97 | #6B7280 | Placeholders, metadatos |
| brand | #7C86FF | #4F5BFF | Acción primaria, "base", foco |
| brandSoft | #262B4D | #E6E8FF | Fondo suave de marca |
| onBrand | #0F1115 | #FFFFFF | Texto sobre brand |
| income | #4ADE9A | #0A7F48 | Dinero que entra |
| expense | #FF7A6B | #C73A2B | Dinero que sale |
| extra | #F5B544 | #9A5B00 | Naturaleza "extra" |
| extraSoft | #3A2E14 | #FFF1D6 | Fondo suave de extra |
| danger | #FF5C5C | #C73A2B | Acciones destructivas |
| scrim | rgba(0,0,0,0.6) | rgba(0,0,0,0.4) | Fondo de modales y sheets |

Reglas:
- Contraste mínimo 4.5:1 en todo texto (hay un test que lo verifica; si un par falla se ajusta solo la luminosidad).
- Fondos suaves de cualquier color de categoría: `tint(color, 0.16)` en oscuro y `tint(color, 0.12)` en claro.
- Ámbar es exclusivo de "extra". Las advertencias (p. ej. presupuesto cerca del límite) usan expense con opacidad 0.65.
- Texto sobre brand siempre onBrand.

## 4. Tipografía

Fuente: Manrope (400, 500, 600, 700). Las cifras monetarias usan números tabulares (fontVariant tabular-nums).

| Variante | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| displayLg | 40 / 48 | 600 | Monto en registro rápido |
| display | 34 / 40 | 600 | Monto héroe de Inicio |
| title | 22 / 28 | 600 | Títulos de pantalla |
| subtitle | 17 / 24 | 500 | Títulos de tarjeta, secciones |
| body | 15 / 22 | 400 | Texto general |
| bodyStrong | 15 / 22 | 600 | Énfasis, botones, montos en filas |
| caption | 12 / 16 | 400 | Apoyo, etiquetas |
| micro | 11 / 14 | 500 | Tags, etiquetas de pestañas |

Todo el texto escala con la configuración del sistema.

## 5. Espaciado, radios y tamaños

- Espaciado: 4, 8, 12, 16, 20, 24, 32, 40.
- Radios: sm 8, md 12, lg 16, xl 24, pill 999.
- Márgenes laterales de pantalla: 20. Separación vertical entre tarjetas: 12.
- Área táctil mínima: 44 x 44 (usar hitSlop si el elemento visual es menor).
- Alturas: botón 52, campo 52, chip 32, tag 20, fila de lista (mínimo) 64, barra de pestañas 64 más safe area.
- Íconos: 16 (en línea), 20 (estándar), 24 (navegación). Solo estilo contorno (Ionicons `-outline`), siempre mediante el componente AppIcon.

## 6. Componentes

- Card: fondo surface, radio lg (xl en la tarjeta héroe), padding 16 (20 en héroe). Sin sombra. En modo claro, borde de 1 px con border.
- Button: alto 52, radio 14, texto bodyStrong. Primary = fondo brand y texto onBrand (UN solo primary por vista). Secondary = fondo surfaceRaised. Ghost = sin fondo, texto brand. Destructive = fondo danger con texto onBrand claro u oscuro según contraste. Estado presionado: tono de surfaceHigh o brand más oscuro, sin sombra. Loading = indicador en lugar del texto, mismo ancho. Disabled = opacidad 0.4.
- Input: alto 52, radio md, fondo surfaceRaised, borde de 1 px transparente que pasa a brand en foco y a expense en error; label arriba (caption, textSecondary); mensaje de error en caption con color expense.
- Chip: alto 32, radio pill, padding horizontal 12, fondo surfaceRaised, texto caption. Seleccionado: fondo brandSoft y texto brand (el chip "Extra" seleccionado: fondo extraSoft y texto extra).
- SegmentedControl: contenedor surface con radio pill y padding 3; segmento activo con fondo surfaceHigh y texto textPrimary; inactivo textSecondary. Alto 40.
- ListRow: círculo de ícono de 40 con tint de la categoría, título body, subtítulo caption textSecondary, trailing alineado a la derecha; alto mínimo 64; presionado = surfaceRaised.
- Tag: alto 20, radio pill, padding horizontal 8, texto micro. extra = extraSoft/extra. base = brandSoft/brand. neutral = surfaceRaised/textSecondary. pending = surfaceRaised/textSecondary con borde dashed no requerido (solo texto "Por confirmar").
- ProgressBar: alto 6, radio pill, fondo surfaceRaised.
- StackedBar: alto 8, segmentos separados 2, radio pill. Base = brand, Extra = extra.
- BottomSheet: fondo surface, radios superiores xl, handle de 4 x 36 centrado, scrim detrás, máximo 85% de alto.
- Snackbar: fondo surfaceHigh, texto textPrimary, radio md, acción en brand; aparece sobre la barra de pestañas; duración 4 s.
- Barra de pestañas: fondo bg con línea superior de 1 px (border). Cinco elementos: Inicio (home), Movimientos (list), (+) central, Planificar (pie-chart), Más (ellipsis-horizontal). Etiquetas micro. Activo: ícono y texto brand; inactivo: textSecondary. El (+) es un círculo de 52 px con fondo brand e ícono onBrand, desplazado 14 px hacia arriba respecto a la fila.
- MoneyText: tabular. Gasto: signo "-" y color expense. Ingreso: signo "+" y color income. Neutro: textPrimary. Formato "$ 87.500" con espacio no separable; sin decimales.

## 7. Movimiento y haptics

- Duraciones: rápida 150 ms, estándar 220 ms, lenta 320 ms. Curva de salida suave (ease-out).
- Conteo animado de cifras: 300 a 600 ms.
- Con "reducir movimiento" activo en el sistema, las animaciones se desactivan (no se acortan).
- Haptics: tap (botón principal y +), selección (chips, segmentos, teclas), éxito (guardar), advertencia (eliminar), error (validación fallida).

## 8. Accesibilidad

- Contraste AA en ambos temas.
- Todo elemento táctil con role y label. Los montos tienen label completo en palabras ("87.500 pesos").
- Nada depende solo del color: los montos llevan signo, los estados llevan texto.
- Orden de lectura lógico (de arriba hacia abajo, héroe primero).
- Cada gráfico con resumen accesible y alternativa en texto.

## 9. Microcopy

- Tuteo ("tú"), frases cortas, oraciones en minúscula salvo la primera palabra.
- Botones: verbo primero ("Guardar", "Agregar movimiento").
- Errores: qué pasó y qué hacer, en una frase, sin culpar al usuario.
- Vacíos: invitan, no se disculpan.
- Sin "por favor", sin signos de exclamación en textos del sistema, sin "exitosamente".

## 10. Prohibido

- Colores hexadecimales, rgb() o valores de estilo sueltos fuera de src/theme.
- Sombras.
- Más de un botón primary por vista.
- Ámbar para algo distinto de "extra".
- Importar Ionicons directamente (usar AppIcon).
- Texto menor a 11 px.