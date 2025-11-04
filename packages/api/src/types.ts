// Domain types
export type DomainStatus =
	| "start-verify"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export interface Domain {
	id: string;
	domain: string;
	organizationId: string;
	userId: string;
	domainType: "custom" | "subdomain" | "system";
	status: DomainStatus;
	userVerified: boolean;
	systemVerified: boolean;
	dnsConfigured: boolean;
	nameservers: string[] | null;
	spfRecord: string | null;
	dkimRecord: string | null;
	dkimSelector: string;
	dmarcRecord: string | null;
	dmarcPolicy: string;
	trackingDomain: boolean;
	verificationFailedReason: string | null;
	deletedAt: string | null;
	lastVerifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export type DNSRecordStatus =
	| "start-verify"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export interface DNSRecord {
	id: string;
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	weight?: number;
	port?: number;
	description?: string;
	isVerified: boolean;
	verificationError?: string;
	isActive: boolean;
	status: DNSRecordStatus;
	createdAt: string;
	updatedAt: string;
}

export interface DomainResponse extends Domain {
	dnsRecords: DNSRecord[];
}

export interface DomainListResponse {
	domains: Domain[];
	total: number;
	page: number;
	limit: number;
}

// Audience types
export type AudienceStatus = "subscribed" | "unsubscribed";

export interface Audience {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	phone: string | null;
	organizationId: string;
	status: AudienceStatus;
	audienceGroupId: string;
	audienceGroupName: string;
	addedAt: string;
	unsubscribedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AudienceGroup {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	userId: string;
	audienceCount: number;
	subscribedCount: number;
	unsubscribedCount: number;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AudienceResponse extends Audience {}

export interface AudienceListResponse {
	audiences: Audience[];
	total: number;
	page: number;
	limit: number;
}

export interface AudienceGroupResponse extends AudienceGroup {}

export interface AudienceGroupListResponse {
	audienceGroups: AudienceGroup[];
	total: number;
	page: number;
	limit: number;
}
