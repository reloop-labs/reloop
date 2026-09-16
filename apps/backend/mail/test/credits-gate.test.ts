import { describe, expect, test } from "bun:test";
import { countEmailRecipients } from "../src/lib/count-recipients";
import { MailErrors } from "../src/lib/errors";

describe("countEmailRecipients", () => {
	test("counts to, cc, and bcc arrays", () => {
		expect(
			countEmailRecipients({
				to: ["a@example.com", "b@example.com"],
				cc: ["c@example.com"],
				bcc: ["d@example.com", "e@example.com"],
			}),
		).toBe(5);
	});

	test("normalizes single string recipients", () => {
		expect(
			countEmailRecipients({
				to: "solo@example.com",
				cc: "cc@example.com",
				bcc: "bcc@example.com",
			}),
		).toBe(3);
	});

	test("treats missing cc/bcc as zero", () => {
		expect(countEmailRecipients({ to: "solo@example.com" })).toBe(1);
	});
});

describe("MailErrors.quotaExceeded", () => {
	test("returns 402 with remaining vs required detail", () => {
		const err = MailErrors.quotaExceeded({
			remaining: 0,
			required: 2,
			monthlyCredits: 3000,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Email quota exceeded");
		expect(err.why).toContain("needs 2 credits");
		expect(err.why).toContain("only 0 remain");
		expect(err.fix).toContain("Upgrade your plan");
	});

	test("uses singular credit wording when required is 1", () => {
		const err = MailErrors.quotaExceeded({
			remaining: 0,
			required: 1,
			monthlyCredits: 3000,
		}) as Error & { why?: string };

		expect(err.why).toContain("needs 1 credit,");
		expect(err.why).not.toContain("needs 1 credits");
	});
});

describe("MailErrors.dailyQuotaExceeded", () => {
	test("returns 402 with today's usage vs plan daily cap", () => {
		const err = MailErrors.dailyQuotaExceeded({
			used: 100,
			limit: 100,
			required: 1,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Daily email limit reached");
		expect(err.why).toContain("already sent 100 of 100 today");
		expect(err.fix).toContain("daily");
	});
});

describe("MailErrors.domainTooNew", () => {
	test("returns 402 with the new-domain daily cap", () => {
		const err = MailErrors.domainTooNew({
			used: 10,
			limit: 10,
			required: 1,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Domain is too new to send this volume");
		expect(err.why).toContain("limited to 10 emails per day");
		expect(err.fix).toContain("30 days");
	});
});
