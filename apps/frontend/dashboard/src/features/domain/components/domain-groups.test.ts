import { describe, expect, test } from "bun:test";
import { rootDomainOf } from "./domain-groups";

describe("rootDomainOf", () => {
	test("uses the registrable domain, including multi-part suffixes", () => {
		expect(rootDomainOf("mail.acme.com")).toBe("acme.com");
		expect(rootDomainOf("a.b.acme.com")).toBe("acme.com");
		expect(rootDomainOf("mail.acme.co.uk")).toBe("acme.co.uk");
		expect(rootDomainOf("Acme.COM.")).toBe("acme.com");
	});
});
