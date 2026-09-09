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

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return invalidPayloadResponse();
  }

  const messageData = payload?.data?.message_data;
  const hasMinimumStructure =
    isObject(payload) &&
    typeof payload.event === "string" &&
    isObject(payload.data) &&
    typeof payload.data.message_action === "string" &&
    typeof payload.data.message_code === "string" &&
    isObject(messageData);

  if (!hasMinimumStructure) {
    return invalidPayloadResponse();
  }

  // TODO: Add Lynk webhook authentication/signature verification after the
  // official webhook documentation and a verified test request are available.
  const isSuccessfulPayment =
    payload.event === "payment.received" &&
    payload.data.message_action === "SUCCESS";

  if (isSuccessfulPayment) {
    return Response.json({
      ok: true,
      received: true
    });
  }

  return Response.json({
    ok: true,
    received: true,
    ignored: true
  });
}
