import { describe, expect, test } from "bun:test";
import { createLogger, redact } from "../src/observability/log";
import { API_KEY, capturingLogger } from "./helpers";

describe("redact", () => {
	test("masks a Reloop key", () => {
		expect(redact(`key ${API_KEY} used`)).toBe("key rl_prod_[redacted] used");
	});

	test("masks an x-api-key header fragment", () => {
		expect(redact("x-api-key: sk-abcdef")).toBe("x-api-key: [redacted]");
	});

	test("masks an authorization bearer fragment", () => {
		expect(redact("authorization: Bearer sk-abcdef")).toBe(
			"authorization: [redacted]",
		);
	});
});

describe("createLogger", () => {
	test("honours the level threshold", () => {
		const lines: string[] = [];
		const logger = createLogger({
			level: "warn",
			sink: (line) => lines.push(line),
		});
		logger.debug("hidden");
		logger.info("hidden");
		logger.warn("shown");
		logger.error("shown too");
		expect(lines).toHaveLength(2);
	});

	test("emits nothing at silent", () => {
		const lines: string[] = [];
		const logger = createLogger({
			level: "silent",
			sink: (line) => lines.push(line),
		});
		logger.error("nope");
		expect(lines).toHaveLength(0);
	});

	test("redacts a key in a field value", () => {
		const { logger, lines } = capturingLogger();
		logger.info("outbound", { header: `x-api-key: ${API_KEY}` });
		expect(lines[0]).not.toContain(API_KEY);
		expect(lines[0]).toContain("[redacted]");
	});

	test("logs errors without a stack", () => {
		const { logger, lines } = capturingLogger();
		logger.error("failed", { cause: new TypeError(`bad ${API_KEY}`) });
		const line = lines[0] ?? "";
		expect(line).toContain("TypeError");
		expect(line).not.toContain("stack");
		expect(line).not.toContain(API_KEY);
	});

	test("child loggers merge fields", () => {
		const lines: string[] = [];
		const logger = createLogger({
			level: "debug",
			sink: (line) => lines.push(line),
		}).child({
			requestId: "req_1",
		});
		logger.debug("hello", { extra: 1 });
		expect(lines[0]).toContain('"requestId":"req_1"');
		expect(lines[0]).toContain('"extra":1');
	});
});

describe("redact hardening", () => {
	test("masks keys inside JSON-serialized headers and other prefixes", () => {
		expect(
			redact('{"authorization":"Bearer rl_stag_ABCDEFGHIJKLMNOPQRSTUVWX"}'),
		).not.toContain("ABCDEFGHIJKLMNOP");
		expect(redact("RL_PROD_ABCDEFGHIJKLMNOP")).not.toContain(
			"ABCDEFGHIJKLMNOP",
		);
		expect(redact("org_live_ABCDEFGHIJKLMNOPQRSTUV")).toBe(
			"org_live_[redacted]",
		);
		expect(redact(`{"x-api-key":"${API_KEY}"}`)).not.toContain(API_KEY);
	});

	test("leaves ordinary identifiers alone", () => {
		expect(redact("contact_not_found con_123456789 req_abc-123")).toBe(
			"contact_not_found con_123456789 req_abc-123",
		);
	});
});
