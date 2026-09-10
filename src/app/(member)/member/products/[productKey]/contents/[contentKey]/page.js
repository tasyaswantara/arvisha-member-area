import Image from "next/image";
import Link from "next/link";
import { getMemberContentByKey } from "@/features/products/data";
import { ArrowLeft, ArrowRight, BookOpen, FileText } from "lucide-react";
import GeniallyViewer from "../../GeniallyViewer";

function ContentNotFound() {
  return (
    <main className="mx-auto max-w-[1376px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-blue-100/70 bg-white p-8 text-center shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen size={28} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Content Access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#142447] sm:text-4xl">Content Not Found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6f87ad]">
          This content is unavailable or you do not have access to it.
        </p>
        <Link
          href="/member/products"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Back to Products
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}

function PrintContent({ content }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#fbfdff] px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FileText size={29} strokeWidth={1.7} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[#142447]">{content.name}</h2>
      <p className="mt-3 text-sm leading-6 text-[#6f87ad]">
        This is a print edition and does not have a digital viewer.
      </p>
    </div>
  );
}

function MissingEmbed({ content }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-100 bg-[#f7fbff] px-6 py-12 text-center sm:px-10">
      <h2 className="text-xl font-semibold text-[#142447]">{content.name}</h2>
      <p className="mt-3 text-sm leading-6 text-[#6f87ad]">
        This digital content is not available yet.
      </p>
    </div>
  );
}

export default async function MemberContentViewerPage({ params }) {
  const { productKey, contentKey } = await params;
  const contentResult = await getMemberContentByKey(productKey, contentKey);

  if (contentResult.status !== "success") {
    return (
      <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
        <ContentNotFound />
      </div>
    );
  }

  const { product, content } = contentResult;
  const isDigital = content.contentType === "digital";

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
      <header className="border-b border-blue-100/70 bg-white/95">
        <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">
          <Link
            href={`/member/products/${product.productKey}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Product
          </Link>
          <Image
            src="/images/logotext horizontal.png"
            alt="Arvisha"
            width={2172}
            height={724}
            priority
            sizes="92px"
            className="h-auto w-[92px] object-contain object-left sm:w-[110px]"
          />
        </div>
      </header>

      <main>
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">{product.name}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#142447] sm:text-5xl">
              {content.name}
            </h1>
            <span className="mt-5 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
              {content.contentType}
            </span>
          </div>
        </section>

        <div className="mx-auto max-w-[1376px] px-5 pb-14 pt-8 sm:px-8 sm:pt-10 lg:px-10 xl:px-12">
          <section className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-7 lg:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#142447] sm:text-2xl">
                  {isDigital ? "Genially Viewer" : "Content Details"}
                </h2>
                <p className="mt-1 text-sm text-[#6f87ad]">
                  {isDigital ? "Your content is ready to explore." : "Information for this content edition."}
                </p>
              </div>
              <Link
                href={`/member/products/${product.productKey}`}
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                Back to Product
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7">
              {isDigital ? (
                content.embedUrl ? (
                  <GeniallyViewer embedUrl={content.embedUrl} contentName={content.name} />
                ) : (
                  <MissingEmbed content={content} />
                )
              ) : (
                <PrintContent content={content} />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
