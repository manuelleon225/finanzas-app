# Edge Functions

Funciones de servidor (Deno) del proyecto. La app **nunca** usa la
`service_role key`; las operaciones que requieren privilegios de servidor viven
en la Edge Function.

## `delete-account`

Elimina al usuario autenticado y, por las llaves foráneas `on delete cascade`,
todas sus filas (`profiles`, `accounts`, `categories`, `transactions`,
`recurring_rules`, `budgets`).

- Valida el JWT del encabezado `Authorization` con `auth.getUser()`; si es
  inválido responde `401`.
- Con las variables de entorno que **Supabase inyecta automáticamente** crea un
  cliente administrador y llama a `auth.admin.deleteUser(user.id)`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya están
  disponibles en el entorno de la función; **no hay que configurar secretos**.
- No registra datos personales en los logs.

### Despliegue con la Supabase CLI (recomendado)

Requisitos: [Supabase CLI](https://supabase.com/docs/guides/cli) instalada y el
`project-ref` del proyecto (el identificador que aparece en la URL
`https://<project-ref>.supabase.co`).

```bash
# 1. Iniciar sesión (abre el navegador).
supabase login

# 2. Enlazar el proyecto local con el remoto.
supabase link --project-ref <project-ref>

# 3. Desplegar la función.
supabase functions deploy delete-account
```

No hace falta pasar `--no-verify-jwt`: la función vuelve a validar el token por
su cuenta.

### Alternativa: pegarla en el panel

1. Entra al [panel de Supabase](https://supabase.com/dashboard) → proyecto →
   **Edge Functions**.
2. Pulsa **Create a new function**, nómbrala `delete-account`.
3. Reemplaza el contenido de `index.ts` por el de
   `supabase/functions/delete-account/index.ts` de este repositorio.
4. Pulsa **Deploy**. No configures secretos: `SUPABASE_URL`,
   `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya están disponibles.

### Probar con un usuario de prueba

1. Crea un usuario de prueba en el proyecto real (por ejemplo desde la app).
2. Regístralo con algunos datos (cuentas, movimientos).
3. Desde la app: **Más → Eliminar cuenta**, escribe `ELIMINAR` y confirma.
4. Verifica en **Authentication → Users** que el usuario desapareció y en el
   **Table Editor** que no quedan filas suyas en `profiles`, `accounts`,
   `categories`, `transactions`, `recurring_rules` ni `budgets`.

### Probar en local (opcional)

```bash
supabase start
supabase functions serve delete-account --env-file .env
```

La CLI inyecta las variables del proyecto enlazado al servir la función.
