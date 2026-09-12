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
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";

function ArvishaLogo({ compact = false }) {
  return (
    <Image
      priority={!compact}
      src="/images/logotext horizontal.png"
      alt="Arvisha"
      width={2172}
      height={724}
      sizes={compact ? "92px" : "(max-width: 767px) 145px, (max-width: 1279px) 160px, 178px"}
      className={`${compact ? "w-[92px]" : "w-[145px] md:w-[160px] xl:w-[178px]"} h-auto object-contain object-left`}
    />
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="flex gap-3 md:block">
      <Image
        src={icon}
        alt=""
        width={1254}
        height={1254}
        sizes="(max-width: 1279px) 40px, 48px"
        className="h-9 w-9 shrink-0 md:h-9 md:w-9 xl:h-10 xl:w-10"
      />
      <div className="mt-0 md:mt-2">
        <h3 className="text-sm font-semibold text-[#1a315b]">
          {title}
        </h3>
        <p className="mt-1 max-w-[160px] text-sm leading-6 text-[#6f87ad] md:text-[13px] md:leading-5">
          {description}
        </p>
      </div>
    </div>
  );
}

function LaptopMockup() {
  return (
    <div className="relative mx-auto mt-1 flex h-[250px] w-full max-w-[440px] items-center justify-center md:h-[270px] md:max-w-[500px] lg:h-[clamp(300px,42vh,400px)] lg:max-w-[680px] xl:h-[clamp(360px,46vh,480px)] xl:max-w-[760px]">
      <Image
        src="/images/laptop1.png"
        alt="Arvisha member dashboard preview"
        width={1227}
        height={1282}
        sizes="(max-width: 767px) 92vw, (max-width: 1023px) 80vw, (max-width: 1279px) 48vw, 760px"
        className="h-full w-full object-contain object-bottom"
      />
    </div>
  );
}

function MarketingPanel() {
  return (
    <section className="relative overflow-hidden bg-[#f5faff] px-5 pb-5 pt-6 md:px-10 md:pb-6 md:pt-8 lg:flex lg:h-dvh lg:min-h-0 lg:w-1/2 lg:flex-col lg:px-10 lg:pb-5 lg:pt-6 xl:px-14 xl:pb-6 xl:pt-8 2xl:px-16">
      <Image
        src="/images/bgeffect.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 50vw"
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[700px] flex-col lg:min-h-0 lg:flex-1">
        <div className="mt-5 md:mt-6 lg:mt-4 xl:mt-5 2xl:mt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3 py-1.5 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-100">
            <LockKeyhole size={14} strokeWidth={2} />
            Member Area
          </div>
          <h1 className="mt-3 max-w-[520px] text-3xl font-bold leading-[1.04] tracking-[-0.045em] text-[#142447] md:text-4xl lg:text-[2.5rem] xl:text-[2.75rem] 2xl:text-[2.8rem]">
            Welcome back,
            <br />
            to <span className="text-primary-600">Arvisha</span>
          </h1>
          <p className="mt-3 max-w-[470px] text-sm leading-6 text-[#6f87ad] md:text-[15px] md:leading-6 xl:text-base">
            Manage your products, access your content,
            <br className="hidden md:block" /> and keep track of your account — all in one place.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-3 md:gap-3 lg:mt-4 xl:mt-5 xl:gap-4">
          <Feature
            icon="/icons/box.png"
            title="Active Products"
            description="Access your purchased products and manage your content."
          />
          <Feature
            icon="/icons/energy.png"
            title="Available Access"
            description="You have access to your products anytime, anywhere."
          />
          <Feature
            icon="/icons/person.png"
            title="Account Status"
            description="Your account is in good standing."
          />
        </div>

        <div className="mt-auto pt-5 lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:items-center lg:justify-center lg:pt-0">
          <LaptopMockup />
        </div>

        <footer className="mt-2 flex items-center gap-3 border-t border-primary-100/80 pt-3 text-xs text-[#7890b5] md:mt-3 md:pt-4 xl:gap-4">
          <ArvishaLogo compact />
          <span className="h-5 w-px bg-primary-200" />
          <span>© 2025 Arvisha. All rights reserved.</span>
        </footer>
      </div>
    </section>
  );
}

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
    <main className="min-h-screen bg-white text-[#142447] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-dvh lg:min-h-0 lg:flex-row">
        <MarketingPanel />

        <section className="flex flex-1 items-center justify-center bg-white px-5 py-12 md:px-12 md:py-14 lg:h-dvh lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:px-10 lg:py-0 xl:px-14 2xl:px-20">
          <div className="w-full max-w-[500px] lg:max-w-[460px] xl:max-w-[500px] 2xl:max-w-[520px]">
            <p className="text-base font-medium text-[#6f87ad]">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#142447] md:text-3xl lg:text-[1.85rem] xl:text-[2rem] 2xl:text-[2.1rem]">
              Login to your account
            </h2>
            <p className="mt-2 text-sm text-[#6f87ad] md:text-base xl:text-[1.05rem]">
              Enter your email and password to continue
            </p>

            <form className="mt-8 md:mt-9 lg:mt-8 xl:mt-10" onSubmit={handleSubmit} noValidate>
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

            <div className="mt-8 flex items-center gap-5 text-sm text-[#6f87ad] xl:mt-9">
              <span className="h-px flex-1 bg-[#d7e2f0]" />
              <span>or</span>
              <span className="h-px flex-1 bg-[#d7e2f0]" />
            </div>

            <p className="mt-7 text-center text-sm text-[#6f87ad] xl:mt-8">
              Don&apos;t have an account?{" "}
              <Link className="font-semibold text-primary-600 hover:text-primary-700" href="/register">
                Register here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
