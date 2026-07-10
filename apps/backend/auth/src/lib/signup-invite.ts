import { db } from "@reloop/db/client";
import { invitation, signupInvite, user } from "@reloop/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

export const SIGNUP_INVITE_COOKIE = "reloop.signup_invite";
export const SIGNUP_INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
