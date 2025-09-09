import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { type AddDomainRequest, DomainService } from "../lib/domain-service";

export const domainRouter = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Domain Management API",
					version: "1.0.0",
					description:
						"API for managing mail server domains, DKIM keys, and DNS records",
				},
				servers: [
					{
						url: "http://localhost:3000/api/domain",
						description: "Domain API server",
					},
				],
				tags: [
					{
						name: "Domain Management",
						description:
							"Operations for managing mail domains, DKIM keys, and DNS records",
					},
				],
			},
			path: "/swagger",
		}),
	)
	.post(
		"/add",
		async ({ body }) => {
			try {
				const result = await DomainService.addDomain(body);
				return {
					success: true,
					data: result,
					message: result.message,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		{
			body: t.Object({
				domain: t.String({
					minLength: 1,
					description: "Domain name (e.g., example.com)",
				}),
				serverIP: t.String({
					minLength: 7,
					description: "Server IP address for A record",
				}),
				adminEmail: t.String({
					format: "email",
					description: "Admin email address",
				}),
				adminPassword: t.String({
					minLength: 8,
					description: "Admin password (minimum 8 characters)",
				}),
				adminFullName: t.String({
					minLength: 1,
					description: "Admin full name",
				}),
				mailboxes: t.Optional(
					t.Number({
						minimum: 1,
						maximum: 1000,
						description: "Maximum number of mailboxes (default: 50)",
					}),
				),
				mailboxQuota: t.Optional(
					t.Number({
						minimum: 1073741824,
						description: "Mailbox quota in bytes (default: 5GB)",
					}),
				),
				quota: t.Optional(
					t.Number({
						minimum: 1073741824,
						description: "Domain quota in bytes (default: 10GB)",
					}),
				),
				rateLimit: t.Optional(
					t.Number({
						minimum: 1,
						maximum: 100,
						description: "Rate limit per hour (default: 12)",
					}),
				),
			}),
			response: t.Object({
				success: t.Boolean(),
				data: t.Optional(
					t.Object({
						success: t.Boolean(),
						domain: t.String(),
						dkimKeys: t.Object({
							selector: t.String(),
							publicKey: t.String(),
							privateKey: t.String(),
						}),
						dnsRecords: t.Array(
							t.Object({
								type: t.String(),
								name: t.String(),
								value: t.String(),
								ttl: t.Optional(t.Number()),
								priority: t.Optional(t.Number()),
								description: t.Optional(t.String()),
							}),
						),
						adminAccount: t.Object({
							username: t.String(),
							email: t.String(),
							fullName: t.String(),
						}),
						message: t.String(),
						isExisting: t.Boolean(),
					}),
				),
				error: t.Optional(t.String()),
				message: t.Optional(t.String()),
			}),
			detail: {
				summary: "Add a new domain",
				description:
					"Add a new domain with DKIM keys, DNS records, and admin account. If domain already exists, returns existing configuration.",
				tags: ["Domain Management"],
				examples: [
					{
						summary: "Add domain example",
						value: {
							domain: "example.com",
							serverIP: "192.168.1.100",
							adminEmail: "admin@example.com",
							adminPassword: "securepassword123",
							adminFullName: "Admin User",
							mailboxes: 100,
							mailboxQuota: 10737418240, // 10GB
							quota: 21474836480, // 20GB
							rateLimit: 20,
						},
					},
				],
			},
		},
	);
