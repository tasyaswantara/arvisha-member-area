import { createClient } from "@/lib/supabase/server";

const productFields = `
  id,
  product_key,
  name,
  description,
  provider,
  external_product_ref,
  is_active,
  price,
  thumbnail_url,
  purchase_url,
  product_type
`;

const productCatalogFields = `${productFields},
  product_contents (
    content:contents (
      is_active
    )
  )
`;

const productDetailFields = `${productFields},
  product_contents (
    content:contents (
      id,
      content_key,
      name,
      content_type,
      embed_url,
      is_active
    )
  )
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
  return !Number.isNaN(validUntil) && validUntil > now;
}

function getActiveContentCount(product) {
  return (product.product_contents ?? []).reduce((count, productContent) => {
    const content = Array.isArray(productContent.content)
      ? productContent.content[0]
      : productContent.content;

    return count + (content?.is_active === true ? 1 : 0);
  }, 0);
}

function getActiveContents(product) {
  return (product.product_contents ?? [])
    .map((productContent) => {
      const content = Array.isArray(productContent.content)
        ? productContent.content[0]
        : productContent.content;

      return content;
    })
    .filter((content) => content?.is_active === true)
    .map((content) => ({
      id: content.id,
      contentKey: content.content_key,
      name: content.name,
      contentType: content.content_type,
      embedUrl: content.embed_url,
    }));
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
    price: product.price,
    thumbnailUrl: product.thumbnail_url,
    purchaseUrl: product.purchase_url,
    productType: product.product_type,
    contentCount: getActiveContentCount(product),
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
          product:products (${productCatalogFields})
        `)
        .eq("status", "active"),
      supabase.from("products").select(productCatalogFields).eq("is_active", true),
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

export async function getMemberProductByKey(productKey) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_access")
      .select(`
        status,
        valid_until,
        product:products!inner (${productDetailFields})
      `)
      .eq("status", "active")
      .eq("product.product_key", productKey)
      .maybeSingle();

    if (error) {
      return { status: "error", product: null };
    }

    const access = data ? { ...data, product: getJoinedProduct(data.product) } : null;

    if (!access || !isCurrentActiveAccess(access, Date.now())) {
      return { status: "not_found", product: null };
    }

    return {
      status: "success",
      product: {
        ...toProductDto(access.product, access),
        contents: getActiveContents(access.product),
      },
    };
  } catch {
    return { status: "error", product: null };
  }
}

export async function getMemberContentByKey(productKey, contentKey) {
  const productResult = await getMemberProductByKey(productKey);

  if (productResult.status !== "success") {
    return { status: productResult.status, product: null, content: null };
  }

  const content = productResult.product.contents.find((item) => item.contentKey === contentKey);

  if (!content) {
    return { status: "not_found", product: null, content: null };
  }

  return {
    status: "success",
    product: {
      id: productResult.product.id,
      productKey: productResult.product.productKey,
      name: productResult.product.name,
    },
    content,
  };
}
