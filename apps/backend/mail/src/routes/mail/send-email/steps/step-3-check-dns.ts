import { ensureSendingDomainVerified } from "@reloop/db/ensure-sending-domain-verified";

/**
 * Live DNS check of every record this domain must publish before a send.
 * Stored verification can be stale if the customer removed records at their
 * DNS host after the last background check.
 */
export async function checkDnsHealth_step3({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	return ensureSendingDomainVerified({ domainId, organizationId });
}
