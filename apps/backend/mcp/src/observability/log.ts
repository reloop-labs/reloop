import type { LogLevel } from "../config/env";

export type Fields = Record<string, unknown>;

export type Logger = {
	debug(msg: string, fields?: Fields): void;
	info(msg: string, fields?: Fields): void;
	warn(msg: string, fields?: Fields): void;
	error(msg: string, fields?: Fields): void;
	child(fields: Fields): Logger;
};

export type LoggerOptions = {
	level: LogLevel;
	sink?: (line: string) => void;
	fields?: Fields;
};

type EmittableLevel = Exclude<LogLevel, "silent">;

const LEVEL_ORDER: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
	silent: 50,
};

const API_KEY_VALUE = /\b([a-z]{2,10}_[a-z]{2,10}_)[A-Za-z0-9_-]{8,}/gi;
const CREDENTIAL_HEADER =
	/("?(?:authorization|x-api-key)"?\s*[:=]\s*"?)(?:bearer\s+)?[^\s,;"']+/gi;

export function redact(text: string): string {
	return text
		.replace(API_KEY_VALUE, "$1[redacted]")
		.replace(CREDENTIAL_HEADER, "$1[redacted]");
}

function redactValue(value: unknown): unknown {
	if (typeof value === "string") {
		return redact(value);
	}
	if (value instanceof Error) {
		return { name: value.name, message: redact(value.message) };
	}
	if (
		value === null ||
		value === undefined ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return value;
	}
	const serialized = JSON.stringify(value);
	return redact(serialized ?? String(value));
}

function writeToStderr(line: string): void {
	process.stderr.write(`${line}\n`);
}

export function createLogger(options: LoggerOptions): Logger {
	const sink = options.sink ?? writeToStderr;
	const baseFields = options.fields ?? {};
	const threshold = LEVEL_ORDER[options.level];

	const emit = (level: EmittableLevel, msg: string, fields?: Fields): void => {
		if (LEVEL_ORDER[level] < threshold) {
			return;
		}
		const payload: Fields = {
			time: new Date().toISOString(),
			level,
			msg: redact(msg),
		};
		for (const [key, value] of Object.entries({ ...baseFields, ...fields })) {
			payload[key] = redactValue(value);
		}
		sink(JSON.stringify(payload));
	};

	return {
		debug: (msg, fields) => emit("debug", msg, fields),
		info: (msg, fields) => emit("info", msg, fields),
		warn: (msg, fields) => emit("warn", msg, fields),
		error: (msg, fields) => emit("error", msg, fields),
		child: (fields) =>
			createLogger({
				level: options.level,
				sink,
				fields: { ...baseFields, ...fields },
			}),
	};
}
