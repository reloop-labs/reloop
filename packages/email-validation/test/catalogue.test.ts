import { afterEach, describe, expect, test } from "bun:test";
import {
	isDisposableMxHost,
	isDisposableMxIp,
	loadCatalogue,
	matchDisposable,
	resetCatalogue,
	warmCatalogue,
} from "../src/catalogue";
import { evaluate } from "../src/evaluate";

/**
 * Both wildcard files are currently empty — upstream enumerates subdomain
 * families host by host instead. The matcher still has to be correct for the
 * day an entry lands in `data/local/wildcards.txt`, so these tests seed the
 * loaded catalogue directly and drop it afterwards.
 */
function seedWildcard(suffix: string): void {
	loadCatalogue().wildcards.add(suffix);
}

function seedAllowlist(domain: string): void {
	loadCatalogue().allowlist.add(domain);
}

afterEach(() => {
	resetCatalogue();
});

describe("wildcard matching", () => {
	test("matches the base domain itself", () => {
		seedWildcard("throwaway.example");
		expect(matchDisposable("throwaway.example").match).toEqual({
			kind: "wildcard",
			domain: "throwaway.example",
			pattern: "*.throwaway.example",
		});
	});

	test("matches a direct subdomain", () => {
		seedWildcard("throwaway.example");
		expect(matchDisposable("inbox.throwaway.example").match).toMatchObject({
			kind: "wildcard",
			pattern: "*.throwaway.example",
		});
	});

	test("matches a deeply nested subdomain", () => {
		seedWildcard("throwaway.example");
		expect(matchDisposable("a.b.c.throwaway.example").match).toMatchObject({
			kind: "wildcard",
			pattern: "*.throwaway.example",
		});
	});

	test("does not match a domain that merely ends with the same text", () => {
		seedWildcard("throwaway.example");
		expect(matchDisposable("notthrowaway.example").match).toBeNull();
	});

	test("does not match a sibling domain", () => {
		seedWildcard("throwaway.example");
		expect(matchDisposable("other.example").match).toBeNull();
	});

	test("the allowlist beats a wildcard hit", () => {
		seedWildcard("throwaway.example");
		seedAllowlist("real.throwaway.example");
		const result = matchDisposable("real.throwaway.example");
		expect(result.match).toBeNull();
		expect(result.allowlisted).toBe(true);
	});

	test("evaluate surfaces the wildcard pattern that matched", () => {
		seedWildcard("throwaway.example");
		const result = evaluate("user@inbox.throwaway.example");
		expect(result.verdict).toBe("disposable");
		expect(result.disposableMatch).toMatchObject({
			pattern: "*.throwaway.example",
		});
	});
});

describe("catalogue loading", () => {
	test("loads the vendored upstream domain list", () => {
		const { domains } = warmCatalogue();
		expect(domains).toBeGreaterThan(100_000);
	});

	test("returns the same instance until reset", () => {
		expect(loadCatalogue()).toBe(loadCatalogue());
	});

	test("subdomains of an exactly-listed disposable host are not assumed disposable", () => {
		expect(matchDisposable("nope.mailinator.com").match).toBeNull();
		expect(matchDisposable("mailinator.com").match).toMatchObject({
			kind: "exact",
		});
	});

	// A domain cannot be both a mailbox we vouch for and a throwaway. Upstream
	// merges nine community lists and has listed real providers (zoho.com,
	// hushmail.com) before, so this catches the next one on refresh rather than
	// in front of a customer.
	test("no curated free provider is also reported disposable", () => {
		const contradictions = [...loadCatalogue().freeProviders].filter(
			(domain) => evaluate(`someone@${domain}`).isDisposable,
		);
		expect(contradictions).toEqual([]);
	});
});

describe("mx fingerprinting", () => {
	test("identifies known disposable MX hosts and subdomains", () => {
		expect(isDisposableMxHost("mail.guerrillamail.com")).toBe(true);
		expect(isDisposableMxHost("mx1.1secmail.com")).toBe(true);
		expect(isDisposableMxHost("smtp.yopmail.com")).toBe(true);
		expect(isDisposableMxHost("mailinator.com")).toBe(true);
	});

	test("does not flag clean mail hosts as disposable", () => {
		expect(isDisposableMxHost("aspmx.l.google.com")).toBe(false);
		expect(isDisposableMxHost("outlook-com.olc.protection.outlook.com")).toBe(
			false,
		);
		expect(isDisposableMxHost("mail.protonmail.ch")).toBe(false);
		expect(isDisposableMxHost("inbound.reloop.sh")).toBe(false);
	});

	test("identifies known disposable mail server IPs", () => {
		expect(isDisposableMxIp("134.199.178.234")).toBe(true);
		expect(isDisposableMxIp("178.162.170.166")).toBe(true);
		expect(isDisposableMxIp("178.32.61.35")).toBe(true);
		expect(isDisposableMxIp("23.239.11.30")).toBe(true);
		expect(isDisposableMxIp("87.98.164.155")).toBe(true);
	});

	test("does not flag regular server IPs as disposable", () => {
		expect(isDisposableMxIp("142.250.190.26")).toBe(false); // Google
		expect(isDisposableMxIp("127.0.0.1")).toBe(false);
	});
});
