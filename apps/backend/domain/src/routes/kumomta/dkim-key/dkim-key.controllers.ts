import { classifyMailboxProvider, resolveOrgEgress } from "@reloop/db";
import { db } from "@reloop/db/client";
import { domain, domainDnsRecord } from "@reloop/db/schema";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export type EgressResult = {
	pool: "dedicated" | "shared";
	address: string | null;
	hostname: string | null;
};

const SHARED_EGRESS: EgressResult = {
	pool: "shared",
	address: null,
	hostname: null,
};

/**
 * Pick the sending IP for one accepted message and reserve its warmup budget.
 * Never fails the send: any error routes the message through the shared pool.
 */
async function resolveEgress(
	organizationId: string,
	recipients: string[],
): Promise<EgressResult> {
	const log = useLogger();
	if (recipients.length === 0) return SHARED_EGRESS;
	try {
		const egress = await resolveOrgEgress(organizationId, {
			// One message, one source IP: the first recipient decides which
			// provider's warmup budget the whole message draws from.
			provider: classifyMailboxProvider(recipients[0] ?? ""),
			recipientCount: recipients.length,
		});
		if (egress.reason !== "no_assignment") {
			log.info(
				`[EGRESS] org=${organizationId} pool=${egress.pool} reason=${egress.reason} provider=${egress.provider} day=${egress.day} sent=${egress.sentToday}/${egress.dailyCap ?? "-"}`,
			);
		}
		if (egress.pool === "dedicated" && egress.address && egress.hostname) {
			return {
				pool: "dedicated",
				address: egress.address,
				hostname: egress.hostname,
			};
		}
		// "defer" overflow has no MTA-side hold yet; it sends from the shared
		// pool like the default "shared" overflow.
		return SHARED_EGRESS;
	} catch (error) {
		log.error(
			`[EGRESS] resolve failed for org=${organizationId}, using shared pool: ${error instanceof Error ? error.message : String(error)}`,
		);
		return SHARED_EGRESS;
	}
}

export async function getDkimKeyController({
	domainName,
	organizationId,
	recipients = [],
}: {
	domainName: string;
	organizationId: string;
	recipients?: string[];
}): Promise<{
	/** Null only for relay domains without a verified Reloop DKIM record. */
	selector: string | null;
	privateKey: string | null;
	smtpProviderId: string | null;
	egress: EgressResult;
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
		// Relay domains leave from the customer's server, never our IPs.
		return {
			selector: null,
			privateKey: null,
			smtpProviderId,
			egress: SHARED_EGRESS,
		};
	}

	if (!dkimRecord || !dkimRecord.privateKey) {
		throw KumoMtaErrors.dkimKeyNotFound(domainName);
	}

	const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");

	return {
		selector,
		privateKey: dkimRecord.privateKey,
		smtpProviderId,
		egress: smtpProviderId
			? SHARED_EGRESS
			: await resolveEgress(organizationId, recipients),
	};
}
