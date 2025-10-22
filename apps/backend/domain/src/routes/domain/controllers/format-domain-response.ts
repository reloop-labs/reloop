import type { DomainTypes } from "@reloop/domain/routes/domain/domain.type";

export function formatDomainResponse(
    domain: {
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
    },
    dnsRecords: Array<{
        id: string;
        domainId: string;
        organizationId: string;
        userId: string;
        recordType: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA" | "SPF" | "DKIM" | "DMARC";
        name: string;
        value: string;
        ttl: number;
        priority: number | null;
        weight: number | null;
        port: number | null;
        domain: string;
        description: string | null;
        isVerified: boolean;
        verificationError: string | null;
        isActive: boolean;
        status: "start-verify" | "verifying" | "active" | "suspended" | "failed";
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }> = []
): DomainTypes.DomainResponse {
    return {
        id: domain.id,
        domain: domain.domain,
        organizationId: domain.organizationId,
        userId: domain.userId,
        domainType: domain.domainType,
        status: domain.status,
        userVerified: domain.userVerified,
        systemVerified: domain.systemVerified,
        dnsConfigured: domain.dnsConfigured,
        nameservers: domain.nameservers,
        spfRecord: domain.spfRecord,
        dkimRecord: domain.dkimRecord,
        dkimSelector: domain.dkimSelector,
        dmarcRecord: domain.dmarcRecord,
        dmarcPolicy: domain.dmarcPolicy,
        trackingDomain: domain.trackingDomain,
        verificationFailedReason: domain.verificationFailedReason,
        dnsRecords: dnsRecords.map(record => ({
            id: record.id,
            recordType: record.recordType,
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority,
            weight: record.weight,
            port: record.port,
            description: record.description,
            isVerified: record.isVerified,
            verificationError: record.verificationError,
            isActive: record.isActive,
            status: record.status,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        })),
        deletedAt: domain.deletedAt?.toISOString() ?? null,
        lastVerifiedAt: domain.lastVerifiedAt?.toISOString() ?? null,
        createdAt: domain.createdAt.toISOString(),
        updatedAt: domain.updatedAt.toISOString(),
    };
}
