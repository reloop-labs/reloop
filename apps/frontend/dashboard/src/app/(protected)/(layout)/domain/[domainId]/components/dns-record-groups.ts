"use client";

import type { DNSRecord } from "@fe/dashboard/types/api.types";

const normalizeLabel = (value: string) => value.trim().toLowerCase();
const RECEIVING_MX_VALUE = "inbound.reloop.sh";

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

export const groupDomainDnsRecords = (records: DNSRecord[] | undefined) => {
	const allRecords = records ?? [];

	const dmarcRecords = allRecords.filter(isDmarcRecord);
	const receivingRecords = allRecords.filter(isReceivingMxRecord);
	const dkimRecords = allRecords.filter(isDkimRecord);
	const trackingRecords = allRecords.filter(isTrackingRecord);
	const sendingRecords = allRecords.filter(isSendingRecord);

	return {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	};
};
