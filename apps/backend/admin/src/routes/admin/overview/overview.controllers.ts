import { db } from "@reloop/db/client";
import {
	adminAuditLog,
	domain,
	emailLog,
	organization,
	organizationCredits,
	supportConversation,
	supportMessage,
	user,
} from "@reloop/db/schema";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

type AttentionSeverity = "critical" | "warning" | "info";

type AttentionItem = {
	id: string;
	severity: AttentionSeverity;
	title: string;
	description: string;
	href: string;
	count: number;
};

export async function getOverviewController() {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const [
		[usersCount],
		[orgsTotal],
		[orgsActive],
		[orgsSuspended],
		[domainsTotal],
		[domainsActive],
		[domainsFailed],
		[domainsSuspended],
		[emailsSentToday],
		[emailsBouncedToday],
		[emailsFailedToday],
		[creditsSum],
		[openSupport],
		[supportUnread],
		[lowCreditOrgs],
		recentAuditRows,
	] = await Promise.all([
		db.select({ value: count() }).from(user),
		db.select({ value: count() }).from(organization),
		db
			.select({ value: count() })
			.from(organization)
			.where(eq(organization.status, "active")),
		db
			.select({ value: count() })
			.from(organization)
			.where(eq(organization.status, "suspended")),
		db
			.select({ value: count() })
			.from(domain)
			.where(sql`${domain.deletedAt} IS NULL`),
		db
			.select({ value: count() })
			.from(domain)
			.where(
				and(eq(domain.status, "active"), sql`${domain.deletedAt} IS NULL`),
			),
		db
			.select({ value: count() })
			.from(domain)
			.where(
				and(eq(domain.status, "failed"), sql`${domain.deletedAt} IS NULL`),
			),
		db
			.select({ value: count() })
			.from(domain)
			.where(
				and(eq(domain.status, "suspended"), sql`${domain.deletedAt} IS NULL`),
			),
		db
			.select({ value: count() })
			.from(emailLog)
			.where(gte(emailLog.createdAt, startOfDay)),
		db
			.select({ value: count() })
			.from(emailLog)
			.where(
				and(
					eq(emailLog.status, "bounced"),
					gte(emailLog.createdAt, startOfDay),
				),
			),
		db
			.select({ value: count() })
			.from(emailLog)
			.where(
				and(eq(emailLog.status, "failed"), gte(emailLog.createdAt, startOfDay)),
			),
		db
			.select({
				value: sql<number>`coalesce(sum(${organizationCredits.creditsRemaining}), 0)`,
			})
			.from(organizationCredits),
		db
			.select({ value: count() })
			.from(supportConversation)
			.where(eq(supportConversation.status, "open")),
		db
			.select({
				value: sql<number>`coalesce(sum(
					(select count(*)::int from ${supportMessage}
					 where ${supportMessage.conversationId} = ${supportConversation.id}
					   and ${supportMessage.senderRole} = 'user'
					   and (
					     ${supportConversation.adminLastReadAt} is null
					     or ${supportMessage.createdAt} > ${supportConversation.adminLastReadAt}
					   )
					)
				), 0)`,
			})
			.from(supportConversation)
			.where(eq(supportConversation.status, "open")),
		db
			.select({ value: count() })
			.from(organizationCredits)
			.innerJoin(
				organization,
				eq(organization.id, organizationCredits.organizationId),
			)
			.where(
				and(
					eq(organization.status, "active"),
					lte(organizationCredits.creditsRemaining, 100),
				),
			),
		db
			.select({
				id: adminAuditLog.id,
				actorUserId: adminAuditLog.actorUserId,
				actorEmail: user.email,
				actorName: user.name,
				action: adminAuditLog.action,
				resourceType: adminAuditLog.resourceType,
				resourceId: adminAuditLog.resourceId,
				organizationId: adminAuditLog.organizationId,
				createdAt: adminAuditLog.createdAt,
			})
			.from(adminAuditLog)
			.leftJoin(user, eq(adminAuditLog.actorUserId, user.id))
			.orderBy(desc(adminAuditLog.createdAt))
			.limit(8),
	]);

	const domainsFailedCount = domainsFailed?.value ?? 0;
	const domainsSuspendedCount = domainsSuspended?.value ?? 0;
	const emailsBounced = emailsBouncedToday?.value ?? 0;
	const emailsFailed = emailsFailedToday?.value ?? 0;
	const orgsSuspendedCount = orgsSuspended?.value ?? 0;
	const openSupportCount = openSupport?.value ?? 0;
	const supportUnreadCount = Number(supportUnread?.value ?? 0);
	const lowCreditCount = lowCreditOrgs?.value ?? 0;

	const attention: AttentionItem[] = [];

	if (supportUnreadCount > 0) {
		attention.push({
			id: "support-unread",
			severity: "critical",
			title: "Unread support messages",
			description: "Customers are waiting for a reply.",
			href: "/support",
			count: supportUnreadCount,
		});
	} else if (openSupportCount > 0) {
		attention.push({
			id: "support-open",
			severity: "info",
			title: "Open support conversations",
			description: "Active threads that may need follow-up.",
			href: "/support",
			count: openSupportCount,
		});
	}

	if (domainsFailedCount > 0) {
		attention.push({
			id: "domains-failed",
			severity: "critical",
			title: "Failed domains",
			description: "DNS or verification failures blocking sending.",
			href: "/domains?status=failed",
			count: domainsFailedCount,
		});
	}

	if (emailsFailed > 0) {
		attention.push({
			id: "emails-failed",
			severity: "warning",
			title: "Failed emails today",
			description: "Delivery failures across the platform.",
			href: "/emails?status=failed",
			count: emailsFailed,
		});
	}

	if (emailsBounced > 0) {
		attention.push({
			id: "emails-bounced",
			severity: "warning",
			title: "Bounced emails today",
			description: "Review bounce rate and suppression health.",
			href: "/emails?status=bounced",
			count: emailsBounced,
		});
	}

	if (domainsSuspendedCount > 0) {
		attention.push({
			id: "domains-suspended",
			severity: "info",
			title: "Suspended domains",
			description: "Domains currently blocked from sending.",
			href: "/domains?status=suspended",
			count: domainsSuspendedCount,
		});
	}

	if (orgsSuspendedCount > 0) {
		attention.push({
			id: "orgs-suspended",
			severity: "info",
			title: "Suspended organizations",
			description: "Accounts currently suspended by admins.",
			href: "/organizations?status=suspended",
			count: orgsSuspendedCount,
		});
	}

	if (lowCreditCount > 0) {
		attention.push({
			id: "credits-low",
			severity: "warning",
			title: "Low credit balances",
			description: "Active orgs with ≤100 credits remaining.",
			href: "/organizations",
			count: lowCreditCount,
		});
	}

	return {
		users: usersCount?.value ?? 0,
		organizations: {
			total: orgsTotal?.value ?? 0,
			active: orgsActive?.value ?? 0,
			suspended: orgsSuspendedCount,
		},
		domains: {
			total: domainsTotal?.value ?? 0,
			active: domainsActive?.value ?? 0,
			failed: domainsFailedCount,
			suspended: domainsSuspendedCount,
		},
		emails: {
			sentToday: emailsSentToday?.value ?? 0,
			bouncedToday: emailsBounced,
			failedToday: emailsFailed,
		},
		credits: {
			totalRemaining: Number(creditsSum?.value ?? 0),
		},
		support: {
			openConversations: openSupportCount,
			unreadMessages: supportUnreadCount,
		},
		attention,
		recentAudit: recentAuditRows.map((row) => ({
			id: row.id,
			actorUserId: row.actorUserId,
			actorEmail: row.actorEmail ?? null,
			actorName: row.actorName ?? null,
			action: row.action,
			resourceType: row.resourceType,
			resourceId: row.resourceId ?? null,
			organizationId: row.organizationId ?? null,
			createdAt: row.createdAt,
		})),
	};
}
