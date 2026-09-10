import Image from "next/image";
import Link from "next/link";
import { getMemberProductByKey } from "@/features/products/data";
import { ArrowLeft, ArrowRight, Bell, BookOpen, ChevronDown, FileText } from "lucide-react";

function ArvishaLogo() {
  return (
    <Image
      src="/images/logotext horizontal.png"
      alt="Arvisha"
      width={2172}
      height={724}
      priority
      sizes="(max-width: 639px) 130px, 146px"
      className="h-auto w-[130px] object-contain object-left sm:w-[146px]"
    />
  );
}

function MemberHeader() {
  return (
    <header className="border-b border-blue-100/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="flex min-w-0 items-center gap-8 lg:gap-12">
          <Link
            href="/member/dashboard"
            className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
          >
            <ArvishaLogo />
          </Link>
          <nav
            className="hidden items-center gap-8 text-sm font-medium text-[#6680aa] md:flex lg:gap-10"
            aria-label="Main navigation"
          >
            <Link href="/member/dashboard" className="py-7 transition hover:text-blue-600">
              Dashboard
            </Link>
            <Link
              href="/member/products"
              className="relative py-7 text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-500"
            >
              Products
            </Link>
            <a href="#help" className="py-7 transition hover:text-blue-600">
              Help
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-[#6f87ad] transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
          </button>
          <div className="hidden h-7 w-px bg-blue-100 sm:block" aria-hidden="true" />
          <button
            type="button"
            aria-label="Open account menu"
            aria-expanded="false"
            className="hidden items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[#395782] transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex"
          >
            Natasya Desinta
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-[1376px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-blue-100/70 bg-white p-8 text-center shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen size={28} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Product Access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#142447] sm:text-4xl">Product Not Found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6f87ad]">
          We could not find the product you are looking for. Return to Products to explore your available products.
        </p>
        <Link
          href="/member/products"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Back to Products
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default async function MemberProductAccessPage({ params }) {
  const { productKey } = await params;
  const productResult = await getMemberProductByKey(productKey);
  const product = productResult.status === "success" ? productResult.product : null;

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
      <MemberHeader />

      <main>
        {product ? (
          <>
            <section className="relative overflow-hidden border-b border-blue-100/60">
              <Image
                src="/images/bgeffect.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="pointer-events-none object-cover object-center opacity-60"
              />
              <div className="relative mx-auto max-w-[1376px] px-5 pb-10 pt-9 sm:px-8 sm:pb-12 sm:pt-12 lg:px-10 lg:pt-14 xl:px-12">
                <Link
                  href="/member/products"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back to Products
                </Link>
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Product Access</p>
                <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#142447] sm:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f87ad]">
                  {product.description || "Your product content is available below."}
                </p>
              </div>
            </section>

            <div className="mx-auto max-w-[1376px] px-5 pb-14 pt-8 sm:px-8 sm:pt-10 lg:px-10 xl:px-12">
              <section className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-7 lg:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#142447] sm:text-2xl">Contents in this product</h2>
                    <p className="mt-1 text-sm text-[#6f87ad]">
                      {product.contentCount} {product.contentCount === 1 ? "content" : "contents"} included with this product.
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 sm:inline-flex">
                    Active
                  </span>
                </div>
                <div className="mt-7 space-y-6">
                  {product.contents.length > 0 ? (
                    product.contents.map((content) => (
                      <article
                        key={content.id}
                        className="flex flex-col gap-5 rounded-2xl border border-blue-100 bg-[#fbfdff] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} strokeWidth={1.8} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-[#142447]">{content.name}</h3>
                            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                              {content.contentType}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/member/products/${product.productKey}/contents/${content.contentKey}`}
                          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
                        >
                          {content.contentType === "print" ? "Lihat Detail" : "Mulai"}
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-blue-100 bg-[#f7fbff] px-5 py-8 text-center text-sm text-[#6f87ad]">
                      No active content is available for this product yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : (
          <ProductNotFound />
        )}
      </main>

      <footer id="help" className="border-t border-blue-100/70 bg-white">
        <div className="mx-auto flex max-w-[1376px] flex-col gap-4 px-5 py-6 text-xs text-[#7890b5] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 xl:px-12">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logotext horizontal.png"
              alt="Arvisha"
              width={2172}
              height={724}
              sizes="92px"
              className="h-auto w-[92px] object-contain object-left"
            />
            <span className="h-5 w-px bg-blue-200" aria-hidden="true" />
            <span>© 2025 Arvisha. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            <a href="#terms" className="transition hover:text-blue-600">Terms of Service</a>
            <a href="#privacy" className="transition hover:text-blue-600">Privacy Policy</a>
            <a href="#help" className="transition hover:text-blue-600">Help</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
