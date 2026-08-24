import { describe, expect, test } from "bun:test";
import { scoreCheck } from "../src/routes/tools/temp-email-checker/check-score";
import {
	isEmptyMxError,
	normalizeMxRecords,
} from "../src/routes/tools/temp-email-checker/mx-lookup";
import { tempEmailCheckerController } from "../src/routes/tools/temp-email-checker/temp-email-checker.controllers";
import { toolsConfig } from "../src/tools.config";

const mxOk =
	(...records: string[]) =>
	async () => ({
		status: "ok" as const,
		records,
	});

const mxEmpty = async () => ({
	status: "empty" as const,
	records: [] as [],
});

const mxError = async () => ({
	status: "error" as const,
	records: [] as [],
});

describe("tempEmailCheckerController", () => {
	test("reports a disposable address with MX, scores, and flags", async () => {
		const result = await tempEmailCheckerController(
			"alex.hunter@temp-mail.org",
			{ lookupMx: mxOk("mx1.temp-mail.org", "mx2.temp-mail.org") },
		);

		expect(result).toMatchObject({
			input: "alex.hunter@temp-mail.org",
			domain: "temp-mail.org",
			verdict: "disposable",
			isDisposable: true,
			mxRecords: ["mx1.temp-mail.org", "mx2.temp-mail.org"],
			confidence: 0.98,
			riskScore: 0.94,
			flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
		});
		expect(result.disposableMatch).toEqual({
			kind: "exact",
			domain: "temp-mail.org",
		});
	});

	test("reports a role address as risky", async () => {
		const result = await tempEmailCheckerController("info@acme.com", {
			lookupMx: mxOk("mail.acme.com"),
		});
		expect(result.verdict).toBe("risky");
		expect(result.confidence).toBe(0.85);
		expect(result.riskScore).toBe(0.45);
		expect(result.flags).toEqual(["ROLE_BASED_PREFIX"]);
		expect(result.mxRecords).toEqual(["mail.acme.com"]);
	});

	test("reports a clean address as deliverable", async () => {
		const result = await tempEmailCheckerController("alex@reloop.sh", {
			lookupMx: mxOk("aspmx.l.google.com"),
		});
		expect(result.verdict).toBe("deliverable");
		expect(result.isDisposable).toBe(false);
		expect(result.confidence).toBe(0.99);
		expect(result.riskScore).toBe(0.02);
		expect(result.flags).toEqual([]);
	});

	test("accepts a bare domain", async () => {
		const result = await tempEmailCheckerController("tempmail.com", {
			lookupMx: mxOk("mx.tempmail.com"),
		});
		expect(result.kind).toBe("domain");
		expect(result.verdict).toBe("disposable");
	});

	test("returns invalid rather than throwing on malformed input", async () => {
		const result = await tempEmailCheckerController("not-an-email", {
			lookupMx: async () => {
				throw new Error("MX must not be queried for invalid input");
			},
		});
		expect(result.verdict).toBe("invalid");
		expect(result.syntaxFailure).toBe("domain-single-label");
		expect(result.mxRecords).toEqual([]);
		expect(result.confidence).toBe(1);
		expect(result.riskScore).toBe(1);
		expect(result.flags).toEqual(["INVALID_SYNTAX"]);
	});

	test("rejects an empty address", async () => {
		await expect(tempEmailCheckerController("   ")).rejects.toThrow(
			"No address provided",
		);
	});

	test("rejects input beyond the length cap", async () => {
		const tooLong = `${"a".repeat(
			toolsConfig.constants.maxInputLength,
		)}@example.com`;
		await expect(tempEmailCheckerController(tooLong)).rejects.toThrow(
			"Input too long",
		);
	});

	test("omits the wildcard pattern field on an exact match", async () => {
		const result = await tempEmailCheckerController("you@mailinator.com", {
			lookupMx: mxOk("mail.mailinator.com"),
		});
		expect(result.disposableMatch).not.toHaveProperty("pattern");
	});

	test("flags a domain with no MX without failing the check", async () => {
		const result = await tempEmailCheckerController("alex@reloop.sh", {
			lookupMx: mxEmpty,
		});
		expect(result.verdict).toBe("deliverable");
		expect(result.mxRecords).toEqual([]);
		expect(result.flags).toEqual(["NO_MX_RECORDS"]);
		expect(result.confidence).toBe(0.7);
		expect(result.riskScore).toBe(0.38);
	});

	test("leaves scores unchanged when MX lookup errors", async () => {
		const result = await tempEmailCheckerController("alex@reloop.sh", {
			lookupMx: mxError,
		});
		expect(result.mxRecords).toEqual([]);
		expect(result.flags).toEqual([]);
		expect(result.confidence).toBe(0.99);
		expect(result.riskScore).toBe(0.02);
	});
});

describe("scoreCheck", () => {
	test("matches the public disposable payload numbers", () => {
		expect(
			scoreCheck({
				isValidSyntax: true,
				isDisposable: true,
				disposableMatch: { kind: "exact", domain: "temp-mail.org" },
				isAllowlisted: false,
				isRoleAddress: false,
				isFreeProvider: false,
				mxStatus: "ok",
			}),
		).toEqual({
			confidence: 0.98,
			riskScore: 0.94,
			flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
		});
	});

	test("marks a shared inbox as role-based", () => {
		expect(
			scoreCheck({
				isValidSyntax: true,
				isDisposable: false,
				disposableMatch: null,
				isAllowlisted: false,
				isRoleAddress: true,
				isFreeProvider: false,
				mxStatus: "ok",
			}),
		).toEqual({
			confidence: 0.85,
			riskScore: 0.45,
			flags: ["ROLE_BASED_PREFIX"],
		});
	});
});

describe("normalizeMxRecords", () => {
	test("sorts by priority, strips the root dot, and de-duplicates", () => {
		expect(
			normalizeMxRecords([
				{ exchange: "mx2.temp-mail.org.", priority: 20 },
				{ exchange: "MX1.temp-mail.org", priority: 10 },
				{ exchange: "mx1.temp-mail.org.", priority: 10 },
				{ exchange: "backup.temp-mail.org", priority: 30 },
			]),
		).toEqual([
			"mx1.temp-mail.org",
			"mx2.temp-mail.org",
			"backup.temp-mail.org",
		]);
	});
});

describe("isEmptyMxError", () => {
	test("treats NXDOMAIN / no-data as an empty MX set", () => {
		expect(isEmptyMxError({ code: "ENOTFOUND" })).toBe(true);
		expect(isEmptyMxError({ code: "ENODATA" })).toBe(true);
		expect(isEmptyMxError({ code: "ETIMEOUT" })).toBe(false);
		expect(isEmptyMxError(new Error("MX did not respond within 1500ms"))).toBe(
			false,
		);
	});
});
