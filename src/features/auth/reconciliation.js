import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reconciles product access for a given member based on their customer's successful transactions.
 * 
 * @param {Object} params
 * @param {string} params.customerId - The UUID of the customer in public.customers
 * @param {string} params.memberId - The UUID of the member in public.members
 * @returns {Promise<{ok: boolean, grantedCount: number, existingCount: number, skippedCount: number}>}
 */
export async function reconcileProductAccessForMember({ customerId, memberId }) {
  if (!customerId || !memberId) {
    throw new Error("customerId and memberId are required");
  }

  const supabase = createAdminClient();

  // 1. Fetch successful Lynk transactions and their items for the given customer
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select(`
      id,
      status,
      transaction_items (
        id,
        product_id
      )
    `)
    .eq("customer_id", customerId)
    .eq("provider", "lynk")
    .eq("status", "successful");

  if (txError) {
    throw new Error(`Failed to fetch transactions: ${txError.message}`);
  }

  // 2. Separate valid known products from unknown ones
  const productToItemMap = new Map();
  let skippedCount = 0;

  for (const tx of transactions) {
    for (const item of tx.transaction_items || []) {
      if (!item.product_id) {
        // Skip unknown products
        skippedCount++;
      } else {
        // Keep the first transaction item encountered as the source
        if (!productToItemMap.has(item.product_id)) {
          productToItemMap.set(item.product_id, item.id);
        }
      }
    }
  }

  // 3. Fetch existing product access for this member
  const { data: existingAccess, error: accessError } = await supabase
    .from("product_access")
    .select("product_id, id")
    .eq("member_id", memberId);

  if (accessError) {
    throw new Error(`Failed to fetch existing product_access: ${accessError.message}`);
  }

  const existingProductIds = new Set(existingAccess.map(a => a.product_id));

  // 4. Determine what needs to be granted vs updated
  const newAccessRecords = [];
  let grantedCount = 0;
  let existingCount = 0;
  const now = new Date().toISOString();
  
  // To update last_evaluated_at for existing access records
  const updatePromises = [];

  for (const [productId, sourceItemId] of productToItemMap.entries()) {
    if (existingProductIds.has(productId)) {
      existingCount++;
      // Update last_evaluated_at for existing active access without modifying source_transaction_item_id
      updatePromises.push(
        supabase
          .from("product_access")
          .update({ last_evaluated_at: now })
          .eq("member_id", memberId)
          .eq("product_id", productId)
      );
    } else {
      grantedCount++;
      newAccessRecords.push({
        member_id: memberId,
        product_id: productId,
        status: "active",
        granted_at: now,
        source_transaction_item_id: sourceItemId,
        last_evaluated_at: now
      });
    }
  }

  // Execute updates for existing records (if any)
  if (updatePromises.length > 0) {
    const updateResults = await Promise.all(updatePromises);
    for (const result of updateResults) {
      if (result.error) {
        throw new Error(`Failed to update existing product_access: ${result.error.message}`);
      }
    }
  }

  // 5. Grant new product access safely
  for (const record of newAccessRecords) {
    const { error: insertError } = await supabase
      .from("product_access")
      .insert(record);

    if (insertError) {
      if (insertError.code === "23505") {
        // Race condition: another process granted this product access concurrently.
        // We gracefully recover by updating last_evaluated_at instead.
        const { error: updateError } = await supabase
          .from("product_access")
          .update({ last_evaluated_at: now })
          .eq("member_id", record.member_id)
          .eq("product_id", record.product_id);

        if (updateError) {
          throw new Error(`Failed to update concurrent product_access: ${updateError.message}`);
        }

        // It was inserted by a concurrent process, so it counts as existing
        grantedCount--;
        existingCount++;
      } else {
        throw new Error(`Failed to grant new product_access: ${insertError.message}`);
      }
    }
  }

  return {
    ok: true,
    grantedCount,
    existingCount,
    skippedCount
  };
}
