import { t } from "elysia";

export const campaignStatusSchema = t.Union([
	t.Literal("draft"),
	t.Literal("scheduled"),
	t.Literal("sending"),
	t.Literal("sent"),
	t.Literal("cancelled"),
]);

export const audienceTypeSchema = t.Union([
	t.Literal("all"),
	t.Literal("group"),
	t.Literal("channel"),
	t.Literal("csv"),
]);

export const campaignResponseSchema = t.Object({
	id: t.String(),
	organizationId: t.String(),
	name: t.String(),
	subject: t.String(),
	previewText: t.Optional(t.String()),
	fromName: t.String(),
	fromEmail: t.String(),
	replyTo: t.Optional(t.String()),
	status: campaignStatusSchema,
	audienceType: audienceTypeSchema,
	audienceTargetId: t.Optional(t.String()),
	audienceTargetName: t.Optional(t.String()),
	recipientCount: t.Number(),
	sentCount: t.Number(),
	deliveredCount: t.Number(),
	openedCount: t.Number(),
	clickedCount: t.Number(),
	failedCount: t.Number(),
	skippedCount: t.Number(),
	templateId: t.Optional(t.String()),
	templateName: t.Optional(t.String()),
	contentHtml: t.String(),
	scheduledAt: t.Optional(t.String()),
	sentAt: t.Optional(t.String()),
	createdAt: t.String(),
	updatedAt: t.String(),
	lastError: t.Optional(t.String()),
});

export const createCampaignBody = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	subject: t.String({ minLength: 1, maxLength: 255 }),
	previewText: t.Optional(t.String()),
	fromName: t.String({ minLength: 1, maxLength: 255 }),
	fromEmail: t.String({ minLength: 3, maxLength: 255 }),
	replyTo: t.Optional(t.String()),
	audienceType: audienceTypeSchema,
	audienceTargetId: t.Optional(t.String()),
	audienceTargetName: t.Optional(t.String()),
	templateId: t.Optional(t.String()),
	contentHtml: t.Optional(t.String()),
	csvEmails: t.Optional(t.Array(t.String(), { maxItems: 50_000 })),
	scheduledAt: t.Optional(t.String()),
	sendImmediately: t.Optional(t.Boolean()),
});

export const updateCampaignBody = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	subject: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	previewText: t.Optional(t.String()),
	fromName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	fromEmail: t.Optional(t.String({ minLength: 3, maxLength: 255 })),
	replyTo: t.Optional(t.String()),
	audienceType: t.Optional(audienceTypeSchema),
	audienceTargetId: t.Optional(t.String()),
	audienceTargetName: t.Optional(t.String()),
	templateId: t.Optional(t.String()),
	contentHtml: t.Optional(t.String()),
	csvEmails: t.Optional(t.Array(t.String(), { maxItems: 50_000 })),
});

export const campaignListQuery = t.Object({
	page: t.Optional(t.Number()),
	limit: t.Optional(t.Number()),
	search: t.Optional(t.String()),
	status: t.Optional(campaignStatusSchema),
});

export const scheduleBody = t.Object({
	scheduledAt: t.String({ format: "date-time" }),
});

export const testSendBody = t.Object({
	to: t.String(),
});

export const recipientStatusSchema = t.Union([
	t.Literal("pending"),
	t.Literal("sending"),
	t.Literal("sent"),
	t.Literal("skipped"),
	t.Literal("failed"),
]);

export const campaignRecipientSchema = t.Object({
	id: t.String(),
	email: t.String(),
	contactId: t.Optional(t.String()),
	status: recipientStatusSchema,
	skipReason: t.Optional(t.String()),
	emailLogId: t.Optional(t.String()),
	openedAt: t.Optional(t.String()),
	clickedAt: t.Optional(t.String()),
});
