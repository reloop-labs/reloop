import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { signupInvite, user } from "@reloop/db/schema";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { createError } from "evlog";
import { adminConfig } from "../../../admin.config";

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function signupInviteLink(code: string) {
	return `${adminConfig.BASE_URL}/dashboard/signup?inviteCode=${encodeURIComponent(code)}`;
}

export async function listSignupInvitesController({
	limit = 50,
	offset = 0,
	q,
	status,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: "pending" | "used" | "revoked";
}) {
	const conditions = [];
	if (status) conditions.push(eq(signupInvite.status, status));
	if (q) {
		conditions.push(
			or(
				ilike(signupInvite.email, `%${q}%`),
				ilike(signupInvite.code, `%${q}%`),
			)!,
		);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(signupInvite)
		.where(whereClause);

	const items = await db
		.select({
			id: signupInvite.id,
			code: signupInvite.code,
			email: signupInvite.email,
			status: signupInvite.status,
			expiresAt: signupInvite.expiresAt,
			invitedByUserId: signupInvite.invitedByUserId,
			invitedByEmail: user.email,
			invitedByName: user.name,
			usedByUserId: signupInvite.usedByUserId,
			createdAt: signupInvite.createdAt,
		})
		.from(signupInvite)
		.leftJoin(user, eq(signupInvite.invitedByUserId, user.id))
		.where(whereClause)
		.orderBy(desc(signupInvite.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items: items.map((item) => ({
			...item,
			inviteLink: signupInviteLink(item.code),
		})),
		total: totalRow?.value ?? 0,
	};
}

export async function createSignupInviteController({
	email,
	actorUserId,
}: {
	email: string;
	actorUserId: string;
}) {
	const normalized = normalizeEmail(email);
	if (!normalized.includes("@")) {
		throw createError({
			status: 400,
			message: "Invalid email",
			why: "A valid email address is required",
			fix: "Provide a valid email",
		});
	}

	const existingUser = await db.query.user.findFirst({
		where: eq(user.email, normalized),
		columns: { id: true },
	});
	if (existingUser) {
		throw createError({
			status: 409,
			message: "User already exists",
			why: `${normalized} already has an account`,
			fix: "Ask them to log in instead",
		});
	}

	const pending = await db.query.signupInvite.findFirst({
		where: and(
			eq(signupInvite.email, normalized),
			eq(signupInvite.status, "pending"),
		),
	});
	if (pending && pending.expiresAt > new Date()) {
		throw createError({
			status: 409,
			message: "Invite already pending",
			why: `A pending invite already exists for ${normalized}`,
			fix: "Revoke the existing invite or wait for it to expire",
		});
	}

	const actor = await db.query.user.findFirst({
		where: eq(user.id, actorUserId),
		columns: { id: true, name: true, email: true },
	});
	if (!actor) {
		throw createError({
			status: 401,
			message: "Unauthorized",
			why: "Actor user not found",
			fix: "Re-authenticate and try again",
		});
	}

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	const [created] = await db
		.insert(signupInvite)
		.values({
			email: normalized,
			invitedByUserId: actorUserId,
			expiresAt,
			status: "pending",
		})
		.returning();

	if (!created) {
		throw createError({
			status: 500,
			message: "Failed to create invite",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	const inviteLink = signupInviteLink(created.code);

	await bus.publish(
		BusEvent.SIGNUP_INVITE_CREATED,
		{
			email: normalized,
			inviteLink,
			inviteCode: created.code,
			inviterName: actor.name || actor.email.split("@")[0] || "Reloop",
			inviterEmail: actor.email,
		},
		{ msgId: `signup_invite_created:${created.id}` },
	);

	await writeAdminAudit({
		actorUserId,
		action: "signup_invite.create",
		resourceType: "signup_invite",
		resourceId: created.id,
		metadata: { email: normalized, code: created.code },
	});

	return {
		id: created.id,
		code: created.code,
		email: created.email,
		status: created.status,
		expiresAt: created.expiresAt,
		inviteLink,
		createdAt: created.createdAt,
	};
}

export async function revokeSignupInviteController({
	inviteId,
	actorUserId,
}: {
	inviteId: string;
	actorUserId: string;
}) {
	const invite = await db.query.signupInvite.findFirst({
		where: eq(signupInvite.id, inviteId),
	});
	if (!invite) {
		throw createError({
			status: 404,
			message: "Invite not found",
			why: `No signup invite with id ${inviteId}`,
			fix: "Refresh the list and try again",
		});
	}
	if (invite.status !== "pending") {
		throw createError({
			status: 400,
			message: "Cannot revoke invite",
			why: `Invite is already ${invite.status}`,
			fix: "Only pending invites can be revoked",
		});
	}

	const [updated] = await db
		.update(signupInvite)
		.set({ status: "revoked", updatedAt: new Date() })
		.where(eq(signupInvite.id, inviteId))
		.returning();

	await writeAdminAudit({
		actorUserId,
		action: "signup_invite.revoke",
		resourceType: "signup_invite",
		resourceId: inviteId,
		metadata: { email: invite.email },
	});

	return {
		id: updated!.id,
		status: updated!.status,
	};
}
