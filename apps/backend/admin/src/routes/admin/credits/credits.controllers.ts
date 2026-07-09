import { type DatabaseInstance, db } from "@reloop/db/client";
import {
	adminAuditLog,
	creditLedger,
	organization,
	organizationCredits,
} from "@reloop/db/schema";
import { createError } from "evlog";
import { desc, eq, sql } from "drizzle-orm";

async function getOrProvisionCredits(
	orgId: string,
	tx: DatabaseInstance = db,
) {
	let activeCredits = await tx.query.organizationCredits.findFirst({
		where: (c, { and, eq: eqFn }) =>
			and(eqFn(c.organizationId, orgId), eqFn(c.status, "active")),
	});

	if (activeCredits) return activeCredits;

	const now = new Date();
	const periodEnd = new Date(now);
	periodEnd.setMonth(periodEnd.getMonth() + 1);

	const [created] = await tx
		.insert(organizationCredits)
		.values({
			organizationId: orgId,
			creditsUsed: 0,
			creditsRemaining: 3000,
			monthlyCredits: 3000,
			currentPeriodStart: now,
			currentPeriodEnd: periodEnd,
			status: "active",
		})
		.onConflictDoNothing()
		.returning();

	if (created) return created;

	activeCredits = await tx.query.organizationCredits.findFirst({
		where: (c, { and, eq: eqFn }) =>
			and(eqFn(c.organizationId, orgId), eqFn(c.status, "active")),
	});
	if (!activeCredits) {
		throw createError({
			status: 500,
			message: "Failed to provision credits",
			why: `Could not create or load credits for ${orgId}`,
			fix: "Retry the request",
		});
	}
	return activeCredits;
}

export async function getCreditsController(organizationId: string) {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	const credits = await db.query.organizationCredits.findFirst({
		where: eq(organizationCredits.organizationId, organizationId),
	});

	const ledger = await db.query.creditLedger.findMany({
		where: eq(creditLedger.organizationId, organizationId),
		orderBy: [desc(creditLedger.createdAt)],
		limit: 50,
	});

	return {
		balance: credits
			? {
					organizationId,
					organizationName: org.name,
					creditsUsed: credits.creditsUsed,
					creditsRemaining: credits.creditsRemaining,
					monthlyCredits: credits.monthlyCredits,
					status: credits.status,
					currentPeriodStart: credits.currentPeriodStart,
					currentPeriodEnd: credits.currentPeriodEnd,
				}
			: null,
		ledger: ledger.map((entry) => ({
			id: entry.id,
			entryType: entry.entryType,
			delta: entry.delta,
			balanceAfter: entry.balanceAfter,
			reason: entry.reason,
			createdAt: entry.createdAt,
		})),
	};
}

export async function topupCreditsController({
	organizationId,
	amount,
	reason,
	actorUserId,
}: {
	organizationId: string;
	amount: number;
	reason?: string;
	actorUserId: string;
}) {
	if (amount <= 0) {
		throw createError({
			status: 400,
			message: "Invalid top-up amount",
			why: `Amount ${amount} must be greater than zero`,
			fix: "Provide a positive amount",
		});
	}

	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	await db.transaction(async (tx) => {
		const activeCredits = await getOrProvisionCredits(
			organizationId,
			tx as DatabaseInstance,
		);
		await tx
			.update(organizationCredits)
			.set({
				creditsRemaining: sql`${organizationCredits.creditsRemaining} + ${amount}`,
				updatedAt: new Date(),
			})
			.where(eq(organizationCredits.id, activeCredits.id));

		await tx.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: activeCredits.id,
			entryType: "manual_adjustment",
			delta: amount,
			balanceAfter: activeCredits.creditsRemaining + amount,
			reason: reason || "Manual top-up",
		});

		await tx.insert(adminAuditLog).values({
			actorUserId,
			action: "credits.topup",
			resourceType: "organization",
			resourceId: organizationId,
			organizationId,
			metadata: { amount, reason: reason || "Manual top-up" },
		});
	});

	return { success: true };
}
