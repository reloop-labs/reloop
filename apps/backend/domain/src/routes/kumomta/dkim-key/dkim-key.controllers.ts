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
}): Promise<{
	/** Null only for relay domains without a verified Reloop DKIM record. */
	selector: string | null;
	privateKey: string | null;
	smtpProviderId: string | null;
}> {
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
		columns: { id: true, status: true, smtpProviderId: true },
	});

	if (!domainRecord) {
		log.warn(`[DKIM-KEY] Domain NOT FOUND: ${domainName}`);
		throw KumoMtaErrors.domainNotFound(domainName);
	}

	// Relay domains route even mid re-verify (status "verifying"/"pending"):
	// the send was already checked upstream, and falling through here would
	// send from Reloop IPs instead of the customer's server.
	const relayRoutable =
		domainRecord.smtpProviderId !== null && domainRecord.status !== "suspended";

	if (domainRecord.status !== "active" && !relayRoutable) {
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
		columns: { name: true, privateKey: true, status: true },
	});

	// Routing piggybacks on this org-scoped lookup so KumoMTA never trusts a
	// provider id supplied by the sender.
	const smtpProviderId = domainRecord.smtpProviderId;

	// Relay domains may have no Reloop DNS at all; only sign with our key when
	// the customer actually published it, otherwise the signature would fail.
	if (smtpProviderId && dkimRecord?.status !== "active") {
		return { selector: null, privateKey: null, smtpProviderId };
	}

	if (!dkimRecord || !dkimRecord.privateKey) {
		throw KumoMtaErrors.dkimKeyNotFound(domainName);
	}

	const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");

	return {
		selector,
		privateKey: dkimRecord.privateKey,
		smtpProviderId,
	};
}
