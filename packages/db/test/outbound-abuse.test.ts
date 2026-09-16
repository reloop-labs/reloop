import { describe, expect, test } from "bun:test";
import {
	scoreOutboundAbuse,
	shouldApplyNewDomainThrottle,
} from "../src/outbound-abuse";

describe("scoreOutboundAbuse", () => {
	test("a normal transactional send is not abuse", () => {
		const score = scoreOutboundAbuse({
			from: "billing@acme.com",
			to: "user@gmail.com",
			subject: "Your invoice for September",
			text: "Thanks for being a customer. https://acme.com/invoices/1",
		});
		expect(score.severity).toBe("none");
		expect(shouldApplyNewDomainThrottle(score, 1)).toBe(false);
	});

	test("the CVE / Telus MMS campaign is blocked as high", () => {
		const score = scoreOutboundAbuse({
			from: "crypto.non-custodial-wallets@cve.patch-security.to",
			to: "4317342009@mms.mb.telus.com",
			subject: "CVE-2026-48291",
			text: "qiw.to/vHGDW CRITICAL Security Alert (CVE-2026-48291) bypasses crypto wallet security resulting to 51k+ losses in 8 hours",
		});
		expect(score.severity).toBe("high");
		expect(score.reasons).toContain("sms_gateway");
		expect(shouldApplyNewDomainThrottle(score, 1)).toBe(true);
	});

	test("stacked phishing tokens without a gateway are still high", () => {
		const score = scoreOutboundAbuse({
			from: "alert@example.com",
			to: "victim@gmail.com",
			subject: "CVE-2026-48291 crypto wallet",
			text: "Non-custodial wallet drain. Connect your wallet.",
		});
		expect(score.severity).toBe("high");
	});

	test("one phishing token plus a URL is medium (notify, still send)", () => {
		const score = scoreOutboundAbuse({
			from: "alerts@exchange.com",
			to: "user@gmail.com",
			subject: "Wallet maintenance",
			text: "See https://exchange.com/status",
		});
		expect(score.severity).toBe("medium");
		expect(shouldApplyNewDomainThrottle(score, 1)).toBe(true);
	});

	test("25 recipients is medium bulk", () => {
		const to = Array.from({ length: 25 }, (_, i) => `u${i}@gmail.com`);
		const score = scoreOutboundAbuse({
			from: "hello@acme.com",
			to,
			subject: "Product update",
			text: "We shipped a feature.",
		});
		expect(score.severity).toBe("medium");
		expect(score.reasons).toContain("bulk_recipients");
	});
});
