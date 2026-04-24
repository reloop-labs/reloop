export { generateDKIMKeyPair } from "@be/domain/utils/dkim-key-generator";
export {
	type DNSRecordData,
	type GeneratedDNSData,
	getExistingDNSRecords,
	insertDNSRecords,
} from "@be/domain/utils/dns-operations";
export {
	generateAllDNSRecords,
	generateDKIMRecord,
	generateDMARCRecord,
	generateMXRecord,
	generateReceivingMXRecord,
	generateSPFRecord,
} from "@be/domain/utils/dns-record-generator";
export {
	getCustomReturnPathSubString,
	getDomainHost,
	getDomainSubString,
} from "@be/domain/utils/domain-formatter";
