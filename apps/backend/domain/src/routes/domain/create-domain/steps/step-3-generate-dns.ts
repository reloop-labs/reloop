import { domainConfig } from "@reloop/domain/domain.config";
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
	trackingSubdomain = domainConfig.constants.defaultTrackingSubdomain,
}: {
	domain: string;
	trackingSubdomain?: string;
}) {
	const log = useLogger();
	log.info("Generating DNS records");

	const dnsRecords = await generateAllDNSRecords(domain);
	// Receiving MX lives on the domain being verified so user@domain is delivered
	// to inbound.{HOST_DOMAIN} (not on a custom return-path subdomain).
	const receivingMxRecord = generateReceivingMXRecordForDomain(domain);

	const trackingRecord: DNSTypes.DNSRecord = generateTrackingCNAMERecord(
		getCustomReturnPathSubString(domain, trackingSubdomain),
		getDomainHost(domain),
	);

	return { dnsRecords, receivingMxRecord, trackingRecord };
}
