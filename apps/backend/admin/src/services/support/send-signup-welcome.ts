import { adminConfig } from "@reloop/admin/admin.config";
import {
	createMessageController,
	getMyConversationController,
	getOrCreateMyConversationController,
} from "@reloop/admin/routes/admin/support/support.controllers";
import { broadcastConversationUpdate } from "@reloop/admin/routes/admin/support/support.rooms";
import {
	conversationAlreadyWelcomed,
	pickWelcomeSender,
	SIGNUP_WELCOME_SUPPORT_MESSAGE,
} from "@reloop/admin/services/support/signup-welcome";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { db } from "@reloop/db/client";
import { user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

async function userForEmail(email: string): Promise<{ id: string } | null> {
	const [found] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email.toLowerCase()))
		.limit(1);
	return found ?? null;
}

async function firstSuperAdmin(): Promise<{ id: string } | null> {
	const [found] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.role, PLATFORM_ADMIN_ROLE))
		.orderBy(user.createdAt)
		.limit(1);
	return found ?? null;
}

async function resolveWelcomeSenderId(): Promise<string | null> {
	const configuredEmail = adminConfig.SUPPORT_WELCOME_SENDER_EMAIL;
	const sender = pickWelcomeSender({
		configuredEmail,
		userForConfiguredEmail: configuredEmail
			? await userForEmail(configuredEmail)
			: null,
		firstSuperAdmin: configuredEmail ? null : await firstSuperAdmin(),
	});
	return sender?.id ?? null;
}

export async function sendSignupWelcomeSupportMessage(
	userId: string,
): Promise<boolean> {
	const senderUserId = await resolveWelcomeSenderId();
	if (!senderUserId) {
		log.warn({
			userId,
			configuredEmail: adminConfig.SUPPORT_WELCOME_SENDER_EMAIL || null,
			message:
				"Skipping signup welcome support message; no sender user configured",
		});
		return false;
	}

	if (senderUserId === userId) {
		log.info({
			userId,
			message: "Skipping signup welcome support message for the sender account",
		});
		return false;
	}

	const [target] = await db
		.select({
			id: user.id,
			activeOrganizationId: user.activeOrganizationId,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!target) {
		log.warn({
			userId,
			message: "Skipping signup welcome support message; user not found",
		});
		return false;
	}

	let conversationId: string;
	let existingMessages: Array<{ body: string }>;

	try {
		const created = await getOrCreateMyConversationController({
			userId,
			organizationId: target.activeOrganizationId ?? null,
		});
		conversationId = created.conversation.id;
		existingMessages = created.messages;
	} catch (error) {
		const fallback = await getMyConversationController({ userId });
		if (!fallback.conversation) {
			throw error;
		}
		conversationId = fallback.conversation.id;
		existingMessages = fallback.messages;
	}

	if (conversationAlreadyWelcomed(existingMessages)) {
		log.info({
			userId,
			conversationId,
			message: "Signup welcome support message already present, skipping",
		});
		return false;
	}

	const result = await createMessageController({
		conversationId,
		senderUserId,
		senderRole: "admin",
		body: SIGNUP_WELCOME_SUPPORT_MESSAGE,
		isPlatformAdmin: true,
	});

	broadcastConversationUpdate({
		conversationId,
		conversationForAdmin: result.conversationForAdmin,
		conversationForUser: result.conversationForUser,
		message: result.message,
	});

	log.info({
		userId,
		conversationId,
		message: "Sent signup welcome support message",
	});
	return true;
}
