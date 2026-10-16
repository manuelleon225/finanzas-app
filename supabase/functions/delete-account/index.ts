// ============================================================================
// Edge Function: delete-account
//
// Elimina la cuenta del usuario autenticado y, en cascada, todas sus filas
// (profiles, accounts, categories, transactions, recurring_rules, budgets;
// todas referencian auth.users con `on delete cascade`).
//
// Seguridad:
// - Valida el JWT del encabezado Authorization con un cliente creado con ese
//   token (auth.getUser()). Si es inválido responde 401.
// - La service_role key SOLO existe aquí, en el entorno de la función. Nunca
//   se expone al cliente. SUPABASE_URL, SUPABASE_ANON_KEY y
//   SUPABASE_SERVICE_ROLE_KEY las inyecta Supabase automáticamente.
// - No se registran datos personales en los logs.
//
// Invocación desde la app: supabase.functions.invoke('delete-account').
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  // Cliente con el JWT del usuario: sirve para validar la identidad.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  // Cliente administrador: única parte que usa la service_role key.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    // Mensaje genérico: nunca se registran datos personales.
    console.error('delete-account: no se pudo eliminar el usuario');
    return jsonResponse({ error: 'delete_failed' }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
