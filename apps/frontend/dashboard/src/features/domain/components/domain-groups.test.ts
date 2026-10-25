import { describe, expect, test } from "bun:test";
import { groupByRootDomain, rootDomainOf } from "./domain-groups";

const host = (h: string) => h;

describe("rootDomainOf", () => {
	test("uses the registrable domain, including multi-part suffixes", () => {
		expect(rootDomainOf("mail.acme.com")).toBe("acme.com");
		expect(rootDomainOf("a.b.acme.com")).toBe("acme.com");
		expect(rootDomainOf("mail.acme.co.uk")).toBe("acme.co.uk");
		expect(rootDomainOf("Acme.COM.")).toBe("acme.com");
	});
});

describe("groupByRootDomain", () => {
	test("groups siblings, keeps singles flat and first-seen order", () => {
		const result = groupByRootDomain(
			["mail.acme.com", "solo.dev", "billing.acme.com", "news.umbrella.co"],
			host,
		);
		expect(result).toEqual([
			{
				kind: "group",
				root: "acme.com",
				parent: null,
				children: ["mail.acme.com", "billing.acme.com"],
			},
			{ kind: "single", item: "solo.dev" },
			{ kind: "single", item: "news.umbrella.co" },
		]);
	});

	test("the root domain itself becomes the group parent", () => {
		const result = groupByRootDomain(
			["mail.acme.com", "acme.com", "notify.acme.com"],
			host,
		);
		expect(result).toEqual([
			{
				kind: "group",
				root: "acme.com",
				parent: "acme.com",
				children: ["mail.acme.com", "notify.acme.com"],
			},
		]);
	});

	test("a lone root domain is not a group", () => {
		expect(groupByRootDomain(["acme.com"], host)).toEqual([
			{ kind: "single", item: "acme.com" },
		]);
	});
});
