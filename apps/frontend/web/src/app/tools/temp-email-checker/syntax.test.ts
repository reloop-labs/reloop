import { describe, expect, test } from "bun:test";
import { type SyntaxFailure, validateCheckerInput } from "./syntax";

describe("validateCheckerInput", () => {
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
		["/tools/temp-email-checker", "domain-invalid"],
		[`${"a".repeat(65)}@example.com`, "local-part-too-long"],
		[`user@${"a".repeat(64)}.com`, "domain-label-too-long"],
	];

	for (const [input, failure] of rejected) {
		test(`rejects ${JSON.stringify(input)} as ${failure}`, () => {
			const result = validateCheckerInput(input);
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.failure).toBe(failure);
			expect(result.message.length).toBeGreaterThan(0);
		});
	}

	test("accepts a well-formed email", () => {
		expect(validateCheckerInput("you@example.com").ok).toBe(true);
	});

	test("accepts a domain that contains the letter s", () => {
		expect(validateCheckerInput("test.com").ok).toBe(true);
	});

	test("accepts a bare domain", () => {
		expect(validateCheckerInput("mailinator.com").ok).toBe(true);
	});

	test("accepts RFC 5322 specials in a local part", () => {
		expect(validateCheckerInput("a!#$%&'*+-/=?^_`{|}~b@example.org").ok).toBe(
			true,
		);
	});

	test("accepts an IDN domain without punycode on the client", () => {
		expect(validateCheckerInput("user@münchen.de").ok).toBe(true);
	});
});
