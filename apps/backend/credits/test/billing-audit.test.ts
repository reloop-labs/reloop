/**
 * Billing & credits audit — runs real code against a real Postgres.
 * Each test asserts the CORRECT business behaviour; a failure = a bug.
 *
 *   PG_URL=postgresql://reloop:reloop123@localhost:5432/reloop_billing_audit \
 *     bun test test/billing-audit.test.ts
 */
import { afterAll, describe, expect, it } from "bun:test";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { handlePolarWebhookEvent } from "@reloop/credits/lib/polar-webhook";
import { db } from "@reloop/db/client";
import {
	refundSendCredits,
	reserveSendCredits,
} from "@reloop/db/reserve-send-credits";
import {
	billingPeriod,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
} from "@reloop/db/schema";
import { eq } from "drizzle-orm";

// Opt-in: only runs against a throwaway *_billing_audit database (writes real rows).
const enabled = process.env.PG_URL?.includes("billing_audit") ?? false;
const suite = describe.skipIf(!enabled);

const created: string[] = [];

async function newOrg(label: string): Promise<string> {
	const id = `audit_${label}_${crypto.randomUUID().slice(0, 8)}`;
	await db.insert(organization).values({
		id,
		name: id,
		slug: id,
		createdAt: new Date(),
	});
	created.push(id);
	return id;
}

async function credits(orgId: string) {
	const row = await db.query.organizationCredits.findFirst({
		where: eq(organizationCredits.organizationId, orgId),
	});
	if (!row) throw new Error("no credits row");
	return row;
}

async function plan(orgId: string) {
	return db.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, orgId),
	});
}

async function setCredits(
	orgId: string,
	values: Partial<typeof organizationCredits.$inferInsert>,
) {
	await db
		.update(organizationCredits)
		.set(values)
		.where(eq(organizationCredits.organizationId, orgId));
}

async function send(orgId: string, n = 1, now?: Date) {
	return reserveSendCredits({ organizationId: orgId, recipientCount: n, now });
}

function subEvent(
	orgId: string,
	opts: {
		type?: string;
		status?: string;
		plan: string;
		periodStart: Date;
		periodEnd: Date;
	},
) {
	return {
		type: opts.type ?? "subscription.updated",
		data: {
			id: `sub_${orgId}`,
			status: opts.status ?? "active",
			metadata: { organization_id: orgId },
			product: {
				id: `prod_${opts.plan}`,
				name: opts.plan,
				metadata: { plan_id: opts.plan },
			},
			current_period_start: opts.periodStart.toISOString(),
			current_period_end: opts.periodEnd.toISOString(),
		},
	};
}

const day = 24 * 60 * 60 * 1000;

afterAll(async () => {
	for (const id of created) {
		await db.delete(organization).where(eq(organization.id, id));
	}
});

/* ------------------------------------------------------------------ */
suite("FREE plan", () => {
	it("F1 new org is provisioned with 3,000/month and 100/day", async () => {
		const org = await newOrg("f1");
		const billing = await getOrProvisionOrgBilling(org);
		expect(billing.plan.planId).toBe("free");
		expect(billing.plan.monthlyEmails).toBe(3000);
		expect(billing.plan.dailyEmailLimit).toBe(100);
		expect(billing.credits.creditsRemaining).toBe(3000);
	});

	it("F2 a send deducts one credit per recipient", async () => {
		const org = await newOrg("f2");
		await getOrProvisionOrgBilling(org);
		const r = await send(org, 5);
		expect(r.ok).toBe(true);
		const c = await credits(org);
		expect(c.creditsUsed).toBe(5);
		expect(c.creditsRemaining).toBe(2995);
		expect(c.dailyEmailsUsed).toBe(5);
	});

	it("F3 the 101st email of the UTC day is blocked; next UTC day it works again", async () => {
		const org = await newOrg("f3");
		await getOrProvisionOrgBilling(org);
		const t = new Date();
		expect((await send(org, 100, t)).ok).toBe(true);
		const blocked = await send(org, 1, t);
		expect(blocked.ok).toBe(false);
		if (!blocked.ok) expect(blocked.reason).toBe("daily");
		const tomorrow = new Date(t.getTime() + day);
		expect((await send(org, 1, tomorrow)).ok).toBe(true);
	});

	it("F4 runs out of monthly credits exactly at zero (no partial sends)", async () => {
		const org = await newOrg("f4");
		await getOrProvisionOrgBilling(org);
		await setCredits(org, { creditsRemaining: 3, creditsUsed: 2997 });
		expect((await send(org, 4)).ok).toBe(false); // 4 recipients > 3 left
		expect((await send(org, 3)).ok).toBe(true);
		const last = await send(org, 1);
		expect(last.ok).toBe(false);
		if (!last.ok) expect(last.reason).toBe("monthly");
		const c = await credits(org);
		expect(c.creditsRemaining).toBe(0);
		expect(c.creditsUsed).toBe(3000);
	});

	it("F5 concurrent sends never overspend (50 parallel sends, 20 credits left)", async () => {
		const org = await newOrg("f5");
		await getOrProvisionOrgBilling(org);
		await setCredits(org, { creditsRemaining: 20, creditsUsed: 2980 });
		const results = await Promise.all(
			Array.from({ length: 50 }, () => send(org, 1)),
		);
		expect(results.filter((r) => r.ok).length).toBe(20);
		expect((await credits(org)).creditsRemaining).toBe(0);
	});

	it("F6 a failed send is refunded (credits + daily count restored)", async () => {
		const org = await newOrg("f6");
		await getOrProvisionOrgBilling(org);
		const r = await send(org, 3);
		if (!r.ok || !r.reservation) throw new Error("reserve failed");
		await refundSendCredits({ reservation: r.reservation });
		const c = await credits(org);
		expect(c.creditsRemaining).toBe(3000);
		expect(c.creditsUsed).toBe(0);
		expect(c.dailyEmailsUsed).toBe(0);
	});

	it("F7 month end (billing/dashboard path): usage resets to 0 and the period is recorded", async () => {
		const org = await newOrg("f7");
		await getOrProvisionOrgBilling(org);
		await send(org, 40);
		await setCredits(org, {
			currentPeriodStart: new Date(Date.now() - 31 * day),
			currentPeriodEnd: new Date(Date.now() - 1000),
		});
		const billing = await getOrProvisionOrgBilling(org);
		expect(billing.credits.creditsUsed).toBe(0);
		expect(billing.credits.creditsRemaining).toBe(3000);
		const periods = await db.query.billingPeriod.findMany({
			where: eq(billingPeriod.organizationId, org),
		});
		expect(periods.length).toBe(1);
		expect(periods[0]?.emailsUsed).toBe(40);
	});

	it("F8 month end (send path): usage resets AND the closed period is recorded", async () => {
		const org = await newOrg("f8");
		await getOrProvisionOrgBilling(org);
		await send(org, 40);
		await setCredits(org, {
			currentPeriodStart: new Date(Date.now() - 31 * day),
			currentPeriodEnd: new Date(Date.now() - 1000),
		});
		// first activity of the new month is a send, not a dashboard visit
		await send(org, 1);
		const c = await credits(org);
		expect(c.creditsUsed).toBe(1);
		const periods = await db.query.billingPeriod.findMany({
			where: eq(billingPeriod.organizationId, org),
		});
		expect(periods.length).toBe(1); // last month's 40 emails must not vanish
	});

	it("F9 billing periods keep their anchor (no drift when the first send is days late)", async () => {
		const org = await newOrg("f9");
		await getOrProvisionOrgBilling(org);
		const anchorEnd = new Date(Date.now() - 10 * day); // period ended 10 days ago
		await setCredits(org, {
			currentPeriodStart: new Date(anchorEnd.getTime() - 30 * day),
			currentPeriodEnd: anchorEnd,
		});
		await send(org, 1);
		const c = await credits(org);
		// new period should start at the old period end, not "now"
		expect(c.currentPeriodStart.getTime()).toBe(anchorEnd.getTime());
	});

	it("F10 a period starting Jan 31 ends Feb 28/29, not Mar 3", async () => {
		const org = await newOrg("f10");
		await getOrProvisionOrgBilling(org);
		await setCredits(org, {
			currentPeriodStart: new Date("2026-12-31T00:00:00Z"),
			currentPeriodEnd: new Date("2027-01-31T00:00:00Z"),
		});
		await send(org, 1, new Date("2027-01-31T00:00:00Z"));
		const c = await credits(org);
		expect(c.currentPeriodEnd.getUTCMonth()).toBe(1); // February
	});
});

/* ------------------------------------------------------------------ */
suite("PAID plans (Polar webhooks)", () => {
	async function paidOrg(label: string, planId = "individual") {
		const org = await newOrg(label);
		await getOrProvisionOrgBilling(org);
		const start = new Date(Date.now() - 2 * day);
		const end = new Date(start.getTime() + 30 * day);
		const res = await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.active",
				plan: planId,
				periodStart: start,
				periodEnd: end,
			}),
		);
		expect(res.ok).toBe(true);
		return { org, start, end };
	}

	it("P1 subscribing to Pro gives 50,000 credits, no daily cap, overage on", async () => {
		const { org } = await paidOrg("p1");
		const p = await plan(org);
		const c = await credits(org);
		expect(p?.planId).toBe("individual");
		expect(p?.dailyEmailLimit).toBeNull();
		expect(p?.overageEnabled).toBe(true);
		expect(c.creditsRemaining).toBe(50000);
	});

	it("P2 upgrading from free resets free usage (fresh paid period)", async () => {
		const org = await newOrg("p2");
		await getOrProvisionOrgBilling(org);
		await send(org, 50);
		const start = new Date();
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.created",
				plan: "individual",
				periodStart: start,
				periodEnd: new Date(start.getTime() + 30 * day),
			}),
		);
		const c = await credits(org);
		expect(c.creditsUsed).toBe(0);
		expect(c.creditsRemaining).toBe(50000);
	});

	it("P3 paid plan has no daily cap (500 emails in one day)", async () => {
		const { org } = await paidOrg("p3");
		expect((await send(org, 500)).ok).toBe(true);
	});

	it("P4 paid plan with overage keeps sending past the included 50,000", async () => {
		const { org } = await paidOrg("p4");
		await setCredits(org, { creditsRemaining: 0, creditsUsed: 50000 });
		const r = await send(org, 10);
		expect(r.ok).toBe(true); // site sells $0.50 / 1,000 overage
	});

	it("P5 renewal webhook (new period) records the old period + overage and resets", async () => {
		const { org, end } = await paidOrg("p5");
		await send(org, 120);
		await handlePolarWebhookEvent(
			subEvent(org, {
				plan: "individual",
				periodStart: end,
				periodEnd: new Date(end.getTime() + 30 * day),
			}),
		);
		const c = await credits(org);
		expect(c.creditsUsed).toBe(0);
		expect(c.creditsRemaining).toBe(50000);
		const periods = await db.query.billingPeriod.findMany({
			where: eq(billingPeriod.organizationId, org),
		});
		expect(
			periods.some((p) => p.emailsUsed === 120 && p.planId === "individual"),
		).toBe(true);
	});

	it("P6 duplicate webhook delivery does not reset usage again", async () => {
		const { org, start, end } = await paidOrg("p6");
		await send(org, 30);
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.active",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		expect((await credits(org)).creditsUsed).toBe(30);
	});

	it("P7 an out-of-order (older) webhook does not roll the period back", async () => {
		const { org, start, end } = await paidOrg("p7");
		const next = { start: end, end: new Date(end.getTime() + 30 * day) };
		await handlePolarWebhookEvent(
			subEvent(org, {
				plan: "individual",
				periodStart: next.start,
				periodEnd: next.end,
			}),
		);
		await send(org, 25);
		// Polar retries the older event late
		await handlePolarWebhookEvent(
			subEvent(org, { plan: "individual", periodStart: start, periodEnd: end }),
		);
		const c = await credits(org);
		expect(c.currentPeriodStart.getTime()).toBe(next.start.getTime());
		expect(c.creditsUsed).toBe(25);
	});

	it("P8 mid-period upgrade Pro → Growth adds the extra 50,000 credits", async () => {
		const { org, start, end } = await paidOrg("p8");
		await send(org, 1000);
		await handlePolarWebhookEvent(
			subEvent(org, { plan: "startup", periodStart: start, periodEnd: end }),
		);
		const c = await credits(org);
		expect(c.monthlyCredits).toBe(100000);
		expect(c.creditsRemaining).toBe(100000 - 1000);
	});

	it("P9 mid-period downgrade Growth → Pro caps remaining at the new limit", async () => {
		const { org, start, end } = await paidOrg("p9", "startup");
		await send(org, 1000);
		await handlePolarWebhookEvent(
			subEvent(org, { plan: "individual", periodStart: start, periodEnd: end }),
		);
		const c = await credits(org);
		expect(c.monthlyCredits).toBe(50000);
		expect(c.creditsRemaining).toBe(50000 - 1000);
	});

	it("P10 cancelled/revoked subscription falls back to the free plan", async () => {
		const { org, start, end } = await paidOrg("p10");
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.revoked",
				status: "revoked",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const p = await plan(org);
		expect(p?.planId).toBe("free");
	});

	it("P11 past_due subscription is restricted (cannot keep using paid quota indefinitely)", async () => {
		const { org, start, end } = await paidOrg("p11");
		await handlePolarWebhookEvent(
			subEvent(org, {
				status: "past_due",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const sub = await db.query.organizationSubscription.findFirst({
			where: eq(organizationSubscription.organizationId, org),
		});
		expect(sub?.status).toBe("past_due");
		// business rule check: does anything stop a past_due org from sending?
		const r = await send(org, 1);
		expect(r.ok).toBe(false);
	});

	it("P12 an unknown Polar status is not treated as active", async () => {
		const { org, start, end } = await paidOrg("p12");
		await handlePolarWebhookEvent(
			subEvent(org, {
				status: "some_new_status",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const sub = await db.query.organizationSubscription.findFirst({
			where: eq(organizationSubscription.organizationId, org),
		});
		expect(sub?.status).not.toBe("active");
	});
});

/* ------------------------------------------------------------------ */
suite("SELF-HOSTED", () => {
	it("S1 self-hosted is unlimited (no monthly/daily caps, no deduction)", async () => {
		const org = await newOrg("s1");
		await getOrProvisionOrgBilling(org);
		await setCredits(org, { creditsRemaining: 0 });
		process.env.SELF_HOSTED = "true";
		try {
			expect((await send(org, 500)).ok).toBe(true);
			expect((await credits(org)).creditsRemaining).toBe(0);
		} finally {
			delete process.env.SELF_HOSTED;
		}
	});
});
