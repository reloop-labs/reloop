import { isPlausibleApiKey } from "../auth/api-key";

export type Env = Record<string, string | undefined>;

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export type Config = {
	baseUrl: string;
	apiKey?: string;
	timeoutMs: number;
	host: string;
	port: number;
	allowedHosts: string[];
	allowedOrigins: string[];
	logLevel: LogLevel;
};

export const DEFAULT_BASE_URL = "https://reloop.sh";

const DEFAULT_TIMEOUT_MS = 30000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 600000;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;
const LOG_LEVELS: readonly LogLevel[] = [
	"debug",
	"info",
	"warn",
	"error",
	"silent",
];
const BASE_URL_FIX =
	"Set RELOOP_BASE_URL to the origin of your Reloop instance, for example https://mail.example.com";

export class ConfigError extends Error {
	readonly code = "config_error";
	readonly fix?: string;

	constructor(message: string, fix?: string) {
		super(message);
		this.name = "ConfigError";
		this.fix = fix;
	}
}

export function validateBaseUrl(raw: string): string {
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new ConfigError(
			`RELOOP_BASE_URL is not a valid URL: ${raw}`,
			BASE_URL_FIX,
		);
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new ConfigError(
			`RELOOP_BASE_URL must use http or https, got ${url.protocol.replace(":", "")}`,
			BASE_URL_FIX,
		);
	}
	if (url.username !== "" || url.password !== "") {
		throw new ConfigError(
			"RELOOP_BASE_URL must not contain credentials",
			BASE_URL_FIX,
		);
	}
	if (url.search !== "" || url.hash !== "") {
		throw new ConfigError(
			"RELOOP_BASE_URL must not contain a query string or fragment",
			BASE_URL_FIX,
		);
	}
	return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

function readText(env: Env, name: string): string | undefined {
	const raw = env[name]?.trim();
	return raw !== undefined && raw.length > 0 ? raw : undefined;
}

function readInteger(
	env: Env,
	name: string,
	fallback: number,
	min: number,
	max: number,
): number {
	const raw = readText(env, name);
	if (raw === undefined) {
		return fallback;
	}
	const value = Number(raw);
	if (!Number.isInteger(value) || value < min || value > max) {
		throw new ConfigError(
			`${name} must be an integer between ${min} and ${max}`,
			`Set ${name} to a whole number between ${min} and ${max}, or unset it to use ${fallback}.`,
		);
	}
	return value;
}

function readList(env: Env, name: string): string[] {
	const raw = env[name];
	if (raw === undefined) {
		return [];
	}
	return raw
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function readLogLevel(env: Env): LogLevel {
	const raw = readText(env, "LOG_LEVEL")?.toLowerCase();
	if (raw === undefined) {
		return "info";
	}
	const level = LOG_LEVELS.find((candidate) => candidate === raw);
	if (level === undefined) {
		throw new ConfigError(
			`LOG_LEVEL must be one of ${LOG_LEVELS.join(", ")}`,
			"Set LOG_LEVEL to debug, info, warn, error, or silent.",
		);
	}
	return level;
}

function readApiKey(env: Env): string | undefined {
	const apiKey = readText(env, "RELOOP_API_KEY");
	if (apiKey !== undefined && !isPlausibleApiKey(apiKey)) {
		throw new ConfigError(
			"RELOOP_API_KEY does not look like a Reloop API key",
			"Copy the key from the Reloop dashboard under API keys. It is 24 to 128 characters of letters, digits, underscores, and hyphens.",
		);
	}
	return apiKey;
}

export function readConfig(env: Env): Config {
	return {
		baseUrl: validateBaseUrl(
			readText(env, "RELOOP_BASE_URL") ?? DEFAULT_BASE_URL,
		),
		apiKey: readApiKey(env),
		timeoutMs: readInteger(
			env,
			"RELOOP_TIMEOUT_MS",
			DEFAULT_TIMEOUT_MS,
			MIN_TIMEOUT_MS,
			MAX_TIMEOUT_MS,
		),
		host: readText(env, "HOST") ?? DEFAULT_HOST,
		port: readInteger(env, "PORT", DEFAULT_PORT, 1, 65535),
		allowedHosts: readList(env, "MCP_ALLOWED_HOSTS"),
		allowedOrigins: readList(env, "MCP_ALLOWED_ORIGINS"),
		logLevel: readLogLevel(env),
	};
}
