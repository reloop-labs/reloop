import type { DomainModel } from "./domain.model";

export namespace DomainTypes {
    export type DomainResponse = typeof DomainModel.domainResponse.static;
    export type DomainListResponse = typeof DomainModel.domainListResponse.static;
    export type CreateDomainBody = typeof DomainModel.createDomainBody.static;
    export type DomainQuery = typeof DomainModel.domainQuery.static;
    export type DomainNotFound = typeof DomainModel.domainNotFound.static;
    export type DomainAlreadyExists = typeof DomainModel.domainAlreadyExists.static;
    export type InvalidDomain = typeof DomainModel.invalidDomain.static;
    export type Unauthorized = typeof DomainModel.unauthorized.static;

    export interface DomainData {
        domain: string;
        organizationId: string;
        userId: string;
        mailboxes: number;
        mailboxQuota: number;
        quota: number;
        rateLimit: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface CreateDomainRequest {
        domain: string;
        serverIP?: string;
    }

    export interface DomainListQuery {
        page?: number;
        limit?: number;
        active?: boolean;
        organizationId?: string;
        userId?: string;
    }

    export interface SearchDomainQuery {
        page?: number;
        limit?: number;
        active?: boolean;
    }
}
