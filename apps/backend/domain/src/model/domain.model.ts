import { t } from "elysia";

export namespace DomainModel {
	// Domain validation pattern - supports domains and subdomains
	const domainPattern =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
	export const createDomainBody = t.Object(
		{
			domain: t.String({
				minLength: 4,
				maxLength: 255,
				pattern: domainPattern.source,
				description: "Domain name (e.g., send.reloop.com)",
			}),
			// custom_return_path and tracking host labels are fixed server-side
			// (inbound / link) — not accepted from clients.
			click_tracking: t.Optional(
				t.Boolean({
					default: true,
					description: "Whether click tracking is enabled",
				}),
			),
			open_tracking: t.Optional(
				t.Boolean({
					default: true,
					description: "Whether open tracking is enabled",
				}),
			),
			tls: t.Optional(
				t.Union([t.Literal("opportunistic"), t.Literal("enforced")], {
					default: "opportunistic",
					description: "TLS mode for the domain",
				}),
			),
			sending_email: t.Optional(
				t.Boolean({
					default: true,
					description: "Whether sending email is enabled",
				}),
			),
			receiving_email: t.Optional(
				t.Boolean({
					default: true,
					description: "Whether receiving email is enabled",
				}),
			),
		},
		{
			examples: [
				{
					domain: "send.example.com",
					click_tracking: true,
					open_tracking: true,
					tls: "opportunistic",
					sending_email: true,
					receiving_email: true,
				},
			],
		},
	);

	export const dnsRecordResponse = t.Object(
		{
			id: t.String({ description: "Unique DNS record identifier" }),
			recordType: t.Union(
				[
					t.Literal("A"),
					t.Literal("AAAA"),
					t.Literal("CNAME"),
					t.Literal("MX"),
					t.Literal("TXT"),
					t.Literal("SPF"),
					t.Literal("DKIM"),
					t.Literal("DMARC"),
				],
				{ description: "DNS record type" },
			),
			recordTypeName: t.Union(
				[
					t.Literal("MX"),
					t.Literal("SPF"),
					t.Literal("DKIM"),
					t.Literal("DMARC"),
					t.Literal("CNAME"),
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
			purpose: t.Union(
				[t.Literal("sending"), t.Literal("receiving"), t.Literal("tracking")],
				{ default: "sending", description: "Purpose of the record" },
			),
			createdAt: t.Date(),
			status: t.Union(
				[
					t.Literal("pending"),
					t.Literal("verifying"),
					t.Literal("active"),
					t.Literal("suspended"),
					t.Literal("failed"),
				],
				{ description: "Domain verification status" },
			),
			updatedAt: t.Date(),
		},
		{
			examples: [
				{
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
					updatedAt: new Date("2026-03-30T10:00:00Z"),
				},
			],
		},
	);

	export const domainBaseResponse = t.Object(
		{
			object: t.Literal("domain", { default: "domain" }),
			id: t.String({ description: "Unique domain identifier" }),
			domain: t.String({ description: "Domain name (e.g., send.reloop.com)" }),

			status: t.Union(
				[
					t.Literal("pending"),
					t.Literal("verifying"),
					t.Literal("active"),
					t.Literal("suspended"),
					t.Literal("failed"),
				],
				{ description: "Domain verification status" },
			),
			userVerifiedDomain: t.Boolean({
				description: "Whether user has verified the domain",
			}),
			systemVerified: t.Boolean({
				description: "Whether system has verified the domain",
			}),
			customReturnPath: t.String({
				description: "Custom return path subdomain for SPF and bounce handling",
				default: "inbound",
			}),
			trackingSubdomain: t.String({
				description: "Custom tracking subdomain for click/open tracking",
				default: "tracking",
			}),
			isClickTrackingEnabled: t.Boolean({
				description: "Whether click tracking is enabled for the domain",
			}),
			isOpenTrackingEnabled: t.Boolean({
				description: "Whether open tracking is enabled for the domain",
			}),
			tls: t.Union([t.Literal("opportunistic"), t.Literal("enforced")], {
				description: "TLS mode for the domain",
			}),
			isTrackingDomain: t.Boolean({
				description: "Whether domain is used for tracking",
			}),
			isSendingEmailEnabled: t.Boolean({
				description: "Whether sending email is enabled for the domain",
			}),
			isReceivingEmailEnabled: t.Boolean({
				description: "Whether receiving email is enabled for the domain",
			}),
			verificationFailedReason: t.Union([t.String(), t.Null()], {
				description: "Reason for verification failure",
			}),
			sentCount: t.Optional(
				t.Number({
					description: "Number of emails sent using this domain",
				}),
			),
			dnsRecords: t.Array(dnsRecordResponse, {
				description: "DNS records for the domain",
			}),
			lastVerifiedAt: t.Union([t.Date(), t.Null()], {
				description: "Last verification timestamp",
			}),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		},
		{
			examples: [
				{
					object: "domain",
					id: "domain_123456789",
					domain: "send.example.com",

					status: "active",
					userVerifiedDomain: true,
					systemVerified: true,
					customReturnPath: "inbound",
					isClickTrackingEnabled: true,
					isOpenTrackingEnabled: true,
					tls: "opportunistic",
					isTrackingDomain: false,
					isSendingEmailEnabled: true,
					isReceivingEmailEnabled: true,
					dnsRecords: [
						{
							id: "dns_123456789",
							recordType: "MX",
							recordTypeName: "MX",
							domain: "example.com",
							name: "@",
							// Receiving: apex MX → inbound MTA (mailboxes are user@example.com)
							value: "inbound.reloop.sh",
							ttl: "Auto",
							priority: 10,
							status: "active",
							createdAt: new Date("2026-03-30T10:00:00Z"),
							updatedAt: new Date("2026-03-30T10:00:00Z"),
						},
					],
					createdAt: new Date("2026-03-30T10:00:00Z"),
					updatedAt: new Date("2026-03-30T10:00:00Z"),
				},
			],
		},
	);

	export const domainResponse = t.Composite([
		domainBaseResponse,
		t.Object({
			event: t.Optional(t.String({ description: "Event ID for the mutation" })),
		}),
	]);

	export const domainStatusResponse = t.Object(
		{
			id: t.String({ description: "Unique domain identifier" }),
			status: t.Union(
				[
					t.Literal("pending"),
					t.Literal("verifying"),
					t.Literal("active"),
					t.Literal("suspended"),
					t.Literal("failed"),
				],
				{ description: "Domain verification status" },
			),
			event: t.Optional(t.String({ description: "Event ID" })),
		},
		{
			examples: [
				{
					id: "domain_123456789",
					status: "verifying",
				},
			],
		},
	);

	export const updateDomainBody = t.Object(
		{
			click_tracking: t.Optional(
				t.Boolean({
					description: "Whether click tracking is enabled",
				}),
			),
			open_tracking: t.Optional(
				t.Boolean({
					description: "Whether open tracking is enabled",
				}),
			),
			sending_email: t.Optional(
				t.Boolean({
					description: "Whether sending email is enabled",
				}),
			),
			receiving_email: t.Optional(
				t.Boolean({
					description: "Whether receiving email is enabled",
				}),
			),
			tls: t.Optional(
				t.Union([t.Literal("opportunistic"), t.Literal("enforced")], {
					description: "TLS mode for the domain",
				}),
			),
		},
		{
			examples: [
				{
					click_tracking: true,
					open_tracking: true,
					sending_email: true,
					receiving_email: false,
				},
			],
		},
	);

	export const domainListResponse = t.Object({
		object: t.Literal("domain", { default: "domain" }),
		domains: t.Array(domainBaseResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		event: t.String({ description: "Event ID for the list request" }),
	});

	export const domainQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		q: t.Optional(t.String({ description: "Search query for domain name" })),
		status: t.Optional(
			t.Union([
				t.Literal("pending"),
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
