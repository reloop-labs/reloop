import { Elysia, t } from "elysia";
import { authConfig } from "../auth.config";
import {
	SIGNUP_INVITE_COOKIE,
	SIGNUP_INVITE_COOKIE_MAX_AGE,
	findSignupInviteByCode,
	normalizeEmail,
} from "../lib/signup-invite";

/**
 * Public signup-invite helpers mounted alongside Better Auth.
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
	);
