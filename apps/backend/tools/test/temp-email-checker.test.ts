import { describe, expect, test } from "bun:test";
import { tempEmailCheckerController } from "../src/routes/tools/temp-email-checker/temp-email-checker.controllers";
import { toolsConfig } from "../src/tools.config";

describe("tempEmailCheckerController", () => {
	test("reports a disposable address", () => {
		const result = tempEmailCheckerController("you@mailinator.com");
		expect(result.verdict).toBe("disposable");
		expect(result.isDisposable).toBe(true);
		expect(result.disposableMatch).toEqual({
			kind: "exact",
			domain: "mailinator.com",
		});
	});

	test("reports a role address as risky", () => {
		expect(tempEmailCheckerController("info@acme.com").verdict).toBe("risky");
	});

	test("reports a clean address as deliverable", () => {
		expect(tempEmailCheckerController("alex@reloop.sh").verdict).toBe(
			"deliverable",
		);
	});

	test("accepts a bare domain", () => {
		const result = tempEmailCheckerController("tempmail.com");
		expect(result.kind).toBe("domain");
		expect(result.verdict).toBe("disposable");
	});

	test("returns invalid rather than throwing on malformed input", () => {
		const result = tempEmailCheckerController("not-an-email");
		expect(result.verdict).toBe("invalid");
		expect(result.syntaxFailure).toBe("domain-single-label");
	});

	test("rejects an empty address", () => {
		expect(() => tempEmailCheckerController("   ")).toThrow(
			"No address provided",
		);
	});

	test("rejects input beyond the length cap", () => {
		const tooLong = `${"a".repeat(
			toolsConfig.constants.maxInputLength,
		)}@example.com`;
		expect(() => tempEmailCheckerController(tooLong)).toThrow(
			"Input too long",
		);
	});

	test("omits the wildcard pattern field on an exact match", () => {
		const result = tempEmailCheckerController("you@mailinator.com");
		expect(result.disposableMatch).not.toHaveProperty("pattern");
	});
});
