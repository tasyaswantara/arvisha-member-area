"use server";

import { redirect } from "next/navigation";

import { checkRegistrationEligibility } from "@/features/auth/eligibility";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/utils/url";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function getFormValue(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getFriendlySignupError(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.status === 429 || message.includes("rate limit")) {
    return "Terlalu banyak percobaan. Harap tunggu sebentar dan coba lagi.";
  }

  return "Kami tidak dapat membuat akun Anda dengan email ini. Silakan periksa detail Anda atau coba email lain.";
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
      formError: "Email ini tidak terdaftar untuk membuat akun. Pastikan Anda menggunakan email pembelian yang benar.",
      success: false,
      confirmationRequired: false
    };
  }

  if (eligibility.reason === "unavailable") {
    return {
      fieldErrors: {},
      formError: "Kami tidak dapat memverifikasi status Anda saat ini. Silakan coba lagi nanti.",
      success: false,
      confirmationRequired: false
    };
  }

  if (!eligibility.eligible) {
    return {
      fieldErrors: {},
      formError: "Kami tidak dapat memverifikasi status Anda saat ini. Silakan coba lagi nanti.",
      success: false,
      confirmationRequired: false
    };
  }

  let data;
  let error;
  let supabase;

  try {
    supabase = await createClient();
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppUrl()}/login`,
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
      formError: "Terjadi kesalahan. Silakan coba lagi.",
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
      formError: "Terjadi kesalahan. Silakan coba lagi.",
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
        formError: "Akun berhasil dibuat, namun gagal menghubungkan profil. Silakan hubungi dukungan pelanggan.",
        success: false,
        confirmationRequired: false
      };
    }

    if (member.customer_id && member.customer_id !== eligibility.customerId) {
      return {
        fieldErrors: {},
        formError: "Akun berhasil dibuat, namun tidak dapat dihubungkan dengan aman. Silakan hubungi dukungan pelanggan.",
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
          formError: "Akun berhasil dibuat, namun gagal menghubungkan profil. Silakan hubungi dukungan pelanggan.",
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
      formError: "Akun berhasil dibuat, namun gagal menghubungkan profil. Silakan hubungi dukungan pelanggan.",
      success: false,
      confirmationRequired: false
    };
  }

  if (data.session) {
    // Jika konfirmasi email dimatikan di Supabase, user akan langsung mendapat sesi.
    // Karena Anda ingin diarahkan ke login, kita hapus sesinya agar middleware tidak melempar balik ke dashboard.
    await supabase.auth.signOut();
    return {
      fieldErrors: {},
      formError: "",
      success: true,
      confirmationRequired: false
    };
  }

  return {
    fieldErrors: {},
    formError: "",
    success: true,
    confirmationRequired: true
  };
}
