export const adminConfig = {
	PORT: Number(process.env.PORT || "8024"),
	NODE_ENV: process.env.NODE_ENV || "development",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
};
