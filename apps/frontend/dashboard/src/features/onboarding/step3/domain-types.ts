export type DomainStatus =
	| "pending"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export type DNSRecord = {
	id: string;
	recordType: string;
	recordTypeName: string;
	domain: string;
	name: string;
	fqdn: string;
	value: string;
	ttl: string;
	priority: number | null;
	purpose: "sending" | "receiving" | "tracking";
	verificationError: string | null;
	status: DomainStatus;
	createdAt: string;
	updatedAt: string;
};

export type DomainResponse = {
	object: "domain";
	id: string;
	domain: string;
	status: DomainStatus;
	userVerifiedDomain: boolean;
	systemVerified: boolean;
	customReturnPath: string;
	trackingSubdomain: string;
	isClickTrackingEnabled: boolean;
	isOpenTrackingEnabled: boolean;
	tls: "opportunistic" | "enforced";
	isTrackingDomain: boolean;
	isSendingEmailEnabled: boolean;
	isReceivingEmailEnabled: boolean;
	verificationFailedReason: string | null;
	dnsRecords: DNSRecord[];
	deletedAt: string | null;
	lastVerifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type DomainNameserversResponse = {
	object: "domain_nameservers";
	domainId: string;
	domain: string;
	nameservers: string[] | null;
	dnsProvider: string | null;
	event: string;
};
