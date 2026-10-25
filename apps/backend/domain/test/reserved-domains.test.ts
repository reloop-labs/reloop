import { describe, expect, test } from "bun:test";
import { isReservedDomain } from "../src/lib/reserved-domains";

describe("isReservedDomain", () => {
	test("reserves the platform host domain", () => {
		expect(isReservedDomain("reloop.sh")).toBe(true);
		expect(isReservedDomain("RELOOP.SH.")).toBe(true);
	});

	test("reserves every subdomain of it", () => {
		expect(isReservedDomain("smtp.reloop.sh")).toBe(true);
		expect(isReservedDomain("a.b.reloop.sh")).toBe(true);
	});

	test("leaves look-alike customer domains alone", () => {
		expect(isReservedDomain("notreloop.sh")).toBe(false);
		expect(isReservedDomain("reloop.sh.example.com")).toBe(false);
		expect(isReservedDomain("example.com")).toBe(false);
	});
});
