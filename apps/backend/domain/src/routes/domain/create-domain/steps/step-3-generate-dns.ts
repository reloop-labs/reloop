import { domainConfig } from "@reloop/domain/domain.config";
import type { DNSTypes } from "@reloop/domain/types/dns.type";
import {
	generateAllDNSRecords,
	generateReceivingMXRecord,
	generateTrackingCNAMERecord,
	getCustomReturnPathSubString,
	getDomainHost,
} from "@reloop/domain/utils";

import { useLogger } from "evlog/elysia";

export async function generateDnsRecords_step3({
	domain,
	customReturnPath,
	trackingSubdomain,
}: {
	domain: string;
	customReturnPath?: string;
	trackingSubdomain?: string;
}) {
	const log = useLogger();
	log.info("Generating DNS records");

	const dnsRecords = await generateAllDNSRecords(domain);
	const receivingMxRecord = generateReceivingMXRecord(
		domainConfig.HOST_DOMAIN,
		getDomainHost(domain),
		getCustomReturnPathSubString(domain, customReturnPath || "inbound"),
	);

	let trackingRecord: DNSTypes.DNSRecord | undefined;
	if (trackingSubdomain) {
		trackingRecord = generateTrackingCNAMERecord(
			trackingSubdomain,
			getDomainHost(domain),
		);
	}

	return { dnsRecords, receivingMxRecord, trackingRecord };
}
