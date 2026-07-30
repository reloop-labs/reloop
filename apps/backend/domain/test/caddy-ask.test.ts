import { describe, expect, test } from "bun:test";
import { normalizeHostname } from "../src/routes/caddy/ask/ask.controllers";

describe("normalizeHostname", () => {
	test("lowercases and trims", () => {
		expect(normalizeHostname("  Link.Example.COM  ")).toBe("link.example.com");
	});

	test("strips trailing DNS root dot", () => {
		expect(normalizeHostname("link.example.com.")).toBe("link.example.com");
	});

	test("empty / whitespace only", () => {
		expect(normalizeHostname("")).toBe("");
		expect(normalizeHostname("   ")).toBe("");
	});
});
