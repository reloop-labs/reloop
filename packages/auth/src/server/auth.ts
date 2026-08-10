import { apiKey } from "@better-auth/api-key";
import { handleAuthLifecycleEviction } from "../middleware/eviction/handle-auth-lifecycle-eviction";
import {
	ORGANIZATION_NAME_MAX_LENGTH,
	organizationNameMaxLengthMessage,
	organizationNameTooLong,
} from "../organization-limits";
import { ac, orgRoles } from "../permissions";
import { platformAc, platformRoles } from "../platform-permissions";
import { DEFAULT_USER_ROLE, PLATFORM_ADMIN_ROLE } from "../roles";
import { authServerConfig } from "./config";
import { redis } from "./redis";
import { sessionCacheRedis } from "./session-cache-redis";
import {
	USER_NAME_PART_MAX_LENGTH,
	userDisplayNamePartsTooLong,
	userNamePartMaxLengthMessage,
} from "../user-name-limits";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
	admin,
	bearer,
	emailOTP,
	jwt,
	lastLoginMethod,
	openAPI,
	organization,
} from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";

function assertOrganizationNameLength(name: string | undefined) {
	if (typeof name !== "string") return;
	if (organizationNameTooLong(name)) {
		throw new APIError("BAD_REQUEST", {
			message: organizationNameMaxLengthMessage(ORGANIZATION_NAME_MAX_LENGTH),
		});
	}
}

function assertUserDisplayNameLength(name: string | undefined) {
	if (typeof name !== "string") return;
	if (userDisplayNamePartsTooLong(name)) {
		throw new APIError("BAD_REQUEST", {
			message: userNamePartMaxLengthMessage("Name", USER_NAME_PART_MAX_LENGTH),
		});
	}
}

/** Accounts created within this window are treated as signups, not return logins. */
const NEW_USER_SIGNIN_GRACE_MS = 2 * 60 * 1000;

function isRecentlyCreatedUser(user: {
	createdAt?: Date | string | null;
}): boolean {
	if (!user.createdAt) return false;
	const createdAtMs = new Date(user.createdAt).getTime();
	if (Number.isNaN(createdAtMs)) return false;
	return Date.now() - createdAtMs < NEW_USER_SIGNIN_GRACE_MS;
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	user: {
		additionalFields: {
			activeOrganizationId: {
				type: "string",
				required: false,
				input: true,
			},
			mode: {
				type: "string",
				required: false,
				input: true,
				defaultValue: "dev",
			},
		},
	},
	/**
	 * Better Auth stores the active org on the *session* (`session.activeOrganizationId`).
	 * We also persist the last-used org on the *user* (`user.activeOrganizationId`) so it
	 * survives across logins. On every new session, copy the user's preference onto the
	 * session so org-scoped endpoints (get-active-member-role, billing, teams, etc.) work
	 * immediately without requiring a manual org switch in the UI.
	 */
	databaseHooks: {
		user: {
			create: {
				// Signup uses the same paths as sign-in (`/sign-in/email-otp`, OAuth
				// callbacks). Emit welcome from the actual user-create hook so first-time
				// accounts get WelcomeEmail regardless of which auth path created them.
				after: async (user) => {
					try {
						log.info({
							...{ data: { id: user.id, email: user.email } },
							message: "User registered:",
						});
						await bus.publish(
							BusEvent.USER_CREATED,
							{
								id: user.id,
								email: user.email,
								name: user.name || undefined,
							},
							{ msgId: `user_created:${user.email}` },
						);
					} catch (error) {
						log.error({
							...{ data: error },
							message: "Failed to publish USER_CREATED",
						});
					}
				},
			},
			update: {
				before: async (user) => {
					assertUserDisplayNameLength(
						typeof user.name === "string" ? user.name : undefined,
					);
				},
			},
		},
		session: {
			create: {
				before: async (session) => {
					if (session.activeOrganizationId) return;

					const [found] = await db
						.select({
							activeOrganizationId: schema.user.activeOrganizationId,
						})
						.from(schema.user)
						.where(eq(schema.user.id, session.userId))
						.limit(1);

					if (!found?.activeOrganizationId) return;

					return {
						data: {
							...session,
							activeOrganizationId: found.activeOrganizationId,
						},
					};
				},
			},
		},
	},
	secondaryStorage: {
		get: async (key) => {
			return await redis.get(key);
		},
		set: async (key, value, ttl) => {
			if (ttl) await redis.set(key, value, ttl);
			else await redis.set(key, value);
		},
		delete: async (key) => {
			await redis.delete(key);
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const { path, context } = ctx;
			log.info({ message: String(ctx.path) });

			try {
				const cookieHeader =
					typeof ctx.headers?.get === "function"
						? ctx.headers.get("cookie")
						: null;
				const sessionUser = context?.session?.user ?? context?.newSession?.user;
				await handleAuthLifecycleEviction(sessionCacheRedis, {
					path: String(path),
					cookieHeader,
					userId: sessionUser?.id ?? null,
				});
			} catch (err) {
				log.error({
					...{ data: err },
					message: "Session cache eviction failed",
				});
			}

			if (
				path === "/sign-in/email-otp" ||
				path === "/callback/google" ||
				path === "/callback/github"
			) {
				const data = context.newSession;
				if (data) {
					const { session, user } = data;

					// First-time signup auto-creates a session on these same paths.
					// Skip the security alert so new users only get the welcome email.
					if (isRecentlyCreatedUser(user)) {
						log.info({
							...{ data: user.email },
							message: "Skipping signin alert for newly created user:",
						});
						return;
					}

					log.info({ ...{ data: user.email }, message: "User signed in:" });

					const bucket = Math.floor(Date.now() / 60000);
					await bus.publish(
						BusEvent.SIGNIN_DETECTED,
						{
							email: user.email,
							fullName: user.name || "User",
							browser: session.userAgent || "Unknown Browser",
							os: "Unknown OS",
							ip: session.ipAddress || "0.0.0.0",
							location: "Unknown Location",
						},
						{ msgId: `signin_detected:${user.email}:${bucket}` },
					);
				}
			}
		}),
	},
	basePath: "/api/auth/v1",
	telemetry: { enabled: false },
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		disableSignUp: authServerConfig.DISABLE_SIGNUP === "true",
	},
	socialProviders: {
		google: {
			clientId: authServerConfig.GOOGLE_CLIENT_ID as string,
			clientSecret: authServerConfig.GOOGLE_CLIENT_SECRET as string,
		},
		github: {
			clientId: authServerConfig.GITHUB_CLIENT_ID as string,
			clientSecret: authServerConfig.GITHUB_CLIENT_SECRET as string,
		},
	},
	secret: authServerConfig.BETTER_AUTH_SECRET,
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: ["*"],
	plugins: [
		jwt(),
		bearer(),
		admin({
			defaultRole: DEFAULT_USER_ROLE,
			adminRoles: [PLATFORM_ADMIN_ROLE],
			ac: platformAc,
			roles: platformRoles,
		}),
		apiKey({ defaultPrefix: "rl" }),
		lastLoginMethod({
			cookieName: "better-auth.last_used_login_method",
			maxAge: 60 * 60 * 24 * 30,
			customResolveMethod: (ctx) => {
				if (ctx.path.includes("/oauth/callback/google")) {
					return "google";
				}
				if (ctx.path.includes("/oauth/callback/github")) {
					return "github";
				}
				if (ctx.path.includes("/sign-up/email")) {
					return "email";
				}
				if (ctx.path.includes("/sign-in/email")) {
					return "email";
				}
				return null;
			},
		}),
		emailOTP({
			expiresIn: 60 * 15,
			allowedAttempts: 3,
			async sendVerificationOTP({ email, otp, type }) {
				log.info("server", `Sending OTP (${type}) to: ${email} (OTP: ${otp})`);
				if (
					authServerConfig.DEFAULT_OTP &&
					authServerConfig.NODE_ENV !== "development"
				)
					return;
				try {
					await bus.publish(
						BusEvent.OTP_REQUESTED,
						{ email, otp, type },
						{ msgId: `otp_requested:${email}:${otp}` },
					);
					log.info("server", `OTP bus event published for ${email} (${type})`);
				} catch (error) {
					log.error({
						...{ data: error },
						message: "Failed to publish OTP event:",
					});

					if (!authServerConfig.DEFAULT_OTP) {
						throw new Error("Failed to send OTP email");
					}
				}
			},
			generateOTP() {
				if (authServerConfig.DEFAULT_OTP) return authServerConfig.DEFAULT_OTP;
				return Math.floor(100000 + Math.random() * 900000).toString();
			},
		}),
		organization({
			ac,
			roles: orgRoles,
			additionalFields: {
				organization: {
					billingEmail: {
						type: "string",
						required: false,
						input: true,
					},
					billingName: {
						type: "string",
						required: false,
						input: true,
					},
					externalCustomerId: {
						type: "string",
						required: false,
						input: true,
						unique: true,
					},
					status: {
						type: "string",
						required: false,
						input: true,
						defaultValue: "active",
					},
				},
			},
			async sendInvitationEmail(data) {
				const inviteLink = `${authServerConfig.BASE_URL}/dashboard/signup?inviteId=${data.id}`;
				log.info({
					...{
						email: data.email,
						organization: data.organization.name,
					},
					message: "Organization invitation email requested:",
				});

				if (authServerConfig.NODE_ENV === "development") {
					log.info("server", `Invite URL (DEV): ${inviteLink}`);
				}

				const isResend =
					Date.now() - new Date(data.invitation.createdAt).getTime() > 5000;

				try {
					await bus.publish(
						BusEvent.INVITE_CREATED,
						{
							email: data.email,
							organizationName: data.organization.name,
							inviteLink,
							inviterName:
								data.inviter.user.name ||
								data.inviter.user.email.split("@")[0] ||
								"Someone",
							inviterEmail: data.inviter.user.email,
							isResend,
						},
						{ msgId: `invite_created:${data.id}:${Date.now()}` },
					);
					log.info(
						"server",
						`Organization invite bus event published for ${data.email} (resend: ${isResend})`,
					);
				} catch (error) {
					log.error(
						"server",
						`Failed to publish organization invite event:${error}`,
					);
				}
			},
			// Better Auth's findPendingInvitation ignores expired rows, so a
			// re-invite after expiry would create a second `pending` invite while
			// the old one remains. Cancel expired pending invites for the same
			// email+org before inserting a new one.
			cancelPendingInvitationsOnReInvite: true,
			organizationHooks: {
				beforeCreateOrganization: async ({ organization: org }) => {
					assertOrganizationNameLength(org.name);
				},
				beforeUpdateOrganization: async ({ organization: org }) => {
					assertOrganizationNameLength(org.name);
				},
				beforeCreateInvitation: async ({ invitation }) => {
					const email = invitation.email.toLowerCase();
					const now = new Date();
					const existing = await db
						.select({
							id: schema.invitation.id,
							expiresAt: schema.invitation.expiresAt,
						})
						.from(schema.invitation)
						.where(
							and(
								eq(schema.invitation.email, email),
								eq(schema.invitation.organizationId, invitation.organizationId),
								eq(schema.invitation.status, "pending"),
							),
						);

					const expiredIds = existing
						.filter((row) => new Date(row.expiresAt).getTime() <= now.getTime())
						.map((row) => row.id);

					if (expiredIds.length === 0) return;

					for (const id of expiredIds) {
						await db
							.update(schema.invitation)
							.set({ status: "canceled" })
							.where(eq(schema.invitation.id, id));
					}

					log.info(
						"server",
						`Canceled ${expiredIds.length} expired pending invitation(s) for ${email} before re-invite`,
					);
				},
				afterAcceptInvitation: async ({ member, user, organization }) => {
					try {
						await bus.publish(
							BusEvent.ORGANIZATION_JOINED,
							{
								organizationId: organization.id,
								orgName: organization.name,
								userId: user.id,
								userEmail: user.email,
								memberName: user.name || user.email,
								inviterName: "Admin",
								role: member.role,
							},
							{ msgId: `org_joined:${organization.id}:${user.id}` },
						);
						log.info(
							"server",
							`Organization joined bus event published for ${user.email}`,
						);

						await db
							.update(schema.user)
							.set({ activeOrganizationId: organization.id })
							.where(eq(schema.user.id, user.id));
						log.info(
							"server",
							`Active organization set to ${organization.id} for user ${user.id}`,
						);
					} catch (error) {
						log.error({
							...{ data: error },
							message:
								"Failed to publish organization joined event or update user:",
						});
					}
				},
			},
		}),
		openAPI({
			path: "/docs",
		}),
	],
	advanced: {
		cookiePrefix: "reloop",
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
		},
	},
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema> | null = null;

const getSchema = async () => {
	if (!_schema) {
		_schema = auth.api.generateOpenAPISchema();
	}
	return _schema;
};

type OpenAPIPathItem = Record<string, unknown> & {
	[method: string]: { tags?: string[] } | unknown;
};

export const OpenAPI = {
	getPaths: async (prefix = "/api/auth/v1") => {
		try {
			const { paths } = await getSchema();
			const reference: Record<string, OpenAPIPathItem> = {};

			for (const path of Object.keys(paths)) {
				const pathData = paths[path];
				if (!pathData) continue;

				const key = prefix + path;
				const item: OpenAPIPathItem = { ...pathData };
				reference[key] = item;

				for (const method of Object.keys(pathData)) {
					const operation = item[method];
					if (operation && typeof operation === "object") {
						(operation as { tags?: string[] }).tags = ["Better Auth"];
					}
				}
			}

			return reference;
		} catch (error) {
			log.error({
				...{ data: error },
				message: "Failed to generate OpenAPI paths:",
			});
			return {};
		}
	},
	components: async () => {
		try {
			const { components } = await getSchema();
			return components;
		} catch (error) {
			log.error({
				...{ data: error },
				message: "Failed to generate OpenAPI components:",
			});
			return {};
		}
	},
} as const;
