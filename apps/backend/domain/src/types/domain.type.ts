import type { DomainModel } from "@reloop/domain/model/domain.model";

export type DomainStatus =
	| "pending"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export interface DNSRecord {
	id: string;
	domainId: string;
	organizationId: string;
	userId: string;
	recordType: string;
	recordTypeName: string;
	domain: string;
	name: string;
	fqdn: string;
	value: string;
	ttl: string;
	priority: number | null;
	verificationError: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface Domain {
	id: string;
	domain: string;
	organizationId: string;
	userId: string;

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
	deletedAt: Date | null;
	lastVerifiedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export namespace DomainTypes {
	export type DomainResponse = typeof DomainModel.domainResponse.static;
	export type DnsRecordResponse = typeof DomainModel.dnsRecordResponse.static;
	export type DomainListResponse = typeof DomainModel.domainListResponse.static;
	export type CreateDomainBody = typeof DomainModel.createDomainBody.static;
	export type UpdateDomainBody = typeof DomainModel.updateDomainBody.static;
	export type DomainQuery = typeof DomainModel.domainQuery.static;
	export type DomainNotFound = typeof DomainModel.domainNotFound.static;
	export type DomainAlreadyExists =
		typeof DomainModel.domainAlreadyExists.static;
	export type InvalidDomain = typeof DomainModel.invalidDomain.static;
	export type Unauthorized = typeof DomainModel.unauthorized.static;

	// Database entity type
	export interface DomainData extends Domain {
		dnsRecords?: DNSRecord[];
	}

	export interface CreateDomainRequest {
		domain: string;
		custom_return_path?: string;
		tracking?: string;
		click_tracking?: boolean;
		open_tracking?: boolean;
		tls?: "opportunistic" | "enforced";
		sending_email?: boolean;
		receiving_email?: boolean;
	}

	export interface DomainListQuery {
		page?: number;
		limit?: number;
		status?: DomainStatus;
		organizationId?: string;
		userId?: string;
	}

	export interface SearchDomainQuery {
		page?: number;
		limit?: number;
		status?: DomainStatus;
	}

	export interface UpdateDomainRequest {
		click_tracking?: boolean;
		open_tracking?: boolean;
		sending_email?: boolean;
		receiving_email?: boolean;
		tls?: "opportunistic" | "enforced";
	}
}
