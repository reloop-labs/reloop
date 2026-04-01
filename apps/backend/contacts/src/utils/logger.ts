import { contactsConfig } from "@be/contacts/contacts.config";
import logger from "@reloop/logger";
/**
 * Creates a structured log entry in the centralized logs service.
 * This is a service-specific implementation that uses contacts-specific configuration.
 */
export async function createLog(body: {
  event: string;
  level?: "debug" | "info" | "warn" | "error" | "fatal";
  trace_id?: string;
  metadata?: Record<string, unknown>;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  cookie?: string;
}) {
  const url = `${contactsConfig.BASE_URL}/api/logs/v1/create`;
  const {
    event,
    level = "info",
    trace_id,
    metadata = {},
    requestDetails = {},
    cookie,
  } = body;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-log-api-key": contactsConfig.LOGS_API_KEY,
        ...(cookie && { cookie }),
      },
      body: JSON.stringify({
        event,
        level,
        trace_id:
          trace_id ||
          (typeof crypto !== "undefined" ? crypto.randomUUID() : undefined),
        metadata,
        requestDetails,
      }),
    });
  } catch (error) {
    logger.error({ error }, "Error calling logs service");
  }
}
