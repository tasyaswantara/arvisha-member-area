import { createHash, timingSafeEqual } from "node:crypto";

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

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
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

  if (payload.data.message_action !== "SUCCESS") {
    return Response.json({
      ok: true,
      received: true,
      ignored: true
    });
  }

  return Response.json({
    ok: true,
    received: true
  });
}
