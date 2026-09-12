"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Mail, UserRound } from "lucide-react";

import PasswordField from "@/components/auth/PasswordField";
import { registerAction } from "./actions";

const initialState = {
  fieldErrors: {},
  formError: "",
  success: false,
  confirmationRequired: false
};

function ArvishaLogo({ compact = false }) {
  return (
    <Image
      alt="Arvisha"
      className={`${compact ? "w-[92px]" : "w-[145px] md:w-[160px] xl:w-[178px]"} h-auto object-contain`}
      height={724}
      priority={!compact}
      sizes={compact ? "92px" : "(max-width: 767px) 145px, (max-width: 1279px) 160px, 178px"}
      src="/images/logotext horizontal.png"
      width={2172}
    />
  );
}

function getClientErrors({ confirmPassword, email, fullName, password, termsAccepted }) {
  const errors = {};
  const normalizedEmail = email.trim();

  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!normalizedEmail) {
    errors.email = "Email address is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    errors.email = "Invalid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!termsAccepted) {
    errors.termsAccepted = "Please agree to the Terms & Conditions.";
  }

  return errors;
}

function TextField({ error, icon: Icon, id, label, name, onChange, placeholder, type, value, helperText }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-semibold text-[#142447]" htmlFor={id}>
        {label}
      </label>
      {helperText ? (
        <p className="mt-1 text-xs text-[#6f87ad]">{helperText}</p>
      ) : null}
      <div className="relative mt-3">
        <Icon
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7890b5]"
          size={21}
          strokeWidth={1.8}
        />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={name === "fullName" ? "name" : "email"}
          className={`h-14 w-full rounded-xl border bg-white pl-14 pr-5 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${error ? "border-red-300" : "border-[#d7e2f0]"
            }`}
          id={id}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={type}
          value={value}
        />
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  function getError(field) {
    return clientErrors[field] || state.fieldErrors?.[field] || "";
  }

  function handleSubmit(event) {
    if (isPending) {
      event.preventDefault();
      return;
    }

    const errors = getClientErrors({
      confirmPassword,
      email,
      fullName,
      password,
      termsAccepted
    });

    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
    }
  }

  function updateField(setter, field) {
    return (value) => {
      setter(value);
      setClientErrors((current) => ({ ...current, [field]: "" }));
    };
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f5faff] text-[#142447]">
      <Image
        src="/images/bgeffect.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:py-4">
        <section className="w-full max-w-[560px] rounded-[2rem] border border-white/80 bg-white/95 px-5 py-7 shadow-[0_24px_70px_rgba(62,113,190,0.14)] backdrop-blur-sm sm:px-10 sm:py-9 lg:px-12 lg:py-7">

          <div className="flex justify-center">
            <ArvishaLogo />
          </div>

          {!state.success && (
            <div className="mt-6 text-center sm:mt-7 lg:mt-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3 py-1.5 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-100">
                <UserRound aria-hidden="true" size={14} strokeWidth={2} />
                Create your account
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#142447] sm:text-[2.15rem] lg:mt-3 lg:text-[1.9rem]">
                Join ARVISHA today
              </h1>
              <p className="mx-auto mt-2 max-w-[410px] text-sm leading-6 text-[#6f87ad] sm:text-base lg:mt-1.5">
                Fill in your details to get started.
              </p>
            </div>
          )}

          {state.success ? (
            <div className="mt-6 text-center sm:mt-7 lg:mt-5">
              <div className="rounded-2xl border border-primary-100 bg-primary-50/70 px-5 py-6" role="status">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Mail aria-hidden="true" size={23} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#142447]">Check your email</h3>
                <p className="mt-2 text-sm leading-6 text-[#55719d]">
                  We&apos;ve created your Arvisha account. Please check your inbox and verify your email before logging in.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  href="/login"
                >
                  Back to login
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="mt-5 space-y-4 lg:mt-4 lg:space-y-3" noValidate onSubmit={handleSubmit}>
              {state.formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
                  {state.formError}
                </div>
              ) : null}

              <TextField
                error={getError("fullName")}
                icon={UserRound}
                id="register-full-name"
                label="Full name"
                name="fullName"
                onChange={updateField(setFullName, "fullName")}
                placeholder="e.g. Natasya Desinta Swantara"
                type="text"
                value={fullName}
              />
              <TextField
                error={getError("email")}
                icon={Mail}
                id="register-email"
                label="Email address"
                name="email"
                helperText="Pastikan email sama dengan yang digunakan waktu pembelian."
                onChange={updateField(setEmail, "email")}
                placeholder="e.g. you@example.com"
                type="email"
                value={email}
              />
              <PasswordField
                autoComplete="new-password"
                error={getError("password")}
                id="register-password"
                label="Password"
                name="password"
                onChange={updateField(setPassword, "password")}
                onToggle={() => setShowPassword((visible) => !visible)}
                placeholder="Create a password"
                value={password}
                visible={showPassword}
              />
              <PasswordField
                autoComplete="new-password"
                error={getError("confirmPassword")}
                id="register-confirm-password"
                label="Confirm password"
                name="confirmPassword"
                onChange={updateField(setConfirmPassword, "confirmPassword")}
                onToggle={() => setShowConfirmPassword((visible) => !visible)}
                placeholder="Confirm your password"
                value={confirmPassword}
                visible={showConfirmPassword}
              />

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#6f87ad]" htmlFor="terms-accepted">
                  <input
                    aria-describedby={getError("termsAccepted") ? "terms-error" : undefined}
                    aria-invalid={Boolean(getError("termsAccepted"))}
                    checked={termsAccepted}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-[#b7c8df] text-primary-600 accent-primary-600 focus:ring-2 focus:ring-primary-200"
                    id="terms-accepted"
                    name="termsAccepted"
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      setClientErrors((current) => ({ ...current, termsAccepted: "" }));
                    }}
                    type="checkbox"
                    value="true"
                  />
                  <span>
                    I agree to the <span className="font-medium text-primary-600">Terms &amp; Conditions</span> and <span className="font-medium text-primary-600">Privacy Policy</span>
                  </span>
                </label>
                {getError("termsAccepted") ? (
                  <p className="mt-2 text-sm text-red-600" id="terms-error">
                    {getError("termsAccepted")}
                  </p>
                ) : null}
              </div>

              <button
                className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary-600 px-5 text-base font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight aria-hidden="true" size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {!state.success && (
            <div className="mt-5 text-center text-sm text-[#6f87ad] lg:mt-4">
              <p>
                Already have an account?{" "}
                <Link
                  className="rounded-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  href="/login"
                >
                  Login here
                </Link>
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
