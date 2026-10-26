import { beforeEach, describe, expect, mock, test } from "bun:test";

const counters = new Map<string, number>();
let dailyEmailLimit: number | null = null;

mock.module("@reloop/be-mail/utils/loader", () => ({
	redis: {
		increment: async (key: string) => {
			const next = (counters.get(key) ?? 0) + 1;
			counters.set(key, next);
			return next;
		},
		expire: async () => true,
		ttl: async () => 3600,
	},
}));

mock.module("@reloop/db/client", () => ({
	db: {
		query: {
			organizationCredits: { findFirst: async () => ({ creditsUsed: 0 }) },
			organizationPlan: { findFirst: async () => ({ dailyEmailLimit }) },
		},
	},
}));

const { mailConfig } = await import("@reloop/be-mail/mail.config");
const { checkRateLimit } = await import(
	"@reloop/be-mail/middleware/rate-limiter"
);

const log = { warn: () => {}, error: () => {} };
const orgId = "org_daily_cap";

function send() {
	return checkRateLimit({
		headers: new Headers({ "cf-connecting-ip": "203.0.113.7" }),
		activeOrganizationId: orgId,
		authType: "internal",
		log,
	});
}

describe("per-org daily send cap", () => {
	beforeEach(() => {
		counters.clear();
		// Sit just under the daily cap; the per-minute layers stay empty.
		counters.set(
			`rl:send:org-day:${orgId}`,
			mailConfig.RATE_LIMIT_ORG_DAILY_MAX,
		);
	});

	test("rejects a Free org past the daily cap", async () => {
		dailyEmailLimit = 200;
		await expect(send()).rejects.toMatchObject({ status: 429 });
	});

	test("lets a Pro org (no daily limit) send past it", async () => {
		dailyEmailLimit = null;
		const headers = await send();
		expect(headers["x-reloop-daily-quota"]).toBe(
			String(mailConfig.RATE_LIMIT_ORG_DAILY_MAX + 1),
		);
	});
});
