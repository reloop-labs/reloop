import * as z from "zod";
import type { SmtpProvider } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";
import { domainNameSchema } from "../domains/schemas";

export const smtpProviderIdSchema = resourceIdSchema.describe(
	"SMTP provider ID as returned by Reloop, for example smtp_123456789",
);

export const sendingDomainSchema = domainNameSchema.describe(
	"Domain the user sends from (the part after @ in From). Reloop adds it automatically if missing; no DNS records are needed when relaying.",
);

export const smtpSecuritySchema = z
	.enum(["starttls", "none"])
	.describe(
		"starttls requires STARTTLS with a valid certificate (ports 587, 25, 2525). none is plaintext and only allowed on self-hosted Reloop. Port 465 implicit TLS is not supported.",
	);

export const smtpHostSchema = z
	.string()
	.trim()
	.min(1)
	.max(255)
	.regex(/^[A-Za-z0-9.-]+$/, "must be a hostname such as smtp.sendgrid.net")
	.describe("SMTP server hostname, for example smtp.sendgrid.net");

export const smtpPortSchema = z
	.number()
	.int()
	.min(1)
	.max(65535)
	.describe("SMTP server port, usually 587");

export const smtpProviderSchema = z.object({
	id: z.string(),
	name: z.string(),
	host: z.string(),
	port: z.number(),
	security: z.enum(["starttls", "none"]),
	username: z.string().nullable(),
	hasPassword: z
		.boolean()
		.describe("Whether a password is stored; it is never returned"),
	domains: z
		.array(z.object({ id: z.string(), domain: z.string() }))
		.describe("Sending domains relayed through this server"),
	status: z
		.enum(["unverified", "ok", "failing"])
		.describe("Result of the last connection test"),
	lastError: z.string().nullable(),
	lastTestedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toSmtpProviderOutput(provider: SmtpProvider) {
	return {
		id: provider.id,
		name: provider.name,
		host: provider.host,
		port: provider.port,
		security: provider.security,
		username: provider.username,
		hasPassword: provider.hasPassword,
		domains: provider.domains.map((d) => ({ id: d.id, domain: d.domain })),
		status: provider.status,
		lastError: provider.lastError,
		lastTestedAt: provider.lastTestedAt,
		createdAt: provider.createdAt,
		updatedAt: provider.updatedAt,
	};
}
