/**
 * sender-gate.ts — is this organization allowed to send at all?
 *
 * Checked by every send path (mail API, SMTP log-incoming) before content
 * scanning, credits or KumoMTA. Two org-level stops:
 *  - organization.status is suspended/deleted (admin block)
 *  - an active org_sending_block row (reputation auto-pause)
 *
 * The mail API also has a Redis fast path for reputation blocks
 * (reputation-guard.ts); this is the Postgres source of truth.
 */

import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "./client";
import { organization, orgSendingBlock } from "./schema";

export type SenderBlock =
	| { kind: "organization_status"; status: "suspended" | "deleted" }
	| {
			kind: "sending_block";
			reason: string;
			bounceRate: number;
			complaintRate: number;
			retryAfterSeconds: number;
	  };

export async function findSenderBlock(
	organizationId: string,
): Promise<SenderBlock | null> {
	const [org] = await db
		.select({ status: organization.status })
		.from(organization)
		.where(eq(organization.id, organizationId))
		.limit(1);
	if (org && org.status !== "active") {
		return { kind: "organization_status", status: org.status };
	}

	const [block] = await db
		.select({
			reason: orgSendingBlock.reason,
			bounceRate: orgSendingBlock.bounceRate,
			complaintRate: orgSendingBlock.complaintRate,
			expiresAt: orgSendingBlock.expiresAt,
		})
		.from(orgSendingBlock)
		.where(
			and(
				eq(orgSendingBlock.organizationId, organizationId),
				isNull(orgSendingBlock.releasedAt),
				gt(orgSendingBlock.expiresAt, new Date()),
			),
		)
		.limit(1);
	if (block) {
		return {
			kind: "sending_block",
			reason: block.reason,
			bounceRate: block.bounceRate,
			complaintRate: block.complaintRate,
			retryAfterSeconds: Math.max(
				Math.ceil((block.expiresAt.getTime() - Date.now()) / 1000),
				1,
			),
		};
	}
	return null;
}
