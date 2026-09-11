import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getCustomerIdentity(messageData) {
  const customer = messageData.customer;
  const email = normalizeEmail(customer?.email);

  if (!email) {
    throw new Error("customer_identity_missing");
  }

  return {
    provider: "lynk",
    external_customer_ref: email,
    email: typeof customer.email === "string" ? customer.email.trim() : email,
    email_normalized: email,
    display_name: typeof customer.name === "string" && customer.name.trim()
      ? customer.name.trim()
      : null,
    updated_at: new Date().toISOString()
  };
}

function getQuantity(item) {
  if (item.quantity === undefined || item.quantity === null) {
    return 1;
  }

  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new Error("invalid_item_quantity");
  }

  return item.quantity;
}

function getUnitAmount(item) {
  if (item.price === undefined || item.price === null) {
    return null;
  }

  if (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0) {
    throw new Error("invalid_item_price");
  }

  return item.price;
}

function getAddonFingerprintData(addons) {
  if (!Array.isArray(addons)) {
    return [];
  }

  return addons
    .filter(isObject)
    .map((addon) => ({
      id: typeof addon.id === "string" ? addon.id : null,
      name: typeof addon.name === "string" ? addon.name : null,
      price: typeof addon.price === "number" && Number.isFinite(addon.price) ? addon.price : null
    }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function normalizeItems(messageData) {
  if (!Array.isArray(messageData.items) || messageData.items.length === 0) {
    throw new Error("payment_items_missing");
  }

  return messageData.items.map((item) => {
    if (!isObject(item) || typeof item.uuid !== "string" || !item.uuid.trim()) {
      throw new Error("invalid_item_reference");
    }

    const normalizedItem = {
      externalProductRef: item.uuid.trim(),
      quantity: getQuantity(item),
      unitAmount: getUnitAmount(item),
      addons: getAddonFingerprintData(item.addons)
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(normalizedItem))
      .digest("hex");

    return {
      ...normalizedItem,
      itemFingerprint: fingerprint
    };
  });
}

async function upsertCustomer(supabase, customer) {
  const { data, error } = await supabase
    .from("customers")
    .upsert(customer, { onConflict: "provider,external_customer_ref" })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error("customer_persistence_failed");
  }

  return data.id;
}

async function upsertTransaction(supabase, { payload, customerId }) {
  const data = payload.data;
  const messageData = data.message_data;
  const externalTransactionId = messageData.refId;

  const { data: existing, error: existingError } = await supabase
    .from("transactions")
    .select("id, customer_id")
    .eq("provider", "lynk")
    .eq("external_transaction_id", externalTransactionId)
    .maybeSingle();

  if (existingError) {
    throw new Error("transaction_lookup_failed");
  }

  if (existing && existing.customer_id !== customerId) {
    throw new Error("transaction_customer_conflict");
  }

  const { data: transaction, error } = await supabase
    .from("transactions")
    .upsert(
      {
        provider: "lynk",
        external_transaction_id: externalTransactionId,
        customer_id: customerId,
        status: "successful",
        provider_status: data.message_action,
        total_amount: messageData.totals.grandTotal,
        raw_payload: payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: "provider,external_transaction_id" }
    )
    .select("id")
    .single();

  if (error || !transaction?.id) {
    throw new Error("transaction_persistence_failed");
  }

  return transaction.id;
}

async function resolveProducts(supabase, items) {
  const externalProductRefs = [...new Set(items.map((item) => item.externalProductRef))];
  const { data, error } = await supabase
    .from("products")
    .select("id, external_product_ref")
    .eq("provider", "lynk")
    .in("external_product_ref", externalProductRefs);

  if (error) {
    throw new Error("product_mapping_lookup_failed");
  }

  const productsByExternalRef = new Map(
    (data ?? []).map((product) => [product.external_product_ref, product.id])
  );

  return productsByExternalRef;
}

async function upsertTransactionItems(supabase, { transactionId, items, productsByExternalRef }) {
  const transactionItems = items.map((item) => ({
    transaction_id: transactionId,
    product_id: productsByExternalRef.get(item.externalProductRef) ?? null,
    external_product_ref: item.externalProductRef,
    provider_line_item_ref: null,
    item_fingerprint: item.itemFingerprint,
    quantity: item.quantity,
    unit_amount: item.unitAmount
  }));

  const { error } = await supabase
    .from("transaction_items")
    .upsert(transactionItems, { onConflict: "transaction_id,item_fingerprint" });

  if (error) {
    throw new Error("transaction_items_persistence_failed");
  }

  return transactionItems;
}

export async function processLynkPayment({ payload, webhookEventId }) {
  const supabase = createAdminClient();

  const { error: processingError } = await supabase
    .from("webhook_events")
    .update({ processing_status: "processing", error_message: null })
    .eq("id", webhookEventId);

  if (processingError) {
    throw new Error("webhook_processing_state_failed");
  }

  try {
    const messageData = payload.data.message_data;
    const customer = getCustomerIdentity(messageData);
    const items = normalizeItems(messageData);
    const customerId = await upsertCustomer(supabase, customer);
    const transactionId = await upsertTransaction(supabase, { payload, customerId });
    const productsByExternalRef = await resolveProducts(supabase, items);
    const transactionItems = await upsertTransactionItems(supabase, {
      transactionId,
      items,
      productsByExternalRef
    });

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("customer_id", customerId)
      .maybeSingle();

    if (member) {
      const { reconcileProductAccessForMember } = await import("@/features/auth/reconciliation");
      await reconcileProductAccessForMember({
        customerId,
        memberId: member.id
      });
    }

    const unknownProductRefs = transactionItems
      .filter((item) => item.product_id === null)
      .map((item) => item.external_product_ref);

    if (unknownProductRefs.length > 0) {
      console.warn(
        "[processLynkPayment] unmapped product refs — no product_access will be granted:",
        unknownProductRefs
      );
    }

    const { error: processedError } = await supabase
      .from("webhook_events")
      .update({
        processing_status: "processed",
        transaction_id: transactionId,
        processed_at: new Date().toISOString(),
        error_message: null
      })
      .eq("id", webhookEventId);

    if (processedError) {
      throw new Error("webhook_processed_state_failed");
    }

    return {
      transactionId,
      itemCount: transactionItems.length,
      unknownProductRefs
    };
  } catch (error) {
    await supabase
      .from("webhook_events")
      .update({
        processing_status: "failed",
        error_message: error instanceof Error ? error.message : "payment_processing_failed"
      })
      .eq("id", webhookEventId);

    throw error;
  }
}
