"use client";

import type { DNSRecord } from "@reloop/api/types";

const normalizeLabel = (value: string) => value.trim().toLowerCase();
const RECEIVING_MX_VALUE = "inbound.reloop.sh";

const isDmarcRecord = (record: DNSRecord) =>
	record.name.includes("_dmarc") ||
	(record.recordType === "TXT" && record.value.includes("v=DMARC"));

const isDkimRecord = (record: DNSRecord) =>
	record.name.includes("_domainkey") || record.value.includes("v=DKIM");

const isReceivingMxRecord = (record: DNSRecord) =>
	record.recordType === "MX" &&
	normalizeLabel(record.value) === RECEIVING_MX_VALUE;

const isTrackingRecord = (record: DNSRecord) =>
	record.recordType === "CNAME" &&
	(record.name.includes("reloop") ||
		record.name.includes("email") ||
		record.name.includes("click"));

export const groupDomainDnsRecords = (records: DNSRecord[] | undefined) => {
	const allRecords = records ?? [];

	const dmarcRecords = allRecords.filter(isDmarcRecord);
	const receivingRecords = allRecords.filter(isReceivingMxRecord);
	const dkimRecords = allRecords.filter(isDkimRecord);
	const trackingRecords = allRecords.filter(isTrackingRecord);
	const sendingRecords = allRecords.filter((record) => {
		if (isDmarcRecord(record)) return false;
		if (isDkimRecord(record)) return false;
		if (isTrackingRecord(record)) return false;
		return true;
	});

	return {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	};
};
