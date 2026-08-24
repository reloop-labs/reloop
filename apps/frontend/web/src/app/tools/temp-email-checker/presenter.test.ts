import { describe, expect, test } from "bun:test";
import type { ApiCheckResponse } from "./check-api";
import { toCheckResult, toPublicPayload } from "./presenter";

function api(
	overrides: Partial<ApiCheckResponse> &
		Pick<ApiCheckResponse, "input" | "verdict">,
): ApiCheckResponse {
	const isDisposable = overrides.verdict === "disposable";
	const isValidSyntax = overrides.verdict !== "invalid";

	return {
		kind: "email",
		domain: "example.com",
		unicodeDomain: null,
		isValidSyntax,
		syntaxFailure: isValidSyntax ? null : "domain-single-label",
		isDisposable,
		disposableMatch: isDisposable
			? { kind: "exact", domain: overrides.domain ?? "example.com" }
			: null,
		isAllowlisted: false,
		isRoleAddress: overrides.verdict === "risky",
		isFreeProvider: false,
		signals: {
			syntax: isValidSyntax ? "pass" : "fail",
			disposable: isDisposable ? "fail" : "pass",
			role: overrides.verdict === "risky" ? "warn" : "pass",
			freeProvider: "pass",
		},
		mxRecords: [],
		confidence: 0,
		riskScore: 0,
		flags: [],
		...overrides,
	};
}

describe("toPublicPayload", () => {
	test("keeps the screenshot contract for a disposable address", () => {
		expect(
			toPublicPayload(
				api({
					input: "alex.hunter@temp-mail.org",
					domain: "temp-mail.org",
					verdict: "disposable",
					isDisposable: true,
					mxRecords: ["mx1.temp-mail.org", "mx2.temp-mail.org"],
					confidence: 0.98,
					riskScore: 0.94,
					flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
				}),
			),
		).toEqual({
			input: "alex.hunter@temp-mail.org",
			domain: "temp-mail.org",
			verdict: "disposable",
			isDisposable: true,
			mxRecords: ["mx1.temp-mail.org", "mx2.temp-mail.org"],
			confidence: 0.98,
			riskScore: 0.94,
			flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
		});
	});
});

describe("toCheckResult", () => {
	test("maps disposable scores and flags into the result card", () => {
		const result = toCheckResult(
			api({
				input: "alex.hunter@temp-mail.org",
				domain: "temp-mail.org",
				verdict: "disposable",
				confidence: 0.98,
				riskScore: 0.94,
				mxRecords: ["mx1.temp-mail.org", "mx2.temp-mail.org"],
				flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
			}),
		);

		expect(result.verdict).toBe("disposable");
		expect(result.confidenceLabel).toBe("98% confidence");
		expect(result.displaySignals).toEqual([
			{ label: "Disposable provider", value: "Detected", status: "fail" },
			{ label: "MX records", value: "Found", status: "pass" },
			{ label: "Role prefix", value: "None", status: "pass" },
			{ label: "Email syntax", value: "Valid", status: "pass" },
		]);
		expect(result.rawJson.flags).toEqual([
			"DISPOSABLE_DOMAIN",
			"PUBLIC_INBOX_DETECTED",
		]);
	});

	test("maps a role address as shared-mailbox risk", () => {
		const result = toCheckResult(
			api({
				input: "billing@acmecorp.io",
				domain: "acmecorp.io",
				verdict: "risky",
				isRoleAddress: true,
				confidence: 0.85,
				riskScore: 0.45,
				mxRecords: ["mail.acmecorp.io"],
				flags: ["ROLE_BASED_PREFIX"],
			}),
		);

		expect(result.confidenceLabel).toBe("85% confidence");
		expect(result.displaySignals).toEqual([
			{ label: "Disposable provider", value: "Clean", status: "pass" },
			{ label: "MX records", value: "Found", status: "pass" },
			{ label: "Role prefix", value: "Shared", status: "warn" },
			{ label: "Email syntax", value: "Valid", status: "pass" },
		]);
	});

	test("does not claim valid MX when the domain has none", () => {
		const result = toCheckResult(
			api({
				input: "alex@reloop.sh",
				domain: "reloop.sh",
				verdict: "deliverable",
				confidence: 0.7,
				riskScore: 0.38,
				mxRecords: [],
				flags: ["NO_MX_RECORDS"],
			}),
		);

		expect(result.subtitle).toBe("No MX records published");
		expect(result.recommendationTone).toBe("warn");
		expect(result.displaySignals[1]).toEqual({
			label: "MX records",
			value: "None",
			status: "warn",
		});
	});

	test("marks MX as unknown when lookup returned no hosts and no empty flag", () => {
		const result = toCheckResult(
			api({
				input: "alex@reloop.sh",
				domain: "reloop.sh",
				verdict: "deliverable",
				confidence: 0.99,
				riskScore: 0.02,
				mxRecords: [],
				flags: [],
			}),
		);

		expect(result.subtitle).toBe("MX lookup did not return hosts");
		expect(result.displaySignals[1]).toEqual({
			label: "MX records",
			value: "Unknown",
			status: "neutral",
		});
	});

	test("skips domain signals on invalid syntax", () => {
		const result = toCheckResult(
			api({
				input: "not-an-email",
				domain: null,
				verdict: "invalid",
				isValidSyntax: false,
				syntaxFailure: "domain-single-label",
				confidence: 1,
				riskScore: 1,
				flags: ["INVALID_SYNTAX"],
			}),
		);

		expect(result.confidenceLabel).toBe("Syntax Error");
		expect(result.recommendationTone).toBe("neutral");
		expect(result.displaySignals[3]).toEqual({
			label: "Email syntax",
			value: "Malformed",
			status: "fail",
		});
		expect(result.rawJson.mxRecords).toEqual([]);
	});
});
