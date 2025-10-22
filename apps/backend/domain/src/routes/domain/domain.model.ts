import { t } from "elysia";

export namespace DomainModel {
	// Domain validation pattern - supports domains and subdomains
	const domainPattern =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

	export const domainParam = t.String({
		pattern: domainPattern.source,
		description:
			"Valid domain or subdomain (e.g., example.com, subdomain.example.com)",
	});

	export const createDomainBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			pattern: domainPattern.source,
			description: "Domain name (e.g., send.reloop.com)",
		}),
	});

	export type CreateDomainBody = typeof createDomainBody.static;

	export const dnsRecordResponse = t.Object({
		id: t.String({ description: "Unique DNS record identifier" }),
		recordType: t.Union(
			[
				t.Literal("A"),
				t.Literal("AAAA"),
				t.Literal("CNAME"),
				t.Literal("MX"),
				t.Literal("TXT"),
				t.Literal("NS"),
				t.Literal("SRV"),
				t.Literal("CAA"),
				t.Literal("SPF"),
				t.Literal("DKIM"),
				t.Literal("DMARC"),
			],
			{ description: "DNS record type" },
		),
		name: t.String({ description: "DNS record name" }),
		value: t.String({ description: "DNS record value" }),
		ttl: t.Number({ description: "Time to live in seconds" }),
		priority: t.Union([t.Number(), t.Null()], {
			description: "Record priority (for MX records)",
		}),
		weight: t.Union([t.Number(), t.Null()], {
			description: "Record weight (for SRV records)",
		}),
		port: t.Union([t.Number(), t.Null()], {
			description: "Record port (for SRV records)",
		}),
		description: t.Union([t.String(), t.Null()], {
			description: "Record description",
		}),
		isVerified: t.Boolean({ description: "Whether the record is verified" }),
		verificationError: t.Union([t.String(), t.Null()], {
			description: "Verification error message",
		}),
		isActive: t.Boolean({ description: "Whether the record is active" }),
		createdAt: t.String(),
		status: t.Union(
			[
				t.Literal("start-verify"),
				t.Literal("verifying"),
				t.Literal("active"),
				t.Literal("suspended"),
				t.Literal("failed"),
			],
			{ description: "Domain verification status" },
		),
		updatedAt: t.String(),
	});

	export const domainResponse = t.Object({
		id: t.String({ description: "Unique domain identifier" }),
		domain: t.String({ description: "Domain name (e.g., send.reloop.com)" }),
		organizationId: t.String(),
		userId: t.String(),
		domainType: t.Union(
			[t.Literal("custom"), t.Literal("subdomain"), t.Literal("system")],
			{ description: "Type of domain" },
		),
		status: t.Union(
			[
				t.Literal("start-verify"),
				t.Literal("verifying"),
				t.Literal("active"),
				t.Literal("suspended"),
				t.Literal("failed"),
			],
			{ description: "Domain verification status" },
		),
		userVerified: t.Boolean({
			description: "Whether user has verified the domain",
		}),
		systemVerified: t.Boolean({
			description: "Whether system has verified the domain",
		}),
		dnsConfigured: t.Boolean({
			description: "Whether DNS is properly configured",
		}),
		nameservers: t.Union([t.Array(t.String()), t.Null()], {
			description: "Domain nameservers",
		}),
		spfRecord: t.Union([t.String(), t.Null()], {
			description: "SPF DNS record",
		}),
		dkimRecord: t.Union([t.String(), t.Null()], {
			description: "DKIM DNS record",
		}),
		dkimSelector: t.String({ description: "DKIM selector (default: reloop)" }),
		dmarcRecord: t.Union([t.String(), t.Null()], {
			description: "DMARC DNS record",
		}),
		dmarcPolicy: t.String({ description: "DMARC policy (default: none)" }),
		trackingDomain: t.Boolean({
			description: "Whether domain is used for tracking",
		}),
		verificationFailedReason: t.Union([t.String(), t.Null()], {
			description: "Reason for verification failure",
		}),
		dnsRecords: t.Array(dnsRecordResponse, {
			description: "DNS records for the domain",
		}),
		deletedAt: t.Union([t.String(), t.Null()], {
			description: "Soft delete timestamp",
		}),
		lastVerifiedAt: t.Union([t.String(), t.Null()], {
			description: "Last verification timestamp",
		}),
		createdAt: t.String(),
		updatedAt: t.String(),
	});

	export type DomainResponse = typeof domainResponse.static;

	export const domainListResponse = t.Object({
		domains: t.Array(domainResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type DomainListResponse = typeof domainListResponse.static;

	export const domainQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		status: t.Optional(
			t.Union([
				t.Literal("start-verify"),
				t.Literal("verifying"),
				t.Literal("active"),
				t.Literal("suspended"),
				t.Literal("failed"),
			]),
		),
		organizationId: t.Optional(t.String()),
		userId: t.Optional(t.String()),
	});

	export type DomainQuery = typeof domainQuery.static;

	export const domainNotFound = t.Object({
		message: t.Literal("Domain not found"),
	});
	export type DomainNotFound = typeof domainNotFound.static;

	export const domainAlreadyExists = t.Object({
		message: t.Literal("Domain already exists"),
	});
	export type DomainAlreadyExists = typeof domainAlreadyExists.static;

	export const invalidDomain = t.Object({
		message: t.Literal("Invalid domain format"),
	});
	export type InvalidDomain = typeof invalidDomain.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;
}
