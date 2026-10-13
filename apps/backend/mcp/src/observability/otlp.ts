import { sendBatchToOTLP } from "evlog/otlp";
import type { Fields } from "./log";

export type OtlpExporterOptions = {
	endpoint: string;
	headers?: Record<string, string>;
	service: string;
	environment: string;
	version: string;
	commit: string;
	/** Flush after this many buffered records. */
	maxBatch?: number;
	/** Flush at least this often while records are buffered. */
	flushIntervalMs?: number;
	send?: typeof sendBatchToOTLP;
	onError?: (cause: unknown) => void;
};

export type OtlpExporter = {
	/** Queues an already-redacted log record. Never throws. */
	export(record: Fields): void;
	flush(): Promise<void>;
};

const DEFAULT_MAX_BATCH = 50;
const DEFAULT_FLUSH_INTERVAL_MS = 2000;
const MAX_BUFFERED = 5000;

type Level = "debug" | "info" | "warn" | "error";

function toLevel(value: unknown): Level {
	return value === "debug" || value === "warn" || value === "error"
		? value
		: "info";
}

/**
 * Ships log records to an OTLP/HTTP logs endpoint (SigNoz) in the same wide
 * event shape the other Reloop services emit through evlog, so MCP logs share
 * their `service`, `environment`, `version` and `commitHash` attributes.
 * Export failures are reported once per outage and never reach the caller.
 */
export function createOtlpExporter(options: OtlpExporterOptions): OtlpExporter {
	const send = options.send ?? sendBatchToOTLP;
	const maxBatch = options.maxBatch ?? DEFAULT_MAX_BATCH;
	const interval = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
	const config = {
		endpoint: options.endpoint,
		headers: options.headers,
		serviceName: options.service,
	};
	let buffer: Fields[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;
	let failing = false;

	const flush = async (): Promise<void> => {
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
		if (buffer.length === 0) {
			return;
		}
		const batch = buffer;
		buffer = [];
		const events = batch.map(({ time, level, ...fields }) => ({
			...fields,
			timestamp: typeof time === "string" ? time : new Date().toISOString(),
			level: toLevel(level),
			service: options.service,
			environment: options.environment,
			version: options.version,
			commitHash: options.commit,
		}));
		try {
			await send(events, config);
			failing = false;
		} catch (cause) {
			if (!failing) {
				failing = true;
				options.onError?.(cause);
			}
		}
	};

	return {
		export(record) {
			if (buffer.length >= MAX_BUFFERED) {
				buffer.shift();
			}
			buffer.push(record);
			if (buffer.length >= maxBatch) {
				void flush();
				return;
			}
			if (timer === undefined) {
				timer = setTimeout(() => void flush(), interval);
				timer.unref?.();
			}
		},
		flush,
	};
}

/** Parses `OTEL_EXPORTER_OTLP_HEADERS` (`key=value,key2=value2`, URL-encoded). */
export function parseOtlpHeaders(
	raw: string | undefined,
): Record<string, string> | undefined {
	if (raw === undefined || raw.trim().length === 0) {
		return undefined;
	}
	const headers: Record<string, string> = {};
	for (const pair of decodeURIComponent(raw).split(",")) {
		const eq = pair.indexOf("=");
		if (eq > 0) {
			const key = pair.slice(0, eq).trim();
			const value = pair.slice(eq + 1).trim();
			if (key.length > 0 && value.length > 0) {
				headers[key] = value;
			}
		}
	}
	return Object.keys(headers).length > 0 ? headers : undefined;
}
