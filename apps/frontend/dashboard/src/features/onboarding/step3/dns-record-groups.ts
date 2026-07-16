import type { DNSRecord } from "./domain-types";

const isDmarcRecord = (record: DNSRecord) =>
	record.purpose === "sending" && record.recordTypeName === "DMARC";

const isDkimRecord = (record: DNSRecord) =>
	record.purpose === "sending" && record.recordTypeName === "DKIM";

const isReceivingMxRecord = (record: DNSRecord) =>
	record.purpose === "receiving";

const isTrackingRecord = (record: DNSRecord) => record.purpose === "tracking";

const isSendingRecord = (record: DNSRecord) =>
	record.purpose === "sending" &&
	(record.recordTypeName === "SPF" || record.recordTypeName === "MX");

export function groupDomainDnsRecords(records: DNSRecord[] | undefined) {
	const allRecords = records ?? [];

	return {
		sendingRecords: allRecords.filter(isSendingRecord),
		receivingRecords: allRecords.filter(isReceivingMxRecord),
		dkimRecords: allRecords.filter(isDkimRecord),
		dmarcRecords: allRecords.filter(isDmarcRecord),
		trackingRecords: allRecords.filter(isTrackingRecord),
	};
}
