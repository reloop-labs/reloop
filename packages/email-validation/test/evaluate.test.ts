import { describe, expect, test } from "bun:test";
import { evaluate } from "../src/evaluate";
import type { SyntaxFailure } from "../src/types";

describe("syntax", () => {
	const rejected: [string, SyntaxFailure][] = [
		["", "empty"],
		["   ", "empty"],
		["@example.com", "local-part-empty"],
		["user@", "no-domain"],
		["a@b@example.com", "multiple-at"],
		["localhost", "domain-single-label"],
		["user@localhost", "domain-single-label"],
		[".user@example.com", "local-part-invalid"],
		["user.@example.com", "local-part-invalid"],
		["us..er@example.com", "local-part-invalid"],
		["user@.example.com", "domain-label-empty"],
		["user@example..com", "domain-label-empty"],
		["user@-example.com", "domain-label-hyphen"],
		["user@example-.com", "domain-label-hyphen"],
		["user@example.c", "tld-invalid"],
		["user@example.123", "tld-invalid"],
		[`${"a".repeat(65)}@example.com`, "local-part-too-long"],
		[`user@${"a".repeat(64)}.com`, "domain-label-too-long"],
	];

	for (const [input, failure] of rejected) {
		test(`rejects ${JSON.stringify(input)} as ${failure}`, () => {
			const result = evaluate(input);
			expect(result.verdict).toBe("invalid");
			expect(result.isValidSyntax).toBe(false);
			expect(result.syntaxFailure).toBe(failure);
		});
	}

	test("accepts the RFC 5322 specials in a local part", () => {
		const result = evaluate("a!#$%&'*+-/=?^_`{|}~b@example.org");
		expect(result.isValidSyntax).toBe(true);
	});

	test("accepts a 64-character local part at the boundary", () => {
		expect(evaluate(`${"a".repeat(64)}@example.org`).isValidSyntax).toBe(true);
	});

	test("invalid input reports unknown signals rather than passes", () => {
		const result = evaluate("nonsense");
		expect(result.signals).toEqual({
			syntax: "fail",
			disposable: "neutral",
			role: "neutral",
			freeProvider: "neutral",
		});
	});
});

describe("normalisation", () => {
	test("trims and lowercases", () => {
		const result = evaluate("  USER@Example.COM  ");
		expect(result.input).toBe("user@example.com");
		expect(result.domain).toBe("example.com");
	});

	test("unwraps a mailto: link", () => {
		expect(evaluate("mailto:user@example.org").domain).toBe("example.org");
	});

	test("unwraps angle brackets", () => {
		expect(evaluate("<user@example.org>").domain).toBe("example.org");
	});

	test("drops the FQDN root dot", () => {
		expect(evaluate("user@example.org.").domain).toBe("example.org");
	});

	test("converts an IDN domain to punycode", () => {
		const result = evaluate("user@münchen.de");
		expect(result.domain).toBe("xn--mnchen-3ya.de");
		expect(result.unicodeDomain).toBe("münchen.de");
	});

	test("leaves an ASCII domain without a unicode form", () => {
		expect(evaluate("user@example.org").unicodeDomain).toBeNull();
	});

	test("accepts an already-punycoded domain unchanged", () => {
		const result = evaluate("user@xn--mnchen-3ya.de");
		expect(result.domain).toBe("xn--mnchen-3ya.de");
		expect(result.unicodeDomain).toBeNull();
	});

	test("an IDN and its punycode form resolve to the same lookup key", () => {
		expect(evaluate("user@münchen.de").domain).toBe(
			evaluate("user@xn--mnchen-3ya.de").domain,
		);
	});
});

describe("input kind", () => {
	test("treats an address as an email", () => {
		const result = evaluate("user@example.org");
		expect(result.kind).toBe("email");
		expect(result.localPart).toBe("user");
	});

	test("treats a bare domain as a domain, with no local part", () => {
		const result = evaluate("example.org");
		expect(result.kind).toBe("domain");
		expect(result.localPart).toBeNull();
		expect(result.isRoleAddress).toBe(false);
	});
});

describe("disposable detection", () => {
	test("flags a known throwaway provider", () => {
		const result = evaluate("someone@mailinator.com");
		expect(result.verdict).toBe("disposable");
		expect(result.isDisposable).toBe(true);
		expect(result.disposableMatch).toEqual({
			kind: "exact",
			domain: "mailinator.com",
		});
	});

	test("flags a bare disposable domain", () => {
		expect(evaluate("guerrillamail.com").verdict).toBe("disposable");
	});

	test("does not flag an ordinary domain", () => {
		const result = evaluate("someone@reloop.sh");
		expect(result.isDisposable).toBe(false);
		expect(result.verdict).toBe("deliverable");
	});

	test("the allowlist overrides an upstream listing", () => {
		const result = evaluate("someone@example.com");
		expect(result.isAllowlisted).toBe(true);
		expect(result.isDisposable).toBe(false);
	});

	test("disposable outranks a role address", () => {
		const result = evaluate("admin@mailinator.com");
		expect(result.isRoleAddress).toBe(true);
		expect(result.verdict).toBe("disposable");
	});
});

describe("role addresses", () => {
	test("flags a shared inbox as risky", () => {
		const result = evaluate("support@reloop.sh");
		expect(result.isRoleAddress).toBe(true);
		expect(result.verdict).toBe("risky");
		expect(result.signals.role).toBe("warn");
	});

	test("sees through a plus tag", () => {
		expect(evaluate("support+billing@reloop.sh").isRoleAddress).toBe(true);
	});

	test("leaves a personal address alone", () => {
		const result = evaluate("farhan@reloop.sh");
		expect(result.isRoleAddress).toBe(false);
		expect(result.verdict).toBe("deliverable");
	});
});

describe("free providers", () => {
	test("reports a consumer mailbox without penalising it", () => {
		const result = evaluate("someone@gmail.com");
		expect(result.isFreeProvider).toBe(true);
		expect(result.isDisposable).toBe(false);
		expect(result.verdict).toBe("deliverable");
		expect(result.signals.freeProvider).toBe("neutral");
	});

	test("a company domain is not a free provider", () => {
		expect(evaluate("someone@reloop.sh").signals.freeProvider).toBe("pass");
	});
});
