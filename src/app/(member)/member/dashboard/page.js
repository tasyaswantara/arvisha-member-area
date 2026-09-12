import Image from "next/image";
import Link from "next/link";
import { getMemberProductData } from "@/features/products/data";
import ProductCard from "@/features/products/ProductCard";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  KeyRound,
  Package,
  UserRound,
} from "lucide-react";

function createDashboardStats(productData) {
  const hasLiveData = productData.status === "success";
  const ownedCount = hasLiveData ? productData.ownedProducts.length : "—";
  const totalCount = hasLiveData
    ? productData.ownedProducts.length + productData.availableProducts.length
    : null;

  return [
    {
      title: "Active Products",
      value: ownedCount,
      description: hasLiveData ? `Out of ${totalCount} total active products` : "Live product data unavailable",
      icon: Package,
      iconClassName: "bg-primary-50 text-primary-600",
    },
    {
      title: "Available Access",
      value: ownedCount,
      description: hasLiveData ? "Active product access for your account" : "Live access data unavailable",
      icon: KeyRound,
      iconClassName: "bg-emerald-50 text-emerald-500",
    },
    {
      title: "Account Status",
      value: "Active",
      description: "Your account is in good standing",
      icon: UserRound,
      iconClassName: "bg-violet-50 text-violet-500",
    },
  ];
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

function StatCard({ title, value, description, icon: Icon, iconClassName }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-primary-100/70 bg-white p-5 shadow-[0_10px_30px_rgba(50,103,172,0.07)] sm:p-6">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#53709f]">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#142447]">{value}</p>
        <p className="mt-1 text-xs leading-5 text-[#7890b5]">{description}</p>
      </div>
      <ArrowRight className="hidden shrink-0 text-[#7899ca] sm:block" size={18} aria-hidden="true" />
    </article>
  );
}

function SectionHeading({ title, description, href = "/member/products" }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#142447] sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-[#6f87ad]">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4"
      >
        View all products
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

function DashboardHeader() {
  return (
    <header className="border-b border-primary-100/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="flex min-w-0 items-center gap-8 lg:gap-12">
          <Link href="/member/dashboard" className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4">
            <ArvishaLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6680aa] md:flex lg:gap-10" aria-label="Main navigation">
            <Link href="/member/dashboard" className="relative py-7 text-primary-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary-500">
              Dashboard
            </Link>
            <Link href="/member/products" className="py-7 transition hover:text-primary-600">
              Products
            </Link>
            <a href="#help" className="py-7 transition hover:text-primary-600">
              Help
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
            Natasya Desinta
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default async function MemberDashboardPage() {
  const productData = await getMemberProductData();
  const dashboardStats = createDashboardStats(productData);
  const ownedProducts = productData.ownedProducts;
  const recommendedProducts = productData.availableProducts;

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
      <DashboardHeader />

      <main>
        {/* HERO SECTION — temporarily hidden per client request. Remove the `false &&` to restore. */}
        {false && (
          <section className="relative overflow-hidden">
            <Image
              src="/images/bgeffect.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="pointer-events-none object-cover object-center opacity-80"
            />
            <div className="relative mx-auto grid max-w-[1376px] items-center gap-8 px-5 pb-8 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:pb-10 lg:pt-16 xl:px-12">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3 py-1.5 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-100">
                  <UserRound size={14} strokeWidth={2} aria-hidden="true" />
                  Member Area
                </div>
                <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#142447] sm:text-5xl lg:text-[3.25rem]">
                  Hi Natasya,
                  <br />
                  <span className="font-normal">Welcome back!</span>
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-[#6f87ad]">
                  Manage your products, access your content,
                  <br className="hidden sm:block" /> and keep track of your account — all in one place.
                </p>
                <Link
                  href="/member/products"
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Explore Products
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="relative mx-auto h-56 w-full max-w-[650px] sm:h-72 lg:h-80 xl:h-96">
                <Image
                  src="/images/laptop3.png"
                  alt="Arvisha dashboard preview"
                  fill
                  priority
                  sizes="(max-width: 1023px) 92vw, (max-width: 1279px) 54vw, 650px"
                  className="object-contain object-center"
                />
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-[1376px] space-y-6 px-5 pb-14 pt-6 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
          {/* Greeting — preserved per client request */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#142447] sm:text-3xl">
              Hi Natasya, Welcome Back!
            </h1>
          </div>

          {/* STATS CARDS — temporarily hidden per client request. Remove the `false &&` to restore. */}
          {false && (
            <section aria-label="Account summary" className="grid gap-4 md:grid-cols-3">
              {dashboardStats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>
          )}

          <section className="rounded-3xl border border-primary-100/70 bg-white p-4 shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-6 lg:p-7">
            <SectionHeading
              title="Your Products"
              description="Access your purchased products and manage your content."
            />
            {ownedProducts.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {ownedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} owned />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-primary-100 bg-[#f7fbff] px-5 py-8 text-center">
                <p className="text-sm text-[#6f87ad]">
                  {productData.status === "success"
                    ? "You do not have any active products yet."
                    : "Live product data is currently unavailable."}
                </p>
                <Link
                  href="/member/products"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4"
                >
                  Explore Products
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>

          <section id="help" className="rounded-3xl border border-primary-100/70 bg-white p-4 shadow-[0_10px_32px_rgba(50,103,172,0.05)] sm:p-6 lg:p-7">
            <SectionHeading
              title="Recommended for You"
              description="Dapatkan promo 10% dengan kode voucher DISKON10 untuk produk yang tersedia di bawah ini."
            />
            {recommendedProducts.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-primary-100 bg-[#f7fbff] px-5 py-8 text-center text-sm text-[#6f87ad]">
                {productData.status === "success"
                  ? "No additional active products are available right now."
                  : "Live product data is currently unavailable."}
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-primary-100/70 bg-white">
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
