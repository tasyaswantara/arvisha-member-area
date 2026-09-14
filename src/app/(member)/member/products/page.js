import { getMemberProductData } from "@/features/products/data";
import ProductsPageClient from "./ProductsPageClient";

export default async function MemberProductsPage() {
  const productData = await getMemberProductData();
  const memberName = productData.memberName || "Member";

  return <ProductsPageClient productData={productData} memberName={memberName} />;
}
