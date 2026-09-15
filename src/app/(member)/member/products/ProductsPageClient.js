"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import ProductCard, { getProductDisplayDescription } from "@/features/products/ProductCard";

function productMatchesQuery(product, query) {
  return (
    !query ||
    product.name.toLowerCase().includes(query) ||
    (product.description ?? "").toLowerCase().includes(query)
  );
}

function withPresentationData(product, owned) {
  return {
    ...product,
    description: getProductDisplayDescription(product),
    image: product.thumbnailUrl || "/images/bgeffect.png",
    status: owned ? "active" : "available",
    action: owned ? "Buka Produk" : product.purchaseUrl ? "Beli Dengan Promo!" : "Pembelian tidak tersedia",
  };
}

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

function MemberHeader({ memberName }) {
  return (
    <header className="border-b border-primary-100/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="flex min-w-0 items-center gap-8 lg:gap-12">
          <Link
            href="/member/dashboard"
            className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4"
          >
            <ArvishaLogo />
          </Link>
          <nav
            className="hidden items-center gap-8 text-sm font-medium text-[#6680aa] md:flex lg:gap-10"
            aria-label="Main navigation"
          >
            <Link href="/member/dashboard" className="py-7 transition hover:text-primary-600">
              Dashboard
            </Link>
            <Link
              href="/member/products"
              className="relative py-7 text-primary-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary-500"
            >
              Produk
            </Link>
            <a href="#help" className="py-7 transition hover:text-primary-600">
              Bantuan
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-[#6f87ad] transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden="true" />
          </button>
          <div className="hidden h-7 w-px bg-primary-100 sm:block" aria-hidden="true" />
          <button
            type="button"
            aria-label="Open account menu"
            aria-expanded="false"
            className="hidden items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[#395782] transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:flex"
          >
            {memberName}
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function ProductSection({ title, description, products, emptyMessage }) {
  return (
    <section className="rounded-3xl border border-primary-100/70 bg-white p-5 shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-6 lg:p-8">
      <div>
        <h2 className="text-base font-semibold leading-snug tracking-tight text-[#142447] md:text-lg">{title}</h2>
        <p className="mt-1 text-xs text-[#6f87ad] md:text-sm">{description}</p>
      </div>
      {products.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} owned={product.status === "active"} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-primary-100 bg-[#f7fbff] px-5 py-6 text-center text-sm text-[#6f87ad]">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export default function ProductsPageClient({ productData, memberName }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const isError = productData.status === "error";
  const ownedProducts = (productData.ownedProducts ?? []).map((product) => withPresentationData(product, true));
  const availableProducts = (productData.availableProducts ?? []).map((product) => withPresentationData(product, false));

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOwnedProducts =
    filter === "available"
      ? []
      : ownedProducts.filter((product) => productMatchesQuery(product, normalizedQuery));
  const filteredAvailableProducts =
    filter === "owned"
      ? []
      : availableProducts.filter((product) => productMatchesQuery(product, normalizedQuery));

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
      <MemberHeader memberName={memberName} />

      <main>
        <section className="relative overflow-hidden border-b border-primary-100/60">
          <Image
            src="/images/bgeffect.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover object-center opacity-60"
          />
          <div className="relative mx-auto max-w-[1376px] px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-12 xl:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 md:text-sm">Produk</p>
            <h1 className="mt-2 text-xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#142447] md:text-2xl lg:text-3xl">
              Jelajahi Produk
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6f87ad] md:text-base">Akses produk Anda atau temukan yang baru.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1376px] space-y-6 px-5 pb-12 pt-6 sm:space-y-8 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
          {isError && (
            <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Data produk tidak tersedia saat ini. Silakan coba lagi nanti.
            </p>
          )}

          <section aria-label="Product search and filters" className="rounded-2xl border border-primary-100/70 bg-white p-4 shadow-[0_10px_30px_rgba(50,103,172,0.05)] sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Cari produk</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7890b5]" size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari produk..."
                  className="h-11 w-full rounded-xl border border-primary-100 bg-[#f9fcff] pl-11 pr-4 text-sm text-[#142447] outline-none transition placeholder:text-[#9aacc8] focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <label className="relative md:w-52">
                <span className="sr-only">Filter produk</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-primary-100 bg-[#f9fcff] px-4 pr-10 text-sm font-medium text-[#395782] outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="all">Semua Produk</option>
                  <option value="owned">Produk Saya</option>
                  <option value="available">Produk Tersedia</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7890b5]" size={17} aria-hidden="true" />
              </label>
            </div>
          </section>

          <ProductSection
            title="Produk Saya"
            description="Produk yang sudah dapat Anda akses."
            products={filteredOwnedProducts}
            emptyMessage="Tidak ada produk aktif yang tersedia untuk akun ini."
          />
          <ProductSection
            title="Produk Tersedia"
            description="Temukan produk yang belum Anda beli."
            products={filteredAvailableProducts}
            emptyMessage="Tidak ada produk aktif yang tersedia saat ini."
          />
        </div>
      </main>

      <footer id="help" className="border-t border-primary-100/70 bg-white">
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
            <span className="h-5 w-px bg-primary-200" aria-hidden="true" />
            <span>© 2025 Arvisha. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            <a href="#terms" className="transition hover:text-primary-600">Terms of Service</a>
            <a href="#privacy" className="transition hover:text-primary-600">Privacy Policy</a>
            <a href="#help" className="transition hover:text-primary-600">Help</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
