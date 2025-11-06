import type { DomainModel } from "@be/domain/routes/domain/domain.model";
import type { Domain, DomainStatus } from "@reloop/api/types";

export namespace DomainTypes {
	export type DomainResponse = typeof DomainModel.domainResponse.static;
	export type DnsRecordResponse = typeof DomainModel.dnsRecordResponse.static;
	export type DomainListResponse = typeof DomainModel.domainListResponse.static;
	export type CreateDomainBody = typeof DomainModel.createDomainBody.static;
	export type DomainQuery = typeof DomainModel.domainQuery.static;
	export type DomainNotFound = typeof DomainModel.domainNotFound.static;
	export type DomainAlreadyExists =
		typeof DomainModel.domainAlreadyExists.static;
	export type InvalidDomain = typeof DomainModel.invalidDomain.static;
	export type Unauthorized = typeof DomainModel.unauthorized.static;

	// Use centralized Domain type but with Date types for backend
	export interface DomainData
		extends Omit<
			Domain,
			"createdAt" | "updatedAt" | "deletedAt" | "lastVerifiedAt"
		> {
		deletedAt: Date | null;
		lastVerifiedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}

	export interface CreateDomainRequest {
		domain: string;
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
}
