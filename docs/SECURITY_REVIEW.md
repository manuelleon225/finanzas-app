# Revisión de seguridad (Fase 9 — P9.2)

Fecha: 2026-10-05. Alcance: auditoría sin agregar funcionalidades.

## 1. Secretos en código e historial

- **Estado: ✅ PASA**
- No hay claves ni tokens en `src/`, `app/` ni archivos de configuración.
- La anon/publishable key y la Project URL solo viven en `.env` (no versionado).
- Búsqueda en todo el historial de git (`-S 'sb_publishable_…'`): **sin coincidencias**.
- Únicas menciones a `service_role` están en documentación instruccional (nunca se usa en la app).
- El `project-id` que aparece en `docs/PROGRESS.md` (para regenerar tipos) es un identificador
  público incluido en la URL del proyecto, no un secreto.

## 2. `.env` vs `.env.example`

- **Estado: ✅ PASA**
- `.env` está en `.gitignore` (`git check-ignore .env` → ignorado).
- Solo `.env.example` está versionado (`git ls-files` lo confirma), con valores vacíos.
- `.env` local sí contiene la clave publishable (de desarrollo).

## 3. Row Level Security

- **Estado: ✅ PASA (código); ⏳ pendiente de prueba en vivo**
- Las 5 tablas (profiles, accounts, categories, transactions, recurring_rules) tienen
  `enable row level security`.
- 21 políticas, **todas** concedidas solo al rol `authenticated`; **ninguna** para `anon`.
- Las políticas de escritura verifican que `account_id`, `transfer_account_id`, `category_id` y
  `parent_id` pertenezcan al mismo usuario.
- Script de prueba con dos usuarios: `supabase/tests/002_rls_test.sql` (se ejecuta en el SQL Editor;
  emite avisos OK/esperado). **Pendiente:** ejecutarlo en Supabase y confirmar la salida.

## 4. Registro de datos financieros o tokens

- **Estado: ✅ PASA**
- No hay `console.log`/`console.warn`/`console.error` en `app/` ni `src/`.
- El cliente de Supabase configura `autoRefreshToken` y persiste la sesión en SecureStore/AsyncStorage;
  no se imprime el token en ningún punto.
- No se registran montos ni datos financieros en logs.

## 5. `npm audit`

- **Estado: ⚠️ REVISAR antes de publicar**
- Resultado: **66** vulnerabilidades (**16** moderadas, **50** altas, **0** críticas).
- Casi todas están en **dependencias de desarrollo/build** (jest, micromatch/`braces`, `@expo/*`
  config-plugins/metro-file-map, `xcode`→`uuid`), no en el bundle de producción.
- `npm audit fix --force` corregiría algunas pero con **cambios que rompen** (p. ej. jest@30). **No
  se actualizó nada** sin autorización, según la tarea.
- Recomendación: revisar/actualizar herramientas en la fase de publicación y re-ejecutar el audit.

## Resumen

| Ítem | Estado |
|---|---|
| Secretos en código/historial | ✅ PASA |
| `.env` ignorado / solo `.env.example` versionado | ✅ PASA |
| RLS completo y sin `anon` | ✅ PASA (código) |
| Sin logs financieros/tokens | ✅ PASA |
| `npm audit` | ⚠️ Revisar (dev/build tooling) |
| Prueba RLS con dos usuarios en vivo | ✅ PASA (7/7 checks con usuarios reales) |