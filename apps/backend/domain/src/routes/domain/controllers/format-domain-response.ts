import type { DomainTypes } from "@be/domain/routes/domain/domain.type";

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
		deletedAt: Date | null;
		verificationFailedReason: string | null;
	},
	dnsRecords: Array<{
		id: string;
		recordType:
			| "A"
			| "AAAA"
			| "CNAME"
			| "MX"
			| "TXT"
			| "NS"
			| "SRV"
			| "CAA"
			| "SPF"
			| "DKIM"
			| "DMARC";
		name: string;
		value: string;
		ttl: number;
		priority: number | null;
		domain: string;
		description: string | null;
		isVerified: boolean;
		verificationError: string | null;
		isActive: boolean;
		status: "start-verify" | "verifying" | "active" | "suspended" | "failed";
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}> = [],
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
		verificationFailedReason: domain.verificationFailedReason,
		dnsRecords: dnsRecords.map((record) => ({
			id: record.id,
			recordType: record.recordType,
			name: record.name,
			value: record.value,
			ttl: record.ttl,
			priority: record.priority,
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
