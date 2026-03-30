"use client";

import type { DNSRecord } from "@reloop/api/types";

const normalizeLabel = (value: string) => value.trim().toLowerCase();
const RECEIVING_MX_VALUE = "inbound.reloop.sh";

const isDmarcRecord = (record: DNSRecord) =>
	record.name.includes("_dmarc") ||
	(record.recordType === "TXT" && record.value.includes("v=DMARC"));

const isReceivingMxRecord = (record: DNSRecord) =>
	record.recordType === "MX" &&
	normalizeLabel(record.value) === RECEIVING_MX_VALUE;

export const groupDomainDnsRecords = (
	records: DNSRecord[] | undefined,
) => {
	const allRecords = records ?? [];

	const dmarcRecords = allRecords.filter(isDmarcRecord);
	const receivingRecords = allRecords.filter(isReceivingMxRecord);
	const sendingRecords = allRecords.filter((record) => {
		if (isDmarcRecord(record)) return false;
		if (isReceivingMxRecord(record)) return false;
		return true;
	});

	return {
		sendingRecords,
		receivingRecords,
		dmarcRecords,
	};
};
