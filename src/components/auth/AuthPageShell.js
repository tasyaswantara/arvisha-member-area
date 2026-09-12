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

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-[2vh] sm:px-6 lg:h-dvh lg:min-h-0">
        <section className="w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 px-5 py-[3vh] shadow-[0_24px_70px_rgba(62,113,190,0.14)] backdrop-blur-sm sm:px-8 sm:py-[4vh]">
          <div className="flex justify-center">
            <Image
              src="/images/logotext horizontal.png"
              alt="Arvisha"
              width={2172}
              height={724}
              priority
              sizes="150px"
              className="h-[5.5vh] w-auto object-contain"
            />
          </div>

          <div className="mt-[2.5vh] text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 px-2.5 py-1 text-[1.2vh] font-semibold text-primary-600 shadow-sm shadow-primary-100">
              <LockKeyhole aria-hidden="true" size={14} className="h-[1.5vh] w-[1.5vh]" strokeWidth={2} />
              Member Area
            </div>
            <p className="mt-[1.5vh] text-[1.4vh] font-medium text-[#6f87ad]">{eyebrow}</p>
            <h1 className="mt-[0.5vh] text-[3.2vh] font-bold tracking-[-0.04em] text-[#142447]">
              {title}
            </h1>
            <p className="mx-auto mt-[1vh] max-w-[410px] text-[1.5vh] leading-relaxed text-[#6f87ad]">
              {description}
            </p>
          </div>

          {children}

          <div className="mt-[2.5vh] text-center text-[1.4vh] text-[#6f87ad]">{footer}</div>
        </section>
      </div>
    </main>
  );
}
