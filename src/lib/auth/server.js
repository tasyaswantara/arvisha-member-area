import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request's Auth claims without trusting getSession()
 * as an authorization check.
 */
export async function getAuthClaims() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return {
    claims: data?.claims ?? null,
    error
  };
}

/**
 * Reads the current Auth user from Supabase when a fresh user record is
 * specifically required by a server-side flow.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return {
    user: data?.user ?? null,
    error
  };
}
