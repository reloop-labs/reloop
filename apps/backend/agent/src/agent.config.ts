export const agentConfig = {
	port: Number(process.env.PORT || "8035"),
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	RELOOP_INTERNAL_SECRET:
		process.env.RELOOP_INTERNAL_SECRET || "reloop_internal_secret_default_123",
	DISABLE_SIGNUP: process.env.DISABLE_SIGNUP || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	services: {
		mail: process.env.MAIL_SERVICE_URL || "http://localhost:8001",
		domain: process.env.DOMAIN_SERVICE_URL || "http://localhost:8011",
		contacts: process.env.CONTACTS_SERVICE_URL || "http://localhost:8014",
		template: process.env.TEMPLATE_SERVICE_URL || "http://localhost:8015",
		workflow: process.env.WORKFLOW_SERVICE_URL || "http://localhost:8016",
		inbox: process.env.INBOX_SERVICE_URL || "http://localhost:8017",
		logs: process.env.LOGS_SERVICE_URL || "http://localhost:8019",
		tools: process.env.TOOLS_SERVICE_URL || "http://localhost:8026",
	},
};
