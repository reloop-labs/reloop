import { describe, expect, test } from "bun:test";
import { type ApiKeyScope, scopeAllowsAddress } from "../src/api-key-scope";

const scope = (entries: ApiKeyScope["entries"]): ApiKeyScope => ({
	restricted: true,
	entries,
});

describe("scopeAllowsAddress", () => {
	test("unrestricted key allows any address", () => {
		expect(
			scopeAllowsAddress({ restricted: false, entries: [] }, "a@b.com"),
		).toBe(true);
	});

	test("domain entry allows every address on that domain only", () => {
		const s = scope([
			{ domain: "acme.com", email: null, domainDeleted: false },
		]);
		expect(scopeAllowsAddress(s, "support@acme.com")).toBe(true);
		expect(scopeAllowsAddress(s, " Sales@ACME.com ")).toBe(true);
		expect(scopeAllowsAddress(s, "support@other.com")).toBe(false);
		expect(scopeAllowsAddress(s, "support@sub.acme.com")).toBe(false);
		expect(scopeAllowsAddress(s, "support@evilacme.com")).toBe(false);
	});

	test("address entry allows only that exact address", () => {
		const s = scope([
			{ domain: "acme.com", email: "support@acme.com", domainDeleted: false },
		]);
		expect(scopeAllowsAddress(s, "SUPPORT@acme.com")).toBe(true);
		expect(scopeAllowsAddress(s, "sales@acme.com")).toBe(false);
		expect(scopeAllowsAddress(s, "support+tag@acme.com")).toBe(false);
	});

	test("a restricted key whose only domain was deleted allows nothing", () => {
		const s = scope([{ domain: "acme.com", email: null, domainDeleted: true }]);
		expect(scopeAllowsAddress(s, "support@acme.com")).toBe(false);
	});

	test("restricted key with no live entries never falls back to full access", () => {
		expect(scopeAllowsAddress(scope([]), "support@acme.com")).toBe(false);
	});

	test("malformed addresses are rejected", () => {
		const s = scope([
			{ domain: "acme.com", email: null, domainDeleted: false },
		]);
		for (const bad of ["", "acme.com", "@acme.com", "support@"]) {
			expect(scopeAllowsAddress(s, bad)).toBe(false);
		}
	});
});
