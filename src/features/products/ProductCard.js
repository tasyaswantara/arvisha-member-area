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
  const action = product.action || (owned ? "Open Product" : product.purchaseUrl ? "Buy on Lynk" : "Purchase unavailable");
  const status = product.status || (owned ? "active" : "available");
  const description = getProductDisplayDescription(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_10px_30px_rgba(50,103,172,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(50,103,172,0.1)]">
      <div className="relative aspect-square w-full overflow-hidden bg-[#edf5ff]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className={`object-contain ${owned ? "" : "opacity-90"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/25 to-transparent" />
        <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-[#4f6d9e] shadow-sm">
          <span className={`h-2 w-2 rounded-full ${owned ? "bg-emerald-400" : "bg-blue-400"}`} aria-hidden="true" />
          {status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#142447]">{product.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-[#6f87ad]">{description || "No description available."}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#7890b5]">
          {product.productType && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 capitalize text-blue-600">
              {product.productType}
            </span>
          )}
          <span>
            {product.contentCount} {product.contentCount === 1 ? "content" : "contents"}
          </span>
          {product.price !== null && product.price !== undefined && <span>• {product.price}</span>}
        </div>

        <div className="mt-auto pt-5">
          {owned ? (
            <Link
              href={`/member/products/${product.productKey}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {action}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : product.purchaseUrl ? (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {action}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
