// Domain types
export type DomainStatus =
	| "pending"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export interface DNSRecord {
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
}

export interface Domain {
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
}

export interface DomainResponse extends Domain {
	event?: string;
}

export interface DomainStatusResponse {
	id: string;
	status: DomainStatus;
	event?: string;
}

export interface DomainListResponse {
	object: "domain";
	domains: Domain[];
	total: number;
	page: number;
	limit: number;
	event: string;
}

export interface DomainNameserversResponse {
	object: "domain_nameservers";
	domainId: string;
	domain: string;
	nameservers: string[] | null;
	dnsProvider: string | null;
	event: string;
}

// Contact types
export type ContactStatus = "subscribed" | "unsubscribed" | "blocked";
export type AudienceStatus = ContactStatus;

export interface Contact {
	object: "contact";
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: ContactStatus;
	properties: Record<string, string | number>;
	groups: {
		id: string;
		name: string;
	}[];
	channels: {
		id: string;
		name: string;
		subscription: "opt_in" | "opt_out";
	}[];
	suppressionReason: "hard_bounce" | "spam_complaint" | null;
	suppressedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export type Audience = Contact;

export interface ContactResponse extends Contact {
	event: string;
}

export type AudienceResponse = ContactResponse;

export interface ContactListResponse {
	object: "contact";
	contacts: Contact[];
	total: number;
	page: number;
	limit: number;
	totalContacts: number;
	subscribedContacts: number;
	unsubscribedContacts: number;
	event: string;
}

// Group types
export interface ContactGroup {
	object: "contact_group";
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface GroupResponse extends ContactGroup {
	event: string;
}

export interface GroupListResponse {
	object: "contact_group";
	groups: {
		id: string;
		name: string;
		createdAt: string;
		updatedAt: string;
	}[];
	total: number;
	page: number;
	limit: number;
	event: string;
}

export interface GroupContactListResponse {
	object: "contact_group";
	group: {
		id: string;
		name: string;
		createdAt: string;
		updatedAt: string;
		contacts: {
			id: string;
			email: string;
			firstName: string | null;
			lastName: string | null;
			status: ContactStatus;
			properties: Record<string, string | number>;
			createdAt: string;
			updatedAt: string;
		}[];
	};
	total: number;
	page: number;
	limit: number;
	event: string;
}
