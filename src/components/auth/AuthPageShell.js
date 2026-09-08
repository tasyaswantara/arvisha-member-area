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
    <main className="relative min-h-dvh overflow-hidden bg-[#f5faff] text-[#142447]">
      <Image
        src="/images/bgeffect.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <section className="w-full max-w-[560px] rounded-[2rem] border border-white/80 bg-white/95 px-5 py-7 shadow-[0_24px_70px_rgba(62,113,190,0.14)] backdrop-blur-sm sm:px-10 sm:py-9 lg:px-12 lg:py-10">
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

          <div className="mt-8 text-center sm:mt-9">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm shadow-blue-100">
              <LockKeyhole aria-hidden="true" size={14} strokeWidth={2} />
              Member Area
            </div>
            <p className="mt-6 text-base font-medium text-[#6f87ad]">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#142447] sm:text-[2.15rem]">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#6f87ad] sm:text-base">
              {description}
            </p>
          </div>

          {children}

          <div className="mt-8 text-center text-sm text-[#6f87ad]">{footer}</div>
        </section>
      </div>
    </main>
  );
}
