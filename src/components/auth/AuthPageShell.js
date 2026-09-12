import Image from "next/image";
import { LockKeyhole } from "lucide-react";

export default function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footer
}) {
  return (
    <main className="relative min-h-dvh bg-[#f5faff] text-[#142447] lg:h-dvh lg:overflow-hidden">
      <Image
        src="/images/bgeffect.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:h-dvh lg:min-h-0 lg:py-6">
        <section className="w-full max-w-[560px] overflow-y-auto rounded-[2rem] border border-white/80 bg-white/95 px-5 py-7 shadow-[0_24px_70px_rgba(62,113,190,0.14)] backdrop-blur-sm sm:px-10 sm:py-9 lg:max-h-[calc(100dvh-3rem)] lg:px-12 lg:py-8">
          <div className="flex justify-center">
            <Image
              src="/images/logotext horizontal.png"
              alt="Arvisha"
              width={2172}
              height={724}
              priority
              sizes="(max-width: 639px) 145px, 165px"
              className="h-auto w-[145px] object-contain sm:w-[165px]"
            />
          </div>

          <div className="mt-6 text-center sm:mt-7 lg:mt-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3 py-1.5 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-100">
              <LockKeyhole aria-hidden="true" size={14} strokeWidth={2} />
              Member Area
            </div>
            <p className="mt-4 text-base font-medium text-[#6f87ad] lg:mt-3">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#142447] sm:text-[2.15rem] lg:text-[1.9rem]">
              {title}
            </h1>
            <p className="mx-auto mt-2 max-w-[410px] text-sm leading-6 text-[#6f87ad] sm:text-base lg:mt-1.5">
              {description}
            </p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-[#6f87ad] lg:mt-5">{footer}</div>
        </section>
      </div>
    </main>
  );
}
