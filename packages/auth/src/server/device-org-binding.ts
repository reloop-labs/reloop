import {
	DEVICE_CODE_GRANT_TYPE,
	type OAuthProviderExtension,
} from "@better-auth/oauth-provider";
import { OAUTH_ORG_CLAIM } from "@reloop/auth/middleware/keys";
import type { AuthRedis } from "@reloop/auth/middleware/types";
import { db as defaultDb } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { BetterAuthPlugin } from "better-auth";
import {
	APIError,
	createAuthMiddleware,
	getSessionFromCtx,
} from "better-auth/api";
import { and, eq, gte, inArray, isNull } from "drizzle-orm";

/**
 * The device flow (CLI login) issues tokens without the provider's
 * consent reference, so the organization picked on the device page would be
 * lost. Approval records it here, keyed by device code; the token exchange
 * reads it into the first access token's org_id claim and stamps it on the
 * new refresh token, which every later refresh inherits.
 */
type DeviceOrgBinding = {
	organizationId: string;
	userId: string;
	clientId: string;
	approvedAtMs: number;
};

const DEVICE_BINDING_TTL_SECONDS = 30 * 60;

function deviceBindingKey(deviceCode: string): string {
	return `oauth:device-org:${deviceCode}`;
}

function normalizeUserCode(userCode: string): string {
	return userCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function readString(source: unknown, key: string): string | null {
	if (typeof source !== "object" || source === null) return null;
	const value: unknown = Reflect.get(source, key);
	return typeof value === "string" && value ? value : null;
}

type BindingDb = typeof defaultDb;

export async function readDeviceOrgBinding(
	redis: AuthRedis,
	deviceCode: string,
): Promise<DeviceOrgBinding | null> {
	return (
		(await redis.get<DeviceOrgBinding>(deviceBindingKey(deviceCode))) ?? null
	);
}

/**
 * Stamps the binding on the refresh token minted for this device login and
 * reports how many were stamped (zero while the CLI is still polling).
 */
export async function bindDeviceRefreshTokens(
	db: BindingDb,
	binding: DeviceOrgBinding,
): Promise<number> {
	const stamped = await db
		.update(schema.oauthRefreshToken)
		.set({ referenceId: binding.organizationId })
		.where(
			and(
				eq(schema.oauthRefreshToken.userId, binding.userId),
				eq(schema.oauthRefreshToken.clientId, binding.clientId),
				isNull(schema.oauthRefreshToken.referenceId),
				gte(schema.oauthRefreshToken.createdAt, new Date(binding.approvedAtMs)),
			),
		)
		.returning({ id: schema.oauthRefreshToken.id });
	return stamped.length;
}

export function deviceOrgClaimsExtension(
	redis: AuthRedis,
): OAuthProviderExtension {
	return {
		claims: {
			accessToken: async ({ ctx, grantType, referenceId }) => {
				if (grantType !== DEVICE_CODE_GRANT_TYPE || referenceId) return {};
				const deviceCode = readString(ctx.body, "device_code");
				if (!deviceCode) return {};
				const binding = await readDeviceOrgBinding(redis, deviceCode);
				return binding ? { [OAUTH_ORG_CLAIM]: binding.organizationId } : {};
			},
		},
	};
}

export const deviceOrgBinding = (options: {
	redis: AuthRedis;
	db?: BindingDb;
}) => {
	const db = options.db ?? defaultDb;
	return {
		id: "device-org-binding",
		hooks: {
			before: [
				{
					matcher: (ctx) => ctx.path === "/device/approve",
					handler: createAuthMiddleware(async (ctx) => {
						const session = await getSessionFromCtx(ctx);
						const userCode = readString(ctx.body, "userCode");
						if (!session || !userCode) return;
						const organizationId = readString(
							session.session,
							"activeOrganizationId",
						);
						if (!organizationId) {
							throw new APIError("BAD_REQUEST", {
								error: "invalid_request",
								error_description:
									"Choose an organization before approving this device.",
							});
						}
						const [membership] = await db
							.select({ id: schema.member.id })
							.from(schema.member)
							.where(
								and(
									eq(schema.member.userId, session.user.id),
									eq(schema.member.organizationId, organizationId),
								),
							)
							.limit(1);
						if (!membership) {
							throw new APIError("FORBIDDEN", {
								error: "access_denied",
								error_description:
									"You are not a member of the selected organization.",
							});
						}
						const [device] = await db
							.select({
								deviceCode: schema.deviceCode.deviceCode,
								clientId: schema.deviceCode.oauthClientId,
							})
							.from(schema.deviceCode)
							.where(
								inArray(schema.deviceCode.userCode, [
									userCode,
									normalizeUserCode(userCode),
								]),
							)
							.limit(1);
						if (!device?.clientId) return;
						const binding: DeviceOrgBinding = {
							organizationId,
							userId: session.user.id,
							clientId: device.clientId,
							approvedAtMs: Date.now(),
						};
						await options.redis.set(
							deviceBindingKey(device.deviceCode),
							binding,
							DEVICE_BINDING_TTL_SECONDS,
						);
					}),
				},
			],
			after: [
				{
					matcher: (ctx) =>
						ctx.path === "/oauth2/token" &&
						readString(ctx.body, "grant_type") === DEVICE_CODE_GRANT_TYPE,
					handler: createAuthMiddleware(async (ctx) => {
						const deviceCode = readString(ctx.body, "device_code");
						if (!deviceCode) return;
						const binding = await readDeviceOrgBinding(
							options.redis,
							deviceCode,
						);
						if (!binding) return;
						if ((await bindDeviceRefreshTokens(db, binding)) > 0) {
							await options.redis.delete(deviceBindingKey(deviceCode));
						}
					}),
				},
			],
		},
	} satisfies BetterAuthPlugin;
};
