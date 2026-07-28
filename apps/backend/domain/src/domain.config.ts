export const domainConfig = {
	port: Number(process.env.PORT || "8011"),
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
	HOST_DOMAIN: process.env.HOST_DOMAIN || "reloop.sh",
	TRACKING_DOMAIN:
		process.env.TRACKING_DOMAIN ||
		`link.${process.env.HOST_DOMAIN || "reloop.sh"}`,
	DKIM_SELECTOR: process.env.DKIM_SELECTOR || "reloop",
	/**
	 * Onboarding “Send email” From domain. Reserved — customers cannot add it.
	 * Separate from RELOOP_SENDER_DOMAIN (system product mail).
	 */
	ONBOARDING_TEST_DOMAIN: process.env.ONBOARDING_TEST_DOMAIN || "",
	/**
	 * System product mail From domain (auth, billing, …). Reserved when set.
	 * Separate from ONBOARDING_TEST_DOMAIN.
	 */
	RELOOP_SENDER_DOMAIN: process.env.RELOOP_SENDER_DOMAIN || "",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	RELOOP_INTERNAL_SECRET:
		process.env.RELOOP_INTERNAL_SECRET || "reloop_internal_secret_default_123",
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",

	// Domain Connect (Synchronous Flow)
	DOMAIN_CONNECT_PROVIDER_ID:
		process.env.DOMAIN_CONNECT_PROVIDER_ID || "reloop.sh",
	DOMAIN_CONNECT_SERVICE_ID:
		process.env.DOMAIN_CONNECT_SERVICE_ID || "email-setup",
	// Coolify/Docker often store multiline PEMs with literal `\n` — normalize those.
	DOMAIN_CONNECT_SIGNING_PRIVATE_KEY: (
		process.env.DOMAIN_CONNECT_SIGNING_PRIVATE_KEY || ""
	)
		.replace(/\\n/g, "\n")
		.trim(),
	DOMAIN_CONNECT_SIGNING_PUB_KEY_ID:
		process.env.DOMAIN_CONNECT_SIGNING_PUB_KEY_ID || "_dc",

	constants: {
		keyLength: 2048,
		mxPriority: 10,
		/** Stored default; receiving MX uses the verified domain host, not this label. */
		defaultCustomReturnPath: "inbound",
		/** Customer tracking CNAME host label (e.g. link.example.com → link.reloop.sh). */
		defaultTrackingSubdomain: "link",
	},
};
