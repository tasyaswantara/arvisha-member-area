"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import AuthPageShell from "@/components/auth/AuthPageShell";

function getFriendlyLoginError(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.status === 429 || message.includes("rate limit")) {
    return "Terlalu banyak percobaan. Harap tunggu sebentar dan coba lagi.";
  }

  if (message.includes("email not confirmed")) {
    return "Harap konfirmasi alamat email Anda sebelum masuk.";
  }

  return "Kami tidak dapat memproses masuk Anda. Periksa email dan kata sandi Anda dan coba lagi.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    const errors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      errors.email = "Masukkan alamat email Anda.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      errors.email = "Masukkan alamat email yang valid.";
    }

    if (!password) {
      errors.password = "Masukkan kata sandi Anda.";
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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setFormError(getFriendlyLoginError(error));
        return;
      }

      router.replace("/member/dashboard");
      router.refresh();
    } catch {
      setFormError("Kami tidak dapat memproses masuk Anda. Harap coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateEmail(value) {
    setEmail(value);
    setFormError("");
    setFieldErrors((current) => ({ ...current, email: "" }));
  }

  function updatePassword(value) {
    setPassword(value);
    setFormError("");
    setFieldErrors((current) => ({ ...current, password: "" }));
  }

  return (
    <AuthPageShell
      eyebrow="Selamat datang kembali"
      title="Masuk ke akun Anda"
      description="Masukkan email dan kata sandi Anda untuk melanjutkan"
      footer={
        <p>
          Belum punya akun?{" "}
          <Link
            className="rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            href="/register"
          >
            Daftar di sini
          </Link>
        </p>
      }
    >
      <form className="mt-[2.5vh]" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            className="mb-[2vh] rounded-xl border border-red-200 bg-red-50 px-4 py-[1vh] text-[1.4vh] leading-relaxed text-red-700"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <label className="text-[1.5vh] font-semibold text-[#142447]" htmlFor="email">
            Alamat Email
          </label>
          <p className="mt-[0.5vh] text-[1.2vh] text-[#6f87ad]">
            Pastikan email sama dengan yang digunakan waktu pembelian.
          </p>
          <div className="relative mt-[1vh]">
            <Mail
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7890b5] h-[2vh] w-[2vh]"
              strokeWidth={1.8}
            />
            <input
              autoComplete="email"
              className={`h-[5.5vh] w-full rounded-xl border bg-white pl-[4.5vh] pr-[2vh] text-[1.6vh] text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
                fieldErrors.email ? "border-red-300" : "border-[#d7e2f0]"
              }`}
              id="email"
              name="email"
              onChange={(event) => updateEmail(event.target.value)}
              placeholder="anda@contoh.com"
              type="email"
              value={email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </div>
          {fieldErrors.email ? (
            <p className="mt-[1vh] text-[1.4vh] text-red-600" id="email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="mt-[2vh]">
          <label className="text-[1.5vh] font-semibold text-[#142447]" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative mt-[1vh]">
            <LockKeyhole
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7890b5] h-[2vh] w-[2vh]"
              strokeWidth={1.8}
            />
            <input
              autoComplete="current-password"
              className={`h-[5.5vh] w-full rounded-xl border bg-white pl-[4.5vh] pr-[4.5vh] text-[1.6vh] text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
                fieldErrors.password ? "border-red-300" : "border-[#d7e2f0]"
              }`}
              id="password"
              name="password"
              onChange={(event) => updatePassword(event.target.value)}
              placeholder="Masukkan kata sandi Anda"
              type={showPassword ? "text" : "password"}
              value={password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#7890b5] transition hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-[2vh] w-[2vh]" /> : <Eye className="h-[2vh] w-[2vh]" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="mt-[1vh] text-[1.4vh] text-red-600" id="password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="mt-[2.5vh] flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-[1.4vh] text-[#6f87ad]">
            <input
              checked={rememberMe}
              className="h-[2vh] w-[2vh] rounded border-[#b7c8df] text-primary-600 accent-primary-600 focus:ring-2 focus:ring-primary-200"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Ingat saya
          </label>
          <Link
            className="text-[1.4vh] font-semibold text-primary-600 transition hover:text-primary-700"
            href="/forgot-password"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <button
          className="mt-[3vh] flex h-[5.5vh] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-[1.6vh] font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin h-[2vh] w-[2vh]" />
              Sedang masuk...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="h-[2vh] w-[2vh]" />
            </>
          )}
        </button>
      </form>
    </AuthPageShell>
  );
}
