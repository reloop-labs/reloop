import { CampaignErrors } from "@be/template/error/campaign.error";
import {
	htmlToText,
	normalizeCsvEmails,
} from "@be/template/lib/campaign/audience";
import { scheduleCampaignStart } from "@be/template/lib/campaign/dispatch";
import {
	campaignMergeVars,
	interpolate,
} from "@be/template/lib/campaign/interpolate";
import { assertVerifiedFromDomain } from "@be/template/lib/campaign/resolve-audience";
import { sendCampaignMail } from "@be/template/lib/campaign/send-mail";
import { snapshotAudience } from "@be/template/lib/campaign/snapshot";
import {
	canCancel,
	canDelete,
	canEdit,
	canSchedule,
	canSend,
} from "@be/template/lib/campaign/status";
import {
	cancelCampaignStart,
	enqueueCampaignStart,
} from "@be/template/queues/campaign.queue";
import {
	toCampaignResponse,
	toRecipientResponse,
} from "@be/template/routes/campaign/campaign.mappers";
import { templateConfig } from "@be/template/template.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	and,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	type SQL,
	sql,
} from "drizzle-orm";

async function requireCampaign(id: string, organizationId: string) {
	const row = await db.query.campaign.findFirst({
		where: and(
			eq(schema.campaign.id, id),
			eq(schema.campaign.organizationId, organizationId),
			isNull(schema.campaign.deletedAt),
		),
	});
	if (!row) throw CampaignErrors.notFound(id);
	return row;
}

async function templateNameFor(templateId: string | null | undefined) {
	if (!templateId) return undefined;
	const tmpl = await db.query.template.findFirst({
		where: eq(schema.template.id, templateId),
		columns: { name: true },
	});
	return tmpl?.name;
}

export async function createCampaignController(params: {
	organizationId: string;
	userId: string;
	body: {
		name: string;
		subject: string;
		previewText?: string;
		fromName: string;
		fromEmail: string;
		replyTo?: string;
		audienceType: "all" | "group" | "channel" | "csv";
		audienceTargetId?: string;
		audienceTargetName?: string;
		templateId?: string;
		contentHtml?: string;
		csvEmails?: string[];
		scheduledAt?: string;
		sendImmediately?: boolean;
	};
}) {
	const { organizationId, userId, body } = params;
	const sendImmediately = Boolean(body.sendImmediately);
	if (!body.name.trim()) throw CampaignErrors.nameRequired();
	if (!body.subject.trim()) throw CampaignErrors.subjectRequired();
	if (!body.fromName.trim() || !body.fromEmail.trim()) {
		throw CampaignErrors.fromRequired();
	}
	if (sendImmediately || body.scheduledAt) {
		await assertVerifiedFromDomain(organizationId, body.fromEmail);
	}

	const csvEmails = normalizeCsvEmails(body.csvEmails ?? []);
	if (body.audienceType === "csv" && csvEmails.length === 0) {
		throw CampaignErrors.invalidAudience("CSV audience has no valid emails.");
	}
	if (
		(body.audienceType === "group" || body.audienceType === "channel") &&
		!body.audienceTargetId
	) {
		throw CampaignErrors.invalidAudience(
			`A ${body.audienceType} id is required.`,
		);
	}

	let scheduledAt: Date | undefined;
	if (body.scheduledAt && !sendImmediately) {
		scheduledAt = new Date(body.scheduledAt);
		if (
			Number.isNaN(scheduledAt.getTime()) ||
			scheduledAt.getTime() <= Date.now()
		) {
			throw CampaignErrors.invalidSchedule();
		}
	}

	const [created] = await db
		.insert(schema.campaign)
		.values({
			organizationId,
			userId,
			name: body.name.trim(),
			subject: body.subject.trim(),
			previewText: body.previewText?.trim() || null,
			fromName: body.fromName.trim(),
			fromEmail: body.fromEmail.trim(),
			replyTo: body.replyTo?.trim() || null,
			audienceType: body.audienceType,
			audienceTargetId: body.audienceTargetId || null,
			audienceTargetName: body.audienceTargetName || null,
			csvEmails,
			templateId: body.templateId || null,
			contentHtml: body.contentHtml ?? "",
			status: sendImmediately ? "sending" : scheduledAt ? "scheduled" : "draft",
			scheduledAt: scheduledAt ?? null,
		})
		.returning();

	if (!created) throw CampaignErrors.notFound("unknown");

	if (sendImmediately) {
		await enqueueCampaignStart({
			campaignId: created.id,
			organizationId,
		});
	} else if (scheduledAt) {
		const row = await requireCampaign(created.id, organizationId);
		await snapshotAudience(row);
		await scheduleCampaignStart({
			campaignId: created.id,
			organizationId,
			scheduledAt,
		});
	}

	const fresh = await requireCampaign(created.id, organizationId);
	return toCampaignResponse(fresh, await templateNameFor(fresh.templateId));
}

export async function listCampaignsController(params: {
	organizationId: string;
	page?: number;
	limit?: number;
	search?: string;
	status?: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
}) {
	const page = Math.max(1, params.page ?? 1);
	const limit = Math.min(
		params.limit ?? templateConfig.constants.defaultPageSize,
		templateConfig.constants.maxPageSize,
	);
	const offset = (page - 1) * limit;
	const filters: SQL[] = [
		eq(schema.campaign.organizationId, params.organizationId),
		isNull(schema.campaign.deletedAt),
	];
	if (params.status) filters.push(eq(schema.campaign.status, params.status));
	if (params.search?.trim()) {
		const q = `%${params.search.trim().replace(/[%_\\]/g, "\\$&")}%`;
		filters.push(ilike(schema.campaign.name, q));
	}

	const where = and(...filters);
	const [rows, totalRow] = await Promise.all([
		db
			.select()
			.from(schema.campaign)
			.where(where)
			.orderBy(desc(schema.campaign.createdAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ value: sql<number>`count(*)` })
			.from(schema.campaign)
			.where(where),
	]);

	return {
		campaigns: rows.map((row) => toCampaignResponse(row)),
		total: Number(totalRow[0]?.value ?? 0),
		page,
		limit,
	};
}

export async function getCampaignController(params: {
	id: string;
	organizationId: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	return toCampaignResponse(row, await templateNameFor(row.templateId));
}

export async function updateCampaignController(params: {
	id: string;
	organizationId: string;
	body: {
		name?: string;
		subject?: string;
		previewText?: string;
		fromName?: string;
		fromEmail?: string;
		replyTo?: string;
		audienceType?: "all" | "group" | "channel" | "csv";
		audienceTargetId?: string;
		audienceTargetName?: string;
		templateId?: string;
		contentHtml?: string;
		csvEmails?: string[];
	};
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!canEdit(row.status)) throw CampaignErrors.notDraft(row.id);
	if (params.body.fromEmail) {
		await assertVerifiedFromDomain(
			params.organizationId,
			params.body.fromEmail,
		);
	}

	const [updated] = await db
		.update(schema.campaign)
		.set({
			...(params.body.name != null ? { name: params.body.name.trim() } : {}),
			...(params.body.subject != null
				? { subject: params.body.subject.trim() }
				: {}),
			...(params.body.previewText !== undefined
				? { previewText: params.body.previewText.trim() || null }
				: {}),
			...(params.body.fromName != null
				? { fromName: params.body.fromName.trim() }
				: {}),
			...(params.body.fromEmail != null
				? { fromEmail: params.body.fromEmail.trim() }
				: {}),
			...(params.body.replyTo !== undefined
				? { replyTo: params.body.replyTo.trim() || null }
				: {}),
			...(params.body.audienceType
				? { audienceType: params.body.audienceType }
				: {}),
			...(params.body.audienceTargetId !== undefined
				? { audienceTargetId: params.body.audienceTargetId || null }
				: {}),
			...(params.body.audienceTargetName !== undefined
				? { audienceTargetName: params.body.audienceTargetName || null }
				: {}),
			...(params.body.templateId !== undefined
				? { templateId: params.body.templateId || null }
				: {}),
			...(params.body.contentHtml !== undefined
				? { contentHtml: params.body.contentHtml }
				: {}),
			...(params.body.csvEmails
				? { csvEmails: normalizeCsvEmails(params.body.csvEmails) }
				: {}),
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, row.id))
		.returning();

	return toCampaignResponse(
		updated ?? row,
		await templateNameFor((updated ?? row).templateId),
	);
}

export async function sendCampaignController(params: {
	id: string;
	organizationId: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!canSend(row.status)) throw CampaignErrors.cannotSend(row.id, row.status);
	await assertVerifiedFromDomain(params.organizationId, row.fromEmail);
	await enqueueCampaignStart({
		campaignId: row.id,
		organizationId: params.organizationId,
	});
	const fresh = await requireCampaign(row.id, params.organizationId);
	return toCampaignResponse(fresh, await templateNameFor(fresh.templateId));
}

export async function scheduleCampaignController(params: {
	id: string;
	organizationId: string;
	scheduledAt: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!canSchedule(row.status)) {
		throw CampaignErrors.cannotSchedule(row.id, row.status);
	}
	const scheduledAt = new Date(params.scheduledAt);
	if (
		Number.isNaN(scheduledAt.getTime()) ||
		scheduledAt.getTime() <= Date.now()
	) {
		throw CampaignErrors.invalidSchedule();
	}
	await assertVerifiedFromDomain(params.organizationId, row.fromEmail);
	await snapshotAudience(row);
	const [updated] = await db
		.update(schema.campaign)
		.set({
			status: "scheduled",
			scheduledAt,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, row.id))
		.returning();
	await scheduleCampaignStart({
		campaignId: row.id,
		organizationId: params.organizationId,
		scheduledAt,
	});
	return toCampaignResponse(
		updated ?? row,
		await templateNameFor((updated ?? row).templateId),
	);
}

export async function cancelCampaignController(params: {
	id: string;
	organizationId: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!canCancel(row.status)) {
		throw CampaignErrors.cannotCancel(row.id, row.status);
	}
	await cancelCampaignStart(row.id);
	const skipped = await db
		.update(schema.campaignRecipient)
		.set({
			status: "skipped",
			skipReason: "cancelled",
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, row.id),
				inArray(schema.campaignRecipient.status, ["pending", "sending"]),
			),
		)
		.returning({ id: schema.campaignRecipient.id });

	const [updated] = await db
		.update(schema.campaign)
		.set({
			status: "cancelled",
			cancelledAt: new Date(),
			skippedCount: sql`${schema.campaign.skippedCount} + ${skipped.length}`,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, row.id))
		.returning();

	return toCampaignResponse(
		updated ?? row,
		await templateNameFor((updated ?? row).templateId),
	);
}

export async function duplicateCampaignController(params: {
	id: string;
	organizationId: string;
	userId: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	const [created] = await db
		.insert(schema.campaign)
		.values({
			organizationId: params.organizationId,
			userId: params.userId,
			name: `${row.name} (Copy)`,
			subject: row.subject,
			previewText: row.previewText,
			fromName: row.fromName,
			fromEmail: row.fromEmail,
			replyTo: row.replyTo,
			audienceType: row.audienceType,
			audienceTargetId: row.audienceTargetId,
			audienceTargetName: row.audienceTargetName,
			csvEmails: row.csvEmails ?? [],
			templateId: row.templateId,
			contentHtml: row.contentHtml,
			status: "draft",
		})
		.returning();
	if (!created) throw CampaignErrors.notFound(params.id);
	return toCampaignResponse(created, await templateNameFor(created.templateId));
}

export async function deleteCampaignController(params: {
	id: string;
	organizationId: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!canDelete(row.status)) {
		throw CampaignErrors.cannotDelete(row.id, row.status);
	}
	await db
		.update(schema.campaign)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(schema.campaign.id, row.id));
	return { success: true, id: row.id };
}

export async function testCampaignController(params: {
	id: string;
	organizationId: string;
	to: string;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!params.to.includes("@")) {
		throw CampaignErrors.testFailed("A valid recipient email is required.");
	}
	await assertVerifiedFromDomain(params.organizationId, row.fromEmail);
	const vars = campaignMergeVars({
		email: params.to,
		firstName: "there",
		lastName: "",
	});
	const html = interpolate(row.contentHtml, vars);
	const subject = interpolate(row.subject, vars);
	const from = `${row.fromName} <${row.fromEmail}>`;
	try {
		await sendCampaignMail({
			organizationId: params.organizationId,
			userId: row.userId,
			from,
			to: params.to,
			subject,
			html,
			text: htmlToText(html) || subject,
			replyTo: row.replyTo,
			tags: [
				{ name: "campaign", value: row.id },
				{ name: "test", value: "true" },
			],
		});
	} catch (error) {
		throw CampaignErrors.testFailed(
			error instanceof Error ? error.message : String(error),
		);
	}
	return { success: true };
}

export async function listRecipientsController(params: {
	id: string;
	organizationId: string;
	page?: number;
	limit?: number;
	status?: "pending" | "sending" | "sent" | "skipped" | "failed";
}) {
	await requireCampaign(params.id, params.organizationId);
	const page = Math.max(1, params.page ?? 1);
	const limit = Math.min(params.limit ?? 50, 100);
	const offset = (page - 1) * limit;
	const filters: SQL[] = [
		eq(schema.campaignRecipient.campaignId, params.id),
		eq(schema.campaignRecipient.organizationId, params.organizationId),
	];
	if (params.status) {
		filters.push(eq(schema.campaignRecipient.status, params.status));
	}
	const where = and(...filters);
	const [rows, totalRow] = await Promise.all([
		db
			.select()
			.from(schema.campaignRecipient)
			.where(where)
			.orderBy(desc(schema.campaignRecipient.createdAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ value: sql<number>`count(*)` })
			.from(schema.campaignRecipient)
			.where(where),
	]);
	return {
		recipients: rows.map(toRecipientResponse),
		total: Number(totalRow[0]?.value ?? 0),
		page,
		limit,
	};
}

export async function campaignStatsController(params: {
	organizationId: string;
}) {
	const [row] = await db
		.select({
			totalCampaigns: sql<number>`count(*)`,
			totalDelivered: sql<number>`coalesce(sum(${schema.campaign.deliveredCount}), 0)`,
			totalOpened: sql<number>`coalesce(sum(${schema.campaign.openedCount}), 0)`,
			totalClicked: sql<number>`coalesce(sum(${schema.campaign.clickedCount}), 0)`,
		})
		.from(schema.campaign)
		.where(
			and(
				eq(schema.campaign.organizationId, params.organizationId),
				isNull(schema.campaign.deletedAt),
			),
		);
	const totalDelivered = Number(row?.totalDelivered ?? 0);
	const totalOpened = Number(row?.totalOpened ?? 0);
	const totalClicked = Number(row?.totalClicked ?? 0);
	return {
		totalCampaigns: Number(row?.totalCampaigns ?? 0),
		totalDelivered,
		avgOpenRate:
			totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
		avgClickRate:
			totalDelivered > 0
				? Math.round((totalClicked / totalDelivered) * 100)
				: 0,
	};
}
