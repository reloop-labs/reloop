import { type DatabaseInstance, db } from "@reloop/db/client";
import { domain, organizationPlan } from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { and, count, eq, isNull, sql } from "drizzle-orm";

const DEFAULT_MAX_CUSTOM_DOMAINS = 1;

export type DomainSlotDecision =
	| { ok: true }
	| { ok: false; used: number; limit: number };

/**
 * Decide whether one more custom domain fits the plan cap.
 * Pure: callers persist the new row under the same transaction as the count.
 */
export function decideCustomDomainSlot(args: {
	used: number;
	limit: number;
}): DomainSlotDecision {
	if (args.used >= args.limit) {
		return { ok: false, used: args.used, limit: args.limit };
	}
	return { ok: true };
}

/**
 * Lock the org, count active custom domains, and throw if the plan is full.
 * Must run in the same transaction as the insert / undelete.
 */
export async function assertCustomDomainQuota(
	organizationId: string,
	tx: DatabaseInstance = db,
): Promise<void> {
	if (!organizationId) {
		throw new Error("organizationId is required for domain quota checks");
	}

	await tx.execute(
		sql`select pg_advisory_xact_lock(hashtext(${organizationId}))`,
	);

	const plan = await tx.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { maxCustomDomains: true },
	});
	const limit = plan?.maxCustomDomains ?? DEFAULT_MAX_CUSTOM_DOMAINS;

	const [row] = await tx
		.select({ total: count() })
		.from(domain)
		.where(
			and(
				eq(domain.organizationId, organizationId),
				isNull(domain.deletedAt),
				eq(domain.isTrackingDomain, false),
			),
		);

	const used = Number(row?.total ?? 0);
	const decision = decideCustomDomainSlot({ used, limit });
	if (!decision.ok) {
		throw DomainErrors.domainLimitReached({
			used: decision.used,
			limit: decision.limit,
		});
	}
}
