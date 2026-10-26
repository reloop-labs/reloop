import { db } from "@reloop/db/client";
import {
	downgradeOrgToFree,
	type OrgBillingRow,
} from "@reloop/db/org-plan-change";
import {
	adminAuditLog,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

/** Polar is still billing the org; an admin downgrade would leave it charged. */
const LIVE_POLAR_STATUSES = new Set(["active", "past_due", "trialing"]);

export async function downgradeOrganizationPlanController(args: {
	organizationId: string;
	reason?: string;
	actorUserId: string;
}) {
	const { organizationId, actorUserId } = args;

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

	return db.transaction(async (tx) => {
		const [plan, credits, subscription] = await Promise.all([
			tx.query.organizationPlan.findFirst({
				where: eq(organizationPlan.organizationId, organizationId),
			}),
			tx.query.organizationCredits.findFirst({
				where: and(
					eq(organizationCredits.organizationId, organizationId),
					eq(organizationCredits.status, "active"),
				),
			}),
			tx.query.organizationSubscription.findFirst({
				where: eq(organizationSubscription.organizationId, organizationId),
			}),
		]);

		if (!plan || plan.planId === "free" || plan.planId === "payg") {
			throw createError({
				status: 409,
				message: "Already on Free",
				why: `Organization is on ${plan?.planId ?? "free"}, which has no subscription to remove`,
				fix: "No action needed",
			});
		}

		if (!credits || !subscription) {
			throw createError({
				status: 409,
				message: "Billing records incomplete",
				why: "Organization has a plan but no active credits or subscription row",
				fix: "Open the organization in the dashboard once to provision billing, then retry",
			});
		}

		if (
			subscription.polarSubscriptionId &&
			LIVE_POLAR_STATUSES.has(subscription.status)
		) {
			throw createError({
				status: 409,
				message: "Polar subscription still active",
				why: `Polar subscription ${subscription.polarSubscriptionId} is ${subscription.status}; downgrading here would keep charging the customer`,
				fix: "Cancel or revoke the subscription in Polar. Its webhook moves the organization to Free",
			});
		}

		const billing: OrgBillingRow = { plan, credits, subscription };
		const period = await downgradeOrgToFree({ billing, tx });

		await tx
			.update(organizationSubscription)
			.set({
				planId: period.planId,
				status: "active",
				currentPeriodStart: period.periodStart,
				currentPeriodEnd: period.periodEnd,
				cancelAtPeriodEnd: false,
				pastDueSince: null,
				updatedAt: new Date(),
			})
			.where(eq(organizationSubscription.id, subscription.id));

		await tx.insert(adminAuditLog).values({
			actorUserId,
			action: `organization.downgrade_to_${period.planId}`,
			resourceType: "organization",
			resourceId: organizationId,
			organizationId,
			metadata: {
				fromPlan: plan.planId,
				toPlan: period.planId,
				reason: args.reason ?? null,
			},
		});

		return {
			organizationId,
			previousPlanId: plan.planId,
			planId: period.planId,
		};
	});
}
