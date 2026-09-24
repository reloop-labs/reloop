import { db } from "@reloop/db/client";
import {
	adminAuditLog,
	creditLedger,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
} from "@reloop/db/schema";
import {
	applyPlanChange,
	getPlanLimits,
	type PlanId,
} from "@reloop/pricing";
import { eq } from "drizzle-orm";
import { createError } from "evlog";

const planRank: Record<PlanId, number> = {
	free: 0,
	individual: 1,
	startup: 2,
	enterprise: 3,
};

function isHigherOrEqual(a: PlanId, b: PlanId): boolean {
	return planRank[a] >= planRank[b];
}

export async function convertOrganizationPlanController(args: {
	organizationId: string;
	targetPlanId: PlanId;
	mode: "comped" | "paid";
	reason?: string;
	actorUserId: string;
}) {
	const { organizationId, targetPlanId, mode, actorUserId } = args;

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

	const currentPlanRow = await db.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
	});
	const currentPlanId: PlanId = (currentPlanRow?.planId as PlanId) ?? "free";

	if (currentPlanId === targetPlanId) {
		throw createError({
			status: 409,
			message: `Already on ${targetPlanId}`,
			why: `Organization is already on plan ${targetPlanId}`,
			fix: "No action needed",
		});
	}

	if (isHigherOrEqual(currentPlanId, targetPlanId)) {
		throw createError({
			status: 409,
			message: "Already on a higher plan",
			why: `Organization is on ${currentPlanId} which is higher than ${targetPlanId}`,
			fix: "Downgrade is not allowed via this endpoint",
		});
	}

	// Build next limits via pricing catalog
	const currentLimits = currentPlanRow
		? {
				planId: currentPlanRow.planId as PlanId,
				monthlyEmails: currentPlanRow.monthlyEmails,
				dailyEmailLimit: currentPlanRow.dailyEmailLimit,
				overageEnabled: currentPlanRow.overageEnabled,
				maxAgentInboxes: currentPlanRow.maxAgentInboxes,
				maxWebhooks: currentPlanRow.maxWebhooks,
				maxCustomDomains: currentPlanRow.maxCustomDomains,
				maxAttachmentBytes: currentPlanRow.maxAttachmentBytes,
				dataRetentionDays: currentPlanRow.dataRetentionDays,
				dedicatedIpCount: currentPlanRow.dedicatedIpCount,
			}
		: null;

	const nextLimits = applyPlanChange({
		current: currentLimits,
		nextPlanId: targetPlanId,
	});

	const now = new Date();

	await db.transaction(async (tx) => {
		// Upsert organization_plan
		if (currentPlanRow) {
			await tx
				.update(organizationPlan)
				.set({
					planId: nextLimits.planId,
					monthlyEmails: nextLimits.monthlyEmails,
					dailyEmailLimit: nextLimits.dailyEmailLimit,
					overageEnabled: nextLimits.overageEnabled,
					maxAgentInboxes: nextLimits.maxAgentInboxes,
					maxWebhooks: nextLimits.maxWebhooks,
					maxCustomDomains: nextLimits.maxCustomDomains,
					maxAttachmentBytes: nextLimits.maxAttachmentBytes,
					dataRetentionDays: nextLimits.dataRetentionDays,
					dedicatedIpCount: nextLimits.dedicatedIpCount,
					updatedAt: now,
				})
				.where(eq(organizationPlan.id, currentPlanRow.id));
		} else {
			await tx.insert(organizationPlan).values({
				organizationId,
				planId: nextLimits.planId,
				monthlyEmails: nextLimits.monthlyEmails,
				dailyEmailLimit: nextLimits.dailyEmailLimit,
				overageEnabled: nextLimits.overageEnabled,
				maxAgentInboxes: nextLimits.maxAgentInboxes,
				maxWebhooks: nextLimits.maxWebhooks,
				maxCustomDomains: nextLimits.maxCustomDomains,
				maxAttachmentBytes: nextLimits.maxAttachmentBytes,
				dataRetentionDays: nextLimits.dataRetentionDays,
				dedicatedIpCount: nextLimits.dedicatedIpCount,
			});
		}

		// Ensure credits row exists
		let credits = await tx.query.organizationCredits.findFirst({
			where: eq(organizationCredits.organizationId, organizationId),
		});
		if (!credits) {
			const periodEnd = new Date(now);
			periodEnd.setMonth(periodEnd.getMonth() + 1);
			const [created] = await tx
				.insert(organizationCredits)
				.values({
					organizationId,
					creditsUsed: 0,
					creditsRemaining: nextLimits.monthlyEmails,
					monthlyCredits: nextLimits.monthlyEmails,
					currentPeriodStart: now,
					currentPeriodEnd: periodEnd,
					status: "active",
				})
				.returning();
			if (!created) throw new Error("Failed to create credits");
			credits = created;
			await tx.insert(creditLedger).values({
				organizationId,
				organizationCreditsId: credits.id,
				entryType: "credit_purchased",
				delta: nextLimits.monthlyEmails,
				balanceAfter: nextLimits.monthlyEmails,
				reason:
					mode === "paid"
						? `Converted to ${targetPlanId} (paid) – initial quota`
						: `Converted to ${targetPlanId} (comped) – initial quota`,
			});
		} else {
			// Update credits: monthlyCredits and remaining based on used
			const newRemaining = Math.max(
				0,
				nextLimits.monthlyEmails - credits.creditsUsed,
			);
			const delta = newRemaining - credits.creditsRemaining;
			await tx
				.update(organizationCredits)
				.set({
					monthlyCredits: nextLimits.monthlyEmails,
					creditsRemaining: newRemaining,
					updatedAt: now,
				})
				.where(eq(organizationCredits.id, credits.id));

			if (delta !== 0) {
				await tx.insert(creditLedger).values({
					organizationId,
					organizationCreditsId: credits.id,
					entryType: "plan_change",
					delta,
					balanceAfter: newRemaining,
					reason:
						args.reason ||
						(mode === "paid"
							? `Converted to ${targetPlanId} (paid)`
							: `Converted to ${targetPlanId} (comped)`),
				});
			} else {
				await tx.insert(creditLedger).values({
					organizationId,
					organizationCreditsId: credits.id,
					entryType: "plan_change",
					delta: 0,
					balanceAfter: credits.creditsRemaining,
					reason:
						args.reason ||
						(mode === "paid"
							? `Converted to ${targetPlanId} (paid)`
							: `Converted to ${targetPlanId} (comped)`),
				});
			}
		}

		// Upsert subscription
		const sub = await tx.query.organizationSubscription.findFirst({
			where: eq(organizationSubscription.organizationId, organizationId),
		});
		if (sub) {
			await tx
				.update(organizationSubscription)
				.set({
					planId: targetPlanId,
					status: "active",
					updatedAt: now,
				})
				.where(eq(organizationSubscription.id, sub.id));
		} else {
			const periodEnd = new Date(now);
			periodEnd.setMonth(periodEnd.getMonth() + 1);
			await tx.insert(organizationSubscription).values({
				organizationId,
				planId: targetPlanId,
				status: "active",
				billingCycle: "monthly",
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
			});
		}

		await tx.insert(adminAuditLog).values({
			actorUserId,
			action:
				targetPlanId === "individual"
					? "organization.convert_to_pro"
					: `organization.convert_to_${targetPlanId}`,
			resourceType: "organization",
			resourceId: organizationId,
			organizationId,
			metadata: {
				fromPlan: currentPlanId,
				toPlan: targetPlanId,
				mode,
				reason: args.reason ?? null,
			},
		});
	});

	return {
		organizationId,
		previousPlanId: currentPlanId,
		planId: nextLimits.planId,
		monthlyEmails: nextLimits.monthlyEmails,
		dailyEmailLimit: nextLimits.dailyEmailLimit,
		overageEnabled: nextLimits.overageEnabled,
		maxAgentInboxes: nextLimits.maxAgentInboxes,
		maxWebhooks: nextLimits.maxWebhooks,
		maxCustomDomains: nextLimits.maxCustomDomains,
		maxAttachmentBytes: nextLimits.maxAttachmentBytes,
		dataRetentionDays: nextLimits.dataRetentionDays,
		dedicatedIpCount: nextLimits.dedicatedIpCount,
		mode,
	};
}
