import { describe, expect, test } from "bun:test";
import {
	parseIanaRdapBootstrap,
	parseRdapCreatedAt,
} from "@reloop/dns/rdap-created-at";

describe("parseRdapCreatedAt", () => {
	test("reads the registration eventDate", () => {
		const created = parseRdapCreatedAt({
			events: [
				{ eventAction: "last changed", eventDate: "2026-01-01T00:00:00Z" },
				{ eventAction: "registration", eventDate: "2026-09-01T12:00:00Z" },
			],
		});
		expect(created?.toISOString()).toBe("2026-09-01T12:00:00.000Z");
	});

	test("returns null when age is redacted or missing", () => {
		expect(parseRdapCreatedAt(null)).toBeNull();
		expect(parseRdapCreatedAt({})).toBeNull();
		expect(
			parseRdapCreatedAt({
				events: [
					{ eventAction: "expiration", eventDate: "2027-01-01T00:00:00Z" },
				],
			}),
		).toBeNull();
	});
});

describe("parseIanaRdapBootstrap", () => {
	test("maps tlds to the first RDAP base URL", () => {
		const map = parseIanaRdapBootstrap({
			services: [[["com", "net"], ["https://rdap.verisign.com/com/v1/"]]],
		});
		expect(map.get("com")).toBe("https://rdap.verisign.com/com/v1/");
		expect(map.get("net")).toBe("https://rdap.verisign.com/com/v1/");
	});
});
