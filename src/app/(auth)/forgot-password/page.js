"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";

import AuthPageShell from "@/components/auth/AuthPageShell";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils/url";

function getFriendlyResetError(error) {
  if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit")) {
    return "Terlalu banyak permintaan. Harap tunggu sebentar dan coba lagi.";
  }

  return "Kami tidak dapat mengirimkan tautan reset saat ini. Harap coba lagi beberapa saat lagi.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim();
    setFieldError("");
    setFormError("");

    if (!normalizedEmail) {
      setFieldError("Masukkan alamat email Anda.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setFieldError("Masukkan alamat email yang valid.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${getAppUrl()}/update-password`
      });

      if (error) {
        setFormError(getFriendlyResetError(error));
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("Kami tidak dapat mengirimkan tautan reset saat ini. Harap coba lagi beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      description="Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda."
      eyebrow="Lupa kata sandi Anda?"
      footer={
        <>
          Ingat kata sandi Anda?{" "}
          <Link
            className="rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            href="/login"
          >
            Kembali ke halaman masuk
          </Link>
        </>
      }
      title="Atur ulang kata sandi Anda"
    >
      {isSuccess ? (
        <div
          aria-live="polite"
          className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/70 px-5 py-5 text-center text-sm leading-6 text-[#55719d]"
        >
          Jika akun dengan email ini ada, kami telah mengirimkan tautan reset kata sandi.
        </div>
      ) : (
        <form className="mt-8" noValidate onSubmit={handleSubmit}>
          {formError ? (
            <div
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-[#142447]" htmlFor="reset-email">
              Alamat Email
            </label>
            <div className="relative mt-3">
              <Mail
                aria-hidden="true"
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7890b5]"
                size={21}
                strokeWidth={1.8}
              />
              <input
                aria-describedby={fieldError ? "reset-email-error" : undefined}
                aria-invalid={Boolean(fieldError)}
                autoComplete="email"
                className={`h-14 w-full rounded-xl border bg-white pl-14 pr-5 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
                  fieldError ? "border-red-300" : "border-[#d7e2f0]"
                }`}
                id="reset-email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldError("");
                  setFormError("");
                }}
                placeholder="anda@contoh.com"
                required
                type="email"
                value={email}
              />
            </div>
            {fieldError ? (
              <p className="mt-2 text-sm text-red-600" id="reset-email-error">
                {fieldError}
              </p>
            ) : null}
          </div>

          <button
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary-600 px-5 text-base font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
                Mengirim tautan...
              </>
            ) : (
              <>
                Kirim tautan reset
                <ArrowRight aria-hidden="true" size={20} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
}
