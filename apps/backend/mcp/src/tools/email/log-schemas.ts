import * as z from "zod";
import type { EmailLogSummary, EmailOrigin } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const emailIdSchema = resourceIdSchema.describe(
	"Email log ID, as returned by send_email or list_emails",
);

export const emailStatusFilterSchema = z.enum([
	"pending",
	"sent",
	"delivered",
	"opened",
	"clicked",
	"bounced",
	"failed",
	"spam",
	"archived",
]);

export const originSchema = z
	.object({
		type: z.enum(["campaign", "automation"]),
		id: z.string(),
		name: z.string(),
	})
	.nullable()
	.describe("Campaign or automation that sent the email; null for API sends");

export function toOriginOutput(
	origin: EmailOrigin | null | undefined,
): z.output<typeof originSchema> {
	return origin === undefined || origin === null
		? null
		: { type: origin.type, id: origin.id, name: origin.name };
}

export const emailSummarySchema = z.object({
	id: z.string(),
	subject: z.string(),
	from: z.string(),
	to: z.array(z.string()),
	status: z
		.string()
		.describe(
			"Latest lifecycle status, for example delivered, opened, or bounced",
		),
	source: z.string().nullable(),
	origin: originSchema,
	hasAttachments: z.boolean(),
	createdAt: z.string(),
});

export function toEmailSummaryOutput(
	email: EmailLogSummary,
): z.output<typeof emailSummarySchema> {
	return {
		id: email.id,
		subject: email.subject,
		from: email.fromEmail,
		to: email.toEmails,
		status: email.status,
		source: email.source ?? null,
		origin: toOriginOutput(email.origin),
		hasAttachments: email.hasAttachments ?? false,
		createdAt: email.createdAt,
	};
}
