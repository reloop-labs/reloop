import {
	auth,
	countPeerSignupInvitesUsed,
	createPeerSignupInvite,
	findSignupInviteByCode,
	listPeerSignupInvites,
	normalizeEmail,
	PEER_SIGNUP_INVITE_LIMIT,
	revokePeerSignupInvite,
	SIGNUP_INVITE_COOKIE,
	SIGNUP_INVITE_COOKIE_MAX_AGE,
} from "@reloop/auth/server";
import { Elysia, t } from "elysia";
import { authConfig } from "../auth.config";

async function requireSession(request: Request) {
	return auth.api.getSession({ headers: request.headers });
}

/**
 * Public signup-invite helpers + authenticated peer invite endpoints.
 * Paths are under /api/auth (see auth service index).
 */
export const signupInviteRoutes = new Elysia({ name: "SignupInviteRoutes" })
	.get(
		"/v1/signup-invite/validate",
		async ({ query, set }) => {
			if (!authConfig.REQUIRE_SIGNUP_INVITE) {
				return {
					valid: true,
					required: false,
					email: null as string | null,
					code: null as string | null,
				};
			}

			const code = query.code?.trim();
			if (!code) {
				set.status = 400;
				return {
					valid: false,
					required: true,
					email: null,
					code: null,
					message: "Invite code is required",
				};
			}

			const invite = await findSignupInviteByCode(code);
			if (!invite) {
				set.status = 404;
				return {
					valid: false,
					required: true,
					email: null,
					code: null,
					message: "Invalid or expired invite code",
				};
			}

			set.headers["set-cookie"] =
				`${SIGNUP_INVITE_COOKIE}=${encodeURIComponent(invite.code)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SIGNUP_INVITE_COOKIE_MAX_AGE}`;

			return {
				valid: true,
				required: true,
				email: normalizeEmail(invite.email),
				code: invite.code,
				expiresAt: invite.expiresAt.toISOString(),
			};
		},
		{
			query: t.Object({
				code: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Signup Invite"],
				summary: "Validate a platform signup invite code",
			},
		},
	)
	.get(
		"/v1/signup-invite/status",
		async () => ({
			required: authConfig.REQUIRE_SIGNUP_INVITE,
		}),
		{
			detail: {
				tags: ["Signup Invite"],
				summary: "Whether signup invites are required",
			},
		},
	)
	.get(
		"/v1/signup-invite/mine",
		async ({ request, set }) => {
			const session = await requireSession(request);
			if (!session?.user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			const used = await countPeerSignupInvitesUsed(session.user.id);
			const items = await listPeerSignupInvites(session.user.id);

			return {
				items,
				used,
				limit: PEER_SIGNUP_INVITE_LIMIT,
				remaining: Math.max(0, PEER_SIGNUP_INVITE_LIMIT - used),
			};
		},
		{
			detail: {
				tags: ["Signup Invite"],
				summary: "List signup invites sent by the current user",
			},
		},
	)
	.post(
		"/v1/signup-invite",
		async ({ request, body, set }) => {
			const session = await requireSession(request);
			if (!session?.user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
				return await createPeerSignupInvite({
					email: body.email,
					inviterUserId: session.user.id,
				});
			} catch (error) {
				const err = error as {
					status?: number;
					message?: string;
					why?: string;
					fix?: string;
				};
				set.status = err.status ?? 500;
				return {
					message: err.message ?? "Failed to create invite",
					why: err.why,
					fix: err.fix,
				};
			}
		},
		{
			body: t.Object({
				email: t.String({ minLength: 3 }),
			}),
			detail: {
				tags: ["Signup Invite"],
				summary: "Invite a friend to create a Reloop account (max 5)",
			},
		},
	)
	.post(
		"/v1/signup-invite/:id/revoke",
		async ({ request, params, set }) => {
			const session = await requireSession(request);
			if (!session?.user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
				return await revokePeerSignupInvite({
					inviteId: params.id,
					inviterUserId: session.user.id,
				});
			} catch (error) {
				const err = error as {
					status?: number;
					message?: string;
					why?: string;
					fix?: string;
				};
				set.status = err.status ?? 500;
				return {
					message: err.message ?? "Failed to revoke invite",
					why: err.why,
					fix: err.fix,
				};
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Signup Invite"],
				summary: "Revoke a pending signup invite you sent",
			},
		},
	);
