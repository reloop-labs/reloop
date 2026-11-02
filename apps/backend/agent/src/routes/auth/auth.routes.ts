import { verifyAgentToken } from "@agentonboard/sdk";
import { agentConfig } from "@be/agent/agent.config";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { apiError } from "@reloop/auth/middleware/api-errors";
import {
	extractAgentToken,
	resolveAudience,
} from "@reloop/auth/middleware/resolve/resolve-agent-onboard-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import { isRegistrationAllowed } from "@reloop/auth/registration-controls";
import { isUserBanned } from "@reloop/auth/user/is-banned";
import { db } from "@reloop/db/client";
import { member, organization, user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

export const authRoutes = new Elysia({ prefix: "/auth" })
	.get(
		"/schema",
		() => ({
			domain: "auth",
			endpoints: getDomainSchemas("auth"),
		}),
		{
			detail: {
				summary: "Auth Domain Schemas",
				description:
					"Returns the available authentication & onboarding schemas for AI agents.",
				tags: ["Auth"],
			},
		},
	)
	.post(
		"/signup",
		async ({ body, request: { headers }, set }) => {
			const token = extractAgentToken(headers);
			if (!token) {
				set.status = 401;
				return apiError(401, {
					code: "UNAUTHORIZED",
					message: "Authentication required",
					why: "The request has no AgentOnboard Bearer token.",
					fix: "Mint a session token using AgentOnboard `get_token` tool for this service's audience and pass it as `Authorization: Bearer <token>`.",
					link: "https://reloop.sh/docs/errors",
				});
			}

			const audience = resolveAudience(
				{ baseUrl: agentConfig.BASE_URL } as unknown as ResolverDeps,
				headers,
			);
			const verification = await verifyAgentToken({
				token,
				audience,
			});

			if (!verification.ok) {
				set.status = 401;
				return apiError(401, {
					code: verification.code,
					message: "Invalid or expired AgentOnboard token",
					why: verification.error || "Token verification failed.",
					fix: "Call `get_token` tool again to mint a fresh 5-minute session token and retry.",
					link: "https://reloop.sh/docs/errors",
				});
			}

			const normalizedEmail = verification.email.trim().toLowerCase();

			// 1. Check if user already exists
			const existingUser = await db.query.user.findFirst({
				where: eq(user.email, normalizedEmail),
			});

			if (existingUser) {
				if (isUserBanned(existingUser)) {
					set.status = 403;
					return apiError(403, {
						code: "FORBIDDEN",
						message: "Account suspended",
						why: "This user account is currently banned or suspended.",
						fix: "Contact platform administrators if you believe this is in error.",
					});
				}

				let existingOrgId = existingUser.activeOrganizationId;
				if (!existingOrgId) {
					const firstMember = await db.query.member.findFirst({
						where: eq(member.userId, existingUser.id),
						orderBy: (table, { asc }) => [asc(table.createdAt)],
					});
					existingOrgId = firstMember?.organizationId ?? null;
				}

				set.status = 200;
				return {
					user: existingUser.id,
					organization: existingOrgId,
					created: false,
					status: "existing_account",
					message:
						"Account already exists for this verified email. Authenticated successfully.",
				};
			}

			// 2. User does not exist: Check registration controls
			const allowed = await isRegistrationAllowed(
				normalizedEmail,
				agentConfig.DISABLE_SIGNUP,
				async () => false,
			);

			if (!allowed) {
				set.status = 403;
				return apiError(403, {
					code: "ACCOUNT_REQUIRED",
					message: "Registration is disabled on this instance",
					why: "Self-signup is disabled on this Reloop deployment.",
					fix: "Ask an administrator for an invitation to join an existing organization.",
					link: "https://reloop.sh/docs/errors",
				});
			}

			// 3. Provision new user + workspace
			const localPart = normalizedEmail.split("@")[0] || "agent";
			const orgName =
				body?.organizationName?.trim() || `${localPart}'s Workspace`;

			const rawSlug = (body?.organizationSlug?.trim() || orgName)
				.toLowerCase()
				.replace(/[^a-z0-9-]/g, "-")
				.replace(/-+/g, "-")
				.replace(/^-|-$/g, "");
			const randomSuffix = crypto.randomUUID().slice(0, 6);
			const uniqueSlug = `${rawSlug || "workspace"}-${randomSuffix}`;

			const [newUser] = await db
				.insert(user)
				.values({
					id: crypto.randomUUID(),
					name: body?.organizationName
						? `${body.organizationName} Agent`
						: localPart,
					email: normalizedEmail,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const [newOrg] = await db
				.insert(organization)
				.values({
					id: crypto.randomUUID(),
					name: orgName,
					slug: uniqueSlug,
					createdAt: new Date(),
				})
				.returning();

			if (!newUser || !newOrg) {
				set.status = 500;
				return apiError(500, {
					code: "PROVISIONING_FAILED",
					message: "Account creation failed",
					why: "Could not insert user or organization record into database.",
					fix: "Retry the request or contact support.",
				});
			}

			await db.insert(member).values({
				id: crypto.randomUUID(),
				userId: newUser.id,
				organizationId: newOrg.id,
				role: "owner",
				createdAt: new Date(),
			});

			await db
				.update(user)
				.set({ activeOrganizationId: newOrg.id })
				.where(eq(user.id, newUser.id));

			set.status = 201;
			return {
				user: newUser.id,
				organization: newOrg.id,
				created: true,
				status: "created",
				message: "User account and workspace provisioned successfully.",
			};
		},
		{
			body: t.Optional(
				t.Object({
					organizationName: t.Optional(t.String()),
					organizationSlug: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "Agent Onboarding & Signup",
				description:
					"Autonomous agent onboarding. Creates user account and default workspace idempotently for verified AgentOnboard tokens.",
				tags: ["Auth"],
			},
		},
	)
	.get(
		"/me",
		async ({ request: { headers }, set }) => {
			const token = extractAgentToken(headers);
			if (!token) {
				set.status = 401;
				return apiError(401, {
					code: "UNAUTHORIZED",
					message: "Authentication required",
					why: "The request has no AgentOnboard Bearer token.",
					fix: "Pass your AgentOnboard token as `Authorization: Bearer <token>`.",
				});
			}

			const audience = resolveAudience(
				{ baseUrl: agentConfig.BASE_URL } as unknown as ResolverDeps,
				headers,
			);
			const verification = await verifyAgentToken({ token, audience });
			if (!verification.ok) {
				set.status = 401;
				return apiError(401, {
					code: verification.code,
					message: "Invalid or expired AgentOnboard token",
					why: verification.error || "Token verification failed.",
					fix: "Mint a fresh session token via AgentOnboard and retry.",
				});
			}

			const normalizedEmail = verification.email.trim().toLowerCase();
			const foundUser = await db.query.user.findFirst({
				where: eq(user.email, normalizedEmail),
			});

			if (!foundUser) {
				set.status = 403;
				return apiError(403, {
					code: "ACCOUNT_REQUIRED",
					message: "Reloop account required",
					why: `Verified identity '${normalizedEmail}' has no registered account at Reloop.`,
					fix: "Call POST /api/agents/v1/auth/signup to provision an account.",
				});
			}

			let activeOrgId = foundUser.activeOrganizationId;
			if (!activeOrgId) {
				const firstMember = await db.query.member.findFirst({
					where: eq(member.userId, foundUser.id),
					orderBy: (table, { asc }) => [asc(table.createdAt)],
				});
				activeOrgId = firstMember?.organizationId ?? null;
			}

			return {
				userId: foundUser.id,
				email: normalizedEmail,
				organizationId: activeOrgId,
				platformRole: foundUser.role,
				createdAt: foundUser.createdAt,
			};
		},
		{
			detail: {
				summary: "Agent Identity & Context",
				description:
					"Returns verified agent identity, active workspace, and platform context.",
				tags: ["Auth"],
			},
		},
	);
