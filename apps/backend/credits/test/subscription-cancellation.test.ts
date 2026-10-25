/**
 * Cancelled / revoked Polar subscriptions — real DB.
 * Opt-in: runs only against a throwaway *_billing_audit database.
 *   PG_URL=postgresql://reloop:reloop123@localhost:5432/reloop_billing_audit \
 *     bun test test/subscription-cancellation.test.ts
 */
import { afterAll, describe, expect, it } from "bun:test";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { handlePolarWebhookEvent } from "@reloop/credits/lib/polar-webhook";
import { db } from "@reloop/db/client";
import { reserveSendCredits } from "@reloop/db/reserve-send-credits";
import {
	billingPeriod,
	domain,
	mailbox,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
	user,
} from "@reloop/db/schema";
import { eq } from "drizzle-orm";

const enabled = process.env.PG_URL?.includes("billing_audit") ?? false;
const day = 24 * 60 * 60 * 1000;
const created: string[] = [];

afterAll(async () => {
	for (const id of created) {
		await db.delete(organization).where(eq(organization.id, id));
	}
});

function subEvent(
	orgId: string,
	opts: {
		type: string;
		status: string;
		plan: string;
		periodStart: Date;
		periodEnd: Date;
		subscriptionId?: string;
		cancelAtPeriodEnd?: boolean;
	},
) {
	return {
		type: opts.type,
		data: {
			id: opts.subscriptionId ?? `sub_${orgId}`,
			status: opts.status,
			metadata: { organization_id: orgId },
			product: {
				id: `prod_${opts.plan}`,
				name: opts.plan,
				metadata: { plan_id: opts.plan },
			},
			current_period_start: opts.periodStart.toISOString(),
			current_period_end: opts.periodEnd.toISOString(),
			cancel_at_period_end: opts.cancelAtPeriodEnd ?? false,
		},
	};
}

async function paidOrg(label: string) {
	const id = `audit_cancel_${label}_${crypto.randomUUID().slice(0, 8)}`;
	await db
		.insert(organization)
		.values({ id, name: id, slug: id, createdAt: new Date() });
	created.push(id);
	await getOrProvisionOrgBilling(id);
	const start = new Date(Date.now() - 5 * day);
	const end = new Date(start.getTime() + 30 * day);
	await handlePolarWebhookEvent(
		subEvent(id, {
			type: "subscription.active",
			status: "active",
			plan: "individual",
			periodStart: start,
			periodEnd: end,
		}),
	);
	return { org: id, start, end };
}

async function state(orgId: string) {
	const [plan, credits, subscription, periods] = await Promise.all([
		db.query.organizationPlan.findFirst({
			where: eq(organizationPlan.organizationId, orgId),
		}),
		db.query.organizationCredits.findFirst({
			where: eq(organizationCredits.organizationId, orgId),
		}),
		db.query.organizationSubscription.findFirst({
			where: eq(organizationSubscription.organizationId, orgId),
		}),
		db.query.billingPeriod.findMany({
			where: eq(billingPeriod.organizationId, orgId),
		}),
	]);
	return { plan, credits, subscription, periods };
}

describe.skipIf(!enabled)("Subscription cancellation", () => {
	it("revoked subscription moves the org to free, records the paid period, starts fresh free credits", async () => {
		const { org, start, end } = await paidOrg("revoke");
		await reserveSendCredits({ organizationId: org, recipientCount: 700 });

		const res = await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.revoked",
				status: "revoked",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		expect(res.ok).toBe(true);

		const s = await state(org);
		expect(s.plan?.planId).toBe("free");
		expect(s.plan?.monthlyEmails).toBe(6000);
		expect(s.plan?.dailyEmailLimit).toBe(200);
		expect(s.plan?.overageEnabled).toBe(false);
		expect(s.credits?.monthlyCredits).toBe(6000);
		expect(s.credits?.creditsRemaining).toBe(6000);
		expect(s.credits?.creditsUsed).toBe(0);
		expect(s.subscription?.planId).toBe("free");
		expect(s.subscription?.status).toBe("cancelled");
		expect(
			s.periods.some((p) => p.planId === "individual" && p.emailsUsed === 700),
		).toBe(true);

		// free limits now apply to sending
		const big = await reserveSendCredits({
			organizationId: org,
			recipientCount: 101,
		});
		expect(big.ok).toBe(false);
	});

	it("cancel at period end keeps the paid plan until Polar revokes it", async () => {
		const { org, start, end } = await paidOrg("period-end");
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.canceled",
				status: "active",
				cancelAtPeriodEnd: true,
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const s = await state(org);
		expect(s.plan?.planId).toBe("individual");
		expect(s.credits?.monthlyCredits).toBe(50000);
		expect(s.subscription?.cancelAtPeriodEnd).toBe(true);
	});

	it("a duplicate revoke webhook does not reset free usage again", async () => {
		const { org, start, end } = await paidOrg("duplicate");
		const revoke = subEvent(org, {
			type: "subscription.revoked",
			status: "revoked",
			plan: "individual",
			periodStart: start,
			periodEnd: end,
		});
		await handlePolarWebhookEvent(revoke);
		await reserveSendCredits({ organizationId: org, recipientCount: 25 });
		await handlePolarWebhookEvent(revoke);

		const s = await state(org);
		expect(s.plan?.planId).toBe("free");
		expect(s.credits?.creditsUsed).toBe(25);
		expect(s.periods.filter((p) => p.planId === "individual").length).toBe(1);
	});

	it("a late cancel of an old subscription does not downgrade a resubscribed org", async () => {
		const { org, start, end } = await paidOrg("stale");
		// org moves to a new Polar subscription
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.created",
				status: "active",
				plan: "startup",
				subscriptionId: `sub_new_${org}`,
				periodStart: end,
				periodEnd: new Date(end.getTime() + 30 * day),
			}),
		);
		// the old subscription's revoke arrives afterwards
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.revoked",
				status: "revoked",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const s = await state(org);
		expect(s.plan?.planId).toBe("startup");
		expect(s.subscription?.status).toBe("active");
	});

	it("revoking Pro suspends inboxes over the free cap (oldest stays active)", async () => {
		const { org, start, end } = await paidOrg("inboxes");
		await db
			.insert(user)
			.values({ id: org, name: org, email: `${org}@example.test` });
		const [d] = await db
			.insert(domain)
			.values({ domain: `${org}.test`, organizationId: org, userId: org })
			.returning();
		if (!d) throw new Error("domain insert failed");
		for (let i = 0; i < 5; i++) {
			await db.insert(mailbox).values({
				email: `agent${i}@${org}.test`,
				password: "x",
				organizationId: org,
				domainId: d.id,
			});
		}

		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.revoked",
				status: "revoked",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);

		const boxes = await db.query.mailbox.findMany({
			where: eq(mailbox.organizationId, org),
		});
		expect(boxes.filter((m) => m.status === "active").length).toBe(1);
		expect(boxes.filter((m) => m.status === "suspended").length).toBe(4);
		await db.delete(user).where(eq(user.id, org));
	});

	it("resubscribing after a downgrade restores the paid plan", async () => {
		const { org, start, end } = await paidOrg("resubscribe");
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.revoked",
				status: "revoked",
				plan: "individual",
				periodStart: start,
				periodEnd: end,
			}),
		);
		const newStart = new Date(Date.now() + 1000);
		await handlePolarWebhookEvent(
			subEvent(org, {
				type: "subscription.created",
				status: "active",
				plan: "individual",
				subscriptionId: `sub_again_${org}`,
				periodStart: newStart,
				periodEnd: new Date(newStart.getTime() + 30 * day),
			}),
		);
		const s = await state(org);
		expect(s.plan?.planId).toBe("individual");
		expect(s.credits?.creditsRemaining).toBe(50000);
		expect(s.subscription?.status).toBe("active");
	});
});
