import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { invitation, signupInvite, user } from "@reloop/db/schema";
import { and, count, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";
import { createError } from "evlog";
import { authServerConfig } from "./config";

export const SIGNUP_INVITE_COOKIE = "reloop.signup_invite";
export const SIGNUP_INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
/** Max platform signup invites a regular user can send. */
export const PEER_SIGNUP_INVITE_LIMIT = 5;

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

export function parseCookieHeader(
	cookieHeader: string | null | undefined,
): Record<string, string> {
	if (!cookieHeader) return {};
	const out: Record<string, string> = {};
	for (const part of cookieHeader.split(";")) {
		const idx = part.indexOf("=");
		if (idx === -1) continue;
		const key = part.slice(0, idx).trim();
		const value = part.slice(idx + 1).trim();
		if (key) out[key] = decodeURIComponent(value);
	}
	return out;
}

export function getSignupInviteCodeFromRequest(
	headers: Headers | { get: (name: string) => string | null },
) {
	const cookies = parseCookieHeader(headers.get("cookie"));
	return cookies[SIGNUP_INVITE_COOKIE] || null;
}

export async function findValidSignupInvite(opts: {
	email: string;
	code?: string | null;
}) {
	const email = normalizeEmail(opts.email);
	const now = new Date();

	if (opts.code) {
		const byCode = await db.query.signupInvite.findFirst({
			where: and(
				eq(signupInvite.code, opts.code),
				eq(signupInvite.status, "pending"),
				gt(signupInvite.expiresAt, now),
			),
		});
		if (!byCode) return null;
		if (normalizeEmail(byCode.email) !== email) return null;
		return byCode;
	}

	return db.query.signupInvite.findFirst({
		where: and(
			eq(signupInvite.email, email),
			eq(signupInvite.status, "pending"),
			gt(signupInvite.expiresAt, now),
		),
	});
}

/** Org member invites also unlock account creation for that email. */
export async function hasPendingOrgInvitation(email: string) {
	const now = new Date();
	const normalized = normalizeEmail(email);
	const row = await db.query.invitation.findFirst({
		where: and(
			sql`lower(${invitation.email}) = ${normalized}`,
			eq(invitation.status, "pending"),
			gt(invitation.expiresAt, now),
		),
		columns: { id: true },
	});
	return !!row;
}

export async function canCreateAccount(opts: {
	email: string;
	code?: string | null;
}) {
	const invite = await findValidSignupInvite(opts);
	if (invite) return { allowed: true as const, signupInvite: invite };
	if (await hasPendingOrgInvitation(opts.email)) {
		return { allowed: true as const, signupInvite: null };
	}
	return { allowed: false as const, signupInvite: null };
}

export async function findSignupInviteByCode(code: string) {
	const now = new Date();
	return db.query.signupInvite.findFirst({
		where: and(
			eq(signupInvite.code, code),
			eq(signupInvite.status, "pending"),
			gt(signupInvite.expiresAt, now),
		),
	});
}

export async function markSignupInviteUsed(opts: {
	inviteId: string;
	userId: string;
}) {
	await db
		.update(signupInvite)
		.set({
			status: "used",
			usedByUserId: opts.userId,
			updatedAt: new Date(),
		})
		.where(eq(signupInvite.id, opts.inviteId));
}

export async function userExistsByEmail(email: string) {
	const existing = await db.query.user.findFirst({
		where: eq(user.email, normalizeEmail(email)),
		columns: { id: true },
	});
	return !!existing;
}

export function signupInviteLink(baseUrl: string, code: string) {
	return `${baseUrl}/dashboard/signup?inviteCode=${encodeURIComponent(code)}`;
}

export async function countPendingSignupInvitesForEmail(email: string) {
	const rows = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(signupInvite)
		.where(
			and(
				eq(signupInvite.email, normalizeEmail(email)),
				eq(signupInvite.status, "pending"),
			),
		);
	return rows[0]?.count ?? 0;
}

/** Pending + used invites count toward the peer quota (revoked do not). */
export async function countPeerSignupInvitesUsed(userId: string) {
	const [row] = await db
		.select({ value: count() })
		.from(signupInvite)
		.where(
			and(
				eq(signupInvite.invitedByUserId, userId),
				inArray(signupInvite.status, ["pending", "used"]),
			),
		);
	return row?.value ?? 0;
}

export async function listPeerSignupInvites(userId: string) {
	const items = await db
		.select({
			id: signupInvite.id,
			code: signupInvite.code,
			email: signupInvite.email,
			status: signupInvite.status,
			expiresAt: signupInvite.expiresAt,
			createdAt: signupInvite.createdAt,
		})
		.from(signupInvite)
		.where(eq(signupInvite.invitedByUserId, userId))
		.orderBy(desc(signupInvite.createdAt))
		.limit(50);

	return items.map((item) => ({
		...item,
		inviteLink: signupInviteLink(authServerConfig.BASE_URL, item.code),
	}));
}

export async function createPeerSignupInvite(opts: {
	email: string;
	inviterUserId: string;
}) {
	const normalized = normalizeEmail(opts.email);
	if (!normalized.includes("@")) {
		throw createError({
			status: 400,
			message: "Invalid email",
			why: "A valid email address is required",
			fix: "Provide a valid email",
		});
	}

	const used = await countPeerSignupInvitesUsed(opts.inviterUserId);
	if (used >= PEER_SIGNUP_INVITE_LIMIT) {
		throw createError({
			status: 403,
			message: "Invite limit reached",
			why: `You can send up to ${PEER_SIGNUP_INVITE_LIMIT} invites`,
			fix: "Revoke an unused invite or wait until one is used",
		});
	}

	if (await userExistsByEmail(normalized)) {
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
			gt(signupInvite.expiresAt, new Date()),
		),
	});
	if (pending) {
		throw createError({
			status: 409,
			message: "Invite already pending",
			why: `A pending invite already exists for ${normalized}`,
			fix: "Ask them to check their email for an existing invite",
		});
	}

	const inviter = await db.query.user.findFirst({
		where: eq(user.id, opts.inviterUserId),
		columns: { id: true, name: true, email: true },
	});
	if (!inviter) {
		throw createError({
			status: 401,
			message: "Unauthorized",
			why: "Inviter user not found",
			fix: "Re-authenticate and try again",
		});
	}

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	const [created] = await db
		.insert(signupInvite)
		.values({
			email: normalized,
			invitedByUserId: opts.inviterUserId,
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

	const inviteLink = signupInviteLink(authServerConfig.BASE_URL, created.code);

	await bus.publish(
		BusEvent.SIGNUP_INVITE_CREATED,
		{
			email: normalized,
			inviteLink,
			inviteCode: created.code,
			inviterName: inviter.name || inviter.email.split("@")[0] || "Reloop",
			inviterEmail: inviter.email,
		},
		{ msgId: `signup_invite_created:${created.id}` },
	);

	return {
		id: created.id,
		code: created.code,
		email: created.email,
		status: created.status,
		expiresAt: created.expiresAt,
		inviteLink,
		createdAt: created.createdAt,
		remaining: PEER_SIGNUP_INVITE_LIMIT - used - 1,
	};
}

export async function revokePeerSignupInvite(opts: {
	inviteId: string;
	inviterUserId: string;
}) {
	const invite = await db.query.signupInvite.findFirst({
		where: and(
			eq(signupInvite.id, opts.inviteId),
			eq(signupInvite.invitedByUserId, opts.inviterUserId),
		),
	});
	if (!invite) {
		throw createError({
			status: 404,
			message: "Invite not found",
			why: `No signup invite with id ${opts.inviteId}`,
			fix: "Refresh and try again",
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
		.where(
			and(
				eq(signupInvite.id, opts.inviteId),
				eq(signupInvite.invitedByUserId, opts.inviterUserId),
				ne(signupInvite.status, "revoked"),
			),
		)
		.returning();

	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to revoke invite",
			why: "Update returned no row",
			fix: "Retry the request",
		});
	}

	return {
		id: updated.id,
		status: updated.status,
	};
}
