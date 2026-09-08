import { developmentMockEligibilityProvider } from "./providers/mockEligibilityProvider";

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

function getEligibilityProvider() {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return developmentMockEligibilityProvider;
  }

  // Fail closed until the real provider contract is known and implemented.
  return null;
}

function normalizeProviderResult(result) {
  if (result?.eligible === true) {
    return { eligible: true, reason: "eligible" };
  }

  const reason = ELIGIBILITY_REASONS.has(result?.reason)
    ? result.reason
    : "not_found";

  return { eligible: false, reason };
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

  const provider = getEligibilityProvider();

  if (!provider) {
    return { eligible: false, reason: "unavailable" };
  }

  try {
    const result = await provider.check(normalizedEmail);
    return normalizeProviderResult(result);
  } catch {
    // Eligibility must fail closed without leaking provider details.
    return { eligible: false, reason: "unavailable" };
  }
}
