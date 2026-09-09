function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function describeStructure(value, depth = 0) {
  if (value === null) {
    return { type: "null" };
  }

  if (Array.isArray(value)) {
    const objectItemKeys = [
      ...new Set(value.filter(isObject).flatMap((item) => Object.keys(item)))
    ];

    return {
      type: "array",
      length: value.length,
      itemKeys: objectItemKeys.slice(0, 100),
      itemKeysTruncated: objectItemKeys.length > 100
    };
  }

  if (!isObject(value)) {
    return { type: typeof value };
  }

  const keys = Object.keys(value);
  const summary = {
    type: "object",
    keys: keys.slice(0, 100),
    keysTruncated: keys.length > 100
  };

  if (depth >= 4) {
    return summary;
  }

  const nested = {};

  for (const [key, child] of Object.entries(value)) {
    if (child !== null && typeof child === "object") {
      nested[key] = describeStructure(child, depth + 1);
    }
  }

  if (Object.keys(nested).length > 0) {
    summary.nested = nested;
  }

  return summary;
}

function sanitizeWebhookPayload(payload) {
  const summary = describeStructure(payload);

  if (!isObject(payload)) {
    return summary;
  }

  if (typeof payload.event === "string") {
    summary.event = payload.event;
  }

  if (isObject(payload.data)) {
    summary.data = {
      ...summary.nested?.data,
      message_action: payload.data.message_action,
      message_code: payload.data.message_code
    };
  }

  return summary;
}

function getDebugHeaders(request) {
  const protectedHeaderPattern =
    /authorization|cookie|signature|merchant|token|secret|api[-_]?key/i;
  const protectedHeaderNames = [];

  for (const [name] of request.headers) {
    if (protectedHeaderPattern.test(name)) {
      protectedHeaderNames.push(name);
    }
  }

  return {
    contentType: request.headers.get("content-type"),
    userAgent: request.headers.get("user-agent"),
    protectedHeaderNames
  };
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
  let rawBody;

  try {
    rawBody = await request.text();
  } catch {
    return invalidPayloadResponse();
  }

  let payload;
  let validJson = true;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    validJson = false;
  }

  // TEMPORARY Phase 5C-2 debug instrumentation. Remove after the real Lynk
  // test payload has been inspected. No body values or protected headers are logged.
  console.info("[Lynk webhook debug]", {
    headers: getDebugHeaders(request),
    body: {
      length: rawBody.length,
      validJson,
      structure: validJson ? sanitizeWebhookPayload(payload) : null
    }
  });

  if (!validJson) {
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
