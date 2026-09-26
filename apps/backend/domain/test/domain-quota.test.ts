import { afterEach, describe, expect, test } from "bun:test";
import {
	DomainErrors,
	KumoMtaErrors,
} from "../src/error/domain.error-response";
import {
	assertCustomDomainQuota,
	decideCustomDomainSlot,
} from "../src/lib/domain-quota";

describe("decideCustomDomainSlot", () => {
	test("free plan cap of 3 blocks the fourth domain", () => {
		let used = 0;
		let accepted = 0;
		let denied = 0;

		for (let i = 0; i < 50; i++) {
			const decision = decideCustomDomainSlot({ used, limit: 3 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			} else {
				denied += 1;
			}
		}

		expect(accepted).toBe(3);
		expect(denied).toBe(47);
		expect(used).toBe(3);
	});

	test("a paid cap of 5 allows five domains then blocks", () => {
		let used = 0;
		let accepted = 0;

		for (let i = 0; i < 20; i++) {
			const decision = decideCustomDomainSlot({ used, limit: 5 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			}
		}

		expect(accepted).toBe(5);
		expect(used).toBe(5);
	});
});

describe("DomainErrors.domainLimitReached", () => {
	test("returns 402 with used vs plan cap", () => {
		const err = DomainErrors.domainLimitReached({
			used: 1,
			limit: 1,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Domain limit reached");
		expect(err.why).toContain("1 custom domain");
		expect(err.why).toContain("already have 1");
		expect(err.fix).toContain("upgrade");
	});
});

describe("KumoMtaErrors.abuseBlocked", () => {
	test("returns 403 with the matched signals", () => {
		const err = KumoMtaErrors.abuseBlocked(["sms_gateway"]) as Error & {
			status?: number;
			why?: string;
		};

		expect(err.status).toBe(403);
		expect(err.message).toBe("Message rejected");
		expect(err.why).toContain("sms_gateway");
	});
});

function fakeTx(args: { maxCustomDomains: number; used: number }) {
	let planReads = 0;
	const tx = {
		execute: async () => undefined,
		query: {
			organizationPlan: {
				findFirst: async () => {
					planReads += 1;
					return { maxCustomDomains: args.maxCustomDomains };
				},
			},
		},
		select: () => ({
			from: () => ({
				where: async () => [{ total: args.used }],
			}),
		}),
	};
	return { tx: tx as never, planReads: () => planReads };
}

describe("assertCustomDomainQuota", () => {
	const original = process.env.BILLING_ENABLED;
	afterEach(() => {
		if (original === undefined) delete process.env.BILLING_ENABLED;
		else process.env.BILLING_ENABLED = original;
	});

	test("Cloud enforces the plan cap", async () => {
		process.env.BILLING_ENABLED = "true";
		const full = fakeTx({ maxCustomDomains: 3, used: 3 });
		await expect(
			assertCustomDomainQuota("org_1", full.tx),
		).rejects.toMatchObject({ status: 402 });
		expect(full.planReads()).toBe(1);

		const room = fakeTx({ maxCustomDomains: 5, used: 4 });
		await expect(
			assertCustomDomainQuota("org_1", room.tx),
		).resolves.toBeUndefined();
	});

	test("self-hosted never reads the plan or blocks", async () => {
		delete process.env.BILLING_ENABLED;
		const full = fakeTx({ maxCustomDomains: 3, used: 50 });
		await expect(
			assertCustomDomainQuota("org_1", full.tx),
		).resolves.toBeUndefined();
		expect(full.planReads()).toBe(0);
	});
});
