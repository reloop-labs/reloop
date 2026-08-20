import type { DomainStatus } from "./status";

export type DemoDnsRecord = {
	id: string;
	recordType: string;
	recordTypeName: string;
	name: string;
	value: string;
	ttl: string;
	priority: number | null;
	purpose: "sending" | "receiving" | "tracking";
	status: DomainStatus;
};

export type DemoDomain = {
	id: string;
	domain: string;
	status: DomainStatus;
	createdAtLabel: string;
	createdAt: string;
	dnsRecords: DemoDnsRecord[];
	isSendingEmailEnabled: boolean;
	isReceivingEmailEnabled: boolean;
	isClickTrackingEnabled: boolean;
	isOpenTrackingEnabled: boolean;
};

function record(
	partial: Omit<DemoDnsRecord, "ttl" | "priority" | "status"> &
		Partial<Pick<DemoDnsRecord, "ttl" | "priority" | "status">>,
): DemoDnsRecord {
	return {
		ttl: "Auto",
		priority: null,
		status: "pending",
		...partial,
	};
}

const SEND_RECORDS: DemoDnsRecord[] = [
	record({
		id: "rec_dkim",
		recordType: "CNAME",
		recordTypeName: "DKIM",
		name: "reloop._domainkey.send",
		value: "dkim.reloop.sh",
		purpose: "sending",
	}),
	record({
		id: "rec_spf",
		recordType: "TXT",
		recordTypeName: "SPF",
		name: "send",
		value: "v=spf1 include:mail.reloop.sh ~all",
		purpose: "sending",
	}),
	record({
		id: "rec_dmarc",
		recordType: "TXT",
		recordTypeName: "DMARC",
		name: "_dmarc.send",
		value: "v=DMARC1; p=none;",
		purpose: "sending",
	}),
	record({
		id: "rec_mx",
		recordType: "MX",
		recordTypeName: "MX",
		name: "send",
		value: "inbound.reloop.sh",
		priority: 10,
		purpose: "receiving",
	}),
	record({
		id: "rec_track",
		recordType: "CNAME",
		recordTypeName: "CNAME",
		name: "link.send",
		value: "link.reloop.sh",
		purpose: "tracking",
	}),
];

export const LIST_DOMAINS: DemoDomain[] = [
	{
		id: "dom_01",
		domain: "acme.com",
		status: "active",
		createdAtLabel: "11 days ago",
		createdAt: "2026-08-05T12:00:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
	{
		id: "dom_02",
		domain: "mail.acme.com",
		status: "active",
		createdAtLabel: "11 days ago",
		createdAt: "2026-08-05T12:10:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
	{
		id: "dom_03",
		domain: "updates.acme.com",
		status: "verifying",
		createdAtLabel: "2 days ago",
		createdAt: "2026-08-14T12:00:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
	{
		id: "dom_04",
		domain: "inbox.acme.com",
		status: "active",
		createdAtLabel: "8 days ago",
		createdAt: "2026-08-08T12:00:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
	{
		id: "dom_05",
		domain: "staging.acme.com",
		status: "pending",
		createdAtLabel: "1 day ago",
		createdAt: "2026-08-15T12:00:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
	{
		id: "dom_06",
		domain: "track.acme.com",
		status: "failed",
		createdAtLabel: "3 days ago",
		createdAt: "2026-08-13T12:00:00.000Z",
		dnsRecords: [],
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: true,
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: true,
	},
];

export const NEW_DOMAIN: DemoDomain = {
	id: "dom_07",
	domain: "send.acme.com",
	status: "pending",
	createdAtLabel: "Just now",
	createdAt: "2026-08-16T12:00:00.000Z",
	dnsRecords: SEND_RECORDS,
	isSendingEmailEnabled: true,
	isReceivingEmailEnabled: true,
	isClickTrackingEnabled: true,
	isOpenTrackingEnabled: true,
};

export const domainTableGridStyle = {
	gridTemplateColumns: "32px minmax(0,1fr) 120px 140px 32px",
};
