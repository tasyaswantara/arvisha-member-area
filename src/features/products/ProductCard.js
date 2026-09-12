import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const catalogDescriptions = {
  "utrt-4-digital":
    "4 edisi digital Ular Tangga Rumah Tangga untuk menemani permainan dan obrolan seru bersama pasangan.",
  "utrt-8-digital":
    "8 edisi digital Ular Tangga Rumah Tangga dan Edukasi Anak untuk aktivitas seru bersama pasangan dan keluarga.",
  "utrt-family-package":
    "Paket lengkap berisi 8 edisi digital dan 2 edisi cetak eksklusif Ular Tangga Rumah Tangga.",
};

export function getProductDisplayDescription(product) {
  return product.description?.trim() || catalogDescriptions[product.productKey] || "";
}

export default function ProductCard({ product, owned = false }) {
  const image = product.image || product.thumbnailUrl || "/images/bgeffect.png";
  const action = product.action || (owned ? "Open Product" : product.purchaseUrl ? "Beli Dengan Promo!" : "Purchase unavailable");
  const status = product.status || (owned ? "active" : "available");
  const description = getProductDisplayDescription(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-primary-100/80 bg-white shadow-[0_10px_30px_rgba(50,103,172,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(50,103,172,0.1)] sm:rounded-2xl">
      <div className="relative aspect-square w-full overflow-hidden bg-[#edf5ff]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          className={`object-cover ${owned ? "" : "opacity-90"}`}
        />
        <div className="absolute inset-0" />
        <span className="absolute bottom-2 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-semibold capitalize text-[#4f6d9e] shadow-sm sm:left-3 sm:px-2.5 sm:text-[10px]">
          <span className={`h-1.5 w-1.5 rounded-full ${owned ? "bg-emerald-400" : "bg-primary-400"}`} aria-hidden="true" />
          {status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="text-sm font-semibold tracking-[-0.02em] text-[#142447] line-clamp-3 sm:text-base">{product.name}</h3>
        <p className="mt-1 text-[11px] leading-[1.35] text-[#6f87ad] line-clamp-2 sm:mt-1.5 sm:text-xs sm:leading-5">{description || "No description available."}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-[#7890b5] sm:mt-3 sm:gap-2 sm:text-[11px]">
          {product.productType && (
            <span className="rounded-full bg-primary-50 px-1.5 py-0.5 capitalize text-primary-600 sm:px-2">
              {product.productType}
            </span>
          )}
          <span>
            {product.contentCount} {product.contentCount === 1 ? "item" : "items"}
          </span>
          {product.price !== null && product.price !== undefined && <span>• {product.price}</span>}
        </div>

        <div className="mt-auto pt-4">
          {owned ? (
            <Link
              href={`/member/products/${product.productKey}`}
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-600 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
            >
              {action}
              <ArrowRight size={14} aria-hidden="true" className="shrink-0" />
            </Link>
          ) : product.purchaseUrl ? (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-[11px] font-semibold text-primary-600 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
            >
              {action}
              <ArrowRight size={14} aria-hidden="true" className="shrink-0" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-[11px] font-semibold text-primary-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
            >
              {action}
              <ArrowRight size={14} aria-hidden="true" className="shrink-0" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
