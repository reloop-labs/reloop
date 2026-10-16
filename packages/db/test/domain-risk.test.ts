import { describe, expect, test } from "bun:test";
import {
	findLookalikeBrand,
	looksRandom,
	scoreDomainRisk,
} from "../src/domain-risk";

const now = new Date("2026-10-16T00:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const ids = (signals: { id: string }[]) => signals.map((s) => s.id);

describe("findLookalikeBrand", () => {
	test("catches digit swaps, lure words and homoglyphs", () => {
		expect(findLookalikeBrand("paypa1.com")).toBe("paypal");
		expect(findLookalikeBrand("paypal-secure-login.xyz")).toBe("paypal");
		expect(findLookalikeBrand("rnicrosoft.com")).toBe("microsoft");
		expect(findLookalikeBrand("mail.coinbase-verify.net")).toBe("coinbase");
		expect(findLookalikeBrand("аpple.com")).toBe("apple"); // Cyrillic а
	});

	test("leaves the real brand and unrelated names alone", () => {
		expect(findLookalikeBrand("paypal.com")).toBeNull();
		expect(findLookalikeBrand("mail.google.com")).toBeNull();
		expect(findLookalikeBrand("appletreebakery.com")).toBeNull();
		expect(findLookalikeBrand("acme.com")).toBeNull();
		expect(findLookalikeBrand("dhlexpressparcels.com")).toBeNull();
	});
});

describe("looksRandom", () => {
	test("flags machine-generated labels only", () => {
		expect(looksRandom("xk7q9ffz2")).toBe(true);
		expect(looksRandom("a8d72k3m9q")).toBe(true);
		expect(looksRandom("acmecorp")).toBe(false);
		expect(looksRandom("shop")).toBe(false);
	});
});

describe("scoreDomainRisk", () => {
	test("an old, ordinary domain has no signals", () => {
		expect(
			scoreDomainRisk({
				domain: "mail.acme.com",
				registeredAt: daysAgo(900),
				now,
			}),
		).toEqual([]);
	});

	test("a fresh look-alike on a risky TLD stacks signals", () => {
		const signals = scoreDomainRisk({
			domain: "paypa1-login.xyz",
			registeredAt: daysAgo(2),
			now,
		});
		expect(ids(signals)).toEqual([
			"brand_lookalike",
			"domain_age_lt_7d",
			"risky_tld",
		]);
	});

	test("disposable matcher is checked against the registrable domain", () => {
		const seen: string[] = [];
		const signals = scoreDomainRisk({
			domain: "send.mailinator.com",
			registeredAt: daysAgo(4000),
			now,
			isDisposable: (d) => {
				seen.push(d);
				return d === "mailinator.com";
			},
		});
		expect(seen).toEqual(["mailinator.com"]);
		expect(ids(signals)).toContain("disposable_domain");
	});

	test("unknown registrar age is a small signal", () => {
		const signals = scoreDomainRisk({
			domain: "acme.com",
			registeredAt: null,
			now,
		});
		expect(ids(signals)).toEqual(["domain_age_unknown"]);
	});
});
