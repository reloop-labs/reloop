import { t } from "elysia";

export namespace DomainModel {
	// Domain validation pattern - supports domains and subdomains
	const domainPattern =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
	export const createDomainBody = t.Object({
		domain: t.String({
			minLength: 4,
			maxLength: 255,
			pattern: domainPattern.source,
			description: "Domain name (e.g., send.reloop.com)",
		}),
		customReturnPath: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
				pattern: "^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$",
				default: "send",
				description: "Custom return-path subdomain (e.g., send)",
			}),
		),
		clickTracking: t.Optional(
			t.Boolean({
				default: false,
				description: "Whether click tracking is enabled",
			}),
		),
		openTracking: t.Optional(
			t.Boolean({
				default: false,
				description: "Whether open tracking is enabled",
			}),
		),
		tls: t.Optional(
			t.Union([t.Literal("opportunistic"), t.Literal("enforced")], {
				default: "opportunistic",
				description: "TLS mode for the domain",
			}),
		),
		sendingEmail: t.Optional(
			t.Boolean({
				default: true,
				description: "Whether sending email is enabled",
			}),
		),
		receivingEmail: t.Optional(
			t.Boolean({
				default: true,
				description: "Whether receiving email is enabled",
			}),
		),
	}, {
		examples: [
			{
				domain: "send.example.com",
				customReturnPath: "send",
				clickTracking: true,
				openTracking: true,
				tls: "opportunistic",
				sendingEmail: true,
				receivingEmail: true,
			},
		],
	});

	export const dnsRecordResponse = t.Object({
		id: t.String({ description: "Unique DNS record identifier" }),
		recordType: t.Union(
			[
				t.Literal("A"),
				t.Literal("AAAA"),
				t.Literal("CNAME"),
				t.Literal("MX"),
				t.Literal("TXT"),
			],
			{ description: "DNS record type" },
		),
		recordTypeName: t.Union(
			[
				t.Literal("MX"),
				t.Literal("SPF"),
				t.Literal("DKIM"),
				t.Literal("DMARC"),
			],
			{ description: "DNS record type name" },
		),
		domain: t.String({ description: "Domain name" }),
		name: t.String({ description: "DNS record name" }),
		value: t.String({ description: "DNS record value" }),
		ttl: t.String({ description: "Time to live in seconds or Auto" }),
		priority: t.Union([t.Number(), t.Null()], {
			description: "Record priority (for MX records)",
		}),
		verificationError: t.Union([t.String(), t.Null()], {
			description: "Verification error message",
		}),
		createdAt: t.Date(),
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
		updatedAt: t.Date(),
	}, {
		examples: [{
			id: "dns_123456789",
			recordType: "MX",
			recordTypeName: "MX",
			domain: "example.com",
			name: "@",
			value: "feedback-smtp.us-east-1.amazonses.com",
			ttl: "Auto",
			priority: 10,
			status: "active",
			createdAt: new Date("2026-03-30T10:00:00Z"),
			updatedAt: new Date("2026-03-30T10:00:00Z")
		}]
	});

	export const domainResponse = t.Object({
		id: t.String({ description: "Unique domain identifier" }),
		domain: t.String({ description: "Domain name (e.g., send.reloop.com)" }),
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
		customReturnPath: t.String({
			description: "Custom return path subdomain for SPF and bounce handling",
			default: 'inbound'
		}),
		clickTracking: t.Boolean({
			description: "Whether click tracking is enabled for the domain",
		}),
		openTracking: t.Boolean({
			description: "Whether open tracking is enabled for the domain",
		}),
		tls: t.Union([t.Literal("opportunistic"), t.Literal("enforced")], {
			description: "TLS mode for the domain",
		}),
		trackingDomain: t.Boolean({
			description: "Whether domain is used for tracking",
		}),
		sendingEmail: t.Boolean({
			description: "Whether sending email is enabled for the domain",
		}),
		receivingEmail: t.Boolean({
			description: "Whether receiving email is enabled for the domain",
		}),
		verificationFailedReason: t.Union([t.String(), t.Null()], {
			description: "Reason for verification failure",
		}),
		dnsRecords: t.Array(dnsRecordResponse, {
			description: "DNS records for the domain",
		}),
		deletedAt: t.Union([t.Date(), t.Null()], {
			description: "Soft delete timestamp",
		}),
		lastVerifiedAt: t.Union([t.Date(), t.Null()], {
			description: "Last verification timestamp",
		}),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	}, {
		examples: [{
			id: "domain_123456789",
			domain: "send.example.com",
			domainType: "custom",
			status: "active",
			userVerified: true,
			systemVerified: true,
			customReturnPath: "inbound",
			clickTracking: true,
			openTracking: true,
			tls: "opportunistic",
			trackingDomain: false,
			sendingEmail: true,
			receivingEmail: true,
			dnsRecords: [{
				id: "dns_123456789",
				recordType: "MX",
				recordTypeName: "MX",
				domain: "example.com",
				name: "@",
				value: "email.reloop.sh",
				ttl: "Auto",
				priority: 10,
				status: "active",
				createdAt: new Date("2026-03-30T10:00:00Z"),
				updatedAt: new Date("2026-03-30T10:00:00Z")
			}],
			createdAt: new Date("2026-03-30T10:00:00Z"),
			updatedAt: new Date("2026-03-30T10:00:00Z")
		}]
	});

	export const domainStatusResponse = t.Object({
		id: t.String({ description: "Unique domain identifier" }),
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
	});

	export const domainListResponse = t.Object({
		domains: t.Array(domainResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

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
	});

	export const domainNotFound = t.Object({
		message: t.Literal("Domain not found"),
	});

	export const domainAlreadyExists = t.Object({
		message: t.Literal("Domain already exists"),
	});

	export const invalidDomain = t.Object({
		message: t.Literal("Invalid domain format"),
	});

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
}
