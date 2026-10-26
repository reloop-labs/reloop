import { beforeEach, describe, expect, mock, test } from "bun:test";

const counters = new Map<string, number>();

mock.module("@reloop/be-mail/utils/loader", () => ({
	redis: {
		increment: async (key: string) => {
			const next = (counters.get(key) ?? 0) + 1;
			counters.set(key, next);
			return next;
		},
		incrementBy: async (key: string, amount: number) => {
			const next = (counters.get(key) ?? 0) + amount;
			counters.set(key, next);
			return next;
		},
		expire: async () => true,
		ttl: async () => 60,
	},
}));

mock.module("@reloop/db/client", () => ({
	db: {
		query: {
			organizationCredits: { findFirst: async () => ({ creditsUsed: 0 }) },
			organizationPlan: {
				findFirst: async () => ({ dailyEmailLimit: null }),
			},
		},
	},
}));

const { mailConfig } = await import("@reloop/be-mail/mail.config");
const { checkRateLimit } = await import(
	"@reloop/be-mail/middleware/rate-limiter"
);

const log = { warn: () => {}, error: () => {} };
const orgId = "org_batch_cost";

function sendBatch(cost: number) {
	return checkRateLimit({
		headers: new Headers({ "cf-connecting-ip": "203.0.113.9" }),
		activeOrganizationId: orgId,
		userId: "user_1",
		authType: "apikey",
		cost,
		log,
	});
}

describe("batch rate-limit cost", () => {
	beforeEach(() => counters.clear());

	test("volume layers charge per email, request layers once", async () => {
		await sendBatch(10);
		expect(counters.get(`rl:send:org:${orgId}`)).toBe(10);
		expect(counters.get(`rl:send:org-day:${orgId}`)).toBe(10);
		expect(counters.get("rl:send:global")).toBe(10);
		expect(counters.get("rl:send:ip:203.0.113.9")).toBe(1);
		expect(counters.get("rl:send:user:user_1")).toBe(1);
	});

	test("a batch over the per-minute org limit is rejected", async () => {
		await expect(
			sendBatch(mailConfig.RATE_LIMIT_ORG_MAX + 1),
		).rejects.toMatchObject({ status: 429 });
	});
});
