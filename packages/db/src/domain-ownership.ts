import { randomBytes } from "node:crypto";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { type DatabaseInstance, db as defaultDb } from "./client";
import { domain, domainDnsRecord } from "./schema/domain";
import { mailbox } from "./schema/inbox";

/**
 * A domain belongs to one organization. Another org may still add it, but
 * then must publish this TXT record to prove DNS control; verifying it moves
 * the domain to that org and removes it from everyone else.
 */
export const OWNERSHIP_RECORD_LABEL = "_reloop-verification";
export const OWNERSHIP_VALUE_PREFIX = "reloop-verification=";

export function isOwnershipRecordValue(value: string): boolean {
	return value.startsWith(OWNERSHIP_VALUE_PREFIX);
}

export function generateOwnershipValue(): string {
	return `${OWNERSHIP_VALUE_PREFIX}${randomBytes(16).toString("hex")}`;
}

/** Live (not deleted) rows for this domain name held by other organizations. */
export async function findDomainInOtherOrgs(
	domainName: string,
	organizationId: string,
	database: DatabaseInstance = defaultDb,
): Promise<{ id: string; organizationId: string; status: string }[]> {
	const normalized = domainName.trim().toLowerCase().replace(/\.$/, "");
	return database
		.select({
			id: domain.id,
			organizationId: domain.organizationId,
			status: domain.status,
		})
		.from(domain)
		.where(
			and(
				sql`lower(${domain.domain}) = ${normalized}`,
				ne(domain.organizationId, organizationId),
				isNull(domain.deletedAt),
			),
		);
}

export type TransferredDomain = {
	domainId: string;
	organizationId: string;
	domain: string;
};

/**
 * Call when `domainId` has just proven DNS control. Soft-deletes the same
 * domain name in every other organization, with its DNS records, and
 * disables mailboxes on it so inbound mail stops reaching the old org.
 * Returns the removed rows; the caller publishes `domain.deleted` for each.
 */
export async function transferDomainOwnership(
	{
		domainId,
		organizationId,
		domainName,
	}: { domainId: string; organizationId: string; domainName: string },
	database: DatabaseInstance = defaultDb,
): Promise<TransferredDomain[]> {
	const others = await findDomainInOtherOrgs(
		domainName,
		organizationId,
		database,
	);
	const ids = others.map((row) => row.id).filter((id) => id !== domainId);
	if (ids.length === 0) return [];

	const now = new Date();
	await database.transaction(async (tx) => {
		await tx
			.update(domain)
			.set({ deletedAt: now, updatedAt: now })
			.where(and(inArray(domain.id, ids), isNull(domain.deletedAt)));
		await tx
			.update(domainDnsRecord)
			.set({ deletedAt: now, updatedAt: now })
			.where(
				and(
					inArray(domainDnsRecord.domainId, ids),
					isNull(domainDnsRecord.deletedAt),
				),
			);
		await tx
			.update(mailbox)
			.set({ status: "disabled" })
			.where(and(inArray(mailbox.domainId, ids), eq(mailbox.status, "active")));
	});

	return others
		.filter((row) => ids.includes(row.id))
		.map((row) => ({
			domainId: row.id,
			organizationId: row.organizationId,
			domain: domainName,
		}));
}
