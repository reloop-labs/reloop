/**
 * sender-gate.ts — is this organization / sending domain allowed to send?
 *
 * Checked by every send path (mail API, SMTP log-incoming) before content
 * scanning, credits or KumoMTA. Two stops:
 *  - organization.status is suspended/deleted (admin block, whole org)
 *  - an active org_sending_block row for the sending domain (reputation
 *    auto-pause). Pauses are per domain: one domain with a bad list doesn't
 *    stop the org's other domains. Legacy rows without a domain still pause
 *    the whole org.
 */

import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "./client";
import { domain, organization, orgSendingBlock } from "./schema";

export type DomainSendingBlock = {
	kind: "sending_block";
	/** Null for a legacy org-wide pause. */
	domainName: string | null;
	reason: string;
	bounceRate: number;
	complaintRate: number;
	retryAfterSeconds: number;
};

export type SenderBlock =
	| { kind: "organization_status"; status: "suspended" | "deleted" }
	| DomainSendingBlock;

/** Active reputation pause covering this sending domain, if any. */
export async function findDomainSendingBlock({
	organizationId,
	domainId,
}: {
	organizationId: string;
	domainId: string;
}): Promise<DomainSendingBlock | null> {
	const [block] = await db
		.select({
			domainName: domain.domain,
			reason: orgSendingBlock.reason,
			bounceRate: orgSendingBlock.bounceRate,
			complaintRate: orgSendingBlock.complaintRate,
			expiresAt: orgSendingBlock.expiresAt,
		})
		.from(orgSendingBlock)
		.leftJoin(domain, eq(domain.id, orgSendingBlock.domainId))
		.where(
			and(
				eq(orgSendingBlock.organizationId, organizationId),
				or(
					eq(orgSendingBlock.domainId, domainId),
					isNull(orgSendingBlock.domainId),
				),
				isNull(orgSendingBlock.releasedAt),
				gt(orgSendingBlock.expiresAt, new Date()),
			),
		)
		.limit(1);
	if (!block) return null;
	return {
		kind: "sending_block",
		domainName: block.domainName,
		reason: block.reason,
		bounceRate: block.bounceRate,
		complaintRate: block.complaintRate,
		retryAfterSeconds: Math.max(
			Math.ceil((block.expiresAt.getTime() - Date.now()) / 1000),
			1,
		),
	};
}

/**
 * Org suspension always; the domain's reputation pause only when `domainId`
 * is given (the mail API checks that later, once the From domain resolves).
 */
export async function findSenderBlock({
	organizationId,
	domainId,
}: {
	organizationId: string;
	domainId?: string;
}): Promise<SenderBlock | null> {
	const [org] = await db
		.select({ status: organization.status })
		.from(organization)
		.where(eq(organization.id, organizationId))
		.limit(1);
	if (org && org.status !== "active") {
		return { kind: "organization_status", status: org.status };
	}
	if (!domainId) return null;
	return findDomainSendingBlock({ organizationId, domainId });
}
