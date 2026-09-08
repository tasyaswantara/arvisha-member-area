/**
 * Development-only eligibility fixture.
 *
 * These synthetic addresses are intentionally not customer data and must not
 * be used as a production eligibility source.
 */
const DEVELOPMENT_ELIGIBLE_EMAILS = new Set(["eligible@example.test"]);

export const developmentMockEligibilityProvider = {
  async check(normalizedEmail) {
    if (DEVELOPMENT_ELIGIBLE_EMAILS.has(normalizedEmail)) {
      return { eligible: true, reason: "eligible" };
    }

    return { eligible: false, reason: "not_found" };
  }
};
