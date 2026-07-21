import { t } from "elysia";

export namespace AdminModel {
	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
		why: t.String(),
		fix: t.String(),
	});

	export const paginationQuery = t.Object({
		limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
		offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
		q: t.Optional(t.String()),
	});

	export const overviewAttentionItem = t.Object({
		id: t.String(),
		severity: t.Union([
			t.Literal("critical"),
			t.Literal("warning"),
			t.Literal("info"),
		]),
		title: t.String(),
		description: t.String(),
		href: t.String(),
		count: t.Number(),
	});

	export const overviewRecentAuditItem = t.Object({
		id: t.String(),
		actorUserId: t.String(),
		actorEmail: t.Union([t.String(), t.Null()]),
		actorName: t.Union([t.String(), t.Null()]),
		action: t.String(),
		resourceType: t.String(),
		resourceId: t.Union([t.String(), t.Null()]),
		organizationId: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
	});

	export const overviewResponse = t.Object({
		users: t.Number(),
		organizations: t.Object({
			total: t.Number(),
			active: t.Number(),
			suspended: t.Number(),
		}),
		domains: t.Object({
			total: t.Number(),
			active: t.Number(),
			failed: t.Number(),
			suspended: t.Number(),
		}),
		emails: t.Object({
			sentToday: t.Number(),
			bouncedToday: t.Number(),
			failedToday: t.Number(),
		}),
		credits: t.Object({
			totalRemaining: t.Number(),
		}),
		support: t.Object({
			openConversations: t.Number(),
			unreadMessages: t.Number(),
		}),
		attention: t.Array(overviewAttentionItem),
		recentAudit: t.Array(overviewRecentAuditItem),
	});

	export const searchUserItem = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String(),
		banned: t.Boolean(),
	});

	export const searchOrganizationItem = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		status: t.String(),
	});

	export const searchDomainItem = t.Object({
		id: t.String(),
		domain: t.String(),
		status: t.String(),
		organizationId: t.String(),
		organizationName: t.String(),
	});

	export const searchResponse = t.Object({
		users: t.Array(searchUserItem),
		organizations: t.Array(searchOrganizationItem),
		domains: t.Array(searchDomainItem),
	});

	export const userDetail = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		image: t.Union([t.String(), t.Null()]),
		role: t.String(),
		banned: t.Boolean(),
		banReason: t.Union([t.String(), t.Null()]),
		banExpires: t.Union([t.Date(), t.Null()]),
		emailVerified: t.Boolean(),
		activeOrganizationId: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
		updatedAt: t.Date(),
		organizations: t.Array(
			t.Object({
				memberId: t.String(),
				role: t.String(),
				joinedAt: t.Date(),
				id: t.String(),
				name: t.String(),
				slug: t.String(),
				status: t.String(),
				billingEmail: t.Union([t.String(), t.Null()]),
				domainCount: t.Number(),
				creditsRemaining: t.Union([t.Number(), t.Null()]),
				creditsUsed: t.Union([t.Number(), t.Null()]),
				monthlyCredits: t.Union([t.Number(), t.Null()]),
			}),
		),
		apiKeys: t.Array(
			t.Object({
				id: t.String(),
				name: t.Union([t.String(), t.Null()]),
				prefix: t.Union([t.String(), t.Null()]),
				start: t.Union([t.String(), t.Null()]),
				enabled: t.Boolean(),
				organizationId: t.String(),
				organizationName: t.String(),
				requestCount: t.Number(),
				lastRequest: t.Union([t.Date(), t.Null()]),
				expiresAt: t.Union([t.Date(), t.Null()]),
				createdAt: t.Date(),
			}),
		),
		supportConversations: t.Array(
			t.Object({
				id: t.String(),
				status: t.Union([t.Literal("open"), t.Literal("closed")]),
				organizationId: t.Union([t.String(), t.Null()]),
				lastMessageAt: t.Date(),
				lastMessagePreview: t.Union([t.String(), t.Null()]),
				createdAt: t.Date(),
			}),
		),
	});

	export const organizationItem = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		status: t.String(),
		createdAt: t.Date(),
		billingEmail: t.Union([t.String(), t.Null()]),
		memberCount: t.Number(),
		domainCount: t.Number(),
		creditsRemaining: t.Union([t.Number(), t.Null()]),
	});

	export const organizationsResponse = t.Object({
		items: t.Array(organizationItem),
		total: t.Number(),
	});

	export const organizationDetail = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		status: t.String(),
		createdAt: t.Date(),
		updatedAt: t.Date(),
		billingEmail: t.Union([t.String(), t.Null()]),
		billingName: t.Union([t.String(), t.Null()]),
		logo: t.Union([t.String(), t.Null()]),
		externalCustomerId: t.Union([t.String(), t.Null()]),
		counts: t.Object({
			members: t.Number(),
			domains: t.Number(),
			apiKeys: t.Number(),
			templates: t.Number(),
			webhooks: t.Number(),
			emails: t.Number(),
			supportThreads: t.Number(),
		}),
		emailStats: t.Object({
			today: t.Object({
				sent: t.Number(),
				failed: t.Number(),
				bounced: t.Number(),
				delivered: t.Number(),
			}),
			week: t.Object({
				sent: t.Number(),
				failed: t.Number(),
				bounced: t.Number(),
				delivered: t.Number(),
			}),
		}),
		credits: t.Union([
			t.Object({
				creditsUsed: t.Number(),
				creditsRemaining: t.Number(),
				monthlyCredits: t.Number(),
				status: t.String(),
				currentPeriodStart: t.Date(),
				currentPeriodEnd: t.Date(),
			}),
			t.Null(),
		]),
		members: t.Array(
			t.Object({
				id: t.String(),
				role: t.String(),
				userId: t.String(),
				userName: t.String(),
				userEmail: t.String(),
				userImage: t.Union([t.String(), t.Null()]),
				userBanned: t.Boolean(),
				userRole: t.String(),
				createdAt: t.Date(),
			}),
		),
		domains: t.Array(
			t.Object({
				id: t.String(),
				domain: t.String(),
				status: t.String(),
				systemVerified: t.Boolean(),
				createdAt: t.Date(),
			}),
		),
		apiKeys: t.Array(
			t.Object({
				id: t.String(),
				name: t.Union([t.String(), t.Null()]),
				prefix: t.Union([t.String(), t.Null()]),
				start: t.Union([t.String(), t.Null()]),
				enabled: t.Boolean(),
				userId: t.String(),
				userEmail: t.String(),
				requestCount: t.Number(),
				lastRequest: t.Union([t.Date(), t.Null()]),
				expiresAt: t.Union([t.Date(), t.Null()]),
				createdAt: t.Date(),
			}),
		),
		templates: t.Array(
			t.Object({
				id: t.String(),
				name: t.String(),
				status: t.String(),
				subject: t.Union([t.String(), t.Null()]),
				fromEmail: t.Union([t.String(), t.Null()]),
				currentVersion: t.Number(),
				updatedAt: t.Date(),
				createdAt: t.Date(),
			}),
		),
		webhooks: t.Array(
			t.Object({
				id: t.String(),
				name: t.String(),
				url: t.String(),
				status: t.String(),
				createdAt: t.Date(),
				updatedAt: t.Date(),
			}),
		),
		recentEmails: t.Array(
			t.Object({
				id: t.String(),
				fromEmail: t.String(),
				toEmails: t.Any(),
				subject: t.String(),
				status: t.String(),
				createdAt: t.Date(),
				sentAt: t.Union([t.Date(), t.Null()]),
			}),
		),
		supportConversations: t.Array(
			t.Object({
				id: t.String(),
				userId: t.String(),
				status: t.Union([t.Literal("open"), t.Literal("closed")]),
				lastMessageAt: t.Date(),
				lastMessagePreview: t.Union([t.String(), t.Null()]),
				createdAt: t.Date(),
				userName: t.Union([t.String(), t.Null()]),
				userEmail: t.Union([t.String(), t.Null()]),
			}),
		),
		recentAudit: t.Array(
			t.Object({
				id: t.String(),
				actorUserId: t.String(),
				actorEmail: t.Union([t.String(), t.Null()]),
				actorName: t.Union([t.String(), t.Null()]),
				action: t.String(),
				resourceType: t.String(),
				resourceId: t.Union([t.String(), t.Null()]),
				metadata: t.Any(),
				createdAt: t.Date(),
			}),
		),
	});

	export const updateOrgStatusBody = t.Object({
		status: t.Union([
			t.Literal("active"),
			t.Literal("suspended"),
			t.Literal("deleted"),
		]),
		reason: t.Optional(t.String()),
	});

	export const domainItem = t.Object({
		id: t.String(),
		domain: t.String(),
		status: t.String(),
		organizationId: t.String(),
		organizationName: t.String(),
		systemVerified: t.Boolean(),
		createdAt: t.Date(),
	});

	export const domainsResponse = t.Object({
		items: t.Array(domainItem),
		total: t.Number(),
	});

	export const updateDomainStatusBody = t.Object({
		status: t.Union([
			t.Literal("pending"),
			t.Literal("verifying"),
			t.Literal("active"),
			t.Literal("suspended"),
			t.Literal("failed"),
		]),
		reason: t.Optional(t.String()),
	});

	export const creditsBalance = t.Object({
		organizationId: t.String(),
		organizationName: t.String(),
		creditsUsed: t.Number(),
		creditsRemaining: t.Number(),
		monthlyCredits: t.Number(),
		status: t.String(),
		currentPeriodStart: t.Date(),
		currentPeriodEnd: t.Date(),
	});

	export const ledgerItem = t.Object({
		id: t.String(),
		entryType: t.String(),
		delta: t.Number(),
		balanceAfter: t.Number(),
		reason: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
	});

	export const creditsDetailResponse = t.Object({
		balance: t.Union([creditsBalance, t.Null()]),
		ledger: t.Array(ledgerItem),
	});

	export const topupBody = t.Object({
		organizationId: t.String(),
		amount: t.Number({ exclusiveMinimum: 0 }),
		reason: t.Optional(t.String()),
	});

	export const topupResponse = t.Object({
		success: t.Boolean(),
	});

	export const emailItem = t.Object({
		id: t.String(),
		organizationId: t.String(),
		fromEmail: t.String(),
		toEmails: t.Any(),
		subject: t.String(),
		status: t.String(),
		createdAt: t.Date(),
		sentAt: t.Union([t.Date(), t.Null()]),
	});

	export const emailsResponse = t.Object({
		items: t.Array(emailItem),
		total: t.Number(),
	});

	export const auditItem = t.Object({
		id: t.String(),
		actorUserId: t.String(),
		actorEmail: t.Union([t.String(), t.Null()]),
		actorName: t.Union([t.String(), t.Null()]),
		action: t.String(),
		resourceType: t.String(),
		resourceId: t.Union([t.String(), t.Null()]),
		organizationId: t.Union([t.String(), t.Null()]),
		metadata: t.Any(),
		createdAt: t.Date(),
	});

	export const auditResponse = t.Object({
		items: t.Array(auditItem),
		total: t.Number(),
	});

	export const successResponse = t.Object({
		success: t.Boolean(),
	});

	export const supportMessage = t.Object({
		id: t.String(),
		conversationId: t.String(),
		senderUserId: t.String(),
		senderRole: t.Union([t.Literal("user"), t.Literal("admin")]),
		body: t.String(),
		createdAt: t.Date(),
		senderName: t.Union([t.String(), t.Null()]),
		senderEmail: t.Union([t.String(), t.Null()]),
		senderImage: t.Union([t.String(), t.Null()]),
	});

	export const supportConversation = t.Object({
		id: t.String(),
		userId: t.String(),
		organizationId: t.Union([t.String(), t.Null()]),
		status: t.Union([t.Literal("open"), t.Literal("closed")]),
		lastMessageAt: t.Date(),
		lastMessagePreview: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
		updatedAt: t.Date(),
		userName: t.Union([t.String(), t.Null()]),
		userEmail: t.Union([t.String(), t.Null()]),
		userImage: t.Union([t.String(), t.Null()]),
		userLastReadAt: t.Union([t.Date(), t.Null()]),
		adminLastReadAt: t.Union([t.Date(), t.Null()]),
		unreadCount: t.Number(),
	});

	export const supportConversationWithMessages = t.Object({
		conversation: supportConversation,
		messages: t.Array(supportMessage),
	});

	export const supportMyConversationResponse = t.Object({
		conversation: t.Union([supportConversation, t.Null()]),
		messages: t.Array(supportMessage),
	});

	export const supportConversationsResponse = t.Object({
		items: t.Array(supportConversation),
		total: t.Number(),
	});

	export const supportMessagesResponse = t.Object({
		items: t.Array(supportMessage),
		total: t.Number(),
	});

	export const supportUnreadCountResponse = t.Object({
		count: t.Number(),
	});

	export const updateSupportStatusBody = t.Object({
		status: t.Union([t.Literal("open"), t.Literal("closed")]),
	});

	export const createSupportMessageBody = t.Object({
		body: t.String({ minLength: 1, maxLength: 4000 }),
	});
}
