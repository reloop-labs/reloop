/**
 * Parse a single ClickHouse connection URL into client options.
 *
 * Supported forms (credentials + database optional — defaults fill gaps):
 *   http://default:reloop123@localhost:8123/reloop
 *   https://user:pass@clickhouse.example:8443/analytics
 *   clickhouse://...  /  clickhouses://...  (mapped to http/https)
 *
 * Port is taken as-is from the URL — no remapping.
 */
const parseClickHouseUrl = (rawUrl: string) => {
	const defaults = {
		username: "default",
		password: "reloop123",
		database: "reloop",
	} as const;

	try {
		const parsed = new URL(rawUrl);
		const username = parsed.username
			? decodeURIComponent(parsed.username)
			: defaults.username;
		const password = parsed.password
			? decodeURIComponent(parsed.password)
			: defaults.password;
		const database =
			parsed.pathname && parsed.pathname !== "/"
				? decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0]!)
				: defaults.database;

		let protocol = parsed.protocol;
		if (protocol === "clickhouse:") {
			protocol = "http:";
		} else if (protocol === "clickhouses:") {
			protocol = "https:";
		}

		return {
			url: `${protocol}//${parsed.host}`,
			username,
			password,
			database,
		};
	} catch {
		return {
			url: rawUrl,
			...defaults,
		};
	}
};

export const logsConfig = {
	port: Number(process.env.PORT || "8016"),
	NODE_ENV: process.env.NODE_ENV || "development",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	// All of host/user/pass/db come from this one URL — no separate env vars.
	clickhouse: parseClickHouseUrl(
		process.env.CLICKHOUSE_URL ||
			"http://default:reloop123@localhost:8123/reloop",
	),
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
} as const;
