import { BusEvent, bus } from "@reloop/bus";
import { type DatabaseInstance, db } from "@reloop/db/client";
import {
	findDomainInOtherOrgs,
	generateOwnershipValue,
	isOwnershipRecordValue,
	OWNERSHIP_RECORD_LABEL,
	type TransferredDomain,
} from "@reloop/db/domain-ownership";
import { domainDnsRecord } from "@reloop/db/schema";
import { getDomainSubString } from "@reloop/domain/utils/domain-formatter";
import { and, eq, isNull } from "drizzle-orm";

/** Whether another organization already holds this domain name. */
export async function isDomainHeldElsewhere(
	domainName: string,
	organizationId: string,
	tx: DatabaseInstance = db,
): Promise<boolean> {
	const others = await findDomainInOtherOrgs(domainName, organizationId, tx);
	return others.length > 0;
}

/**
 * If another org holds this domain, make sure this row carries an ownership
 * TXT record the user must publish before the domain can verify. Returns
 * whether the domain is contested.
 */
export async function ensureOwnershipRecord(
	{
		domainId,
		organizationId,
		userId,
		domain,
	}: {
		domainId: string;
		organizationId: string;
		userId: string;
		domain: string;
	},
	tx: DatabaseInstance = db,
): Promise<boolean> {
	if (!(await isDomainHeldElsewhere(domain, organizationId, tx))) {
		return false;
	}

	const existing = await tx
		.select({ value: domainDnsRecord.value })
		.from(domainDnsRecord)
		.where(
			and(
				eq(domainDnsRecord.domainId, domainId),
				eq(domainDnsRecord.recordType, "TXT"),
				isNull(domainDnsRecord.deletedAt),
			),
		);
	if (existing.some((record) => isOwnershipRecordValue(record.value))) {
		return true;
	}

	const sub = getDomainSubString(domain);
	await tx.insert(domainDnsRecord).values({
		domainId,
		organizationId,
		userId,
		domain,
		recordType: "TXT",
		recordTypeName: "OWNERSHIP",
		purpose: "sending",
		name:
			sub === "@" ? OWNERSHIP_RECORD_LABEL : `${OWNERSHIP_RECORD_LABEL}.${sub}`,
		fqdn: `${OWNERSHIP_RECORD_LABEL}.${domain}`,
		value: generateOwnershipValue(),
	});
	return true;
}

/** Tell each previous holder their domain moved to another organization. */
export async function publishDomainTransfers(
	transferred: TransferredDomain[],
): Promise<void> {
	for (const row of transferred) {
		await bus.publish(BusEvent.DOMAIN_DELETED, {
			domainId: row.domainId,
			domain: row.domain,
			organizationId: row.organizationId,
		});
	}
}
