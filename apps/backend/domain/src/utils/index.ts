export { generateDKIMKeyPair } from "@reloop/domain/utils/dkim-key-generator";
export {
	type DNSRecordData,
	type GeneratedDNSData,
	getExistingDNSRecords,
	insertDNSRecords,
} from "@reloop/domain/utils/dns-operations";
export {
	generateAllDNSRecords,
	generateDKIMRecord,
	generateDMARCRecord,
	generateMXRecord,
	generateReceivingMXRecord,
	generateSPFRecord,
	generateTrackingCNAMERecord,
} from "@reloop/domain/utils/dns-record-generator";
export {
	getCustomReturnPathSubString,
	getDomainHost,
	getDomainSubString,
} from "@reloop/domain/utils/domain-formatter";
