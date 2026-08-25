import { describe, expect, it, mock } from "bun:test";
import { checkBody } from "../src/routes/tools/deliverability-test/analyzer/check-body";
import { checkLinks } from "../src/routes/tools/deliverability-test/analyzer/check-links";
import { checkRspamdAndContent } from "../src/routes/tools/deliverability-test/analyzer/check-rspamd";
import { parseMime } from "../src/routes/tools/deliverability-test/analyzer/parse-mime";
import { computeDeliverabilityScore } from "../src/routes/tools/deliverability-test/analyzer/score";
import type { CategoryResult } from "../src/routes/tools/deliverability-test/deliverability-test.types";

const stubFetch = (async () =>
	new Response("", { status: 200 })) as typeof fetch;

// CI has no Redis. The real client waits up to 15s to connect, so session
// create/get/inject hang until bun kills the test. Same seam as rate-limit.test.ts.
const sessionStore = new Map<string, unknown>();
const sessionCounters = new Map<string, number>();

mock.module("@be/tools/utils/loader", () => ({
	redis: {
		set: async (key: string, value: unknown, _seconds?: number) => {
			sessionStore.set(key, value);
		},
		get: async <T>(key: string): Promise<T | null> => {
			return (sessionStore.get(key) as T) ?? null;
		},
		increment: async (key: string): Promise<number> => {
			const next = (sessionCounters.get(key) ?? 0) + 1;
			sessionCounters.set(key, next);
			return next;
		},
		expire: async (_key: string, _seconds: number): Promise<void> => {},
		ttl: async (_key: string): Promise<number> => -1,
		healthCheck: async (): Promise<boolean> => true,
	},
	loader: async () => {},
}));

describe("Deliverability Tester Analyzer", () => {
	const sampleMime = `From: "Reloop Notifications" <support@reloop.sh>
To: "Test User" <test-a1b2c3@mail-test.reloop.email>
Subject: Welcome to Reloop!
Date: Mon, 25 Aug 2026 10:00:00 +0000
Message-ID: <test-12345@reloop.sh>
Return-Path: <bounces@reloop.sh>
Received: from mail.reloop.sh (mail.reloop.sh [198.51.100.25]) by inbound.reloop.sh; Mon, 25 Aug 2026 10:00:01 +0000
DKIM-Signature: v=1; a=rsa-sha256; d=reloop.sh; s=reloop; c=relaxed/relaxed; q=dns/txt; bh=abc12345=; b=xyz9876=
Authentication-Results: mx.reloop.sh; dkim=pass (signature verified); spf=pass (reloop.sh: 198.51.100.25)
X-Spam-Score: -1.2
X-Spam-Status: No, score=-1.2 required=5 tests=R_SPF_ALLOW,R_DKIM_ALLOW,MIME_GOOD
Content-Type: multipart/alternative; boundary="boundary-123"

--boundary-123
Content-Type: text/plain; charset="utf-8"

Welcome to Reloop. We're excited to have you on board.
Visit your dashboard at https://reloop.sh/dashboard

--boundary-123
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html>
<body>
  <h1>Welcome to Reloop</h1>
  <p>We're excited to have you on board.</p>
  <p><a href="https://reloop.sh/dashboard">Go to Dashboard</a></p>
  <img src="https://reloop.sh/logo.png" alt="Reloop Logo" />
</body>
</html>
--boundary-123--`;

	it("parses MIME structure and headers accurately", async () => {
		const parsed = await parseMime(sampleMime);

		expect(parsed.from.address).toBe("support@reloop.sh");
		expect(parsed.from.domain).toBe("reloop.sh");
		expect(parsed.to.address).toBe("test-a1b2c3@mail-test.reloop.email");
		expect(parsed.subject).toBe("Welcome to Reloop!");
		expect(parsed.messageId).toBe("<test-12345@reloop.sh>");
		expect(parsed.returnPath).toBe("bounces@reloop.sh");
		expect(parsed.connectingIp).toBe("198.51.100.25");
		expect(parsed.dkimSignatures.length).toBe(1);
		expect(parsed.rspamdScore).toBe(-1.2);
		expect(parsed.rspamdSymbols).toContain("R_SPF_ALLOW");
		expect(parsed.rspamdSymbols).toContain("R_DKIM_ALLOW");
		expect(parsed.text).toContain("Welcome to Reloop");
		expect(parsed.html).toContain("<h1>Welcome to Reloop</h1>");
	});

	it("evaluates clean message body with multipart and alt tags", async () => {
		const parsed = await parseMime(sampleMime);
		const bodyRes = checkBody(parsed);

		expect(bodyRes.hasHtml).toBe(true);
		expect(bodyRes.hasText).toBe(true);
		expect(bodyRes.missingAltCount).toBe(0);
		expect(bodyRes.category.mark).toBe(0);
		expect(bodyRes.category.status).toBe("pass");
	});

	it("penalizes risky HTML elements like <script> and missing alt tags", async () => {
		const riskyMime = `From: sender@example.com
To: recipient@example.com
Subject: Notice
Content-Type: text/html

<html><body><script>alert(1)</script><img src="pic.jpg"></body></html>`;

		const parsed = await parseMime(riskyMime);
		const bodyRes = checkBody(parsed);

		expect(bodyRes.category.status).toBe("fail");
		expect(bodyRes.category.mark).toBeLessThan(-1.0);
		expect(bodyRes.category.items.some((i) => i.id === "body-risky-html")).toBe(
			true,
		);
		expect(bodyRes.missingAltCount).toBe(1);
	});

	it("detects link shorteners and mismatched display text", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = stubFetch;

		try {
			const phishingMime = `From: info@test.com
To: test@test.com
Subject: Update Account
Content-Type: text/html

<html><body>
  <a href="https://bit.ly/3xyz">Short link</a>
  <a href="https://evil-site.com/login">https://paypal.com/security</a>
</body></html>`;

			const parsed = await parseMime(phishingMime);
			const linksRes = await checkLinks(parsed);

			expect(linksRes.category.status).toBe("fail");
			expect(linksRes.shorteners).toContain("bit.ly");
			expect(
				linksRes.category.items.some((i) => i.id === "links-deceptive"),
			).toBe(true);
			expect(
				linksRes.category.items.some((i) => i.id === "links-shortener"),
			).toBe(true);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it("evaluates Rspamd clean scores and content heuristics", async () => {
		const parsed = await parseMime(sampleMime);
		const contentRes = await checkRspamdAndContent(parsed);

		expect(contentRes.category.mark).toBe(0);
		expect(contentRes.category.status).toBe("pass");
	});

	it("computes aggregate score correctly starting from 10.0", async () => {
		const parsed = await parseMime(sampleMime);

		const mockSignature: CategoryResult = {
			id: "signature",
			title: "Authentication",
			mark: 0,
			status: "pass",
			items: [],
		};

		const mockBlacklists: CategoryResult = {
			id: "blacklists",
			title: "Blacklists",
			mark: 0,
			status: "pass",
			items: [],
		};

		const mockContent: CategoryResult = {
			id: "content",
			title: "Content",
			mark: 0,
			status: "pass",
			items: [],
		};

		const mockBody: CategoryResult = {
			id: "body",
			title: "Body",
			mark: 0,
			status: "pass",
			items: [],
		};

		const mockLinks: CategoryResult = {
			id: "links",
			title: "Links",
			mark: 0,
			status: "pass",
			items: [],
		};

		const report = computeDeliverabilityScore({
			email: parsed,
			signatureCategory: mockSignature,
			blacklistsCategory: mockBlacklists,
			contentCategory: mockContent,
			bodyCategory: mockBody,
			linksCategory: mockLinks,
		});

		expect(report.score).toBe(10);
		expect(report.grade).toBe("A+");
		expect(report.verdict).toBe("inbox_ready");

		// Test penalties
		const degradedSignature: CategoryResult = {
			...mockSignature,
			mark: -2.5,
			status: "fail",
		};
		const degradedBlacklist: CategoryResult = {
			...mockBlacklists,
			mark: -2.0,
			status: "fail",
		};

		const degradedReport = computeDeliverabilityScore({
			email: parsed,
			signatureCategory: degradedSignature,
			blacklistsCategory: degradedBlacklist,
			contentCategory: mockContent,
			bodyCategory: mockBody,
			linksCategory: mockLinks,
		});

		expect(degradedReport.score).toBe(5.5);
		expect(degradedReport.grade).toBe("C");
		expect(degradedReport.verdict).toBe("needs_review");
	});

	it("handles session lifecycle: create -> inject sample -> retrieve report", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = stubFetch;

		try {
			const {
				createDeliverabilityTestSession,
				getDeliverabilityTestSession,
				processInboundTesterEmail,
			} = await import(
				"../src/routes/tools/deliverability-test/deliverability-test.controllers"
			);

			const session = await createDeliverabilityTestSession("127.0.0.1");
			expect(session.token).toMatch(/^test-[a-f0-9]+$/);
			expect(session.address).toContain("@");

			// Pending initially
			const pendingRes = await getDeliverabilityTestSession(session.token);
			expect(pendingRes.status).toBe("pending");
			expect(pendingRes.report).toBeUndefined();

			// Inject test email targeting this session address
			const mimeToSend = sampleMime.replace(
				"test-a1b2c3@mail-test.reloop.email",
				session.address,
			);
			const injectResult = await processInboundTesterEmail(mimeToSend);
			expect(injectResult.success).toBe(true);

			// Now retrieve report
			const completedRes = await getDeliverabilityTestSession(session.token);
			expect(completedRes.status).toBe("received");
			expect(completedRes.report).toBeDefined();
			expect(completedRes.report?.score).toBeGreaterThan(0);
		} finally {
			globalThis.fetch = originalFetch;
		}
	}, 15_000);

	it("ingests plus-addressed aliases of the tester mailbox", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = stubFetch;
		const { toolsConfig } = await import("../src/tools.config");
		const originalTesterEmail = toolsConfig.TESTER_EMAIL;
		toolsConfig.TESTER_EMAIL = "pluto@mail-test.reloop.email";

		try {
			const {
				createDeliverabilityTestSession,
				getDeliverabilityTestSession,
				processInboundTesterEmail,
			} = await import(
				"../src/routes/tools/deliverability-test/deliverability-test.controllers"
			);

			const session = await createDeliverabilityTestSession("127.0.0.1");
			expect(session.address).toBe(
				`pluto+${session.token}@mail-test.reloop.email`,
			);

			const mimeToSend = `From: send@support.reloop.sh
To: ${session.address}
Subject: Email six
Message-ID: <email-six@support.reloop.sh>
Content-Type: text/plain

Email six`;

			const injectResult = await processInboundTesterEmail(mimeToSend);
			expect(injectResult.success).toBe(true);

			const completedRes = await getDeliverabilityTestSession(session.token);
			expect(completedRes.status).toBe("received");
			expect(completedRes.report).toBeDefined();
		} finally {
			toolsConfig.TESTER_EMAIL = originalTesterEmail;
			globalThis.fetch = originalFetch;
		}
	}, 15_000);

	it("recovers the test token when To is the base mailbox but the plus-tag remains in the MIME", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = stubFetch;
		const { toolsConfig } = await import("../src/tools.config");
		const originalTesterEmail = toolsConfig.TESTER_EMAIL;
		toolsConfig.TESTER_EMAIL = "pluto@mail-test.reloop.email";

		try {
			const {
				createDeliverabilityTestSession,
				getDeliverabilityTestSession,
				processInboundTesterEmail,
			} = await import(
				"../src/routes/tools/deliverability-test/deliverability-test.controllers"
			);

			const session = await createDeliverabilityTestSession("127.0.0.1");

			// Reloop inbound delivers plus-aliases to the base mailbox. Some hops
			// rewrite To: to that canonical address while leaving the original
			// envelope recipient in Received / X-Original-To.
			const mimeToSend = `From: send@support.reloop.sh
To: pluto@mail-test.reloop.email
X-Original-To: ${session.address}
Received: from smtp.reloop.sh by inbound.reloop.sh for <${session.address}>; Wed, 26 Aug 2026 02:05:00 +0000
Subject: Email six
Message-ID: <email-six-rewritten@support.reloop.sh>
Content-Type: text/plain

Email six`;

			const injectResult = await processInboundTesterEmail(mimeToSend);
			expect(injectResult.success).toBe(true);
			expect(injectResult.token).toBe(session.token);

			const completedRes = await getDeliverabilityTestSession(session.token);
			expect(completedRes.status).toBe("received");
			expect(completedRes.report).toBeDefined();
		} finally {
			toolsConfig.TESTER_EMAIL = originalTesterEmail;
			globalThis.fetch = originalFetch;
		}
	}, 15_000);
});
