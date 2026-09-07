import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import {
	applyLimitsToOrgPlan,
	getOrProvisionOrgBilling,
} from "@reloop/credits/lib/org-billing";
import { db } from "@reloop/db/client";
import { organizationCredits } from "@reloop/db/schema";
import type { PlanLimits } from "@reloop/pricing";
import { eq } from "drizzle-orm";

export type AdminPlanPatch = Partial<
	Pick<
		PlanLimits,
		| "monthlyEmails"
		| "dailyEmailLimit"
		| "overageEnabled"
		| "maxAgentInboxes"
		| "maxWebhooks"
		| "maxCustomDomains"
		| "maxAttachmentBytes"
		| "dataRetentionDays"
		| "dedicatedIpCount"
	>
>;

export async function patchOrgPlanController(args: {
	organizationId: string;
	patch: AdminPlanPatch;
}) {
	const billing = await getOrProvisionOrgBilling(args.organizationId);
	const next: PlanLimits = {
		planId: billing.plan.planId,
		monthlyEmails: args.patch.monthlyEmails ?? billing.plan.monthlyEmails,
		dailyEmailLimit:
			args.patch.dailyEmailLimit === undefined
				? billing.plan.dailyEmailLimit
				: args.patch.dailyEmailLimit,
		overageEnabled: args.patch.overageEnabled ?? billing.plan.overageEnabled,
		maxAgentInboxes: args.patch.maxAgentInboxes ?? billing.plan.maxAgentInboxes,
		maxWebhooks: args.patch.maxWebhooks ?? billing.plan.maxWebhooks,
		maxCustomDomains:
			args.patch.maxCustomDomains ?? billing.plan.maxCustomDomains,
		maxAttachmentBytes:
			args.patch.maxAttachmentBytes ?? billing.plan.maxAttachmentBytes,
		dataRetentionDays:
			args.patch.dataRetentionDays ?? billing.plan.dataRetentionDays,
		dedicatedIpCount:
			args.patch.dedicatedIpCount ?? billing.plan.dedicatedIpCount,
	};

	const saved = await db.transaction(async (tx) => {
		const plan = await applyLimitsToOrgPlan(args.organizationId, next, tx);
		if (args.patch.monthlyEmails !== undefined) {
			await tx
				.update(organizationCredits)
				.set({
					monthlyCredits: args.patch.monthlyEmails,
					updatedAt: new Date(),
				})
				.where(eq(organizationCredits.id, billing.credits.id));
		}
		return plan;
	});

	if (!saved) {
		throw CreditErrors.databaseError("Failed to update organization plan");
	}

	return {
		organizationId: args.organizationId,
		planId: saved.planId,
		monthlyEmails: saved.monthlyEmails,
		dailyEmailLimit: saved.dailyEmailLimit,
		overageEnabled: saved.overageEnabled,
		maxAgentInboxes: saved.maxAgentInboxes,
		maxWebhooks: saved.maxWebhooks,
		maxCustomDomains: saved.maxCustomDomains,
		maxAttachmentBytes: saved.maxAttachmentBytes,
		dataRetentionDays: saved.dataRetentionDays,
		dedicatedIpCount: saved.dedicatedIpCount,
	};
}
