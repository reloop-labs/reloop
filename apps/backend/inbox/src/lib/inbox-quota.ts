import { InboxErrors } from "@reloop/be-inbox/lib/errors";
import { type DatabaseInstance, db } from "@reloop/db/client";
import { mailbox, organizationPlan } from "@reloop/db/schema";
import { count, eq, sql } from "drizzle-orm";

const DEFAULT_MAX_AGENT_INBOXES = 1;

export type InboxSlotDecision =
	| { ok: true }
	| { ok: false; used: number; limit: number };

/**
 * Decide whether one more agent inbox fits the plan cap.
 * Pure: callers persist the new row under the same transaction as the count.
 */
export function decideInboxSlot(args: {
	used: number;
	limit: number;
}): InboxSlotDecision {
	if (args.used >= args.limit) {
		return { ok: false, used: args.used, limit: args.limit };
	}
	return { ok: true };
}

/**
 * Lock the org, count mailboxes, and throw if the plan is full.
 * Must run in the same transaction as the insert.
 */
export async function assertInboxQuota(
	organizationId: string,
	tx: DatabaseInstance = db,
): Promise<void> {
	if (!organizationId) {
		throw new Error("organizationId is required for inbox quota checks");
	}

	await tx.execute(
		sql`select pg_advisory_xact_lock(hashtext(${`${organizationId}:inbox`}))`,
	);

	const plan = await tx.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { maxAgentInboxes: true },
	});
	const limit = plan?.maxAgentInboxes ?? DEFAULT_MAX_AGENT_INBOXES;

	const [row] = await tx
		.select({ total: count() })
		.from(mailbox)
		.where(eq(mailbox.organizationId, organizationId));

	const used = Number(row?.total ?? 0);
	const decision = decideInboxSlot({ used, limit });
	if (!decision.ok) {
		throw InboxErrors.inboxLimitReached({
			used: decision.used,
			limit: decision.limit,
		});
	}
}
