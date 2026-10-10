import { describe, expect, test } from "bun:test";
import {
	ConfigError,
	DEFAULT_BASE_URL,
	readConfig,
	validateBaseUrl,
} from "../src/config/env";
import { API_KEY } from "./helpers";

describe("validateBaseUrl", () => {
	test("keeps a self-hosted origin without a trailing slash", () => {
		expect(validateBaseUrl("https://mail.example.com/")).toBe(
			"https://mail.example.com",
		);
	});

	test("rejects a non-http protocol", () => {
		expect(() => validateBaseUrl("ftp://mail.example.com")).toThrow(
			ConfigError,
		);
	});

	test("rejects credentials in the URL", () => {
		expect(() => validateBaseUrl("https://user:pass@mail.example.com")).toThrow(
			ConfigError,
		);
	});

	test("rejects a query string", () => {
		expect(() => validateBaseUrl("https://mail.example.com?token=1")).toThrow(
			ConfigError,
		);
	});

	test("rejects a bare hostname", () => {
		expect(() => validateBaseUrl("mail.example.com")).toThrow(ConfigError);
	});
});

describe("readConfig", () => {
	test("falls back to the hosted base URL and defaults", () => {
		const config = readConfig({});
		expect(config.baseUrl).toBe(DEFAULT_BASE_URL);
		expect(config.apiKey).toBeUndefined();
		expect(config.timeoutMs).toBe(30000);
		expect(config.host).toBe("127.0.0.1");
		expect(config.port).toBe(3000);
		expect(config.allowedHosts).toEqual([]);
		expect(config.allowedOrigins).toEqual([]);
		expect(config.logLevel).toBe("info");
	});

	test("keeps a custom self-hosted base URL", () => {
		expect(
			readConfig({ RELOOP_BASE_URL: "https://mail.example.com/" }).baseUrl,
		).toBe("https://mail.example.com");
	});

	test("rejects an invalid PORT", () => {
		expect(() => readConfig({ PORT: "0" })).toThrow(/PORT/);
	});

	test("rejects an invalid RELOOP_TIMEOUT_MS", () => {
		expect(() => readConfig({ RELOOP_TIMEOUT_MS: "12" })).toThrow(
			/RELOOP_TIMEOUT_MS/,
		);
	});

	test("rejects an invalid LOG_LEVEL", () => {
		expect(() => readConfig({ LOG_LEVEL: "chatty" })).toThrow(/LOG_LEVEL/);
	});

	test("accepts a plausible API key", () => {
		expect(readConfig({ RELOOP_API_KEY: API_KEY }).apiKey).toBe(API_KEY);
	});

	test("rejects an implausible API key without echoing it", () => {
		const secret = "not a key!!";
		try {
			readConfig({ RELOOP_API_KEY: secret });
			throw new Error("expected readConfig to throw");
		} catch (cause) {
			expect(cause).toBeInstanceOf(ConfigError);
			expect(cause instanceof Error ? cause.message : "").not.toContain(secret);
		}
	});

	test("parses comma separated allowlists", () => {
		const config = readConfig({
			MCP_ALLOWED_HOSTS: " mcp.example.com , , other.example.com ",
		});
		expect(config.allowedHosts).toEqual([
			"mcp.example.com",
			"other.example.com",
		]);
	});
});
