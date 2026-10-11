import { t } from "elysia";
import { DomainModel } from "./domain.model";

export namespace SmtpProviderModel {
	export const security = t.Union([t.Literal("starttls"), t.Literal("none")], {
		description:
			"starttls = require STARTTLS with a valid certificate (587/25/2525). none = plaintext, self-hosted only. Implicit TLS (465) is not supported.",
	});

	export const provider = t.Object({
		object: t.Literal("smtp_provider"),
		id: t.String(),
		name: t.String(),
		host: t.String(),
		port: t.Number(),
		security,
		username: t.Union([t.String(), t.Null()]),
		hasPassword: t.Boolean(),
		domains: t.Array(t.Object({ id: t.String(), domain: t.String() }), {
			description: "Sending domains relayed through this provider",
		}),
		status: t.Union([
			t.Literal("unverified"),
			t.Literal("ok"),
			t.Literal("failing"),
		]),
		lastTestedAt: t.Union([t.Date(), t.Null()]),
		lastError: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});

	export const listResponse = t.Object({
		object: t.Literal("list"),
		limit: t.Union([t.Number(), t.Null()], {
			description: "Plan cap on providers (null = unlimited)",
		}),
		items: t.Array(provider),
	});

	const host = t.String({
		minLength: 1,
		maxLength: 255,
		pattern: "^[A-Za-z0-9.-]+$",
		description: "SMTP server hostname, e.g. smtp.sendgrid.net",
	});
	const port = t.Integer({ minimum: 1, maximum: 65535 });
	const sendingDomain = t.String({
		minLength: 4,
		maxLength: 255,
		pattern: DomainModel.domainPattern.source,
		description:
			"Domain you send from (the part after @ in From). Created automatically if it isn't in Reloop yet — no DNS setup needed.",
	});

	export const createBody = t.Object({
		domain: sendingDomain,
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 100,
				description: "Defaults to the sending domain",
			}),
		),
		host,
		port,
		security: t.Optional(security),
		username: t.Optional(t.String({ maxLength: 255 })),
		password: t.Optional(t.String({ maxLength: 1024 })),
	});

	export const updateBody = t.Object({
		domain: t.Optional(sendingDomain),
		name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
		host: t.Optional(host),
		port: t.Optional(port),
		security: t.Optional(security),
		username: t.Optional(t.Union([t.String({ maxLength: 255 }), t.Null()])),
		password: t.Optional(
			t.Union([t.String({ maxLength: 1024 }), t.Null()], {
				description: "Omit to keep the stored password, null to clear it",
			}),
		),
	});

	export const params = t.Object({ provider_id: t.String() });

	export const testResponse = t.Object({
		ok: t.Boolean(),
		error: t.Union([t.String(), t.Null()]),
		provider,
	});

	export const deleteResponse = t.Object({
		object: t.Literal("smtp_provider"),
		id: t.String(),
		deleted: t.Literal(true),
	});
}

export type SmtpProviderCreateBody = typeof SmtpProviderModel.createBody.static;
export type SmtpProviderUpdateBody = typeof SmtpProviderModel.updateBody.static;
