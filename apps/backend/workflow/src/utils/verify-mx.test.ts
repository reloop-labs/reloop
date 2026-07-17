import { describe, expect, test } from "bun:test";
import { normalizeMxLookupName } from "./verify-mx";

describe("normalizeMxLookupName", () => {
	test("strips legacy @. prefix from apex FQDN", () => {
		expect(normalizeMxLookupName("@.example.com")).toBe("example.com");
	});

	test("leaves normal FQDNs alone", () => {
		expect(normalizeMxLookupName("send.example.com")).toBe("send.example.com");
		expect(normalizeMxLookupName("example.com.")).toBe("example.com");
	});
});
