# Guía de prompts v2: rediseño y mejoras de la app de finanzas

Continuación de la guía anterior (P0.1 a P10.1). Parte del estado real de la app descrito en `APP_GUIDE.md`: MVP completo, sin publicar.

Contiene **24 prompts (R0.1 a R6.4)** y dos anexos con la especificación exacta de diseño y UX, que son la pieza clave de esta guía.

---

## 1. Por qué esta guía es distinta

La interfaz anterior se construyó a ciegas: el modelo no ve pantallas y trabajó con adjetivos ("limpio", "buen contraste"). Por eso salió genérica. Esta guía cambia el método:

1. **Especificación exacta, no adjetivos.** Colores, tamaños, tipografía, estructura de cada pantalla y textos están escritos en los Anexos A y B. El agente los lee y los aplica; no inventa.
2. **El humano es los ojos.** Después de cada prompt visual, tú miras la pantalla con la lista "Para revisar visualmente". En los puntos marcados con 📸 me mandas capturas y las reviso contigo.
3. **Guardrails que un modelo ciego sí puede verificar:** regla de lint que prohíbe colores hexadecimales fuera del tema, test de contraste WCAG de los tokens, tests de la lógica pura.
4. **Compatibilidad hacia atrás.** Primero se actualizan los componentes base sin romper sus props; las pantallas migran una por una.

---

## 2. Preparación (antes de R0.1)

✋ Haz esto una sola vez:

1. Crea una rama de trabajo: `git checkout -b feat/redesign`. Todo el rediseño va en esa rama; se une a `main` al final.
2. Copia el **Anexo A** de esta guía a `docs/DESIGN_SYSTEM.md` y el **Anexo B** a `docs/UX_SPEC.md`, exactamente como están. Es importante que no los reescriba el agente.
3. Confirma que `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd test` pasan en verde antes de empezar.

---

## 3. Reglas de uso (iguales a la guía anterior, con ajustes)

- Un prompt a la vez, con el **PIE COMÚN v2** (sección 4) pegado al final.
- Un prompt = un commit. Si el modelo falla dos veces en lo mismo: `git restore .`, divide la tarea y reintenta.
- Si el contexto de la sesión pesa, abre sesión nueva: la memoria vive en `AGENTS.md` y `docs/`.
- Las migraciones SQL las ejecutas tú en el SQL Editor de Supabase, en orden, y luego corres el script de RLS si el prompt lo pide.
- Marcas: ✋ paso manual tuyo · 🔍 revisión obligatoria antes de seguir · 📸 mándame captura(s) para revisar.

---

## 4. PIE COMÚN v2 (se agrega al final de CADA prompt)

```text
AL TERMINAR:
1. Ejecuta `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd test`. Corrige todo error antes de responder.
2. No agregues dependencias que no estén listadas en este prompt sin preguntarme antes. Las del ecosistema Expo se instalan con `npx.cmd expo install`.
3. No modifiques archivos fuera del alcance de esta tarea ni refactorices código que no te pedí tocar. No edites migraciones ya aplicadas: las nuevas llevan el siguiente número.
4. No uses colores hexadecimales ni valores de diseño "mágicos" fuera de src/theme: todo sale de los tokens de docs/DESIGN_SYSTEM.md (esta regla aplica desde que exista la regla de lint de R2.1).
5. No puedes ver la pantalla. Nunca afirmes que algo "se ve bien". Verifica con tipos, tests y lint, y termina con una lista "Para revisar visualmente" con lo que debo mirar yo en el dispositivo.
6. Actualiza docs/PROGRESS.md.
7. Responde solo con: (a) resumen breve, (b) archivos tocados, (c) comandos o pasos manuales para mí, (d) lista "Para revisar visualmente" si aplica, (e) mensaje de commit sugerido en formato Conventional Commits.
8. Detente. No empieces la siguiente tarea.
```

---

## 5. Mapa de prompts y dependencias

| Fase | Prompts | Resultado |
|---|---|---|
| R0 | R0.1 | Documentación y reglas actualizadas |
| R1 | R1.1 a R1.3 | Nueva fórmula de "Disponible hoy" (lógica) |
| R2 | R2.1 a R2.4 | Sistema de diseño v2 (tema, componentes) |
| R3 | R3.1 | Nueva navegación |
| R4 | R4.1 a R4.5 | Pantallas rediseñadas y pulido |
| R5 | R5.1 a R5.6 | Presupuestos, análisis, offline, recurrentes con confirmación, exportar |
| R6 | R6.1 a R6.4 | Bloqueantes de publicación, seguridad, QA |

Después de R6.4: ejecuta el **P10.1** de la guía anterior (EAS y publicación).

Orden obligatorio: R1 antes de R4.1 (el Inicio usa la nueva fórmula); R2 antes de R3 y R4; R5.3 antes de R5.4; R5.5 después de R4.2.

---

# FASE R0: documentación

### R0.1: Actualizar la memoria del proyecto

```text
ROL: Eres un arquitecto de software senior.

CONTEXTO: La app de finanzas ya tiene el MVP completo (ver docs/APP_GUIDE.md). Vamos a ejecutar un rediseño de UI y mejoras funcionales. Esta tarea NO escribe código: actualiza la documentación. Ya existen docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md: son la fuente de verdad del diseño y NO debes modificarlos ni parafrasearlos.

TAREA:
1. Lee docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md completos.
2. Actualiza AGENTS.md: agrega (a) una sección "Diseño" que obligue a leer docs/DESIGN_SYSTEM.md y la sección correspondiente de docs/UX_SPEC.md antes de tocar cualquier UI; (b) las reglas: "No puedes ver la pantalla: nunca afirmes que algo se ve bien; entrega siempre una lista 'Para revisar visualmente'", "Prohibidos colores hexadecimales y valores de diseño fuera de src/theme", "Un solo botón primario por vista", "Ámbar solo para 'extra', nunca para advertencias".
3. Crea docs/DECISIONS.md (registro de decisiones, formato: fecha, decisión, motivo) con estas decisiones ya tomadas:
   - Nueva fórmula de "Disponible hoy": saldo líquido menos gastos comprometidos hasta el próximo ingreso base, dividido entre los días hasta ese ingreso; los extras se muestran aparte como colchón y por defecto no inflan el número.
   - Rediseño visual: oscuro por defecto, marca índigo distinta de los colores semánticos.
   - Navegación de 5 elementos: Inicio, Movimientos, botón (+) central, Planificar, Más.
   - Registro rápido: monto, toque en categoría y queda guardado.
   - Presupuestos y análisis antes de publicar.
   - Registro de movimientos sin conexión (solo creación) con cola de sincronización.
   - Recurrentes con modo "pedir confirmación".
   - Fuera de alcance por ahora: tarjetas de crédito y deudas, metas de ahorro, registro por voz, foto de recibo, cuentas compartidas, login social.
4. Actualiza docs/DATA_MODEL.md: reemplaza la sección de la fórmula "Disponible hoy" por la fórmula v2 (descrita en R1.2, que te pego abajo) y agrega una sección "Cambios planificados" con: accounts.counts_as_liquid, tabla budgets, transactions.status ('posted' | 'pending') y recurring_rules.confirmation_mode ('auto' | 'confirm').
5. Actualiza docs/PRD.md (alcance y fuera de alcance) y docs/ARCHITECTURE.md (agrega: fuente Manrope, modo de tema, cola offline planificada con TanStack Query persistido, gráficos propios con react-native-svg).
6. Registra la tarea en docs/PROGRESS.md.

FÓRMULA v2 (documentar tal cual):
- liquidBalance = suma de saldos de cuentas activas con counts_as_liquid = true.
- horizonDate = fecha de la próxima ocurrencia (estrictamente posterior a hoy) de la regla recurrente activa de ingreso base más cercana; si no hay ninguna, el primer día del mes siguiente.
- daysToIncome = max(1, días calendario entre hoy y horizonDate).
- committed = suma de las ocurrencias de reglas recurrentes activas de gasto con fecha entre mañana y el día anterior a horizonDate (inclusive), más los gastos pendientes de confirmar.
- extraCushion = max(0, ingresos extra del mes - gastos extra del mes).
- availableTotal = liquidBalance - committed.
- availableBase = availableTotal - extraCushion (si includeExtras es false); availableTotal (si es true).
- spentToday = gastos publicados de hoy (sin transferencias).
- allowanceToday = floor(max(0, availableBase + spentToday) / daysToIncome).
- remainingToday = max(0, allowanceToday - spentToday).
- Documenta que es una v1 editable y los supuestos.
```

---

# FASE R1: nueva lógica de "Disponible hoy"

### R1.1: Migración 005 y marca de cuenta líquida

```text
Lee AGENTS.md, docs/DATA_MODEL.md y docs/ARCHITECTURE.md.

TAREA: Agrega el concepto de "cuenta líquida" (dinero disponible para gastar).

REQUISITOS:
1. Crea supabase/migrations/005_accounts_liquid.sql: agrega accounts.counts_as_liquid boolean not null default true; actualiza con false las cuentas existentes de tipo 'savings' y 'credit_card'; recrea la vista account_balances agregando la columna counts_as_liquid AL FINAL (sin alterar el orden de las existentes) y conservando security_invoker = true.
2. Actualiza src/types/database.ts y la capa de datos de cuentas (api, hooks, tipos de AccountWithBalance) para incluir el campo.
3. En el formulario de cuenta (app/account-form.tsx) agrega un switch "Cuenta para gastar" con texto de ayuda: "Cuenta el saldo de esta cuenta en tu Disponible hoy." El valor por defecto al crear depende del tipo: true para cash y bank, false para savings y credit_card (cambia al cambiar el tipo si el usuario no lo ha tocado).
4. Textos en src/i18n/es.ts. Tests del valor por defecto según tipo (función pura).
5. Actualiza supabase/tests/002_rls_test.sql solo si hace falta para cubrir la vista.

NO rediseñes pantallas todavía: solo agrega el campo con los componentes actuales.
```

✋ Ejecuta `005_accounts_liquid.sql` en Supabase, abre una cuenta de ahorro existente y verifica que quedó con el switch apagado.

### R1.2: Función pura de "Disponible hoy" v2

```text
Lee AGENTS.md y la sección de la fórmula v2 en docs/DATA_MODEL.md.

TAREA: Implementa la lógica pura en src/features/summary/utils/availableToday.ts (sin UI, sin Supabase).

REQUISITOS:
1. Función `calculateAvailableToday(input): AvailableTodayResult` con input: { today: string ('YYYY-MM-DD'), accounts: { balance: number; countsAsLiquid: boolean }[], rules: RecurringRule[], pendingExpenses: number (default 0), monthTransactions: Transaction[] (publicados del mes de hoy), includeExtras: boolean }.
2. Resultado: { liquidBalance, committed, availableTotal, extraCushion, availableBase, daysToIncome, horizonDate, usedFallbackHorizon: boolean, spentToday, allowanceToday, remainingToday }.
3. Implementa EXACTAMENTE la fórmula v2 de docs/DATA_MODEL.md. Reutiliza getOccurrences y getNextOccurrence de src/features/recurring/utils/recurrence.ts: antes de usarlas, verifica y documenta en un comentario si getNextOccurrence devuelve fechas estrictamente posteriores a la fecha dada; si no, adáptalo sin romper sus tests.
4. Cuentas no líquidas no suman. Las transferencias nunca cuentan como gasto ni ingreso.
5. Todo el cálculo con enteros; floor al final; nunca números negativos en allowanceToday y remainingToday.
6. Tests exhaustivos (mínimo 18) que cubran: sin reglas (horizonte = primer día del mes siguiente); ingreso quincenal (semimonthly) el día 14, 15 y 29; ingreso mensual; cuentas no líquidas ignoradas; gastos comprometidos restan; disponible negativo da 0; includeExtras true y false; colchón extra mayor que el disponible; gasto de hoy que reduce remainingToday pero no allowanceToday; último día del mes con fallback (daysToIncome = 1); regla inactiva ignorada; regla de gasto con end_date vencida; pendingExpenses restando.
7. No toques todavía la pantalla de Inicio ni el hook existente.

CRITERIOS DE ACEPTACIÓN:
- Tests en verde y la función exportada con tipos estrictos, sin `any`.
```

### R1.3: Conectar la nueva fórmula

```text
Lee AGENTS.md, docs/DATA_MODEL.md y docs/UX_SPEC.md (sección "Inicio", solo el bloque de la tarjeta Disponible hoy).

TAREA: Conecta calculateAvailableToday a la app, sin rediseñar la UI.

REQUISITOS:
1. Hook `useAvailableToday(month)` en src/features/summary/hooks: obtiene cuentas con saldo, reglas activas y movimientos publicados del mes, lee `includeExtrasInAvailable` de un store Zustand persistido (default false) y devuelve el resultado de la función pura.
2. Crea el store src/features/summary/store/usePreferencesStore.ts con includeExtrasInAvailable (persistido en AsyncStorage). En Ajustes (pantalla actual) agrega un switch "Incluir extras en Disponible hoy" con ayuda: "Si lo activas, el dinero que recibes como extra también cuenta para gastar hoy."
3. En la pantalla de Inicio actual reemplaza el cálculo viejo de disponible_hoy por el nuevo, manteniendo el resto de la pantalla intacta. Si usedFallbackHorizon es true, muestra bajo la tarjeta un texto de ayuda: "Crea tu ingreso recurrente para un cálculo más preciso."
4. Elimina el cálculo viejo de disponible_mes/disponible_hoy y sus tests (la función calculateMonthSummary conserva el resto: totales, base/extra, dependencia). Actualiza tests afectados.
5. Agrega en src/features/summary/utils una función pura `explainAvailable(result): string[]` que devuelva 3 a 4 frases cortas en español explicando el número (saldo líquido, gastos comprometidos, días a tu pago, colchón extra). Con tests. Úsala en el texto de ayuda actual de la tarjeta.
6. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Inicio muestra el nuevo Disponible hoy y cambia al registrar un gasto o al activar el switch de extras.
```

✋ Prueba con datos reales: crea una regla de ingreso base quincenal y revisa que "días a tu pago" y el monto tienen sentido. 🔍 Si la fórmula no te convence, es el momento de ajustarla (edita `docs/DATA_MODEL.md` y se corrige la función).

---

# FASE R2: sistema de diseño v2

### R2.1: Fundamentos (tema, fuente, guardrails)

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (completo) y docs/ARCHITECTURE.md.

TAREA: Reemplaza los fundamentos del tema por los de docs/DESIGN_SYSTEM.md, sin romper la API actual de useTheme().

REQUISITOS:
1. Instala expo-font, expo-splash-screen y @expo-google-fonts/manrope. Carga Manrope (pesos 400, 500, 600 y 700) al iniciar y mantén el splash visible hasta que las fuentes estén listas.
2. src/theme: reescribe los tokens de color (oscuro y claro) EXACTAMENTE con los valores de la tabla del Anexo de diseño, más escalas de espaciado, radios, tipografía (con lineHeight), duraciones de animación y alturas de componentes. Mantén los nombres antiguos como alias deprecated para que las pantallas actuales sigan compilando (comenta cada alias con "deprecated: migrar a X").
3. Modo de tema: preferencia 'system' | 'dark' | 'light' en un store Zustand persistido, con valor por defecto 'dark'. useTheme() respeta la preferencia.
4. Helper `tint(color, opacity)` en src/theme para fondos suaves, con tests.
5. Test de contraste WCAG en src/theme/contrast.test.ts: implementa la fórmula de contraste y verifica en ambos modos que textPrimary y textSecondary sobre bg, surface y surfaceRaised; textMuted sobre bg y surface; onBrand sobre brand; income, expense y extra sobre surface, cumplen 4.5:1 como mínimo. Si algún par de la tabla falla, ajusta el color mínimamente (solo luminosidad), indícalo en tu respuesta con los valores finales, y actualiza el Anexo de docs/DESIGN_SYSTEM.md con ese cambio puntual.
6. Regla de ESLint (no-restricted-syntax o equivalente) que prohíba literales de color hexadecimal, rgb() y rgba() en cualquier archivo fuera de src/theme y de los tests. Corrige los incumplimientos existentes usando tokens; si alguno no tiene token equivalente, déjalo en una lista al final de tu respuesta en lugar de inventar uno.
7. Ajusta el ajuste de fuente: confirma que el escalado de texto del sistema (allowFontScaling) está activo por defecto en el componente Text.
8. Si Manrope no alinea bien las cifras con fontVariant ['tabular-nums'], repórtalo sin cambiar de fuente por tu cuenta.

CRITERIOS DE ACEPTACIÓN:
- La app arranca con la nueva fuente y el tema oscuro por defecto, sin errores. Calidad en verde, test de contraste pasando.
```

📸 Después de R2.1, abre la app y mándame una captura de Inicio: aún se verá parecida (los componentes no cambiaron), pero deben notarse la fuente y los colores nuevos.

### R2.2: Componentes base, parte 1

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (secciones "Componentes" y "Tipografía") y src/components/ui actual.

TAREA: Actualiza los componentes existentes al nuevo sistema SIN cambiar sus props públicas (compatibilidad hacia atrás).

COMPONENTES: Screen, Text, Button, Input, Card, Chip, SegmentedControl, MoneyText.

REQUISITOS:
1. Aplica EXACTAMENTE las especificaciones de docs/DESIGN_SYSTEM.md: alturas, radios, paddings, variantes, estados (pressed, disabled, loading, error, selected).
2. Text: agrega las variantes displayLg, display, title, subtitle, body, bodyStrong, caption y micro (mantén las antiguas como alias). Todos con allowFontScaling.
3. MoneyText: cifras tabulares, signo y color según el tipo (income, expense, neutral), prop `size` con las variantes de display, y formato "$ 87.500" con espacio no separable. Sin cambiar su prop actual.
4. Button: un solo estilo "primary" (marca) con texto onBrand; secondary, ghost y destructive; estado pressed con cambio de tono (sin sombras); haptics en onPress usando la utilidad que se creará en R2.4 (por ahora solo deja el punto de integración comentado).
5. SegmentedControl: forma de píldora según el Anexo, con animación del segmento activo (Reanimated, 150 ms) que respete reducir movimiento.
6. Crea el componente AppIcon en src/components/ui/AppIcon.tsx: único punto de acceso a Ionicons, solo variantes outline, tamaños 16/20/24, color por token. Prohíbe (con regla de lint) importar Ionicons directamente fuera de AppIcon.
7. Tests de render por componente (variantes y estados principales) y de MoneyText (signos, colores, tamaños).
8. Actualiza la pantalla temporal app/design-preview.tsx (vuelve a crearla si fue eliminada) mostrando todos los componentes en ambos temas, con un switch de tema arriba. Documenta que se eliminará en R4.5.

CRITERIOS DE ACEPTACIÓN:
- Las pantallas existentes siguen funcionando con los nuevos estilos. Calidad en verde.
```

🔍 Abre `design-preview` en modo oscuro y claro. Revisa que botones, chips, segmentado y cifras se vean prolijos y alineados.

### R2.3: Componentes nuevos, parte 1 (visualización)

```text
Lee AGENTS.md y docs/DESIGN_SYSTEM.md (sección "Componentes").

TAREA: Crea los componentes de visualización en src/components/ui.

COMPONENTES Y ESPECIFICACIÓN:
1. ListRow: círculo de ícono de 40 px con fondo tint(color, 0.16) e ícono del color de la categoría; título y subtítulo; elemento trailing; altura mínima 64; presionable con estado pressed; soporte para una Tag junto al título.
2. Tag: píldora pequeña (altura 20) con variantes 'extra' (ámbar suave), 'base' (marca suave), 'neutral' y 'pending'; texto micro.
3. ProgressBar: altura 6, radio completo, fondo surfaceRaised, relleno animado (200 ms) con color configurable y valor entre 0 y 1 (con clamp).
4. StackedBar: barra de 8 px de alto con segmentos proporcionales, separación de 2 px, radio completo y leyenda opcional; recibe segments: { value, color, label }[]; maneja total 0 mostrando solo el fondo.
5. Skeleton: bloque con animación de pulso suave (respeta reducir movimiento) y variantes de línea, círculo y tarjeta.
6. EmptyState v2: ícono grande en círculo suave, título, texto de una línea, y botón opcional. LoadingState y ErrorState actualizados al mismo estilo (el error con botón "Reintentar").
7. Snackbar: reestilizar al sistema (superficie elevada por tono, sin sombra), con acción (ej. "Deshacer") sin cambiar su API.
8. BottomSheet: implementa con react-native-reanimated y react-native-gesture-handler (ya incluidos en Expo) un componente propio: fondo con scrim, handle, cierre al deslizar o tocar fuera, altura por contenido con máximo del 85% de la pantalla, safe area inferior. No instales librerías externas de sheets.

REQUISITOS GENERALES:
- Todos tipados, con tokens del tema, accesibilidad (role, label) y áreas táctiles mínimas de 44.
- Tests de render de ProgressBar (clamp), StackedBar (proporciones, total 0), Tag y ListRow.
- Agrega cada componente a app/design-preview.tsx.

CRITERIOS DE ACEPTACIÓN:
- Todo se muestra correcto en la pantalla de preview en ambos temas. Calidad en verde.
```

### R2.4: Componentes nuevos, parte 2 (interacción)

```text
Lee AGENTS.md y docs/DESIGN_SYSTEM.md (secciones "Componentes", "Movimiento y haptics").

TAREA: Crea los componentes e utilidades de interacción.

REQUISITOS:
1. Instala expo-haptics. Crea src/lib/haptics.ts con: tap() (impacto ligero), select() (selección), success(), warning() y error() (notificaciones). Todas envueltas en try/catch y desactivables por un flag global. Integra tap() en Button y select() en Chip y SegmentedControl (los puntos que quedaron comentados).
2. NumericKeypad: teclado de 3 columnas x 4 filas (1-9, "000", 0, borrar), teclas de 52 px de alto con radio md, props { onDigit, onBackspace, onClear, disabled }; mantener presionado "borrar" ejecuta onClear; haptics select() en cada tecla; accesibilidad con label por tecla. Función pura `applyKey(current: string, key: string, maxDigits = 12): string` en utils (sin ceros a la izquierda; "000" respeta maxDigits) con tests.
3. AnimatedNumber: muestra un monto con conteo animado (300 a 600 ms) cuando cambia, usando Reanimated; si reducir movimiento está activo, cambia sin animar. Formatea con las funciones de src/lib/money.ts.
4. SwipeableRow: fila deslizable a la izquierda con una acción visible ("Eliminar", destructiva) usando react-native-gesture-handler; props { onDelete, children }; cierra al tocar otra fila; accesibilidad: acción alternativa por accessibilityActions.
5. MonthSelector: chevrones izquierda y derecha y etiqueta de mes (ej. "octubre 2026"); prop value (Date o 'YYYY-MM'), onChange; sin permitir ir a un mes futuro. Usa las funciones existentes de formato de mes.
6. ScreenHeader: título grande opcional, subtítulo, y slot derecho de acciones (íconos con área táctil de 44).
7. IconButton: botón circular de ícono con estado pressed y badge opcional (punto).
8. Agrega todo a app/design-preview.tsx.

CRITERIOS DE ACEPTACIÓN:
- Tests de applyKey y de los componentes en verde; preview funcional en el dispositivo.
```

🔍 En el preview prueba: teclado (haptics, mantener presionado borrar), deslizar la fila, cambiar de mes. 📸 Mándame una captura del preview completo en modo oscuro.

---

# FASE R3: navegación

### R3.1: Nueva barra de pestañas

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md (componente "Barra de pestañas") y docs/UX_SPEC.md (secciones "Navegación", "Planificar" y "Más").

TAREA: Reemplaza la navegación por la nueva estructura.

REQUISITOS:
1. Barra de pestañas personalizada (custom tabBar de Expo Router) con 5 elementos en este orden: Inicio, Movimientos, botón (+) central, Planificar, Más. El (+) NO es una pestaña: abre el modal transaction-form. Especificación visual del Anexo A (alto 64 más safe area, botón central de 52 px elevado por posición, no por sombra, etiqueta micro, estado activo con color de marca y ícono relleno/contorno según el diseño).
2. Elimina los botones flotantes (Fab) de Inicio y Movimientos, y el componente Fab si queda sin uso.
3. Crea la pestaña Planificar (app/(tabs)/plan.tsx) según UX_SPEC: por ahora con dos filas: "Pagos e ingresos recurrentes" (navega a /recurring) y "Análisis" (deshabilitada hasta R5.2; no la muestres si la ruta aún no existe).
4. Crea la pestaña Más (app/(tabs)/more.tsx) según UX_SPEC con grupos: Organización (Cuentas, Categorías), Preferencias (Apariencia, Incluir extras en Disponible hoy, Bloqueo biométrico, Recordatorios de pagos), Cuenta (Cerrar sesión) y pie con la versión de la app. Mueve ahí toda la funcionalidad que hoy vive en Ajustes (los switches y selectores existentes con su lógica) y elimina la pestaña Ajustes.
5. Apariencia: selector Sistema | Oscuro | Claro conectado al store de tema de R2.1.
6. Mantén las protecciones de ruta, el bloqueo biométrico y los efectos globales (recurrentes, recordatorios) funcionando sin cambios.
7. Los hijos (accounts, categories, recurring y sus formularios) siguen como rutas del Stack raíz con encabezado propio estilizado con ScreenHeader (botón atrás de 44 px).
8. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Navegación completa funcional: el (+) abre el modal, Planificar y Más muestran sus secciones, y no queda rastro de la pestaña Ajustes.
```

📸 Mándame capturas de la barra en Inicio, Planificar y Más.

---

# FASE R4: pantallas rediseñadas

### R4.1: Inicio

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Inicio", completa).

TAREA: Rediseña la pestaña Inicio EXACTAMENTE según docs/UX_SPEC.md. No cambies la lógica de datos ya existente: usa los hooks actuales (useAvailableToday, useMonthSummary, cuentas, últimos movimientos).

REQUISITOS:
1. Estructura y orden según el Anexo B: encabezado (saludo + MonthSelector + acción de análisis si la ruta existe), tarjeta héroe "Disponible hoy", tarjeta "Este mes" con barras apiladas base/extra de ingresos y gastos, cuentas en fila horizontal, últimos 5 movimientos con ListRow y enlace "Ver todos".
2. Tarjeta héroe: AnimatedNumber con remainingToday, ProgressBar de gasto de hoy sobre allowanceToday, pie con "Gastaste X de Y" y "N días a tu pago" (o "N días para fin de mes" si usedFallbackHorizon), fila de colchón extra si extraCushion > 0 con Tag extra, y el ícono de ayuda que abre un BottomSheet con explainAvailable() y el desglose numérico (saldo líquido, comprometido, colchón, días).
3. Estado "sin margen": si availableBase <= 0, el número se muestra en el color expense con el texto "Sin margen hoy" y una línea de ayuda según UX_SPEC.
4. Estados de carga con Skeleton con la misma forma de cada bloque, vacío (primer uso, según UX_SPEC) y error con reintento. Pull-to-refresh.
5. Todo con tokens y componentes del sistema de diseño; cero valores de estilo sueltos. Textos en src/i18n/es.ts.
6. Accesibilidad: el monto héroe tiene accessibilityLabel completo ("Disponible hoy: 87.500 pesos, de 108.500 pesos").
7. Tests de las funciones puras de presentación que crees (ej. cálculo de proporciones, textos).

CRITERIOS DE ACEPTACIÓN:
- La pantalla coincide con la jerarquía del Anexo B y funciona con datos reales, en ambos temas.
```

📸 Captura de Inicio con datos reales en modo oscuro y claro, y con una cuenta nueva (estado vacío).

### R4.2: Registro rápido

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Registro rápido", completa).

TAREA: Rediseña app/transaction-form.tsx para el alta rápida, manteniendo todas las reglas de validación y la capa de datos actual (esquema zod discriminado, hooks, invalidaciones).

REQUISITOS (modo NUEVO):
1. Estructura vertical según el Anexo B: encabezado ("Cancelar" y título), SegmentedControl Gasto | Ingreso | Transferencia, monto con displayLg (estado vacío "$ 0" atenuado), fila de chips (Cuenta, Fecha, Base/Extra, Nota), texto guía "Toca una categoría para guardar", cuadrícula de categorías y NumericKeypad al pie.
2. El monto se controla con NumericKeypad y applyKey; máximo 12 dígitos; se muestra formateado.
3. Cuadrícula de categorías: 3 columnas, 5 categorías + mosaico "Más". Orden: las 5 más usadas en los últimos 60 días (función pura `rankCategoriesByUsage(transactions, categories, today)` con tests; si hay menos de 5 con uso, completar por sort_order). "Más" abre un BottomSheet con CategoryPicker completo (con subcategorías).
4. Al tocar una categoría: si el monto es 0, haptics error() y una animación breve de sacudida del monto sin guardar; si es válido, guarda de inmediato, haptics success(), cierra el modal y muestra un Snackbar "Guardado" con acción "Deshacer" (que elimina el movimiento creado).
5. Chips: Cuenta abre BottomSheet con la lista de cuentas (por defecto la última usada, ya persistida); Fecha abre BottomSheet con Hoy, Ayer y "Elegir fecha" (instala @react-native-community/datetimepicker con expo install); Base/Extra es un par de chips excluyentes (por defecto Base, no se recuerda); Nota expande un campo de texto de una línea sobre el teclado.
6. Transferencia: se ocultan categoría y Base/Extra; aparecen chips "Desde" y "Hacia" y un Button primary "Guardar transferencia" en lugar de la cuadrícula. Valida cuentas distintas con mensaje en línea.
7. Modo EDICIÓN (con id): mismo lenguaje visual, con los datos cargados, la categoría seleccionada resaltada, un Button primary "Guardar cambios" y un Button destructive "Eliminar" con confirmación. En edición, tocar una categoría solo la selecciona (no guarda).
8. El modal respeta teclado y safe areas; el teclado numérico propio reemplaza al del sistema (el input de monto no abre teclado nativo). Si el usuario cambia de tipo con monto escrito, se conserva el monto.
9. Textos en src/i18n/es.ts. Tests de las funciones puras.

CRITERIOS DE ACEPTACIÓN:
- Registrar un gasto base con valores recordados toma 3 toques o menos: dígitos, categoría, listo.
```

📸 Captura del modal en las tres variantes (gasto, ingreso, transferencia) y en modo edición. ✋ Mide a mano cuántos toques toma registrar un gasto.

### R4.3: Movimientos

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Movimientos", completa).

TAREA: Rediseña la pestaña Movimientos según el Anexo B, conservando paginación, filtros y datos actuales.

REQUISITOS:
1. Encabezado: título, MonthSelector, IconButtons de búsqueda y filtros (con badge cuando hay filtros activos).
2. Franja resumen con Ingresos, Gastos y Balance del mes (balance coloreado según signo).
3. SectionList con encabezados de día pegajosos ("Hoy", "Ayer" o "mar 7 oct", total del día a la derecha) y filas con ListRow según el Anexo: ícono y color de categoría, título (nota o nombre de categoría), subtítulo "Categoría · Cuenta", monto con signo y color, Tag "Extra" y marcador de recurrente (AppIcon) cuando aplique. Las transferencias con ícono propio y color neutro.
4. Eliminar: SwipeableRow con acción visible "Eliminar" (reemplaza el mantener presionado). Tras eliminar, Snackbar "Movimiento eliminado" con "Deshacer" (reinserta). Tocar la fila abre la edición.
5. Búsqueda: al tocar el ícono, el encabezado se transforma en un campo de búsqueda con botón de cerrar.
6. Filtros: BottomSheet restilizado con los filtros actuales (cuenta, categoría, tipo, naturaleza) y botones "Limpiar" y "Aplicar".
7. Estados: Skeleton de filas, vacío con CTA "Agregar movimiento" que abre el modal, vacío por filtros ("Nada con estos filtros" con botón "Limpiar filtros"), error con reintento. Pull-to-refresh y paginación infinita sin saltos.
8. Rendimiento: filas memoizadas con keys estables, getItemLayout o equivalente si es viable. Verifica con 300 movimientos de prueba (script de seed solo local, no versionado).
9. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- La lista es fluida, eliminar con deslizar funciona con deshacer, y los filtros combinados se comportan igual que antes.
```

📸 Captura de la lista con datos, con el menú de filtros abierto y con una fila deslizada.

### R4.4: Autenticación y estados con personalidad

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (secciones "Autenticación" y "Estados y microcopy").

TAREA: Rediseña las pantallas de login, registro y recuperar contraseña, y unifica los estados vacíos y de error de toda la app.

REQUISITOS:
1. Auth: encabezado con marca (wordmark tipográfico "Finanzas" con la fuente del sistema de diseño, sin imágenes), título y subtítulo cortos, formulario con Input v2 (altura 52, label flotante o superior según el Anexo), Button primary de ancho completo, enlaces secundarios en ghost. Mantén la lógica (react-hook-form + zod, errores traducidos). Teclado: el formulario no queda tapado y el botón siempre visible.
2. Mostrar/ocultar contraseña con IconButton.
3. Revisa TODAS las pantallas y reemplaza estados vacíos, de carga y de error por los componentes v2 con el microcopy de docs/UX_SPEC.md (una pantalla a la vez; lista al final de tu respuesta cuáles tocaste).
4. Textos en src/i18n/es.ts, con el tono del Anexo ("tú", frases cortas, sin "por favor" ni signos de exclamación en el sistema).

CRITERIOS DE ACEPTACIÓN:
- Ninguna pantalla conserva un estado vacío o de error con el estilo antiguo.
```

📸 Captura de login, registro y un estado vacío cualquiera.

### R4.5: Pulido de interacción y accesibilidad

```text
Lee AGENTS.md y docs/DESIGN_SYSTEM.md (secciones "Movimiento y haptics" y "Accesibilidad").

TAREA: Pulido final de la interacción. Haz SOLO lo listado.

REQUISITOS:
1. Haptics: verifica que están integrados en: guardar movimiento (success), error de validación (error), eliminar (warning), cambio de segmento y chips (select), teclas (select), botón (+) (tap). Agrega los que falten, no más.
2. Animaciones: transiciones suaves de entrada de las tarjetas de Inicio (fade con desplazamiento de 8 px, 220 ms, escalonado de 40 ms) y de las filas nuevas en Movimientos. TODAS deben respetar "reducir movimiento" del sistema (desactívalas, no las acortes).
3. Accesibilidad: recorre todas las pantallas y verifica accessibilityLabel y role en elementos táctiles, orden de lectura lógico, áreas táctiles de 44 mínimo (hitSlop donde haga falta), y que nada dependa solo del color (los montos llevan signo, las Tags llevan texto). Corrige lo que falte.
4. Elimina app/design-preview.tsx, el código muerto, los alias deprecated del tema que ya no se usen, y cualquier hex o estilo suelto detectado por la regla de lint.
5. Lista al final los alias deprecated que aún se usan y dónde.

CRITERIOS DE ACEPTACIÓN:
- Calidad en verde sin warnings nuevos; la app se siente consistente en las 4 pestañas principales.
```

🔍 Recorre toda la app en modo oscuro y claro, con letra grande del sistema activada y con "reducir movimiento". 📸 **Mándame 4 capturas (Inicio, Movimientos, Registro rápido, Planificar) para una revisión de diseño completa antes de seguir.** Si algo no me convence, lo ajustamos aquí antes de agregar más funciones.

---

# FASE R5: funcionalidad nueva

### R5.1: Presupuestos

```text
Lee AGENTS.md, docs/DATA_MODEL.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Presupuestos").

TAREA: Implementa presupuestos mensuales por categoría de gasto.

REGLAS DE NEGOCIO:
- Un presupuesto es un monto mensual recurrente asociado a UNA categoría principal de gasto (parent_id nulo). El gasto de sus subcategorías se acumula en el de la madre.
- Un solo presupuesto por categoría y usuario. Solo cuentan gastos publicados (no transferencias).
- Estado: 'ok' (menos de 85%), 'near' (85% a 100%) y 'over' (más de 100%). En la UI: ok = marca, near = expense con opacidad 0.65, over = expense. Nunca ámbar.

REQUISITOS:
1. Migración supabase/migrations/006_budgets.sql: tabla budgets (id, user_id con default auth.uid() y referencia a auth.users on delete cascade, category_id referencia categories on delete cascade, amount bigint > 0, is_active default true, created_at, updated_at, unique (user_id, category_id)), trigger updated_at, índices, RLS con políticas separadas por operación para authenticated, y WITH CHECK que verifique con EXISTS que category_id pertenece al usuario, es de tipo 'expense' y tiene parent_id nulo.
2. Actualiza src/types/database.ts y extiende supabase/tests/002_rls_test.sql para cubrir budgets (acceso cruzado entre dos usuarios y categoría ajena).
3. Capa de datos en src/features/budgets: api (listar, crear, editar, eliminar), hooks con invalidación, y función pura `calculateBudgetProgress(budgets, categories, transactions)` que devuelva por presupuesto { spent, remaining, ratio, status } y los totales. Tests exhaustivos (subcategorías acumulan, transferencias ignoradas, ratio mayor a 1, presupuesto sin gasto, categoría archivada).
4. Pantalla app/budgets.tsx (enlazada desde Planificar con una tarjeta resumen que muestre total gastado de total presupuestado con ProgressBar): MonthSelector, lista de presupuestos con ListRow, ProgressBar y texto "$ gastado de $ presupuesto" más "te quedan $ X" o "te pasaste $ X". Botón para agregar.
5. Crear y editar en BottomSheet: selector de categoría principal de gasto sin presupuesto, monto con NumericKeypad, botón "Guardar" y, al editar, "Eliminar". Estados de carga, vacío (invitación: "Ponle un tope a lo que más gastas") y error.
6. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Un gasto en una subcategoría actualiza el progreso de su categoría madre, y los colores cambian en los umbrales.
```

✋ Ejecuta `006_budgets.sql` y luego el script de RLS actualizado en Supabase con dos usuarios. 🔍 No avances si algún usuario ve presupuestos del otro. 📸 Captura de Planificar con presupuestos y de la pantalla de presupuestos.

### R5.2: Análisis

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Análisis").

TAREA: Implementa la pantalla de análisis con gráficos propios.

REQUISITOS:
1. Instala react-native-svg con expo install. NO instales librerías de gráficos: los componentes son propios.
2. Funciones puras en src/features/analysis/utils, con tests exhaustivos: `spendingByCategory(transactions, categories, { topN: 6 })` (agrupa subcategorías en su madre y el resto en "Otros"; devuelve monto y porcentaje), `monthlyTrend(transactions, endMonth, months = 6)` (ingresos, gastos, base y extra por mes), `extraShareByMonth(...)` y `buildInsights(data): string[]` (2 a 3 frases cortas en español, basadas en reglas, p. ej. variación del gasto contra el mes anterior, categoría que más pesa, dependencia de extras; sin comparar si no hay datos suficientes).
3. Componentes en src/components/charts: DonutChart (con monto central y leyenda), GroupedBarChart (barras de ingresos y gastos por mes) y reutiliza StackedBar. Colores solo de tokens (income, expense, extra, brand y la paleta de categorías). Accesibles: cada gráfico con accessibilityLabel que resume los datos y una tabla de datos alternativa en texto bajo cada gráfico.
4. Capa de datos: la consulta de 6 meses debe paginar internamente (bloques de hasta 1000 filas) para no truncar; con test de la lógica de paginación si es pura.
5. Pantalla app/analysis.tsx: MonthSelector; SegmentedControl Gastos | Ingresos con DonutChart y lista de categorías con monto y porcentaje; sección "Últimos 6 meses" con GroupedBarChart; sección "Base y extras" con porcentaje de extras por mes; bloque de insights al inicio. Enlázala desde Planificar y desde el encabezado de Inicio.
6. Estados de carga (Skeleton), vacío ("Registra movimientos para ver tu análisis") y error.
7. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- Los totales del análisis coinciden con los de Movimientos para el mismo mes.
```

📸 Captura completa de la pantalla de análisis (modo oscuro).

### R5.3: Registro sin conexión, infraestructura

```text
Lee AGENTS.md, docs/ARCHITECTURE.md y src/lib/queryClient.ts. Consulta la documentación vigente de TanStack Query sobre persistencia y mutaciones offline antes de implementar.

TAREA: Habilita la creación de movimientos sin conexión (SOLO creación; editar y eliminar siguen requiriendo conexión). Implementa la infraestructura, sin UI nueva.

REQUISITOS:
1. Instala @tanstack/react-query-persist-client, @tanstack/query-async-storage-persister, @react-native-community/netinfo y expo-crypto (con expo install las de Expo).
2. Conecta onlineManager de TanStack Query con NetInfo. Reemplaza el provider por PersistQueryClientProvider con persistencia en AsyncStorage, gcTime y maxAge de 7 días, y persistencia de las mutaciones pendientes. Haz dehydrate solo de las mutaciones de creación de movimientos y de las queries de lectura que ya existen. Nunca persistas tokens (la sesión sigue en su storage actual).
3. Identificadores en el cliente: createTransaction genera el id con expo-crypto (randomUUID) y lo envía en el insert. La mutación es idempotente: ante conflicto de id (reintento tras un corte), se trata como éxito.
4. Registra con queryClient.setMutationDefaults(['transactions', 'create'], ...) la mutationFn y el networkMode 'offlineFirst', para que las mutaciones restauradas tras reiniciar la app se puedan reanudar. Llama a resumePausedMutations al iniciar con sesión y cuando vuelva la conexión. Al terminar cada mutación, invalida transactions, accounts y summary.
5. Función pura `classifyMutationError(error): 'network' | 'server' | 'validation'` con tests (red caída, 4xx, 5xx, violación de constraint).
6. Documenta en docs/ARCHITECTURE.md el diseño y sus límites (solo creaciones; límite de antigüedad de 7 días; qué pasa al cerrar sesión: se limpia la cola).
7. Al cerrar sesión se debe limpiar el caché persistido y las mutaciones pendientes (probar en test o dejar el punto de integración claro y comentado).
8. Si algo de esta tarea te resulta ambiguo o chocan versiones, detente y repórtalo en lugar de improvisar.

CRITERIOS DE ACEPTACIÓN:
- Con el modo avión, crear un movimiento no falla; al volver la conexión se sincroniza una sola vez y sin duplicados, incluso si cierras y reabres la app en medio.
```

✋ Pruébalo a mano: modo avión, crea 2 gastos, reinicia la app, quita el modo avión y verifica en Supabase que llegaron 2 filas (no 4).

### R5.4: Registro sin conexión, experiencia de usuario

```text
Lee AGENTS.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (sección "Sin conexión").

TAREA: Haz visible el estado de conexión y la cola de pendientes.

REQUISITOS:
1. Hook `useConnectivity()` que exponga si hay conexión.
2. Componente ConnectivityPill (ya especificado en UX_SPEC): píldora discreta bajo el encabezado en Inicio y Movimientos con "Sin conexión" y, si hay pendientes, "Sin conexión · N por sincronizar". Al volver la conexión con pendientes: "Sincronizando…" y luego desaparece.
3. Usa useMutationState (filtro por mutationKey ['transactions','create']) para obtener los movimientos pendientes y mostrarlos en la lista de Movimientos como filas con Tag "Sin sincronizar" al inicio del día correspondiente. No manipules a mano el caché de la lista.
4. Errores no transitorios (classifyMutationError distinto de 'network'): la fila pasa a estado de error con Tag "No se guardó" y acciones "Reintentar" y "Descartar" (BottomSheet al tocarla). Descartar elimina la mutación de la cola.
5. El modal de registro rápido, estando sin conexión, guarda y cierra de inmediato (no espera la red) con Snackbar "Guardado. Se sincronizará cuando haya conexión."
6. Editar o eliminar sin conexión: bloquea la acción con Snackbar "Necesitas conexión para esto."
7. Los saldos y totales no cambian hasta sincronizar; en Inicio, si hay pendientes, muestra bajo la tarjeta héroe el texto "Hay N movimientos sin sincronizar; tus saldos se actualizarán al conectarte."
8. Textos en src/i18n/es.ts. Tests de las funciones puras de presentación.

CRITERIOS DE ACEPTACIÓN:
- Todos los estados (sin conexión, con pendientes, sincronizando, error) se ven y se comportan según UX_SPEC.
```

📸 Captura de Movimientos con una fila pendiente y la píldora de conexión.

### R5.5: Recurrentes con confirmación

```text
Lee AGENTS.md, docs/DATA_MODEL.md, docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md (secciones "Recurrentes" e "Inicio").

TAREA: Agrega el modo "pedir confirmación" a las reglas recurrentes, para gastos de monto variable (servicios).

REGLAS DE NEGOCIO:
- recurring_rules.confirmation_mode: 'auto' (genera el movimiento publicado, como hoy) o 'confirm' (genera un movimiento con status 'pending' que el usuario confirma o descarta).
- Un movimiento 'pending' NO cuenta en saldos, totales, presupuestos ni análisis. SÍ cuenta como gasto comprometido en "Disponible hoy" (pendingExpenses).

REQUISITOS:
1. Migración supabase/migrations/007_pending_transactions.sql: crea el enum transaction_status ('posted','pending'); agrega transactions.status not null default 'posted'; agrega recurring_rules.confirmation_mode ('auto','confirm') not null default 'auto'; recrea la vista account_balances para sumar SOLO movimientos 'posted' (conservando security_invoker = true y el orden de columnas); ajusta el índice si hace falta. No toques las migraciones anteriores.
2. Actualiza src/types/database.ts y los esquemas zod. AUDITA TODAS las consultas y funciones que agregan movimientos (lista, resumen, presupuestos, análisis, exportación futura) y asegúrate de filtrar status = 'posted'; lista al final de tu respuesta cada lugar revisado. Agrega tests que demuestren que un pending no altera ningún total.
3. generateDueTransactions: para reglas 'confirm' inserta con status 'pending' (siempre idempotente con el índice único); las 'auto' no cambian.
4. Formulario de reglas: switch "Pedir confirmación cada vez" con ayuda "Úsalo para pagos que cambian de monto, como los servicios." Se muestra solo en reglas de gasto.
5. Inicio: si hay pendientes, banner bajo la tarjeta héroe: "N pagos por confirmar". Al tocarlo, BottomSheet con la lista; cada ítem permite editar el monto (NumericKeypad) y "Confirmar" (pasa a posted con el monto indicado) o "Descartar" (elimina). Movimientos muestra los pendientes en una sección "Por confirmar" al inicio, con Tag 'pending'.
6. Conecta pendingExpenses en useAvailableToday con la suma de gastos pendientes.
7. Textos en src/i18n/es.ts. Tests de generación (reglas auto y confirm) y de la confirmación.

CRITERIOS DE ACEPTACIÓN:
- Una regla de servicios con confirmación genera un pendiente que no altera saldos hasta confirmarlo, y su monto sí reduce el Disponible hoy mientras está pendiente.
```

✋ Ejecuta `007_pending_transactions.sql`, luego el script de RLS. 🔍 Compara el saldo de tus cuentas antes y después de la migración: deben ser idénticos.

### R5.6: Exportar movimientos a CSV

```text
Lee AGENTS.md y docs/ARCHITECTURE.md. Consulta la documentación vigente de expo-file-system y expo-sharing para la versión de Expo instalada (sus APIs han cambiado entre versiones).

TAREA: Permite exportar los movimientos a un archivo CSV.

REQUISITOS:
1. Instala expo-file-system y expo-sharing con expo install.
2. Función pura `transactionsToCsv(rows): string` en src/features/transactions/utils con tests exhaustivos. Columnas: fecha, tipo, naturaleza, categoría, subcategoría, cuenta, cuenta_destino, monto, nota, recurrente (sí/no). Separador punto y coma (el estándar de Excel en español), BOM UTF-8 al inicio, escape correcto de comillas, saltos de línea y separadores dentro de las notas, monto como entero sin formato, fecha YYYY-MM-DD. Solo movimientos publicados.
3. En Más, grupo "Datos": fila "Exportar movimientos" que abre un BottomSheet con rango (Este mes, Este año, Todo), botón "Exportar" y estado de progreso.
4. La consulta pagina internamente en bloques de 1000 para no truncar. Genera el archivo en el directorio de caché y abre la hoja de compartir del sistema. Elimina el archivo temporal después.
5. Estados: sin datos en el rango ("No hay movimientos en este rango"), error con reintento.
6. Textos en src/i18n/es.ts.

CRITERIOS DE ACEPTACIÓN:
- El archivo exportado abre en Excel y en Google Sheets con las columnas, tildes y montos correctos.
```

---

# FASE R6: antes de publicar

### R6.1: Eliminar cuenta dentro de la app

```text
Lee AGENTS.md, docs/ARCHITECTURE.md y docs/DATA_MODEL.md.

CONTEXTO: Las tiendas de apps exigen poder eliminar la cuenta y sus datos desde la propia app. Borrar un usuario de Supabase Auth requiere privilegios de servidor: NUNCA se hace desde la app ni con la service_role key en el cliente.

TAREA: Implementa la eliminación de cuenta con una Edge Function de Supabase.

REQUISITOS:
1. Crea supabase/functions/delete-account/index.ts (Deno): valida el JWT del encabezado Authorization creando un cliente con ese token y llamando a auth.getUser(); si es inválido responde 401. Con un cliente administrador (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del entorno de la función, que Supabase inyecta automáticamente) llama a auth.admin.deleteUser(user.id). Responde JSON con éxito o error. Sin logs de datos personales. Las filas del usuario se eliminan por las llaves foráneas on delete cascade (verifica en las migraciones que todas las tablas lo tienen; si alguna no, repórtalo).
2. Crea supabase/functions/README.md con las instrucciones exactas de despliegue (Supabase CLI: login, link al proyecto y deploy) y la alternativa de pegar el código en el editor de Edge Functions del panel.
3. En la app, Más > Cuenta > "Eliminar cuenta" (destructiva) abre app/delete-account.tsx: explica en 3 líneas qué se borra y que es irreversible, ofrece el enlace "Exportar mis datos primero" (a R5.6), pide escribir la palabra ELIMINAR para habilitar el botón destructivo, llama a supabase.functions.invoke('delete-account') y, si responde bien, limpia TODO el estado local (sesión, caché persistido y cola de mutaciones de R5.3, stores de Zustand, flags de SecureStore como la biometría, notificaciones programadas) y lleva a login con un mensaje "Tu cuenta se eliminó".
4. Manejo de errores: sin conexión ("Necesitas conexión para eliminar tu cuenta") y fallo del servidor (mensaje claro y reintentar). No cierres sesión si la eliminación falló.
5. Textos en src/i18n/es.ts. Tests de la función pura que valida la palabra de confirmación y de la limpieza de estado (con mocks).
6. Actualiza docs/SECURITY_REVIEW.md: documenta que la service_role key solo existe en el entorno de la Edge Function.

CRITERIOS DE ACEPTACIÓN:
- No hay ninguna referencia a la service_role key en el código de la app. El flujo completo funciona contra el proyecto real con un usuario de prueba.
```

✋ Despliega la función siguiendo `supabase/functions/README.md` y pruébala con un usuario de prueba (verifica en Supabase que desaparecen el usuario y sus filas). Google Play además pide una **URL pública** donde se explique cómo borrar la cuenta; la preparamos junto con la política de privacidad en P10.1.

### R6.2: Enlaces profundos (confirmar correo y recuperar contraseña)

```text
Lee AGENTS.md, docs/ARCHITECTURE.md y src/features/auth. Consulta la documentación oficial vigente de Supabase para autenticación con enlaces profundos en Expo y la de Expo Router sobre deep links.

PROBLEMA A RESOLVER: Hoy "olvidé mi contraseña" y la confirmación de correo dependen de enlaces que en el celular no abren la app, y un enlace de recuperación crea una sesión que el guardia de rutas redirige al inicio ANTES de que el usuario cambie su contraseña.

TAREA: Implementa el flujo completo.

REQUISITOS:
1. Configura en app.json un `scheme` propio (pregúntame el valor antes; propón "finanzasapp"). Instala expo-linking si falta.
2. Configura el cliente de Supabase para el flujo recomendado por la documentación vigente (PKCE si está soportado) y maneja el enlace entrante: parsea la URL, intercambia el código o tokens por sesión y distingue el tipo (recuperación de contraseña o confirmación de correo).
3. Almacén de estado `isRecoverySession` (en memoria, no persistido): cuando el enlace es de recuperación, se activa, y el guardia de rutas NO redirige a las pestañas; en su lugar muestra app/(auth)/reset-password.tsx: nueva contraseña y confirmación (validación zod, mínimo 8), botón "Guardar contraseña" que llama a supabase.auth.updateUser, desactiva la bandera, y entra a la app con un Snackbar "Contraseña actualizada".
4. Confirmación de correo: tras registrarse (si Supabase exige confirmación), pantalla "Revisa tu correo" con el correo, botón "Reenviar correo" (con enfriamiento de 60 s) y volver a login. Al abrir el enlace de confirmación, inicia sesión y entra a la app.
5. Enlace inválido o vencido: pantalla con mensaje claro y botón para pedir uno nuevo.
6. Funciona en desarrollo con Expo Go usando Linking.createURL y documenta la limitación (el scheme propio solo funciona completo en development build o app compilada).
7. Textos en src/i18n/es.ts. Tests de la función pura que parsea y clasifica URLs entrantes (válidas, vencidas, mal formadas, de otro tipo).
8. Documenta en docs/ARCHITECTURE.md el flujo y las URLs que deben permitirse en Supabase.

CRITERIOS DE ACEPTACIÓN:
- Desde el correo de recuperación, el enlace abre la app en la pantalla de nueva contraseña, y tras guardarla el usuario entra sin ser redirigido antes de tiempo.
```

✋ En Supabase (Authentication > URL Configuration) agrega a las Redirect URLs el patrón del scheme (por ejemplo `finanzasapp://**`) y el de desarrollo de Expo (`exp://**`). Después, reactiva "Confirm email". Prueba los dos flujos con un correo real, de preferencia en un development build.

### R6.3: Seguridad y dependencias

```text
Lee AGENTS.md, docs/SECURITY_REVIEW.md y supabase/tests/002_rls_test.sql.

TAREA: Auditoría de seguridad y dependencias posterior a los cambios. No agregues funcionalidades.

REQUISITOS:
1. Extiende supabase/tests/002_rls_test.sql (o crea 003_rls_test_v2.sql) para cubrir: budgets, transactions.status, recurring_rules.confirmation_mode, account_balances con counts_as_liquid, y el acceso cruzado entre dos usuarios en cada tabla. Debe ser ejecutable en el SQL Editor y reportar PASS/FAIL por caso.
2. Revisa que no existan secretos en el código ni en el historial reciente (service_role, tokens). Confirma que la Edge Function es el único lugar con privilegios elevados.
3. Revisa que ningún log, Snackbar o mensaje de error exponga datos financieros, tokens o correos. Revisa que el caché persistido (R5.3) no contenga tokens.
4. Dependencias: ejecuta `npm.cmd audit --omit=dev` y `npm.cmd audit`; clasifica los hallazgos en "afectan a producción" y "solo desarrollo". Ejecuta `npx.cmd expo-doctor` y `npx.cmd expo install --check`. Aplica SOLO las correcciones compatibles con el SDK instalado (con `npx.cmd expo install --fix`); lista las demás con su riesgo, sin forzar actualizaciones rompedoras.
5. Actualiza docs/SECURITY_REVIEW.md con hallazgos, correcciones y pendientes.

CRITERIOS DE ACEPTACIÓN:
- Reporte actualizado y calidad en verde tras las correcciones.
```

✋ Ejecuta el script de RLS actualizado con dos usuarios reales. 🔍 No avances si algo falla.

### R6.4: Checklist de QA y cierre

```text
Lee AGENTS.md, docs/APP_GUIDE.md, docs/UX_SPEC.md y docs/PROGRESS.md.

TAREA: Prepara el cierre del rediseño. No agregues funcionalidades.

REQUISITOS:
1. Crea docs/QA_CHECKLIST.md: lista manual de casos de prueba (mínimo 60), agrupada por: autenticación y recuperación, cuentas, categorías, registro rápido (todas las variantes), movimientos (filtros, deslizar, deshacer), recurrentes (auto y confirmación), Disponible hoy (casos de fórmula con números de ejemplo y resultado esperado), presupuestos, análisis, sin conexión, exportar, eliminar cuenta, temas claro y oscuro, letra grande, reducir movimiento y bloqueo biométrico. Cada caso con pasos y resultado esperado, en formato de casilla.
2. Actualiza docs/APP_GUIDE.md completo para reflejar el estado actual (nueva fórmula, nuevas tablas y migraciones 005 a 007, nueva navegación, sistema de diseño v2, funciones nuevas, reglas de trabajo con el agente ciego y la lista "Para revisar visualmente"). Conserva su estructura y actualiza la tabla de historial con los prompts R.
3. Verifica que docs/DESIGN_SYSTEM.md y docs/UX_SPEC.md coinciden con lo implementado; si encuentras diferencias, NO modifiques los documentos: lístalas al final de tu respuesta para que yo decida.
4. Elimina código muerto, archivos sin uso, dependencias instaladas que ya no se usen (lista cuáles y pide confirmación antes de desinstalar) y comentarios TODO resueltos.

CRITERIOS DE ACEPTACIÓN:
- Checklist completo, guía actualizada y lista de discrepancias entregada.
```

✋ Ejecuta tú la checklist completa en un dispositivo real. 📸 Mándame capturas finales y hacemos la última revisión de diseño. Después: une `feat/redesign` a `main` y ejecuta **P10.1** de la guía anterior.

---

# ANEXO A: contenido de `docs/DESIGN_SYSTEM.md`

> Copia TODO lo que está dentro del siguiente bloque a `docs/DESIGN_SYSTEM.md`, sin cambios.

````markdown
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
````

---

# ANEXO B: contenido de `docs/UX_SPEC.md`

> Copia TODO lo que está dentro del siguiente bloque a `docs/UX_SPEC.md`, sin cambios.

````markdown
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
````
