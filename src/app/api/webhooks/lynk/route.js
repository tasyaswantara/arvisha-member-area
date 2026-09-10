import { createHash, timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { processLynkPayment } from "@/features/webhooks/lynk/processPayment";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function invalidPayloadResponse() {
  return Response.json(
    {
      ok: false,
      error: "Invalid Lynk webhook payload."
    },
    { status: 400 }
  );
}

function configurationErrorResponse() {
  return Response.json(
    {
      ok: false,
      error: "Webhook configuration is unavailable."
    },
    { status: 500 }
  );
}

function databaseErrorResponse() {
  return Response.json(
    {
      ok: false,
      error: "Webhook could not be recorded."
    },
    { status: 500 }
  );
}

function signaturesMatch(calculatedSignature, receivedSignature) {
  const calculatedBuffer = Buffer.from(calculatedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(calculatedBuffer, receivedBuffer);
}

function hasPaymentStructure(payload) {
  const data = payload.data;

  if (!isObject(data)) {
    return false;
  }

  const messageData = data.message_data;

  if (!isObject(messageData)) {
    return false;
  }

  const totals = messageData.totals;

  return (
    typeof data.message_action === "string" &&
    data.message_action.length > 0 &&
    typeof data.message_code === "string" &&
    data.message_code.length > 0 &&
    typeof data.message_id === "string" &&
    data.message_id.length > 0 &&
    typeof messageData.refId === "string" &&
    messageData.refId.length > 0 &&
    isObject(totals) &&
    typeof totals.grandTotal === "number" &&
    Number.isFinite(totals.grandTotal)
  );
}

function calculatePayloadHash(rawBody) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

async function persistWebhookEvent({ payload, rawBody }) {
  const { message_id: messageId } = payload.data;
  const supabase = createAdminClient();
  const payloadHash = calculatePayloadHash(rawBody);

  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      provider: "lynk",
      external_event_id: messageId,
      event_type: "payment.received",
      payload_hash: payloadHash,
      payload,
      processing_status: "received"
    })
    .select("id, processing_status, transaction_id, payload")
    .single();

  if (!error) {
    return { duplicate: false, event: data };
  }

  if (error.code !== "23505") {
    return { error: true };
  }

  const { data: existingEvent, error: lookupError } = await supabase
    .from("webhook_events")
    .select("id, processing_status, transaction_id, payload")
    .eq("provider", "lynk")
    .eq("external_event_id", messageId)
    .maybeSingle();

  if (lookupError || !existingEvent) {
    return { error: true };
  }

  return { duplicate: true, event: existingEvent };
}

export async function POST(request) {
  let rawBody;
  let payload;

  try {
    rawBody = await request.text();
    payload = JSON.parse(rawBody);
  } catch {
    return invalidPayloadResponse();
  }

  if (!isObject(payload) || typeof payload.event !== "string") {
    return invalidPayloadResponse();
  }

  if (payload.event === "test_event") {
    return Response.json({
      ok: true,
      test: true
    });
  }

  if (payload.event !== "payment.received" || !hasPaymentStructure(payload)) {
    return invalidPayloadResponse();
  }

  const merchantKey = process.env.LYNK_MERCHANT_KEY;

  if (!merchantKey) {
    return configurationErrorResponse();
  }

  const receivedSignature = request.headers.get("x-lynk-signature");

  if (!receivedSignature) {
    return Response.json(
      {
        ok: false,
        error: "Webhook signature is required."
      },
      { status: 401 }
    );
  }

  const { message_id: messageId, message_data: messageData } = payload.data;
  const { refId, totals } = messageData;
  const signatureString =
    String(totals.grandTotal) + refId + messageId + merchantKey;
  const calculatedSignature = createHash("sha256")
    .update(signatureString)
    .digest("hex");

  if (!signaturesMatch(calculatedSignature, receivedSignature)) {
    return Response.json(
      {
        ok: false,
        error: "Invalid webhook signature."
      },
      { status: 401 }
    );
  }

  if (
    payload.data.message_action !== "SUCCESS" ||
    payload.data.message_code !== "0"
  ) {
    return Response.json({
      ok: true,
      received: true,
      ignored: true
    });
  }

  try {
    const result = await persistWebhookEvent({ payload, rawBody });

    if (result.error) {
      return databaseErrorResponse();
    }

    if (result.event.processing_status === "processing") {
      return Response.json({
        ok: true,
        received: true
      });
    }

    if (result.event.processing_status === "processed" && result.event.transaction_id) {
      return Response.json({
        ok: true,
        received: true,
        duplicate: true
      });
    }

    await processLynkPayment({
      payload: result.event.payload,
      webhookEventId: result.event.id
    });

    return Response.json({
      ok: true,
      received: true,
      ...(result.duplicate ? { duplicate: true } : {})
    });
  } catch {
    return databaseErrorResponse();
  }
}
