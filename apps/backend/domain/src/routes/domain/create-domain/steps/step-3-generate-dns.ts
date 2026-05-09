import { domainConfig } from "@be/domain/domain.config";
import {
	generateAllDNSRecords,
	generateReceivingMXRecord,
	getCustomReturnPathSubString,
	getDomainHost,
} from "@be/domain/utils";
import { useLogger } from "evlog/elysia";

export async function generateDnsRecords_step3({
	domain,
	customReturnPath,
}: {
	domain: string;
	customReturnPath?: string;
}) {
	const logger = useLogger();
	logger.info("Generating DNS records", { domain });

	const dnsRecords = await generateAllDNSRecords(domain);
	const receivingMxRecord = generateReceivingMXRecord(
		domainConfig.HOST_DOMAIN,
		getDomainHost(domain),
		getCustomReturnPathSubString(domain, customReturnPath || "inbound"),
	);

	return { dnsRecords, receivingMxRecord };
}
