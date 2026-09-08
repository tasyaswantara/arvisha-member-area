"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";

import AuthPageShell from "@/components/auth/AuthPageShell";
import { createClient } from "@/lib/supabase/client";

function getFriendlyResetError(error) {
  if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  return "We couldn't send a reset link right now. Please try again in a moment.";
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
      setFieldError("Enter your email address.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) {
        setFormError(getFriendlyResetError(error));
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("We couldn't send a reset link right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      description="Enter your email and we'll send you a link to reset your password."
      eyebrow="Forgot your password?"
      footer={
        <>
          Remember your password?{" "}
          <Link
            className="rounded-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            href="/login"
          >
            Back to login
          </Link>
        </>
      }
      title="Reset your password"
    >
      {isSuccess ? (
        <div
          aria-live="polite"
          className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-5 text-center text-sm leading-6 text-[#55719d]"
        >
          If an account exists for this email, we&apos;ve sent a password reset link.
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
              Email address
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
                className={`h-14 w-full rounded-xl border bg-white pl-14 pr-5 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                  fieldError ? "border-red-300" : "border-[#d7e2f0]"
                }`}
                id="reset-email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldError("");
                  setFormError("");
                }}
                placeholder="you@example.com"
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
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
                Sending link...
              </>
            ) : (
              <>
                Send reset link
                <ArrowRight aria-hidden="true" size={20} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
}
