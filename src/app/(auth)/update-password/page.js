"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

import AuthPageShell from "@/components/auth/AuthPageShell";
import PasswordField from "@/components/auth/PasswordField";
import { createClient } from "@/lib/supabase/client";

function getFriendlyUpdateError(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("session") ||
    message.includes("expired") ||
    message.includes("invalid") ||
    message.includes("token") ||
    message.includes("used") ||
    message.includes("pkce")
  ) {
    return "Tautan tidak valid atau telah digunakan. Pastikan Anda membuka tautan di browser yang sama saat Anda meminta reset, atau minta tautan baru.";
  }

  if (error?.status === 429 || message.includes("rate limit")) {
    return "Terlalu banyak permintaan. Harap tunggu sebentar dan coba lagi.";
  }

  return "Kami tidak dapat memperbarui kata sandi Anda. Harap coba lagi.";
}

const processedCodes = new Set();

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [supabase] = useState(() => createClient());
  const [isExchanging, setIsExchanging] = useState(!!code);
  const [exchangeError, setExchangeError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!code || processedCodes.has(code)) {
      return;
    }

    processedCodes.add(code);

    async function exchangeCode() {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setExchangeError(getFriendlyUpdateError(error));
        } else {
          // Remove the PKCE code from the URL so it's not reused on refresh
          router.replace("/update-password");
        }
      } catch {
        setExchangeError("Gagal memverifikasi sesi. Harap minta tautan reset baru.");
      } finally {
        setIsExchanging(false);
      }
    }

    exchangeCode();
  }, [code, supabase, router]);

  useEffect(() => {
    if (!isSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/login");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [isSuccess, router]);

  function validateForm() {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = "Masukkan kata sandi baru.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Gunakan setidaknya 8 karakter.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi baru Anda.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Kata sandi tidak cocok.";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setFormError("");
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setFormError(getFriendlyUpdateError(error));
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setFormError("Kata sandi Anda telah diperbarui. Silakan kembali ke halaman masuk dan masuk kembali.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("Kami tidak dapat memperbarui kata sandi Anda. Harap coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(setter, field) {
    return (value) => {
      setter(value);
      setFormError("");
      setFieldErrors((current) => ({ ...current, [field]: "" }));
    };
  }

  if (isExchanging) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-8 text-center text-[#55719d]">
        <LoaderCircle aria-hidden="true" className="animate-spin text-primary-600" size={32} />
        <p className="text-sm font-medium">Memverifikasi sesi pemulihan...</p>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-5 text-center text-sm leading-6 text-red-700">
        <p>{exchangeError}</p>
        <Link
          className="mt-4 inline-flex items-center gap-2 rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
          href="/forgot-password"
        >
          Minta tautan baru
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div aria-live="polite" className="mt-8 text-center">
        <div className="rounded-2xl border border-primary-100 bg-primary-50/70 px-5 py-5 text-sm leading-6 text-[#55719d]">
          Kata sandi Anda telah diperbarui. Mengalihkan Anda ke halaman masuk...
        </div>
        <Link
          className="mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
          href="/login"
        >
          Pergi ke halaman masuk sekarang
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
      {formError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <PasswordField
        autoComplete="new-password"
        error={fieldErrors.newPassword}
        id="new-password"
        label="Kata sandi baru"
        name="new-password"
        onChange={updateField(setNewPassword, "newPassword")}
        onToggle={() => setShowNewPassword((visible) => !visible)}
        placeholder="Buat kata sandi"
        value={newPassword}
        visible={showNewPassword}
      />
      <PasswordField
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        id="confirm-password"
        label="Konfirmasi kata sandi"
        name="confirm-password"
        onChange={updateField(setConfirmPassword, "confirmPassword")}
        onToggle={() => setShowConfirmPassword((visible) => !visible)}
        placeholder="Konfirmasi kata sandi Anda"
        value={confirmPassword}
        visible={showConfirmPassword}
      />

      <button
        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary-600 px-5 text-base font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
            Memperbarui kata sandi...
          </>
        ) : (
          <>
            Perbarui kata sandi
            <ArrowRight aria-hidden="true" size={20} />
          </>
        )}
      </button>
    </form>
  );
}

export default function UpdatePasswordPage() {
  return (
    <AuthPageShell
      description="Pilih kata sandi baru untuk menjaga keamanan akun Arvisha Anda."
      eyebrow="Pemulihan kata sandi"
      footer={
        <>
          Butuh tautan reset baru?{" "}
          <Link
            className="rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            href="/forgot-password"
          >
            Minta tautan baru
          </Link>
        </>
      }
      title="Buat kata sandi baru"
    >
      <Suspense
        fallback={
          <div className="mt-8 flex justify-center py-10">
            <LoaderCircle aria-hidden="true" className="animate-spin text-primary-600" size={32} />
          </div>
        }
      >
        <UpdatePasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
