import { authServerConfig } from "@reloop/auth/server/config";

/**
 * Auth service process config.
 * Shared Better Auth / env keys come from {@link authServerConfig}
 * (single source of truth). Service-only fields live here.
 */
export const authConfig = {
	...authServerConfig,
	port: Number(process.env.PORT || "8000"),
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
};
