import { db } from "@reloop/db/client";
import { member, organizationPlan } from "@reloop/db/schema";
import { eq, inArray } from "drizzle-orm";

export function plansForMemberships(
	organizationIds: string[],
	rows: { organizationId: string; planId: string }[],
): { organizationId: string; planId: string }[] {
	const byOrg = new Map(rows.map((row) => [row.organizationId, row.planId]));
	return organizationIds.map((organizationId) => ({
		organizationId,
		planId: byOrg.get(organizationId) ?? "free",
	}));
}

export async function listOrgPlansController(args: { userId: string }) {
	const memberships = await db.query.member.findMany({
		where: eq(member.userId, args.userId),
		columns: { organizationId: true },
	});
	const organizationIds = memberships.map((row) => row.organizationId);
	if (organizationIds.length === 0) {
		return { plans: [] as { organizationId: string; planId: string }[] };
	}

	const rows = await db
		.select({
			organizationId: organizationPlan.organizationId,
			planId: organizationPlan.planId,
		})
		.from(organizationPlan)
		.where(inArray(organizationPlan.organizationId, organizationIds));

	return { plans: plansForMemberships(organizationIds, rows) };
}
