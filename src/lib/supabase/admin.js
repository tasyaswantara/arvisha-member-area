import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing server-side Supabase configuration.");
  }

  return { url, secretKey };
}

export function createAdminClient() {
  const { url, secretKey } = getAdminConfig();

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
