import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { CampaignErrors } from "@be/campaigns/error/campaign.error";
import {
	htmlToText,
	normalizeCsvEmails,
} from "@be/campaigns/lib/campaign/audience";
import { scheduleCampaignStart } from "@be/campaigns/lib/campaign/dispatch";
import {
	campaignMergeVars,
	interpolate,
} from "@be/campaigns/lib/campaign/interpolate";
import { assertVerifiedFromDomain } from "@be/campaigns/lib/campaign/resolve-audience";
import { sendCampaignMail } from "@be/campaigns/lib/campaign/send-mail";
import { snapshotAudience } from "@be/campaigns/lib/campaign/snapshot";
import {
	canCancel,
	canDelete,
	canEdit,
	canSchedule,
	canSend,
} from "@be/campaigns/lib/campaign/status";
import {
	cancelCampaignJobs,
	enqueueCampaignStart,
} from "@be/campaigns/queues/campaign.queue";
import {
	toCampaignResponse,
	toRecipientResponse,
} from "@be/campaigns/routes/campaign/campaign.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	and,
	desc,
	eq,
	exists,
	ilike,
	inArray,
	isNotNull,
	isNull,
	or,
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
		subject?: string;
		previewText?: string;
		fromName?: string;
		fromEmail?: string;
		replyTo?: string;
		audienceType: "all" | "group" | "channel" | "csv";
		audienceTargetId?: string;
		audienceTargetName?: string;
		templateId?: string;
		content?: unknown[];
		contentHtml?: string;
		csvEmails?: string[];
		scheduledAt?: string;
		sendImmediately?: boolean;
	};
}) {
	const { organizationId, userId, body } = params;
	const sendImmediately = Boolean(body.sendImmediately);
	if (!body.name.trim()) throw CampaignErrors.nameRequired();
	// Subject + From may be empty on drafts — enforced at send/schedule time.
	const subject = body.subject?.trim() ?? "";
	const fromName = body.fromName?.trim() ?? "";
	const fromEmail = body.fromEmail?.trim() ?? "";
	if (sendImmediately || body.scheduledAt) {
		if (!subject) throw CampaignErrors.subjectRequired();
		await assertVerifiedFromDomain(organizationId, fromEmail);
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
			subject,
			previewText: body.previewText?.trim() || null,
			fromName,
			fromEmail,
			replyTo: body.replyTo?.trim() || null,
			audienceType: body.audienceType,
			audienceTargetId: body.audienceTargetId || null,
			audienceTargetName: body.audienceTargetName || null,
			csvEmails,
			templateId: body.templateId || null,
			content: body.content ?? [],
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
		params.limit ?? campaignsConfig.constants.defaultPageSize,
		campaignsConfig.constants.maxPageSize,
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
		content?: unknown[];
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
			...(params.body.content !== undefined
				? { content: params.body.content }
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
	if (!row.subject.trim()) throw CampaignErrors.subjectRequired();
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
	if (!row.subject.trim()) throw CampaignErrors.subjectRequired();
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
	await cancelCampaignJobs(row.id);
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
			content: Array.isArray(row.content) ? row.content : [],
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
	variables?: Record<string, any>;
}) {
	const row = await requireCampaign(params.id, params.organizationId);
	if (!params.to.includes("@")) {
		throw CampaignErrors.testFailed("A valid recipient email is required.");
	}
	await assertVerifiedFromDomain(params.organizationId, row.fromEmail);
	const vars = {
		...campaignMergeVars({
			email: params.to,
			firstName: "there",
			lastName: "",
		}),
		...(params.variables ?? {}),
	};
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
	category?:
		| "unsubscribed"
		| "bounced"
		| "suppressed"
		| "complained"
		| "clicked"
		| "all";
	search?: string;
}) {
	await requireCampaign(params.id, params.organizationId);
	const page = Math.max(1, params.page ?? 1);
	const limit = Math.min(params.limit ?? 50, 100);
	const offset = (page - 1) * limit;

	// Condition fragments for deliverability categories
	const unsubscribedCondition = or(
		eq(schema.campaignRecipient.skipReason, "unsubscribed"),
		eq(schema.contact.status, "unsubscribed"),
		exists(
			db
				.select({ id: schema.emailEvent.id })
				.from(schema.emailEvent)
				.where(
					and(
						eq(
							schema.emailEvent.emailLogId,
							schema.campaignRecipient.emailLogId,
						),
						eq(schema.emailEvent.type, "unsubscribed"),
					),
				),
		),
	)!;

	const bouncedCondition = or(
		eq(schema.campaignRecipient.status, "failed"),
		eq(schema.emailLog.status, "bounced"),
		exists(
			db
				.select({ id: schema.emailEvent.id })
				.from(schema.emailEvent)
				.where(
					and(
						eq(
							schema.emailEvent.emailLogId,
							schema.campaignRecipient.emailLogId,
						),
						eq(schema.emailEvent.type, "bounced"),
					),
				),
		),
	)!;

	const suppressedCondition = inArray(schema.campaignRecipient.skipReason, [
		"suppressed",
		"blocked",
	]);

	const complainedCondition = or(
		eq(schema.emailLog.status, "spam"),
		eq(schema.contact.suppressionReason, "spam_complaint"),
		ilike(schema.campaignRecipient.error, "%spam%"),
		ilike(schema.campaignRecipient.error, "%complaint%"),
		exists(
			db
				.select({ id: schema.emailEvent.id })
				.from(schema.emailEvent)
				.where(
					and(
						eq(
							schema.emailEvent.emailLogId,
							schema.campaignRecipient.emailLogId,
						),
						eq(schema.emailEvent.type, "complaint"),
					),
				),
		),
	)!;

	const clickedEventExists = exists(
		db
			.select({ id: schema.emailEvent.id })
			.from(schema.emailEvent)
			.where(
				and(
					eq(schema.emailEvent.emailLogId, schema.campaignRecipient.emailLogId),
					eq(schema.emailEvent.type, "clicked"),
				),
			),
	);

	const clickedCondition = or(
		isNotNull(schema.campaignRecipient.clickedAt),
		clickedEventExists,
	)!;

	const anyIssueCondition = or(
		unsubscribedCondition,
		bouncedCondition,
		suppressedCondition,
		complainedCondition,
	)!;

	const baseFilter: SQL[] = [
		eq(schema.campaignRecipient.campaignId, params.id),
		eq(schema.campaignRecipient.organizationId, params.organizationId),
	];

	const countsWhere = and(...baseFilter);

	const clickCountExpr = sql<number>`coalesce((
		select count(*)::int
		from ${schema.emailEvent}
		where ${schema.emailEvent.emailLogId} = ${schema.campaignRecipient.emailLogId}
			and ${schema.emailEvent.type} = 'clicked'
	), 0)`;

	const uniqueClickCountExpr = sql<number>`coalesce((
		select count(distinct ${schema.emailEvent.metadata}->>'url')::int
		from ${schema.emailEvent}
		where ${schema.emailEvent.emailLogId} = ${schema.campaignRecipient.emailLogId}
			and ${schema.emailEvent.type} = 'clicked'
			and coalesce(${schema.emailEvent.metadata}->>'url', '') <> ''
	), 0)`;

	const selectFields = {
		recipient: schema.campaignRecipient,
		contactFirstName: schema.contact.firstName,
		contactLastName: schema.contact.lastName,
		contactStatus: schema.contact.status,
		contactSuppressionReason: schema.contact.suppressionReason,
		contactSuppressedAt: schema.contact.suppressedAt,
		emailLogStatus: schema.emailLog.status,
		clickCount: clickCountExpr,
		uniqueClickCount: uniqueClickCountExpr,
	};

	const queryFilter: SQL[] = [...baseFilter];
	if (params.status) {
		queryFilter.push(eq(schema.campaignRecipient.status, params.status));
	}
	if (params.category) {
		switch (params.category) {
			case "unsubscribed":
				queryFilter.push(unsubscribedCondition);
				break;
			case "bounced":
				queryFilter.push(bouncedCondition);
				break;
			case "suppressed":
				queryFilter.push(suppressedCondition);
				break;
			case "complained":
				queryFilter.push(complainedCondition);
				break;
			case "clicked":
				queryFilter.push(clickedCondition);
				break;
			case "all":
				queryFilter.push(anyIssueCondition);
				break;
		}
	}
	if (params.search?.trim()) {
		const q = `%${params.search.trim().replace(/[%_\\]/g, "\\$&")}%`;
		queryFilter.push(
			or(
				ilike(schema.campaignRecipient.email, q),
				ilike(schema.contact.firstName, q),
				ilike(schema.contact.lastName, q),
			)!,
		);
	}

	const where = and(...queryFilter);

	const [rows, totalRow, countsRow, clickedTotalRow] = await Promise.all([
		db
			.select(selectFields)
			.from(schema.campaignRecipient)
			.leftJoin(
				schema.contact,
				and(
					eq(
						schema.contact.organizationId,
						schema.campaignRecipient.organizationId,
					),
					eq(schema.contact.email, schema.campaignRecipient.email),
					isNull(schema.contact.deletedAt),
				),
			)
			.leftJoin(
				schema.emailLog,
				eq(schema.emailLog.id, schema.campaignRecipient.emailLogId),
			)
			.where(where)
			.orderBy(
				params.category === "clicked"
					? desc(clickCountExpr)
					: desc(schema.campaignRecipient.createdAt),
			)
			.limit(limit)
			.offset(offset),
		db
			.select({ value: sql<number>`count(*)` })
			.from(schema.campaignRecipient)
			.leftJoin(
				schema.contact,
				and(
					eq(
						schema.contact.organizationId,
						schema.campaignRecipient.organizationId,
					),
					eq(schema.contact.email, schema.campaignRecipient.email),
					isNull(schema.contact.deletedAt),
				),
			)
			.leftJoin(
				schema.emailLog,
				eq(schema.emailLog.id, schema.campaignRecipient.emailLogId),
			)
			.where(where),
		db
			.select({
				unsubscribed: sql<number>`count(*) filter (where ${unsubscribedCondition})`,
				bounced: sql<number>`count(*) filter (where ${bouncedCondition})`,
				suppressed: sql<number>`count(*) filter (where ${suppressedCondition})`,
				complained: sql<number>`count(*) filter (where ${complainedCondition})`,
				clicked: sql<number>`count(*) filter (where ${clickedCondition})`,
				all: sql<number>`count(*) filter (where ${anyIssueCondition})`,
			})
			.from(schema.campaignRecipient)
			.leftJoin(
				schema.contact,
				and(
					eq(
						schema.contact.organizationId,
						schema.campaignRecipient.organizationId,
					),
					eq(schema.contact.email, schema.campaignRecipient.email),
					isNull(schema.contact.deletedAt),
				),
			)
			.leftJoin(
				schema.emailLog,
				eq(schema.emailLog.id, schema.campaignRecipient.emailLogId),
			)
			.where(countsWhere),
		db
			.select({ value: sql<number>`count(*)::int` })
			.from(schema.emailEvent)
			.innerJoin(
				schema.campaignRecipient,
				eq(schema.campaignRecipient.emailLogId, schema.emailEvent.emailLogId),
			)
			.where(
				and(
					eq(schema.campaignRecipient.campaignId, params.id),
					eq(schema.campaignRecipient.organizationId, params.organizationId),
					eq(schema.emailEvent.type, "clicked"),
				),
			),
	]);

	const recipients = rows.map(
		({
			recipient,
			contactFirstName,
			contactLastName,
			contactStatus,
			contactSuppressionReason,
			emailLogStatus,
			clickCount,
			uniqueClickCount,
		}) => {
			let category:
				| "unsubscribed"
				| "bounced"
				| "suppressed"
				| "complained"
				| "clicked"
				| undefined;

			if (params.category === "clicked") {
				category = "clicked";
			} else if (
				emailLogStatus === "spam" ||
				contactSuppressionReason === "spam_complaint" ||
				(recipient.error && /spam|complaint|feedback/i.test(recipient.error))
			) {
				category = "complained";
			} else if (
				recipient.skipReason === "unsubscribed" ||
				contactStatus === "unsubscribed"
			) {
				category = "unsubscribed";
			} else if (
				recipient.skipReason === "suppressed" ||
				recipient.skipReason === "blocked"
			) {
				category = "suppressed";
			} else if (
				emailLogStatus === "bounced" ||
				recipient.status === "failed" ||
				(recipient.error && /bounce|oob|expiration/i.test(recipient.error))
			) {
				category = "bounced";
			}

			const contactName =
				[contactFirstName, contactLastName].filter(Boolean).join(" ").trim() ||
				undefined;

			const events = Number(clickCount ?? 0);
			const uniqueLinks = Number(uniqueClickCount ?? 0);
			const hasClicked = Boolean(recipient.clickedAt) || events > 0;

			return toRecipientResponse(recipient, {
				category,
				contactName,
				error: recipient.error,
				clickCount: hasClicked ? Math.max(events, 1) : events,
				uniqueClickCount: hasClicked ? Math.max(uniqueLinks, 1) : uniqueLinks,
			});
		},
	);

	return {
		recipients,
		total: Number(totalRow[0]?.value ?? 0),
		page,
		limit,
		counts: countsRow[0]
			? {
					unsubscribed: Number(countsRow[0].unsubscribed ?? 0),
					bounced: Number(countsRow[0].bounced ?? 0),
					suppressed: Number(countsRow[0].suppressed ?? 0),
					complained: Number(countsRow[0].complained ?? 0),
					clicked: Number(countsRow[0].clicked ?? 0),
					clickedTotal: Number(clickedTotalRow[0]?.value ?? 0),
					all: Number(countsRow[0].all ?? 0),
				}
			: undefined,
	};
}
