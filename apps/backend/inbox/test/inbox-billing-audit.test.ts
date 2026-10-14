/**
 * Agent inbox billing audit — real code against a throwaway Postgres.
 *   PG_URL=postgresql://reloop:reloop123@localhost:5432/reloop_billing_audit \
 *     bun test test/inbox-billing-audit.test.ts
 */
import { afterAll, describe, expect, it } from "bun:test";
import {
	assertCanActivateInbox,
	assertInboxQuota,
} from "@reloop/be-inbox/lib/inbox-quota";
import { db } from "@reloop/db/client";
import { syncInboxesToPlanCap } from "@reloop/db/inbox-plan-cap";
import {
	domain,
	mailbox,
	organization,
	organizationPlan,
	user,
} from "@reloop/db/schema";
import { eq } from "drizzle-orm";

// Opt-in: only runs against a throwaway *_billing_audit database (writes real rows).
const enabled = process.env.PG_URL?.includes("billing_audit") ?? false;

const orgs: string[] = [];
const users: string[] = [];

async function setup(maxAgentInboxes: number) {
	const id = `audit_inbox_${crypto.randomUUID().slice(0, 8)}`;
	await db
		.insert(organization)
		.values({ id, name: id, slug: id, createdAt: new Date() });
	await db.insert(user).values({ id, name: id, email: `${id}@example.test` });
	orgs.push(id);
	users.push(id);
	await db.insert(organizationPlan).values({
		organizationId: id,
		planId: maxAgentInboxes === 1 ? "free" : "individual",
		monthlyEmails: 3000,
		dailyEmailLimit: 100,
		overageEnabled: false,
		maxAgentInboxes,
		maxWebhooks: 1,
		maxCustomDomains: 3,
		maxAttachmentBytes: 1048576,
		dataRetentionDays: 30,
		dedicatedIpCount: 0,
		maxSmtpProviders: 0,
	});
	const [d] = await db
		.insert(domain)
		.values({ domain: `${id}.test`, organizationId: id, userId: id })
		.returning();
	if (!d) throw new Error("domain insert failed");
	return { orgId: id, domainId: d.id };
}

/** Same pattern as create-mailbox: quota check + insert in one transaction. */
async function createInbox(orgId: string, domainId: string, n: number) {
	await db.transaction(async (tx) => {
		await assertInboxQuota(orgId, tx);
		await tx.insert(mailbox).values({
			email: `agent${n}-${crypto.randomUUID().slice(0, 4)}@${orgId}.test`,
			password: "x",
			organizationId: orgId,
			domainId,
		});
	});
}

async function inboxCount(orgId: string) {
	return (
		await db.query.mailbox.findMany({
			where: eq(mailbox.organizationId, orgId),
		})
	).length;
}

afterAll(async () => {
	for (const id of orgs)
		await db.delete(organization).where(eq(organization.id, id));
	for (const id of users) await db.delete(user).where(eq(user.id, id));
});

describe.skipIf(!enabled)("Agent inbox limits", () => {
	it("I1 free plan: 1st inbox allowed, 2nd blocked", async () => {
		const { orgId, domainId } = await setup(1);
		await createInbox(orgId, domainId, 1);
		expect(createInbox(orgId, domainId, 2)).rejects.toThrow();
		expect(await inboxCount(orgId)).toBe(1);
	});

	it("I2 Pro plan: 5 inboxes allowed, 6th blocked", async () => {
		const { orgId, domainId } = await setup(5);
		for (let i = 0; i < 5; i++) await createInbox(orgId, domainId, i);
		expect(createInbox(orgId, domainId, 6)).rejects.toThrow();
		expect(await inboxCount(orgId)).toBe(5);
	});

	it("I3 parallel creation can't exceed the cap (10 at once on free)", async () => {
		const { orgId, domainId } = await setup(1);
		await Promise.allSettled(
			Array.from({ length: 10 }, (_, i) => createInbox(orgId, domainId, i)),
		);
		expect(await inboxCount(orgId)).toBe(1);
	});

	async function downgradeTo(orgId: string, maxAgentInboxes: number) {
		// same as applyLimitsToOrgPlan / admin convert-plan: plan row + sync in one tx
		await db.transaction(async (tx) => {
			await tx
				.update(organizationPlan)
				.set({ maxAgentInboxes })
				.where(eq(organizationPlan.organizationId, orgId));
			await syncInboxesToPlanCap({
				organizationId: orgId,
				maxAgentInboxes,
				tx,
			});
		});
	}

	async function statuses(orgId: string) {
		const rows = await db.query.mailbox.findMany({
			where: eq(mailbox.organizationId, orgId),
			orderBy: (m, { asc }) => [asc(m.createdAt), asc(m.id)],
		});
		return rows.map((m) => m.status);
	}

	it("I4 after downgrading Pro → free, inboxes above the free cap are suspended", async () => {
		const { orgId, domainId } = await setup(5);
		for (let i = 0; i < 5; i++) await createInbox(orgId, domainId, i);
		await downgradeTo(orgId, 1);
		const s = await statuses(orgId);
		expect(s.filter((x) => x === "active").length).toBe(1);
		expect(s.filter((x) => x === "suspended").length).toBe(4);
		expect(s[0]).toBe("active"); // the oldest inbox keeps working
	});

	it("I5 upgrading again re-activates suspended inboxes", async () => {
		const { orgId, domainId } = await setup(5);
		for (let i = 0; i < 5; i++) await createInbox(orgId, domainId, i);
		await downgradeTo(orgId, 1);
		await downgradeTo(orgId, 5);
		expect((await statuses(orgId)).every((x) => x === "active")).toBe(true);
	});

	it("I6 a suspended inbox can't be re-enabled past the cap", async () => {
		const { orgId, domainId } = await setup(5);
		for (let i = 0; i < 5; i++) await createInbox(orgId, domainId, i);
		await downgradeTo(orgId, 1);
		const suspended = (
			await db.query.mailbox.findMany({
				where: eq(mailbox.organizationId, orgId),
			})
		).find((m) => m.status === "suspended");
		if (!suspended) throw new Error("expected a suspended inbox");
		expect(
			db.transaction((tx) => assertCanActivateInbox(orgId, suspended.id, tx)),
		).rejects.toThrow();
	});

	it("I7 user-disabled inboxes are left alone and don't take a slot", async () => {
		const { orgId, domainId } = await setup(5);
		for (let i = 0; i < 3; i++) await createInbox(orgId, domainId, i);
		const oldest = (
			await db.query.mailbox.findMany({
				where: eq(mailbox.organizationId, orgId),
				orderBy: (m, { asc }) => [asc(m.createdAt), asc(m.id)],
			})
		)[0];
		if (!oldest) throw new Error("no inbox");
		await db
			.update(mailbox)
			.set({ status: "disabled" })
			.where(eq(mailbox.id, oldest.id));
		await downgradeTo(orgId, 1);
		const s = await statuses(orgId);
		expect(s[0]).toBe("disabled");
		expect(s.filter((x) => x === "active").length).toBe(1);
		expect(s.filter((x) => x === "suspended").length).toBe(1);
	});
});
