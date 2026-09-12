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
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (message.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  return "We couldn't sign you in. Check your email and password and try again.";
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
      errors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Enter your password.";
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
      setFormError("We couldn't sign you in. Please try again.");
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
      eyebrow="Welcome back"
      title="Login to your account"
      description="Enter your email and password to continue"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            className="rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            href="/register"
          >
            Register here
          </Link>
        </p>
      }
    >
      <form className="mt-6 md:mt-7 lg:mt-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <label className="text-sm font-semibold text-[#142447]" htmlFor="email">
            Email address
          </label>
          <p className="mt-1 text-xs text-[#6f87ad]">
            Pastikan email sama dengan yang digunakan waktu pembelian.
          </p>
          <div className="relative mt-3">
            <Mail
              aria-hidden="true"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7890b5]"
              size={21}
              strokeWidth={1.8}
            />
            <input
              autoComplete="email"
              className={`h-14 w-full rounded-xl border bg-white pl-14 pr-5 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
                fieldErrors.email ? "border-red-300" : "border-[#d7e2f0]"
              }`}
              id="email"
              name="email"
              onChange={(event) => updateEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </div>
          {fieldErrors.email ? (
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="mt-5 xl:mt-6">
          <label className="text-sm font-semibold text-[#142447]" htmlFor="password">
            Password
          </label>
          <div className="relative mt-3">
            <LockKeyhole
              aria-hidden="true"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7890b5]"
              size={21}
              strokeWidth={1.8}
            />
            <input
              autoComplete="current-password"
              className={`h-14 w-full rounded-xl border bg-white pl-14 pr-14 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
                fieldErrors.password ? "border-red-300" : "border-[#d7e2f0]"
              }`}
              id="password"
              name="password"
              onChange={(event) => updatePassword(event.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#7890b5] transition hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="mt-2 text-sm text-red-600" id="password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 xl:mt-6">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#6f87ad]">
            <input
              checked={rememberMe}
              className="h-5 w-5 rounded border-[#b7c8df] text-primary-600 accent-primary-600 focus:ring-2 focus:ring-primary-200"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Remember me
          </label>
          <Link
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <button
          className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary-600 px-5 text-base font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin" size={20} />
              Signing in...
            </>
          ) : (
            <>
              Login
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </AuthPageShell>
  );
}
