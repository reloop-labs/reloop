import { db } from "@reloop/db/client";
import { domain, domainDnsRecord } from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

function isPlatformDomain(domainName: string): boolean {
	const platform = domainConfig.PLATFORM_TEST_FROM_DOMAIN.toLowerCase().trim();
	return domainName.toLowerCase().trim() === platform;
}

/**
 * Platform domain DKIM is shared (one DNS zone). Prefer env keys, then any
 * active domain row for that hostname with a stored private key.
 */
async function resolvePlatformDkim(
	domainName: string,
): Promise<{ selector: string; privateKey: string } | null> {
	if (
		domainConfig.PLATFORM_DKIM_PRIVATE_KEY &&
		domainConfig.PLATFORM_DKIM_SELECTOR
	) {
		return {
			selector: domainConfig.PLATFORM_DKIM_SELECTOR,
			privateKey: domainConfig.PLATFORM_DKIM_PRIVATE_KEY,
		};
	}

	// Fall back: first active domain with this name that has DKIM material.
	const domains = await db.query.domain.findMany({
		where: and(
			eq(domain.domain, domainName),
			eq(domain.status, "active"),
			isNull(domain.deletedAt),
		),
		columns: { id: true },
		limit: 20,
	});

	for (const row of domains) {
		const dkimRecord = await db.query.domainDnsRecord.findFirst({
			where: and(
				eq(domainDnsRecord.domainId, row.id),
				eq(domainDnsRecord.recordTypeName, "DKIM"),
				isNull(domainDnsRecord.deletedAt),
			),
			columns: { name: true, privateKey: true },
		});
		if (dkimRecord?.privateKey) {
			const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");
			return { selector, privateKey: dkimRecord.privateKey };
		}
	}

	return null;
}

export async function getDkimKeyController({
	domainName,
	organizationId,
}: {
	domainName: string;
	organizationId: string;
}): Promise<{ selector: string; privateKey: string }> {
	const log = useLogger();

	if (isPlatformDomain(domainName)) {
		log.info(
			`[DKIM-KEY] Platform domain DKIM lookup: ${domainName} (Org: ${organizationId})`,
		);
		const platformKeys = await resolvePlatformDkim(domainName);
		if (platformKeys) {
			return platformKeys;
		}
		log.warn(`[DKIM-KEY] Platform DKIM not configured for ${domainName}`);
		throw KumoMtaErrors.dkimKeyNotFound(domainName);
	}

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
