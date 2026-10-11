import {
	OAUTH_ACCESS_TOKEN_MAX_LIFETIME_SECONDS,
	oauthGrantRevocationKey,
} from "@reloop/auth/middleware/keys";
import type { AuthRedis } from "@reloop/auth/middleware/types";
import { db as defaultDb } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { BetterAuthPlugin } from "better-auth";
import {
	APIError,
	createAuthEndpoint,
	sensitiveSessionMiddleware,
	sessionMiddleware,
} from "better-auth/api";
import {
	and,
	type Column,
	eq,
	gt,
	inArray,
	isNull,
	type SQL,
} from "drizzle-orm";
import { z } from "zod";

/**
 * One member's grant to one OAuth client (MCP client, CLI, third-party app)
 * in one organization: a consent, a live refresh token, or both. Every grant
 * is bound to the organization chosen when it was approved.
 */
export type ConnectedApp = {
	clientId: string;
	name: string | null;
	icon: string | null;
	uri: string | null;
	applicationType: string | null;
	user: {
		id: string;
		name: string | null;
		email: string;
		image: string | null;
	};
	isOwn: boolean;
	scopes: string[];
	resources: string[];
	connectedAt: string | null;
	lastActiveAt: string | null;
	hasActiveSession: boolean;
};

export type GrantRef = {
	userId: string;
	clientId: string;
	organizationId: string;
};

type ConnectedAppsDb = typeof defaultDb;

type ConnectedAppsOptions = {
	redis: AuthRedis;
	db?: ConnectedAppsDb;
};

type Grant = {
	userId: string;
	clientId: string;
	scopes: string[];
	resources: string[] | null;
	createdAt: Date | null;
	active: boolean;
};

const ORG_ADMIN_ROLES = new Set(["owner", "admin"]);

export function isOrgAdminRole(role: string | null | undefined): boolean {
	return (role ?? "")
		.split(",")
		.some((part) => ORG_ADMIN_ROLES.has(part.trim()));
}

function earliest(a: Date | null, b: Date | null): Date | null {
	if (!a) return b;
	if (!b) return a;
	return a < b ? a : b;
}

function latest(a: Date | null, b: Date | null): Date | null {
	if (!a) return b;
	if (!b) return a;
	return a > b ? a : b;
}

/**
 * Grants bound to an organization: every member's for owners and admins,
 * only the viewer's otherwise.
 */
export async function listConnectedApps(
	db: ConnectedAppsDb,
	input: {
		organizationId: string;
		viewerUserId: string;
		includeAllMembers: boolean;
		now?: Date;
	},
): Promise<ConnectedApp[]> {
	const { organizationId, viewerUserId, includeAllMembers } = input;
	const now = input.now ?? new Date();

	const visible = (columns: {
		userId: Column;
		referenceId: Column;
	}): SQL | undefined =>
		includeAllMembers
			? eq(columns.referenceId, organizationId)
			: and(
					eq(columns.referenceId, organizationId),
					eq(columns.userId, viewerUserId),
				);

	const [consents, refreshTokens] = await Promise.all([
		db
			.select({
				userId: schema.oauthConsent.userId,
				clientId: schema.oauthConsent.clientId,
				scopes: schema.oauthConsent.scopes,
				resources: schema.oauthConsent.resources,
				createdAt: schema.oauthConsent.createdAt,
			})
			.from(schema.oauthConsent)
			.where(visible(schema.oauthConsent)),
		db
			.select({
				userId: schema.oauthRefreshToken.userId,
				clientId: schema.oauthRefreshToken.clientId,
				scopes: schema.oauthRefreshToken.scopes,
				resources: schema.oauthRefreshToken.resources,
				createdAt: schema.oauthRefreshToken.createdAt,
			})
			.from(schema.oauthRefreshToken)
			.where(
				and(
					visible(schema.oauthRefreshToken),
					isNull(schema.oauthRefreshToken.revoked),
					gt(schema.oauthRefreshToken.expiresAt, now),
				),
			),
	]);

	const grants: Grant[] = [
		...consents.flatMap((row) =>
			row.userId ? [{ ...row, userId: row.userId, active: false }] : [],
		),
		...refreshTokens.map((row) => ({ ...row, active: true })),
	];
	if (grants.length === 0) return [];

	const byGrant = new Map<
		string,
		{
			userId: string;
			clientId: string;
			scopes: Set<string>;
			resources: Set<string>;
			connectedAt: Date | null;
			lastActiveAt: Date | null;
			active: boolean;
		}
	>();
	for (const grant of grants) {
		const key = `${grant.userId}\u0000${grant.clientId}`;
		const entry = byGrant.get(key) ?? {
			userId: grant.userId,
			clientId: grant.clientId,
			scopes: new Set<string>(),
			resources: new Set<string>(),
			connectedAt: null,
			lastActiveAt: null,
			active: false,
		};
		for (const scope of grant.scopes) entry.scopes.add(scope);
		for (const resource of grant.resources ?? []) entry.resources.add(resource);
		entry.connectedAt = earliest(entry.connectedAt, grant.createdAt);
		if (grant.active) {
			entry.active = true;
			entry.lastActiveAt = latest(entry.lastActiveAt, grant.createdAt);
		}
		byGrant.set(key, entry);
	}

	const entries = [...byGrant.values()];
	const [clients, users] = await Promise.all([
		db
			.select({
				clientId: schema.oauthClient.clientId,
				name: schema.oauthClient.name,
				icon: schema.oauthClient.icon,
				uri: schema.oauthClient.uri,
				applicationType: schema.oauthClient.applicationType,
				disabled: schema.oauthClient.disabled,
			})
			.from(schema.oauthClient)
			.where(
				inArray(schema.oauthClient.clientId, [
					...new Set(entries.map((entry) => entry.clientId)),
				]),
			),
		db
			.select({
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
				image: schema.user.image,
			})
			.from(schema.user)
			.where(
				inArray(schema.user.id, [
					...new Set(entries.map((entry) => entry.userId)),
				]),
			),
	]);
	const clientById = new Map(
		clients.map((client) => [client.clientId, client]),
	);
	const userById = new Map(users.map((user) => [user.id, user]));

	return entries
		.flatMap((entry) => {
			const client = clientById.get(entry.clientId);
			const user = userById.get(entry.userId);
			if (!client || client.disabled === true || !user) return [];
			return [
				{
					clientId: client.clientId,
					name: client.name,
					icon: client.icon,
					uri: client.uri,
					applicationType: client.applicationType,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
					isOwn: user.id === viewerUserId,
					scopes: [...entry.scopes].sort(),
					resources: [...entry.resources].sort(),
					connectedAt: entry.connectedAt?.toISOString() ?? null,
					lastActiveAt: entry.lastActiveAt?.toISOString() ?? null,
					hasActiveSession: entry.active,
				},
			];
		})
		.sort((a, b) =>
			(b.lastActiveAt ?? b.connectedAt ?? "").localeCompare(
				a.lastActiveAt ?? a.connectedAt ?? "",
			),
		);
}

function grantWhere(
	columns: { userId: Column; clientId: Column; referenceId: Column },
	grant: GrantRef,
): SQL | undefined {
	return and(
		eq(columns.userId, grant.userId),
		eq(columns.clientId, grant.clientId),
		eq(columns.referenceId, grant.organizationId),
	);
}

/**
 * Cut one grant off. The Redis marker goes first so a Redis failure leaves
 * everything untouched and the caller can retry; issued JWT access tokens are
 * stateless, and the marker is what makes the resolver reject them before
 * they expire.
 */
export async function revokeConnectedApp(
	db: ConnectedAppsDb,
	redis: AuthRedis,
	grant: GrantRef,
	now: Date = new Date(),
): Promise<boolean> {
	const [consent, token] = await Promise.all([
		db
			.select({ id: schema.oauthConsent.id })
			.from(schema.oauthConsent)
			.where(grantWhere(schema.oauthConsent, grant))
			.limit(1),
		db
			.select({ id: schema.oauthRefreshToken.id })
			.from(schema.oauthRefreshToken)
			.where(
				and(
					grantWhere(schema.oauthRefreshToken, grant),
					isNull(schema.oauthRefreshToken.revoked),
				),
			)
			.limit(1),
	]);
	if (consent.length === 0 && token.length === 0) return false;

	await redis.set(
		oauthGrantRevocationKey(grant.userId, grant.clientId, grant.organizationId),
		Math.floor(now.getTime() / 1000),
		OAUTH_ACCESS_TOKEN_MAX_LIFETIME_SECONDS + 60,
	);

	await db.transaction(async (tx) => {
		await tx
			.update(schema.oauthRefreshToken)
			.set({ revoked: now })
			.where(
				and(
					grantWhere(schema.oauthRefreshToken, grant),
					isNull(schema.oauthRefreshToken.revoked),
				),
			);
		await tx
			.update(schema.oauthAccessToken)
			.set({ revoked: now })
			.where(
				and(
					grantWhere(schema.oauthAccessToken, grant),
					isNull(schema.oauthAccessToken.revoked),
				),
			);
		await tx
			.delete(schema.oauthConsent)
			.where(grantWhere(schema.oauthConsent, grant));
	});
	return true;
}

/**
 * Members may disconnect their own apps; owners and admins may disconnect
 * any member's app in the organization.
 */
export function canRevokeGrant(input: {
	viewerUserId: string;
	viewerRole: string | null;
	targetUserId: string;
}): boolean {
	return (
		input.targetUserId === input.viewerUserId ||
		isOrgAdminRole(input.viewerRole)
	);
}

async function memberRole(
	db: ConnectedAppsDb,
	userId: string,
	organizationId: string,
): Promise<string | null> {
	const [row] = await db
		.select({ role: schema.member.role })
		.from(schema.member)
		.where(
			and(
				eq(schema.member.userId, userId),
				eq(schema.member.organizationId, organizationId),
			),
		)
		.limit(1);
	return row?.role ?? null;
}

function activeOrganizationOf(session: unknown): string {
	const value =
		typeof session === "object" && session !== null
			? Reflect.get(session, "activeOrganizationId")
			: undefined;
	if (typeof value !== "string" || !value) {
		throw new APIError("BAD_REQUEST", {
			message: "Select an organization first",
		});
	}
	return value;
}

export const connectedApps = (options: ConnectedAppsOptions) => {
	const db = options.db ?? defaultDb;
	return {
		id: "connected-apps",
		endpoints: {
			listConnectedApps: createAuthEndpoint(
				"/connected-apps/list",
				{
					method: "GET",
					use: [sessionMiddleware],
					metadata: {
						openapi: {
							description:
								"Lists the OAuth apps with access to the active organization. Owners and admins see every member's apps; members see their own.",
						},
					},
				},
				async (ctx) => {
					const { session, user } = ctx.context.session;
					const organizationId = activeOrganizationOf(session);
					const role = await memberRole(db, user.id, organizationId);
					if (role === null) {
						throw new APIError("FORBIDDEN", {
							message: "You are not a member of this organization",
						});
					}
					const apps = await listConnectedApps(db, {
						organizationId,
						viewerUserId: user.id,
						includeAllMembers: isOrgAdminRole(role),
					});
					return ctx.json(apps);
				},
			),
			revokeConnectedApp: createAuthEndpoint(
				"/connected-apps/revoke",
				{
					method: "POST",
					use: [sensitiveSessionMiddleware],
					requireHeaders: true,
					body: z.object({
						clientId: z.string().trim().min(1).max(512),
						userId: z.string().trim().min(1).max(255),
					}),
					metadata: {
						openapi: {
							description:
								"Disconnects an OAuth app from the active organization: revokes its tokens and consent. Owners and admins can disconnect any member's app.",
						},
					},
				},
				async (ctx) => {
					const { session, user } = ctx.context.session;
					const organizationId = activeOrganizationOf(session);
					const role = await memberRole(db, user.id, organizationId);
					if (
						role === null ||
						!canRevokeGrant({
							viewerUserId: user.id,
							viewerRole: role,
							targetUserId: ctx.body.userId,
						})
					) {
						throw new APIError("FORBIDDEN", {
							message: "You can't disconnect this app",
						});
					}
					const revoked = await revokeConnectedApp(db, options.redis, {
						userId: ctx.body.userId,
						clientId: ctx.body.clientId,
						organizationId,
					});
					if (!revoked) {
						throw new APIError("NOT_FOUND", {
							message: "This app is no longer connected",
						});
					}
					return ctx.json({ success: true });
				},
			),
		},
	} satisfies BetterAuthPlugin;
};
