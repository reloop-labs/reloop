export type { StatsRoutes } from "../../../apps/backend/auth/src/routes/stats.js";
export type { EmailService } from "../../../apps/backend/domain/src/index.js";

// Domain types
export type DomainStatus = "start-verify" | "verifying" | "active" | "suspended" | "failed";

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

export type DNSRecordStatus = "start-verify" | "verifying" | "active" | "suspended" | "failed";

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
