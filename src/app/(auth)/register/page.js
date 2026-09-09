"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, LoaderCircle, Mail, UserRound } from "lucide-react";

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
      className={`${compact ? "w-[92px]" : "w-[145px] md:w-[160px] xl:w-[178px]"} h-auto object-contain object-left`}
      height={724}
      priority={!compact}
      sizes={compact ? "92px" : "(max-width: 767px) 145px, (max-width: 1279px) 160px, 178px"}
      src="/images/logotext horizontal.png"
      width={2172}
    />
  );
}

function Feature({ description, icon, title }) {
  return (
    <div className="flex gap-3 md:block">
      <Image
        alt=""
        className="h-9 w-9 shrink-0 md:h-9 md:w-9 xl:h-10 xl:w-10"
        height={1254}
        sizes="(max-width: 1279px) 40px, 48px"
        src={icon}
        width={1254}
      />
      <div className="mt-0 md:mt-2">
        <h3 className="text-sm font-semibold text-[#1a315b]">{title}</h3>
        <p className="mt-1 max-w-[160px] text-sm leading-6 text-[#6f87ad] md:text-[13px] md:leading-5">
          {description}
        </p>
      </div>
    </div>
  );
}

function MarketingPanel() {
  return (
    <section className="relative overflow-hidden bg-[#f5faff] px-5 pb-5 pt-6 md:px-10 md:pb-6 md:pt-8 lg:flex lg:h-dvh lg:min-h-0 lg:w-1/2 lg:flex-col lg:px-10 lg:pb-5 lg:pt-6 xl:px-14 xl:pb-6 xl:pt-8 2xl:px-16">
      <Image
        alt=""
        className="pointer-events-none object-cover"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 50vw"
        src="/images/bgeffect.png"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[700px] flex-col lg:min-h-0 lg:flex-1">
        <div className="mt-5 md:mt-6 lg:mt-4 xl:mt-5 2xl:mt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm shadow-blue-100">
            <UserRound aria-hidden="true" size={14} strokeWidth={2} />
            Create your account
          </div>
          <h1 className="mt-3 max-w-[520px] text-3xl font-bold leading-[1.04] tracking-[-0.045em] text-[#142447] md:text-4xl lg:text-[2.5rem] xl:text-[2.75rem] 2xl:text-[2.8rem]">
            Get started with
            <br />
            <span className="text-blue-600">Arvisha</span>
          </h1>
          <p className="mt-3 max-w-[470px] text-sm leading-6 text-[#6f87ad] md:text-[15px] md:leading-6 xl:text-base">
            Join us and manage your products, access your content,
            <br className="hidden md:block" /> and keep track of your account — all in one place.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-3 md:gap-3 lg:mt-4 xl:mt-5 xl:gap-4">
          <Feature
            description="Access your purchased products and manage your content."
            icon="/icons/box.png"
            title="Exclusive Products"
          />
          <Feature
            description="Get instant access to your products anytime, anywhere."
            icon="/icons/energy.png"
            title="Easy Access"
          />
          <Feature
            description="Your data is always protected with us."
            icon="/icons/person.png"
            title="Secure & Private"
          />
        </div>

        <div className="mt-auto pt-5 lg:flex lg:min-h-0 lg:flex-1 lg:items-center lg:justify-center lg:pt-0">
          <div className="relative mx-auto mt-1 flex h-[250px] w-full max-w-[440px] items-center justify-center md:h-[270px] md:max-w-[500px] lg:h-[clamp(300px,42vh,400px)] lg:max-w-[680px] xl:h-[clamp(360px,46vh,480px)] xl:max-w-[760px]">
            <Image
              alt="Arvisha member dashboard preview"
              className="h-full w-full object-contain object-bottom"
              height={1282}
              sizes="(max-width: 767px) 92vw, (max-width: 1023px) 80vw, (max-width: 1279px) 48vw, 760px"
              src="/images/laptop1.png"
              width={1227}
            />
          </div>
        </div>

        <footer className="mt-2 flex items-center gap-3 border-t border-blue-100/80 pt-3 text-xs text-[#7890b5] md:mt-3 md:pt-4 xl:gap-4">
          <ArvishaLogo compact />
          <span className="h-5 w-px bg-blue-200" />
          <span>© 2025 Arvisha. All rights reserved.</span>
        </footer>
      </div>
    </section>
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

function TextField({ error, icon: Icon, id, label, name, onChange, placeholder, type, value }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-semibold text-[#142447]" htmlFor={id}>
        {label}
      </label>
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
          className={`h-14 w-full rounded-xl border bg-white pl-14 pr-5 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
            error ? "border-red-300" : "border-[#d7e2f0]"
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
    <main className="min-h-screen bg-white text-[#142447] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-dvh lg:min-h-0 lg:flex-row">
        <MarketingPanel />

        <section className="flex flex-1 items-center justify-center bg-white px-5 py-10 md:px-12 md:py-14 lg:h-dvh lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:px-10 lg:py-8 xl:px-14 xl:py-10 2xl:px-20">
          <div className="w-full max-w-[540px]">
            <p className="text-base font-medium text-[#6f87ad]">Create your account</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#142447] md:text-3xl lg:text-[1.85rem] xl:text-[2rem] 2xl:text-[2.1rem]">
              Join Arvisha today
            </h2>
            <p className="mt-2 text-sm text-[#6f87ad] md:text-base xl:text-[1.05rem]">
              Fill in your details to get started.
            </p>

            {state.success ? (
              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-6 text-center" role="status">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Mail aria-hidden="true" size={23} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#142447]">Check your email</h3>
                <p className="mt-2 text-sm leading-6 text-[#55719d]">
                  We&apos;ve created your Arvisha account. Please check your inbox and verify your email before logging in.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  href="/login"
                >
                  Back to login
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            ) : (
              <form action={formAction} className="mt-7 space-y-5 xl:mt-8" noValidate onSubmit={handleSubmit}>
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
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[#b7c8df] text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-200"
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
                      I agree to the <span className="font-medium text-blue-600">Terms &amp; Conditions</span> and <span className="font-medium text-blue-600">Privacy Policy</span>
                    </span>
                  </label>
                  {getError("termsAccepted") ? (
                    <p className="mt-2 text-sm text-red-600" id="terms-error">
                      {getError("termsAccepted")}
                    </p>
                  ) : null}
                </div>

                <button
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
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

            {!state.success ? (
              <div className="mt-7 flex items-center gap-5 text-sm text-[#6f87ad] xl:mt-8">
                <span className="h-px flex-1 bg-[#d7e2f0]" />
                <span>or</span>
                <span className="h-px flex-1 bg-[#d7e2f0]" />
              </div>
            ) : null}

            {!state.success ? (
              <p className="mt-7 text-center text-sm text-[#6f87ad]">
                Already have an account?{" "}
                <Link
                  className="rounded-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  href="/login"
                >
                  Login here
                </Link>
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
