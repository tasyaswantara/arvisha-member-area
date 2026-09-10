import { createClient } from "@/lib/supabase/server";

const productFields = `
  id,
  product_key,
  name,
  description,
  provider,
  external_product_ref,
  is_active
`;

function getJoinedProduct(product) {
  return Array.isArray(product) ? product[0] : product;
}

function isCurrentActiveAccess(access, now) {
  if (access.status !== "active") {
    return false;
  }

  if (!access.product || access.product.is_active !== true) {
    return false;
  }

  if (!access.valid_until) {
    return true;
  }

  const validUntil = Date.parse(access.valid_until);
  return !Number.isNaN(validUntil) && validUntil >= now;
}

function toProductDto(product, access = null) {
  return {
    id: product.id,
    productKey: product.product_key,
    name: product.name,
    description: product.description,
    provider: product.provider,
    externalProductRef: product.external_product_ref,
    isActive: product.is_active,
    accessStatus: access?.status ?? null,
    validUntil: access?.valid_until ?? null,
  };
}

export async function getMemberProductData() {
  try {
    const supabase = await createClient();
    const [accessResult, catalogResult] = await Promise.all([
      supabase
        .from("product_access")
        .select(`
          status,
          valid_until,
          product:products (${productFields})
        `)
        .eq("status", "active"),
      supabase.from("products").select(productFields).eq("is_active", true),
    ]);

    if (accessResult.error || catalogResult.error) {
      return { status: "error", ownedProducts: [], availableProducts: [] };
    }

    const now = Date.now();
    const ownedProducts = (accessResult.data ?? [])
      .map((access) => ({ ...access, product: getJoinedProduct(access.product) }))
      .filter((access) => isCurrentActiveAccess(access, now))
      .map((access) => toProductDto(access.product, access));
    const ownedProductIds = new Set(ownedProducts.map((product) => product.id));
    const availableProducts = (catalogResult.data ?? [])
      .filter((product) => product.is_active && !ownedProductIds.has(product.id))
      .map((product) => toProductDto(product));

    return { status: "success", ownedProducts, availableProducts };
  } catch {
    return { status: "error", ownedProducts: [], availableProducts: [] };
  }
}
