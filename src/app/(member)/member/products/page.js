import { getMemberProductData } from "@/features/products/data";
import ProductsPageClient from "./ProductsPageClient";

export default async function MemberProductsPage() {
  const productData = await getMemberProductData();

  return <ProductsPageClient productData={productData} />;
}
