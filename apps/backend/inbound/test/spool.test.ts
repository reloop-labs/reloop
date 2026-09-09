import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * TypeScript mirror of parse_min_free_space in init.lua.
 * KumoMTA only accepts a percent string ("10%") or a byte count (number).
 * Env values like "10MB" must be converted or kumod refuses to start.
 */
function parseMinFreeSpace(raw: unknown): string | number {
	if (raw == null || raw === "") {
		return "1%";
	}
	const s = String(raw).trim();
	if (/^\d+%$/.test(s)) {
		return s;
	}
	const asNumber = Number(s);
	if (s !== "" && Number.isFinite(asNumber) && String(asNumber) === s) {
		return asNumber;
	}
	const match = s.match(/^(\d+\.?\d*)\s*([A-Za-z]+)$/);
	if (match?.[1] && match[2]) {
		const multipliers: Record<string, number> = {
			b: 1,
			byte: 1,
			bytes: 1,
			k: 1024,
			kb: 1024,
			kib: 1024,
			m: 1024 * 1024,
			mb: 1024 * 1024,
			mib: 1024 * 1024,
			g: 1024 * 1024 * 1024,
			gb: 1024 * 1024 * 1024,
			gib: 1024 * 1024 * 1024,
			t: 1024 * 1024 * 1024 * 1024,
			tb: 1024 * 1024 * 1024 * 1024,
			tib: 1024 * 1024 * 1024 * 1024,
		};
		const mul = multipliers[match[2].toLowerCase()];
		if (mul) {
			return Math.floor(Number(match[1]) * mul);
		}
	}
	return "1%";
}

const inboundDir = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("parseMinFreeSpace", () => {
	test("defaults empty values to 1%", () => {
		expect(parseMinFreeSpace(undefined)).toBe("1%");
		expect(parseMinFreeSpace(null)).toBe("1%");
		expect(parseMinFreeSpace("")).toBe("1%");
		expect(parseMinFreeSpace("  ")).toBe("1%");
	});

	test("passes through percent strings", () => {
		expect(parseMinFreeSpace("1%")).toBe("1%");
		expect(parseMinFreeSpace("10%")).toBe("10%");
		expect(parseMinFreeSpace(" 5% ")).toBe("5%");
	});

	test("passes through raw byte counts", () => {
		expect(parseMinFreeSpace("0")).toBe(0);
		expect(parseMinFreeSpace("10485760")).toBe(10485760);
	});

	test("converts human sizes that crash kumod if passed through", () => {
		expect(parseMinFreeSpace("10MB")).toBe(10 * 1024 * 1024);
		expect(parseMinFreeSpace("10mb")).toBe(10 * 1024 * 1024);
		expect(parseMinFreeSpace("10MiB")).toBe(10 * 1024 * 1024);
		expect(parseMinFreeSpace("1GB")).toBe(1024 * 1024 * 1024);
	});

	test("falls back to 1% for invalid specifiers", () => {
		expect(parseMinFreeSpace("plenty")).toBe("1%");
		expect(parseMinFreeSpace("10 bananas")).toBe("1%");
	});
});

describe("inbound spool policy stays wired", () => {
	test("init.lua parses KUMOMTA_MIN_FREE_SPACE before define_spool", () => {
		const initLua = readFileSync(join(inboundDir, "init.lua"), "utf8");
		expect(initLua).toContain("local function parse_min_free_space(raw)");
		expect(initLua).toContain(
			'parse_min_free_space(os.getenv("KUMOMTA_MIN_FREE_SPACE"))',
		);
		expect(initLua).toContain("min_free_space = min_free_space");
		expect(initLua).toContain("path = '/var/spool/kumomta/data'");
		expect(initLua).toContain("path = '/var/spool/kumomta/meta'");
	});

	test("entrypoint chowns spool dirs so Coolify volumes are writable by kumod", () => {
		const entrypoint = readFileSync(join(inboundDir, "entrypoint.sh"), "utf8");
		expect(entrypoint).toContain("/var/spool/kumomta/data");
		expect(entrypoint).toContain("chown -R kumod:kumod");
		expect(entrypoint).toContain("--user kumod");
	});
});
