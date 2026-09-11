import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/**
 * Normalized outcomes returned by the eligibility contract.
 * Provider records and provider-specific fields must not cross this boundary.
 */
const ELIGIBILITY_REASONS = new Set([
  "eligible",
  "invalid_email",
  "not_found",
  "unavailable"
]);

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Checks whether an email may proceed to the future registration flow.
 *
 * This module is intended for server-side registration code. It returns only
 * the normalized contract and never exposes customer or transaction records.
 */
export async function checkRegistrationEligibility(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { eligible: false, reason: "invalid_email" };
  }

  try {
    const supabase = createAdminClient();
    // We query customers joined with successful transactions.
    // Due to the unique constraint (provider, external_customer_ref) on customers,
    // this will return at most one customer for provider='lynk'.
    const { data, error } = await supabase
      .from("customers")
      .select("id, transactions!inner(id)")
      .eq("provider", "lynk")
      .eq("email_normalized", normalizedEmail)
      .eq("transactions.provider", "lynk")
      .eq("transactions.status", "successful")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[checkRegistrationEligibility] Database error:", error.message);
      return { eligible: false, reason: "unavailable" };
    }

    if (!data) {
      return { eligible: false, reason: "not_found" };
    }

    // Customer exists and has at least one successful transaction.
    // We return the customerId so that the signup flow can use it for linking.
    return { eligible: true, reason: "eligible", customerId: data.id };
  } catch (err) {
    console.error("[checkRegistrationEligibility] Unexpected error:", err);
    // Eligibility must fail closed without leaking provider details.
    return { eligible: false, reason: "unavailable" };
  }
}
