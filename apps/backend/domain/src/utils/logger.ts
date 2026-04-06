import { domainConfig } from "@be/domain/domain.config";

/**
 * Creates a structured log entry in the centralized logs service.
 * This is a service-specific implementation that uses domain-specific configuration.
 */
export async function createLog(body: {
  event: string;
  level?: "debug" | "info" | "warn" | "error" | "fatal";
  trace_id?: string;
  metadata?: Record<string, unknown>;
  // Context fields
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
  organization_id?: string;
  user_id?: string;
}) {
  const url = `${domainConfig.BASE_URL}/api/logs/v1/create`;
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
        "x-log-api-key": domainConfig.LOGS_API_KEY,
        ...(cookie && { cookie }),
      },
      body: JSON.stringify({
        event,
        level,
        source: "domain",
        trace_id:
          trace_id ||
          (typeof crypto !== "undefined" ? crypto.randomUUID() : undefined),
        metadata,
        status_code: requestDetails.statusCode,
        requestDetails,
      }),
    });
  } catch (error) {
    // Log locally if remote logging fails
    console.error("[Domain Service] Error calling logs service:", error);
  }
}
