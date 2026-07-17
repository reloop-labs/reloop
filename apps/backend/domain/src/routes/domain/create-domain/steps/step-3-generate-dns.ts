import type { DNSTypes } from "@reloop/domain/types/dns.type";
import {
	generateAllDNSRecords,
	generateReceivingMXRecordForDomain,
	generateTrackingCNAMERecord,
	getCustomReturnPathSubString,
	getDomainHost,
} from "@reloop/domain/utils";

import { useLogger } from "evlog/elysia";

export async function generateDnsRecords_step3({
	domain,
	trackingSubdomain,
}: {
	domain: string;
	/** @deprecated Kept for API compat; receiving MX is on the domain apex, not return-path. */
	customReturnPath?: string;
	trackingSubdomain?: string;
}) {
	const log = useLogger();
	log.info("Generating DNS records");

	const dnsRecords = await generateAllDNSRecords(domain);
	// Receiving MX lives on the domain being verified so user@domain is delivered
	// to inbound.{HOST_DOMAIN} (not on the custom return-path subdomain).
	const receivingMxRecord = generateReceivingMXRecordForDomain(domain);

	let trackingRecord: DNSTypes.DNSRecord | undefined;
	if (trackingSubdomain) {
		trackingRecord = generateTrackingCNAMERecord(
			getCustomReturnPathSubString(domain, trackingSubdomain),
			getDomainHost(domain),
		);
	}

	return { dnsRecords, receivingMxRecord, trackingRecord };
}
