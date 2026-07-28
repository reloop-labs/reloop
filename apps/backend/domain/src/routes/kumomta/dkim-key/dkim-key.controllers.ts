import { db } from "@reloop/db/client";
import { domain, domainDnsRecord } from "@reloop/db/schema";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getDkimKeyController({
	domainName,
	organizationId,
}: {
	domainName: string;
	organizationId: string;
}): Promise<{ selector: string; privateKey: string }> {
	const log = useLogger();
	const domainQuery = and(
		eq(domain.domain, domainName),
		eq(domain.organizationId, organizationId),
		isNull(domain.deletedAt),
	);

	log.info(
		`[DKIM-KEY] Querying domain: ${domainName} (Org: ${organizationId})`,
	);

	const domainRecord = await db.query.domain.findFirst({
		where: domainQuery,
		columns: { id: true, status: true },
	});

	if (!domainRecord) {
		log.warn(`[DKIM-KEY] Domain NOT FOUND: ${domainName}`);
		throw KumoMtaErrors.domainNotFound(domainName);
	}

	if (domainRecord.status !== "active") {
		log.warn(
			`[DKIM-KEY] Domain found but NOT ACTIVE: ${domainName} (Status: ${domainRecord.status})`,
		);
		throw KumoMtaErrors.domainNotActive(domainName);
	}

	const dkimRecord = await db.query.domainDnsRecord.findFirst({
		where: and(
			eq(domainDnsRecord.domainId, domainRecord.id),
			eq(domainDnsRecord.recordTypeName, "DKIM"),
			isNull(domainDnsRecord.deletedAt),
		),
		columns: { name: true, privateKey: true },
	});

	if (!dkimRecord || !dkimRecord.privateKey) {
		throw KumoMtaErrors.dkimKeyNotFound(domainName);
	}

	const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");

	return { selector, privateKey: dkimRecord.privateKey };
}
