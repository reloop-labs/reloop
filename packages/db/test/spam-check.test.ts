import { describe, expect, test } from "bun:test";
import {
	buildScanMessage,
	checkOutboundSpam,
	combineSpamVerdict,
	scanWithRspamd,
} from "../src/spam-check";

const clean = { severity: "none" as const, reasons: [], phishingTokenCount: 0 };
const thresholds = { rspamdBlock: 15, rspamdFlag: 6 };

function fakeRspamd(response: unknown, status = 200) {
	const calls: Array<{ url: string; init: RequestInit }> = [];
	const fetchImpl = (async (url: string, init: RequestInit) => {
		calls.push({ url, init });
		return new Response(JSON.stringify(response), { status });
	}) as unknown as typeof fetch;
	return { fetchImpl, calls };
}

describe("combineSpamVerdict", () => {
	test("clean internal + low rspamd is allowed", () => {
		const v = combineSpamVerdict(
			clean,
			{ score: 2, action: "no action", symbols: [] },
			thresholds,
		);
		expect(v).toEqual({ verdict: "allow", severity: "none", reasons: [] });
	});

	test("rspamd at the block threshold blocks", () => {
		const v = combineSpamVerdict(
			clean,
			{
				score: 15,
				action: "reject",
				symbols: [{ name: "PH_SURBL_MULTI", score: 7.5 }],
			},
			thresholds,
		);
		expect(v.verdict).toBe("block");
		expect(v.severity).toBe("high");
		expect(v.reasons).toContain("rspamd_score:15.0");
		expect(v.reasons).toContain("rspamd:PH_SURBL_MULTI");
	});

	test("rspamd at the flag threshold flags", () => {
		const v = combineSpamVerdict(
			clean,
			{ score: 7, action: "add header", symbols: [] },
			thresholds,
		);
		expect(v.verdict).toBe("flag");
		expect(v.severity).toBe("medium");
	});

	test("internal high blocks even when rspamd is unreachable", () => {
		const v = combineSpamVerdict(
			{ severity: "high", reasons: ["sms_gateway"], phishingTokenCount: 0 },
			null,
			thresholds,
		);
		expect(v.verdict).toBe("block");
		expect(v.reasons).toEqual(["sms_gateway"]);
	});

	test("internal medium flags when rspamd is unreachable", () => {
		const v = combineSpamVerdict(
			{
				severity: "medium",
				reasons: ["bulk_recipients"],
				phishingTokenCount: 0,
			},
			null,
			thresholds,
		);
		expect(v.verdict).toBe("flag");
	});
});

describe("buildScanMessage", () => {
	test("multipart when both parts exist, no Bcc header, no header injection", () => {
		const msg = buildScanMessage({
			from: "Acme <billing@acme.com>",
			to: ["a@x.com", "b@y.com"],
			bcc: "secret@z.com",
			subject: "Hi\r\nBcc: injected@evil.com",
			text: "hello",
			html: "<p>hello</p>",
		});
		expect(msg).toContain("To: a@x.com, b@y.com");
		expect(msg).toContain("multipart/alternative");
		expect(msg).toContain("Message-ID: <");
		expect(msg).not.toContain("secret@z.com");
		expect(msg).not.toMatch(/^Bcc:/m);
	});

	test("single part when only html", () => {
		const msg = buildScanMessage({
			from: "a@b.com",
			to: "c@d.com",
			html: "<b>x</b>",
		});
		expect(msg).toContain("Content-Type: text/html; charset=utf-8");
		expect(msg).not.toContain("multipart");
	});
});

describe("scanWithRspamd", () => {
	test("parses score and keeps only positive symbols, highest first", async () => {
		const { fetchImpl, calls } = fakeRspamd({
			score: 9.2,
			action: "add header",
			symbols: {
				MIME_GOOD: { score: -0.1 },
				BAYES_SPAM: { score: 5.1 },
				FUZZY_DENIED: { score: 4 },
			},
		});
		const r = await scanWithRspamd(
			"raw",
			{ organizationId: "org_1", from: "Acme <billing@acme.com>" },
			{ fetch: fetchImpl, rspamdUrl: "http://rspamd/checkv2" },
		);
		expect(r?.score).toBe(9.2);
		expect(r?.symbols.map((s) => s.name)).toEqual([
			"BAYES_SPAM",
			"FUZZY_DENIED",
		]);
		const headers = calls[0]?.init.headers as Record<string, string>;
		expect(headers.User).toBe("org_1");
		expect(headers.From).toBe("billing@acme.com");
	});

	test("fails open on HTTP error, network error, or disabled url", async () => {
		const { fetchImpl } = fakeRspamd({}, 500);
		expect(
			await scanWithRspamd(
				"raw",
				{},
				{ fetch: fetchImpl, rspamdUrl: "http://r" },
			),
		).toBeNull();

		const throwing = (async () => {
			throw new Error("ECONNREFUSED");
		}) as unknown as typeof fetch;
		expect(
			await scanWithRspamd(
				"raw",
				{},
				{ fetch: throwing, rspamdUrl: "http://r" },
			),
		).toBeNull();

		expect(await scanWithRspamd("raw", {}, { rspamdUrl: null })).toBeNull();
	});
});

describe("checkOutboundSpam", () => {
	test("skips rspamd when the internal scorer already blocks", async () => {
		const { fetchImpl, calls } = fakeRspamd({
			score: 0,
			action: "no action",
			symbols: {},
		});
		const r = await checkOutboundSpam(
			{
				from: "a@b.com",
				to: "4317342009@mms.mb.telus.com",
				subject: "hi",
				text: "hi",
			},
			{ fetch: fetchImpl, rspamdUrl: "http://r" },
		);
		expect(r.verdict).toBe("block");
		expect(r.rspamd).toBeNull();
		expect(calls).toHaveLength(0);
	});

	test("scans rawMessage as-is when provided", async () => {
		const { fetchImpl, calls } = fakeRspamd({
			score: 20,
			action: "reject",
			symbols: {},
		});
		const r = await checkOutboundSpam(
			{
				from: "a@b.com",
				to: "c@d.com",
				subject: "x",
				text: "x",
				rawMessage: "RAW-MIME",
			},
			{ fetch: fetchImpl, rspamdUrl: "http://r" },
		);
		expect(calls[0]?.init.body).toBe("RAW-MIME");
		expect(r.verdict).toBe("block");
	});
});
