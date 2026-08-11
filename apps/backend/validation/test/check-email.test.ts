import { describe, expect, test } from "bun:test";
import { checkEmailController } from "../src/routes/validation/check-email/check-email.controllers";
import { validationConfig } from "../src/validation.config";

describe("checkEmailController", () => {
	test("reports a disposable address", () => {
		const result = checkEmailController("you@mailinator.com");
		expect(result.verdict).toBe("disposable");
		expect(result.isDisposable).toBe(true);
		expect(result.disposableMatch).toEqual({
			kind: "exact",
			domain: "mailinator.com",
		});
	});

	test("reports a role address as risky", () => {
		expect(checkEmailController("info@acme.com").verdict).toBe("risky");
	});

	test("reports a clean address as deliverable", () => {
		expect(checkEmailController("farhan@reloop.sh").verdict).toBe(
			"deliverable",
		);
	});

	test("accepts a bare domain", () => {
		const result = checkEmailController("tempmail.com");
		expect(result.kind).toBe("domain");
		expect(result.verdict).toBe("disposable");
	});

	test("returns invalid rather than throwing on malformed input", () => {
		const result = checkEmailController("not-an-email");
		expect(result.verdict).toBe("invalid");
		expect(result.syntaxFailure).toBe("domain-single-label");
	});

	test("rejects an empty address", () => {
		expect(() => checkEmailController("   ")).toThrow("No address provided");
	});

	test("rejects input beyond the length cap", () => {
		const tooLong = `${"a".repeat(
			validationConfig.constants.maxInputLength,
		)}@example.com`;
		expect(() => checkEmailController(tooLong)).toThrow("Input too long");
	});

	test("omits the wildcard pattern field on an exact match", () => {
		const result = checkEmailController("you@mailinator.com");
		expect(result.disposableMatch).not.toHaveProperty("pattern");
	});
});
