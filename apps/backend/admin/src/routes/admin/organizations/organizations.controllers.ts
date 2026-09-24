import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { db } from "@reloop/db/client";
import {
	getDomainAgeDays,
	getDomainInitialDailyCap,
	getRegistrarCreationDate,
} from "@reloop/db/domain-age-cap";
import { utcDayStart } from "@reloop/db/reserve-send-credits";
import {
	adminAuditLog,
	apikey,
	domain,
	emailLog,
	mailbox,
	member,
	organization,
	organizationCredits,
	organizationPlan,
	supportConversation,
	template,
	user,
	webhook,
} from "@reloop/db/schema";
import {
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	or,
	sql,
} from "drizzle-orm";
import { createError } from "evlog";

export async function listOrganizationsController({
	limit = 50,
	offset = 0,
	q,
	status,
	plan,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: "active" | "suspended" | "deleted";
	plan?: "free" | "individual" | "startup" | "enterprise";
}) {
	const conditions = [];
	if (status) conditions.push(eq(organization.status, status));
	if (q) {
		conditions.push(
			or(
				ilike(organization.name, `%${q}%`),
				ilike(organization.slug, `%${q}%`),
			)!,
		);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// total count – handle plan filter with join when needed
	let totalRow: { value: number } | undefined;
	if (plan) {
		const planCondition =
			plan === "free"
				? or(
						eq(organizationPlan.planId, "free"),
						sql`${organizationPlan.planId} IS NULL`,
					)!
				: eq(organizationPlan.planId, plan);
		const [row] = await db
			.select({ value: count() })
			.from(organization)
			.leftJoin(
				organizationPlan,
				eq(organizationPlan.organizationId, organization.id),
			)
			.where(whereClause ? and(whereClause, planCondition) : planCondition);
		totalRow = row;
	} else {
		const [row] = await db
			.select({ value: count() })
			.from(organization)
			.where(whereClause);
		totalRow = row;
	}

	const planCondition = plan
		? plan === "free"
			? or(
					eq(organizationPlan.planId, "free"),
					sql`${organizationPlan.planId} IS NULL`,
				)!
			: eq(organizationPlan.planId, plan)
		: undefined;
	const orgsWhere = whereClause
		? planCondition
			? and(whereClause, planCondition)
			: whereClause
		: planCondition;

	const orgs = await db
		.select({
			id: organization.id,
			name: organization.name,
			slug: organization.slug,
			status: organization.status,
			createdAt: organization.createdAt,
			billingEmail: organization.billingEmail,
			creditsRemaining: organizationCredits.creditsRemaining,
			planId: organizationPlan.planId,
		})
		.from(organization)
		.leftJoin(
			organizationCredits,
			eq(organizationCredits.organizationId, organization.id),
		)
		.leftJoin(
			organizationPlan,
			eq(organizationPlan.organizationId, organization.id),
		)
		.where(orgsWhere)
		.orderBy(desc(organization.createdAt))
		.limit(limit)
		.offset(offset);

	const orgIds = orgs.map((o) => o.id);

	const memberCounts =
		orgIds.length === 0
			? []
			: await db
					.select({
						organizationId: member.organizationId,
						value: count(),
					})
					.from(member)
					.where(inArray(member.organizationId, orgIds))
					.groupBy(member.organizationId);

	const domainCounts =
		orgIds.length === 0
			? []
			: await db
					.select({
						organizationId: domain.organizationId,
						value: count(),
					})
					.from(domain)
					.where(
						and(
							sql`${domain.deletedAt} IS NULL`,
							inArray(domain.organizationId, orgIds),
						),
					)
					.groupBy(domain.organizationId);

	const memberMap = new Map(
		memberCounts.map((row) => [row.organizationId, row.value]),
	);
	const domainMap = new Map(
		domainCounts.map((row) => [row.organizationId, row.value]),
	);

	return {
		items: orgs.map((o) => ({
			id: o.id,
			name: o.name,
			slug: o.slug,
			status: o.status,
			createdAt: o.createdAt,
			billingEmail: o.billingEmail ?? null,
			memberCount: memberMap.get(o.id) ?? 0,
			domainCount: domainMap.get(o.id) ?? 0,
			creditsRemaining: o.creditsRemaining ?? null,
			planId: o.planId ?? null,
		})),
		total: totalRow?.value ?? 0,
	};
}

export async function getOrganizationController(organizationId: string) {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const countByStatus = async (
		since: Date,
		status: "sent" | "failed" | "bounced" | "delivered",
	) => {
		const [row] = await db
			.select({ value: count() })
			.from(emailLog)
			.where(
				and(
					eq(emailLog.organizationId, organizationId),
					eq(emailLog.status, status),
					gte(emailLog.createdAt, since),
				),
			);
		return row?.value ?? 0;
	};

	const [
		members,
		domains,
		credits,
		plan,
		apiKeys,
		templates,
		webhooks,
		mailboxes,
		recentEmails,
		supportThreads,
		recentAuditRows,
		[apiKeyCount],
		[templateCount],
		[webhookCount],
		[mailboxCount],
		[emailTotal],
		sentToday,
		failedToday,
		bouncedToday,
		deliveredToday,
		sentWeek,
		failedWeek,
		bouncedWeek,
		deliveredWeek,
	] = await Promise.all([
		db
			.select({
				id: member.id,
				role: member.role,
				userId: member.userId,
				userName: user.name,
				userEmail: user.email,
				userImage: user.image,
				userBanned: user.banned,
				userRole: user.role,
				createdAt: member.createdAt,
			})
			.from(member)
			.innerJoin(user, eq(member.userId, user.id))
			.where(eq(member.organizationId, organizationId))
			.orderBy(desc(member.createdAt)),
		db
			.select({
				id: domain.id,
				domain: domain.domain,
				status: domain.status,
				systemVerified: domain.systemVerified,
				createdAt: domain.createdAt,
			})
			.from(domain)
			.where(
				and(
					eq(domain.organizationId, organizationId),
					sql`${domain.deletedAt} IS NULL`,
				),
			)
			.orderBy(desc(domain.createdAt)),
		db.query.organizationCredits.findFirst({
			where: eq(organizationCredits.organizationId, organizationId),
		}),
		db.query.organizationPlan.findFirst({
			where: eq(organizationPlan.organizationId, organizationId),
		}),
		db
			.select({
				id: apikey.id,
				name: apikey.name,
				prefix: apikey.prefix,
				start: apikey.start,
				enabled: apikey.enabled,
				userId: apikey.userId,
				userEmail: user.email,
				requestCount: apikey.requestCount,
				lastRequest: apikey.lastRequest,
				expiresAt: apikey.expiresAt,
				createdAt: apikey.createdAt,
			})
			.from(apikey)
			.innerJoin(user, eq(apikey.userId, user.id))
			.where(eq(apikey.organizationId, organizationId))
			.orderBy(desc(apikey.createdAt))
			.limit(100),
		db
			.select({
				id: template.id,
				name: template.name,
				status: template.status,
				subject: template.subject,
				fromEmail: template.fromEmail,
				currentVersion: template.currentVersion,
				updatedAt: template.updatedAt,
				createdAt: template.createdAt,
			})
			.from(template)
			.where(
				and(
					eq(template.organizationId, organizationId),
					sql`${template.deletedAt} IS NULL`,
				),
			)
			.orderBy(desc(template.updatedAt))
			.limit(100),
		db
			.select({
				id: webhook.id,
				name: webhook.name,
				url: webhook.url,
				status: webhook.status,
				createdAt: webhook.createdAt,
				updatedAt: webhook.updatedAt,
			})
			.from(webhook)
			.where(eq(webhook.organizationId, organizationId))
			.orderBy(desc(webhook.createdAt))
			.limit(100),
		db
			.select({
				id: mailbox.id,
				email: mailbox.email,
				displayName: mailbox.displayName,
				status: mailbox.status,
				domain: domain.domain,
				createdAt: mailbox.createdAt,
			})
			.from(mailbox)
			.leftJoin(domain, eq(mailbox.domainId, domain.id))
			.where(eq(mailbox.organizationId, organizationId))
			.orderBy(desc(mailbox.createdAt))
			.limit(10),
		db
			.select({
				id: emailLog.id,
				fromEmail: emailLog.fromEmail,
				toEmails: emailLog.toEmails,
				subject: emailLog.subject,
				status: emailLog.status,
				attachments: emailLog.attachments,
				createdAt: emailLog.createdAt,
				sentAt: emailLog.sentAt,
			})
			.from(emailLog)
			.where(eq(emailLog.organizationId, organizationId))
			.orderBy(desc(emailLog.createdAt))
			.limit(40),
		db
			.select({
				id: supportConversation.id,
				userId: supportConversation.userId,
				status: supportConversation.status,
				lastMessageAt: supportConversation.lastMessageAt,
				lastMessagePreview: supportConversation.lastMessagePreview,
				createdAt: supportConversation.createdAt,
				userName: user.name,
				userEmail: user.email,
			})
			.from(supportConversation)
			.leftJoin(user, eq(supportConversation.userId, user.id))
			.where(eq(supportConversation.organizationId, organizationId))
			.orderBy(desc(supportConversation.lastMessageAt))
			.limit(30),
		db
			.select({
				id: adminAuditLog.id,
				actorUserId: adminAuditLog.actorUserId,
				actorEmail: user.email,
				actorName: user.name,
				action: adminAuditLog.action,
				resourceType: adminAuditLog.resourceType,
				resourceId: adminAuditLog.resourceId,
				metadata: adminAuditLog.metadata,
				createdAt: adminAuditLog.createdAt,
			})
			.from(adminAuditLog)
			.leftJoin(user, eq(adminAuditLog.actorUserId, user.id))
			.where(eq(adminAuditLog.organizationId, organizationId))
			.orderBy(desc(adminAuditLog.createdAt))
			.limit(40),
		db
			.select({ value: count() })
			.from(apikey)
			.where(eq(apikey.organizationId, organizationId)),
		db
			.select({ value: count() })
			.from(template)
			.where(
				and(
					eq(template.organizationId, organizationId),
					sql`${template.deletedAt} IS NULL`,
				),
			),
		db
			.select({ value: count() })
			.from(webhook)
			.where(eq(webhook.organizationId, organizationId)),
		db.select({ value: count() }).from(mailbox).where(eq(mailbox.organizationId, organizationId)),
		db
			.select({ value: count() })
			.from(emailLog)
			.where(eq(emailLog.organizationId, organizationId)),
		countByStatus(startOfDay, "sent"),
		countByStatus(startOfDay, "failed"),
		countByStatus(startOfDay, "bounced"),
		countByStatus(startOfDay, "delivered"),
		countByStatus(sevenDaysAgo, "sent"),
		countByStatus(sevenDaysAgo, "failed"),
		countByStatus(sevenDaysAgo, "bounced"),
		countByStatus(sevenDaysAgo, "delivered"),
	]);

	const emailStats = {
		today: {
			sent: sentToday,
			failed: failedToday,
			bounced: bouncedToday,
			delivered: deliveredToday,
		},
		week: {
			sent: sentWeek,
			failed: failedWeek,
			bounced: bouncedWeek,
			delivered: deliveredWeek,
		},
	};

	// ── Per-domain warmup / daily cap (all plans) ─────────────────────────
	const dayStart = utcDayStart(new Date());
	const domainIds = domains.map((d) => d.id);
	const sentByDomainRows =
		domainIds.length === 0
			? []
			: await db
					.select({ domainId: emailLog.domainId, value: count() })
					.from(emailLog)
					.where(and(inArray(emailLog.domainId, domainIds), gte(emailLog.createdAt, dayStart)))
					.groupBy(emailLog.domainId);
	const sentByDomain = new Map(sentByDomainRows.map((r) => [r.domainId, r.value]));
	const enrichedDomains = await Promise.all(
		domains.map(async (d) => {
			const registrarCreatedAtStr = await getRegistrarCreationDate(d.domain);
			const ageDays = registrarCreatedAtStr
				? getDomainAgeDays(new Date(registrarCreatedAtStr), new Date())
				: getDomainAgeDays(d.createdAt, new Date());
			const dailyCap = getDomainInitialDailyCap(ageDays);
			const sentTodayForDomain = sentByDomain.get(d.id) ?? 0;
			const remaining = dailyCap === null ? null : Math.max(0, dailyCap - sentTodayForDomain);
			return {
				...d,
				registrarCreatedAt: registrarCreatedAtStr ? new Date(registrarCreatedAtStr) : null,
				ageDays,
				dailyCap,
				sentToday: sentTodayForDomain,
				remaining,
				source: registrarCreatedAtStr ? "rdap" : "reloop",
			};
		}),
	);

	return {
		id: org.id,
		name: org.name,
		slug: org.slug,
		status: org.status,
		createdAt: org.createdAt,
		updatedAt: org.updatedAt,
		billingEmail: org.billingEmail ?? null,
		billingName: org.billingName ?? null,
		logo: org.logo ?? null,
		externalCustomerId: org.externalCustomerId ?? null,
		counts: {
			members: members.length,
			domains: domains.length,
			apiKeys: apiKeyCount?.value ?? 0,
			templates: templateCount?.value ?? 0,
			webhooks: webhookCount?.value ?? 0,
			mailboxes: mailboxCount?.value ?? 0,
			emails: emailTotal?.value ?? 0,
			supportThreads: supportThreads.length,
		},
		emailStats,
		credits: credits
			? {
					creditsUsed: credits.creditsUsed,
					creditsRemaining: credits.creditsRemaining,
					monthlyCredits: credits.monthlyCredits,
					status: credits.status,
					currentPeriodStart: credits.currentPeriodStart,
					currentPeriodEnd: credits.currentPeriodEnd,
				}
			: null,
		plan: plan
			? {
					planId: plan.planId,
					monthlyEmails: plan.monthlyEmails,
					dailyEmailLimit: plan.dailyEmailLimit,
					overageEnabled: plan.overageEnabled,
					maxAgentInboxes: plan.maxAgentInboxes,
					maxWebhooks: plan.maxWebhooks,
					maxCustomDomains: plan.maxCustomDomains,
					maxAttachmentBytes: plan.maxAttachmentBytes,
					dataRetentionDays: plan.dataRetentionDays,
					dedicatedIpCount: plan.dedicatedIpCount,
				}
			: null,
		members: members.map((m) => ({
			id: m.id,
			role: m.role,
			userId: m.userId,
			userName: m.userName,
			userEmail: m.userEmail,
			userImage: m.userImage ?? null,
			userBanned: m.userBanned ?? false,
			userRole: m.userRole,
			createdAt: m.createdAt,
		})),
		domains: enrichedDomains,
		apiKeys: apiKeys.map((k) => ({
			id: k.id,
			name: k.name ?? null,
			prefix: k.prefix ?? null,
			start: k.start ?? null,
			enabled: k.enabled,
			userId: k.userId,
			userEmail: k.userEmail,
			requestCount: k.requestCount,
			lastRequest: k.lastRequest ?? null,
			expiresAt: k.expiresAt ?? null,
			createdAt: k.createdAt,
		})),
		templates: templates.map((t) => ({
			id: t.id,
			name: t.name,
			status: t.status,
			subject: t.subject ?? null,
			fromEmail: t.fromEmail ?? null,
			currentVersion: t.currentVersion ?? 1,
			updatedAt: t.updatedAt,
			createdAt: t.createdAt,
		})),
		webhooks: webhooks.map((w) => ({
			id: w.id,
			name: w.name,
			url: w.url,
			status: w.status,
			createdAt: w.createdAt,
			updatedAt: w.updatedAt,
		})),
		mailboxes: mailboxes.map((m) => ({
			id: m.id,
			email: m.email,
			displayName: m.displayName ?? null,
			status: m.status,
			domain: m.domain ?? null,
			createdAt: m.createdAt,
		})),
		recentEmails: recentEmails.map((e) => ({
			id: e.id,
			fromEmail: e.fromEmail,
			toEmails: e.toEmails,
			subject: e.subject,
			status: e.status,
			createdAt: e.createdAt,
			sentAt: e.sentAt ?? null,
			attachments: (e.attachments ?? []).map((att) => ({
				id: att.id,
				filename: att.filename,
				contentType: att.contentType,
				size: att.size,
				storagePath: att.storagePath,
				contentDisposition: att.contentDisposition ?? null,
				contentId: att.contentId ?? null,
			})),
		})),
		supportConversations: supportThreads.map((t) => ({
			id: t.id,
			userId: t.userId,
			status: t.status,
			lastMessageAt: t.lastMessageAt,
			lastMessagePreview: t.lastMessagePreview ?? null,
			createdAt: t.createdAt,
			userName: t.userName ?? null,
			userEmail: t.userEmail ?? null,
		})),
		recentAudit: recentAuditRows.map((row) => ({
			id: row.id,
			actorUserId: row.actorUserId,
			actorEmail: row.actorEmail ?? null,
			actorName: row.actorName ?? null,
			action: row.action,
			resourceType: row.resourceType,
			resourceId: row.resourceId ?? null,
			metadata: row.metadata ?? null,
			createdAt: row.createdAt,
		})),
	};
}

export async function updateOrganizationStatusController({
	organizationId,
	status,
	reason,
	actorUserId,
}: {
	organizationId: string;
	status: "active" | "suspended" | "deleted";
	reason?: string;
	actorUserId: string;
}) {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	await db
		.update(organization)
		.set({ status, updatedAt: new Date() })
		.where(eq(organization.id, organizationId));

	await writeAdminAudit({
		actorUserId,
		action: `organization.${status}`,
		resourceType: "organization",
		resourceId: organizationId,
		organizationId,
		metadata: { previousStatus: org.status, reason },
	});

	return { success: true };
}
