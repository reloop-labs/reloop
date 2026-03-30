"use client";

import type { DNSRecord } from "@reloop/api/types";

const normalizeLabel = (value: string) => value.trim().toLowerCase();

const isDmarcRecord = (record: DNSRecord) =>
	record.name.includes("_dmarc") ||
	(record.recordType === "TXT" && record.value.includes("v=DMARC"));

const matchesReturnPathName = (
	recordName: string,
	customReturnPath: string | undefined,
) => {
	if (!customReturnPath) return false;

	const normalizedRecordName = normalizeLabel(recordName);
	const normalizedReturnPath = normalizeLabel(customReturnPath);

	return (
		normalizedRecordName === normalizedReturnPath ||
		normalizedRecordName.endsWith(`.${normalizedReturnPath}`) ||
		normalizedRecordName.includes(`.${normalizedReturnPath}.`)
	);
};

export const groupDomainDnsRecords = (
	records: DNSRecord[] | undefined,
	customReturnPath: string | undefined,
) => {
	const allRecords = records ?? [];

	const dmarcRecords = allRecords.filter(isDmarcRecord);
	const receivingRecords = allRecords.filter(
		(record) =>
			record.recordType === "MX" &&
			!matchesReturnPathName(record.name, customReturnPath),
	);
	const sendingRecords = allRecords.filter((record) => {
		if (isDmarcRecord(record)) return false;
		if (record.recordType !== "MX") return true;
		return matchesReturnPathName(record.name, customReturnPath);
	});

	return {
		sendingRecords,
		receivingRecords,
		dmarcRecords,
	};
};
