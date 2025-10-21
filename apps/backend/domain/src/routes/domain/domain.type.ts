import type { DomainModel } from "./domain.model";

export namespace DomainTypes {
    export type DomainResponse = typeof DomainModel.domainResponse.static;
    export type DnsRecordResponse = typeof DomainModel.dnsRecordResponse.static;
    export type DomainListResponse = typeof DomainModel.domainListResponse.static;
    export type CreateDomainBody = typeof DomainModel.createDomainBody.static;
    export type DomainQuery = typeof DomainModel.domainQuery.static;
    export type DomainNotFound = typeof DomainModel.domainNotFound.static;
    export type DomainAlreadyExists = typeof DomainModel.domainAlreadyExists.static;
    export type InvalidDomain = typeof DomainModel.invalidDomain.static;
    export type Unauthorized = typeof DomainModel.unauthorized.static;

    export interface DomainData {
        id: string;
        domain: string;
        organizationId: string;
        userId: string;
        domainType: "custom" | "subdomain" | "system";
        status: "start-verify" | "verifying" | "active" | "suspended" | "failed";
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
        status?: "start-verify" | "verifying" | "active" | "suspended" | "failed";
        organizationId?: string;
        userId?: string;
    }

    export interface SearchDomainQuery {
        page?: number;
        limit?: number;
        status?: "start-verify" | "verifying" | "active" | "suspended" | "failed";
    }
}
