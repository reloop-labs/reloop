import type { DNSRecord } from "#/features/domain/types";

const isDmarcRecord = (record: DNSRecord) => record.recordTypeName === "DMARC";

const isDkimRecord = (record: DNSRecord) => record.recordTypeName === "DKIM";

const isSpfRecord = (record: DNSRecord) => record.recordTypeName === "SPF";

const isMxRecord = (record: DNSRecord) => record.recordTypeName === "MX";

const isTrackingRecord = (record: DNSRecord) => record.purpose === "tracking";

export const groupDomainDnsRecords = (records: DNSRecord[] | undefined) => {
	const allRecords = records ?? [];

	return {
		sendingRecords: allRecords.filter(isSpfRecord),
		receivingRecords: allRecords.filter(isMxRecord),
		dkimRecords: allRecords.filter(isDkimRecord),
		dmarcRecords: allRecords.filter(isDmarcRecord),
		trackingRecords: allRecords.filter(isTrackingRecord),
	};
};
