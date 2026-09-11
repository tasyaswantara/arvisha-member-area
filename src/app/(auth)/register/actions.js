"use server";

import { redirect } from "next/navigation";

import { checkRegistrationEligibility } from "@/features/auth/eligibility";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function getFormValue(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getFriendlySignupError(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.status === 429 || message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return "We couldn't create your account with this email. Please check your details or try another email.";
}

export async function registerAction(previousState, formData) {
  const fullName = getFormValue(formData, "fullName").trim();
  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirmPassword");
  const termsAccepted = getFormValue(formData, "termsAccepted") === "true";
  const fieldErrors = {};

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!email) {
    fieldErrors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Invalid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (!termsAccepted) {
    fieldErrors.termsAccepted = "Please agree to the Terms & Conditions.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      formError: "",
      success: false,
      confirmationRequired: false
    };
  }

  const eligibility = await checkRegistrationEligibility(email);

  if (eligibility.reason === "invalid_email") {
    return {
      fieldErrors: { email: "Invalid email address." },
      formError: "",
      success: false,
      confirmationRequired: false
    };
  }

  if (eligibility.reason === "not_found") {
    return {
      fieldErrors: {},
      formError: "This email is not eligible to create an account.",
      success: false,
      confirmationRequired: false
    };
  }

  if (eligibility.reason === "unavailable") {
    return {
      fieldErrors: {},
      formError: "We couldn't verify your eligibility right now. Please try again later.",
      success: false,
      confirmationRequired: false
    };
  }

  if (!eligibility.eligible) {
    return {
      fieldErrors: {},
      formError: "We couldn't verify your eligibility right now. Please try again later.",
      success: false,
      confirmationRequired: false
    };
  }

  let data;
  let error;

  try {
    const supabase = await createClient();
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    data = response.data;
    error = response.error;
  } catch {
    return {
      fieldErrors: {},
      formError: "Something went wrong. Please try again.",
      success: false,
      confirmationRequired: false
    };
  }

  if (error) {
    return {
      fieldErrors: {},
      formError: getFriendlySignupError(error),
      success: false,
      confirmationRequired: false
    };
  }

  if (!data?.user) {
    return {
      fieldErrors: {},
      formError: "Something went wrong. Please try again.",
      success: false,
      confirmationRequired: false
    };
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();
    const { data: member, error: memberError } = await adminSupabase
      .from("members")
      .select("id, customer_id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (memberError || !member) {
      return {
        fieldErrors: {},
        formError: "Account created but profile linking failed. Please contact support.",
        success: false,
        confirmationRequired: false
      };
    }

    if (member.customer_id && member.customer_id !== eligibility.customerId) {
      return {
        fieldErrors: {},
        formError: "Account created but could not be linked safely. Please contact support.",
        success: false,
        confirmationRequired: false
      };
    }

    if (!member.customer_id) {
      const { error: updateError } = await adminSupabase
        .from("members")
        .update({ customer_id: eligibility.customerId })
        .eq("id", data.user.id);

      if (updateError) {
        return {
          fieldErrors: {},
          formError: "Account created but profile linking failed. Please contact support.",
          success: false,
          confirmationRequired: false
        };
      }
    }

    const { reconcileProductAccessForMember } = await import("@/features/auth/reconciliation");
    await reconcileProductAccessForMember({
      customerId: eligibility.customerId,
      memberId: data.user.id
    });
  } catch (err) {
    console.error("[registerAction] Post-signup linking or reconciliation failed:", err);
    return {
      fieldErrors: {},
      formError: "Account created but profile linking failed. Please contact support.",
      success: false,
      confirmationRequired: false
    };
  }

  if (data.session) {
    redirect("/member/dashboard");
  }

  return {
    fieldErrors: {},
    formError: "",
    success: true,
    confirmationRequired: true
  };
}
