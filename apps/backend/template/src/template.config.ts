export const templateConfig = {
	port: Number(process.env.PORT || "8019"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
	OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
	GEMMA_MODEL: process.env.GEMMA_MODEL || "gemma2:9b",
	/** OpenRouter (free-tier models work with a free API key) */
	OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
	/** Default OpenRouter model for template generation */
	OPENROUTER_MODEL:
		process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free",
	/** Multimodal model used when the agent receives image attachments */
	VISION_MODEL:
		process.env.VISION_MODEL ||
		process.env.GEMINI_VISION_MODEL ||
		"gemini-2.0-flash",
	/** Max reference images per agent turn */
	VISION_MAX_IMAGES: Number(process.env.VISION_MAX_IMAGES || "4"),

	constants: {
		maxTemplateNameLength: 255,
		maxSubjectLength: 500,
		defaultPageSize: 10,
		maxPageSize: 100,
	},
};
