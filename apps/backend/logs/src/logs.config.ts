const parseClickHouseUrl = () => {
	const rawUrl = process.env.CLICKHOUSE_URL || "http://localhost:8123";

	try {
		const parsed = new URL(rawUrl);
		const username = parsed.username
			? decodeURIComponent(parsed.username)
			: process.env.CLICKHOUSE_USER || "default";
		const password = parsed.password
			? decodeURIComponent(parsed.password)
			: process.env.CLICKHOUSE_PASSWORD || "reloop123";
		const database =
			parsed.pathname && parsed.pathname !== "/"
				? decodeURIComponent(parsed.pathname.replace(/^\//, ""))
				: process.env.CLICKHOUSE_DATABASE ||
					process.env.CLICKHOUSE_DB ||
					"reloop";

		let protocol = parsed.protocol;
		if (protocol === "clickhouse:") {
			protocol = "http:";
		} else if (protocol === "clickhouses:") {
			protocol = "https:";
		}

		let host = parsed.host;
		if (parsed.port === "9000") {
			host = host.replace(":9000", ":8123");
		} else if (parsed.port === "9440") {
			host = host.replace(":9440", ":8443");
		}

		const url = `${protocol}//${host}`;

		return {
			url,
			username,
			password,
			database,
		};
	} catch {
		return {
			url: rawUrl,
			username: process.env.CLICKHOUSE_USER || "default",
			password: process.env.CLICKHOUSE_PASSWORD || "reloop123",
			database:
				process.env.CLICKHOUSE_DATABASE ||
				process.env.CLICKHOUSE_DB ||
				"reloop",
		};
	}
};

const clickhouseParsed = parseClickHouseUrl();

export const logsConfig = {
	port: Number(process.env.PORT || "8016"),
	NODE_ENV: process.env.NODE_ENV || "development",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	clickhouse: clickhouseParsed,
	OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
	OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
} as const;
