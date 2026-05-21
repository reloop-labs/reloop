import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { db } from "@reloop/db/client";
import { domain, domainDnsRecord, emailLog } from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { redis } from "@reloop/domain/utils/loader";
import { and, eq, isNull } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import { simpleParser } from "mailparser";

// Local authentication checks
async function verifyApiKeyController(
	apiKey: string,
): Promise<{ userId: string; organizationId: string } | null> {
	try {
		const result = await validateApiKeyShared(apiKey, redis);
		return result
			? {
					userId: result.userId,
					organizationId: result.organizationId,
				}
			: null;
	} catch (e) {
		log.error({
			message: "Error authenticating API key",
			error: e instanceof Error ? e.message : String(e),
		});
		return null;
	}
}

async function verifyDomainController({
	domainName,
	orgId,
}: {
	domainName: string;
	orgId: string;
}): Promise<{ isVerified: boolean } | null> {
	try {
		const domainRecord = await db.query.domain.findFirst({
			where: and(
				eq(domain.domain, domainName),
				eq(domain.organizationId, orgId),
				isNull(domain.deletedAt),
			),
			columns: { status: true },
		});
		if (!domainRecord) return null;
		return { isVerified: domainRecord.status === "active" };
	} catch (error) {
		log.error({
			message: "Error verifying domain",
			error: error instanceof Error ? error.message : String(error),
			domain: domainName,
		});
		return null;
	}
}

export const kumomtaRoutes = new Elysia({
	prefix: "",
	name: "KumomtaRoutes",
})
	.use(authMiddleware)
	.post(
		"/verify",
		async ({ body, organizationId, userId, status }) => {
			const { domain: domainName } = body;
			const domainResult = await verifyDomainController({
				domainName,
				orgId: organizationId,
			});
			if (!domainResult) {
				return status(404, { message: "Domain not found" });
			}
			return { userId, organizationId, ...domainResult };
		},
		{
			apiKeyAuth: true,
			response: {
				200: t.Object({
					userId: t.String(),
					organizationId: t.String(),
					isVerified: t.Boolean(),
				}),
				401: t.Object({
					message: t.String(),
				}),
				404: t.Object({
					message: t.String(),
				}),
			},
			body: t.Object({
				domain: t.String(),
			}),
			detail: {
				summary: "Verify",
				description:
					"Internal verification endpoint mapping POST API keys to their owner and checking domain verification status.",
			},
		},
	)
	.post(
		"/dkim-key",
		async ({ body, organizationId, status }) => {
			const { domainName } = body;
			try {
				const domainQuery = and(
					eq(domain.domain, domainName),
					eq(domain.organizationId, organizationId),
					isNull(domain.deletedAt),
				);

				log.info({
					message: "[DKIM-KEY] Querying domain",
					domain: domainName,
					organizationId,
				});

				const domainRecord = await db.query.domain.findFirst({
					where: domainQuery,
					columns: { id: true, status: true },
				});

				if (!domainRecord) {
					log.warn({
						message: "[DKIM-KEY] Domain NOT FOUND",
						domain: domainName,
					});
					return status(404, { message: "Domain not found" });
				}

				if (domainRecord.status !== "active") {
					log.warn({
						message: "[DKIM-KEY] Domain found but NOT ACTIVE",
						domain: domainName,
						status: domainRecord.status,
					});
					return status(404, { message: "Domain not active" });
				}

				const dkimRecord = await db.query.domainDnsRecord.findFirst({
					where: and(
						eq(domainDnsRecord.domainId, domainRecord.id),
						eq(domainDnsRecord.recordTypeName, "DKIM"),
						isNull(domainDnsRecord.deletedAt),
					),
					columns: { name: true, privateKey: true },
				});

				if (!dkimRecord || !dkimRecord.privateKey) {
					return status(404, { message: "DKIM key not found for domain" });
				}

				const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");

				return { selector, privateKey: dkimRecord.privateKey };
			} catch (error) {
				log.error({
					message: "Error fetching DKIM key",
					error: error instanceof Error ? error.message : String(error),
					domain: domainName,
				});
				return status(500, { message: "Internal Error" });
			}
		},
		{
			apiKeyAuth: true,
			response: {
				200: t.Object({
					selector: t.String(),
					privateKey: t.String(),
				}),
				401: t.Object({ message: t.String() }),
				404: t.Object({ message: t.String() }),
				500: t.Object({ message: t.String() }),
			},
			body: t.Object({
				domainName: t.String(),
			}),
			detail: {
				summary: "Get DKIM Key",
				description:
					"Internal endpoint for KumoMTA to fetch the DKIM private key and selector for a given domain, used to sign outgoing emails.",
			},
		},
	)
	.post(
		"/log-incoming",
		async ({ body, organizationId, status }) => {
			try {
				let textBody = body.textBody || "";
				let htmlBody = body.htmlBody || "";
				let subject = body.subject || "No Subject";

				if (body.rawMessage) {
					log.info({
						message: "[LOG-INCOMING] Parsing rawMessage",
						rawLength: body.rawMessage.length,
					});
					try {
						const parsed = await simpleParser(body.rawMessage);
						log.info({
							message: "[LOG-INCOMING] Parsed rawMessage",
							hasText: !!parsed.text,
							hasHtml: !!parsed.html,
						});
						textBody = parsed.text || "";
						htmlBody = (parsed.html as string) || "";
						subject = parsed.subject || subject;
					} catch (parseError) {
						log.error({
							message: "[LOG-INCOMING] mailparser error",
							parseError,
						});
					}
				}

				const domainQuery = and(
					eq(domain.domain, body.domainName),
					eq(domain.organizationId, organizationId),
					isNull(domain.deletedAt),
				);

				log.info({
					message: "[LOG-INCOMING] Querying domain",
					domain: body.domainName,
					organizationId,
				});

				const domainRecord = await db.query.domain.findFirst({
					where: domainQuery,
					columns: { id: true, status: true, organizationId: true },
				});

				if (!domainRecord) {
					log.warn({
						message: "[LOG-INCOMING] Domain NOT FOUND",
						domain: body.domainName,
						organizationId,
					});
					return status(404, { message: "Domain not found" });
				}

				if (domainRecord.status !== "active") {
					log.warn({
						message: "[LOG-INCOMING] Domain found but NOT ACTIVE",
						domain: body.domainName,
						status: domainRecord.status,
					});
					return status(404, { message: "Domain not verified" });
				}

				const finalOrgId = organizationId || domainRecord.organizationId;

				const existingLog = await db.query.emailLog.findFirst({
					where: eq(emailLog.messageId, body.messageId),
					columns: { id: true },
				});

				if (existingLog) {
					log.info({
						message: "[LOG-INCOMING] Message ID already exists",
						messageId: body.messageId,
					});
					return status(409, { message: "Message ID already exists" });
				}

				const inserted = await db
					.insert(emailLog)
					.values({
						messageId:
							body.messageId ||
							`msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
						organizationId: finalOrgId,
						domainId: domainRecord.id,
						fromEmail: body.fromEmail,
						toEmails: body.toEmails,
						subject: subject,
						textBody: textBody,
						htmlBody: htmlBody,
						status: "pending",
						size: body.size || 0,
						provider: "kumomta",
						providerMessageId: body.providerMessageId,
					})
					.returning({ id: emailLog.id });

				const insertedId = inserted?.[0]?.id;
				if (!insertedId) {
					return status(400, { message: "Failed to insert email log" });
				}
				return { id: insertedId };
			} catch (error) {
				log.error({
					message: "Error logging incoming email",
					error: error instanceof Error ? error.message : String(error),
					domain: body.domainName,
				});
				return status(500, { message: "Internal Error" });
			}
		},
		{
			apiKeyAuth: true,
			response: {
				200: t.Object({
					id: t.String(),
				}),
				400: t.Object({
					message: t.String(),
				}),
				401: t.Object({
					message: t.String(),
				}),
				404: t.Object({
					message: t.String(),
				}),
				409: t.Object({
					message: t.String(),
				}),
				500: t.Object({
					message: t.String(),
				}),
			},
			body: t.Object({
				domainName: t.String(),
				messageId: t.String(),
				providerMessageId: t.Optional(t.String()),
				fromEmail: t.String(),
				toEmails: t.Array(t.String()),
				subject: t.String(),
				textBody: t.Optional(t.String()),
				htmlBody: t.Optional(t.String()),
				rawMessage: t.Optional(t.String()),
				size: t.Number(),
			}),
			detail: {
				summary: "Log Incoming Email",
				description:
					"Log incoming SMTP email into the DB, returning the new email log ID.",
			},
		},
	);
