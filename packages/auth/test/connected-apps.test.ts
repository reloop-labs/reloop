import { describe, expect, test } from "bun:test";
import { oauthGrantRevocationKey } from "@reloop/auth/middleware/keys";
import {
	canRevokeGrant,
	isOrgAdminRole,
	listConnectedApps,
	revokeConnectedApp,
} from "@reloop/auth/server/connected-apps";
import * as schema from "@reloop/db/schema";
import { MemoryRedis } from "./memory-redis";

type Row = Record<string, unknown>;

/**
 * Drizzle stand-in: `select().from(table).where()` resolves to the rows
 * registered for that table (filters are the query's job and are not
 * re-evaluated here), and writes are recorded in order.
 */
function fakeDb(rows: Map<unknown, Row[]>) {
	const writes: string[] = [];
	const select = () => ({
		from: (table: unknown) => {
			const result = rows.get(table) ?? [];
			return {
				where: () =>
					Object.assign(Promise.resolve(result), {
						limit: (n: number) => Promise.resolve(result.slice(0, n)),
					}),
			};
		},
	});
	const name = (table: unknown) =>
		table === schema.oauthRefreshToken
			? "refresh"
			: table === schema.oauthAccessToken
				? "access"
				: table === schema.oauthConsent
					? "consent"
					: "other";
	const writer = {
		update: (table: unknown) => ({
			set: () => ({
				where: async () => {
					writes.push(`revoke:${name(table)}`);
				},
			}),
		}),
		delete: (table: unknown) => ({
			where: async () => {
				writes.push(`delete:${name(table)}`);
			},
		}),
	};
	const db = {
		select,
		transaction: async (run: (tx: typeof writer) => Promise<void>) => {
			writes.push("begin");
			await run(writer);
			writes.push("commit");
		},
	};
	return { db: db as never, writes };
}

const t = (iso: string) => new Date(iso);

const client = (clientId: string, over: Row = {}): Row => ({
	clientId,
	name: clientId,
	icon: null,
	uri: null,
	applicationType: null,
	disabled: false,
	...over,
});

const user = (id: string): Row => ({
	id,
	name: id,
	email: `${id}@example.com`,
	image: null,
});

describe("listConnectedApps", () => {
	test("keeps one row per member, client, and org", async () => {
		const { db } = fakeDb(
			new Map<unknown, Row[]>([
				[
					schema.oauthConsent,
					[
						{
							userId: "me",
							clientId: "claude",
							scopes: ["openid", "email"],
							resources: ["https://reloop.sh/mcp"],
							createdAt: t("2026-09-01T00:00:00Z"),
						},
						{
							userId: "teammate",
							clientId: "claude",
							scopes: ["openid"],
							resources: null,
							createdAt: t("2026-09-05T00:00:00Z"),
						},
					],
				],
				[
					schema.oauthRefreshToken,
					[
						{
							userId: "me",
							clientId: "claude",
							scopes: ["profile"],
							resources: ["https://reloop.sh/mcp"],
							createdAt: t("2026-10-10T00:00:00Z"),
						},
						{
							userId: "me",
							clientId: "cli",
							scopes: ["openid"],
							resources: null,
							createdAt: t("2026-10-01T00:00:00Z"),
						},
					],
				],
				[
					schema.oauthClient,
					[
						client("claude", { name: "Claude", applicationType: "web" }),
						client("cli", { name: "Reloop CLI", disabled: null }),
					],
				],
				[schema.user, [user("me"), user("teammate")]],
			]),
		);
		const apps = await listConnectedApps(db, {
			organizationId: "org-1",
			viewerUserId: "me",
			includeAllMembers: true,
		});
		expect(apps.map((app) => [app.clientId, app.user.id])).toEqual([
			["claude", "me"],
			["cli", "me"],
			["claude", "teammate"],
		]);
		expect(apps[0]).toEqual({
			clientId: "claude",
			name: "Claude",
			icon: null,
			uri: null,
			applicationType: "web",
			user: {
				id: "me",
				name: "me",
				email: "me@example.com",
				image: null,
			},
			isOwn: true,
			scopes: ["email", "openid", "profile"],
			resources: ["https://reloop.sh/mcp"],
			connectedAt: "2026-09-01T00:00:00.000Z",
			lastActiveAt: "2026-10-10T00:00:00.000Z",
			hasActiveSession: true,
		});
		expect(apps[2]?.isOwn).toBe(false);
		expect(apps[2]?.hasActiveSession).toBe(false);
	});

	test("hides disabled clients and returns nothing without grants", async () => {
		const disabled = fakeDb(
			new Map<unknown, Row[]>([
				[
					schema.oauthConsent,
					[
						{
							userId: "me",
							clientId: "x",
							scopes: [],
							resources: null,
							createdAt: t("2026-01-01T00:00:00Z"),
						},
					],
				],
				[schema.oauthClient, [client("x", { disabled: true })]],
				[schema.user, [user("me")]],
			]),
		);
		const input = {
			organizationId: "org-1",
			viewerUserId: "me",
			includeAllMembers: false,
		};
		expect(await listConnectedApps(disabled.db, input)).toEqual([]);
		expect(await listConnectedApps(fakeDb(new Map()).db, input)).toEqual([]);
	});
});

describe("revokeConnectedApp", () => {
	const now = t("2026-10-11T12:00:00Z");
	const grant = { userId: "me", clientId: "claude", organizationId: "org-1" };

	test("writes the org-scoped marker, then revokes tokens and consent", async () => {
		const redis = new MemoryRedis();
		const { db, writes } = fakeDb(
			new Map<unknown, Row[]>([[schema.oauthConsent, [{ id: "c1" }]]]),
		);
		expect(await revokeConnectedApp(db, redis, grant, now)).toBe(true);
		expect(
			await redis.get<number>(oauthGrantRevocationKey("me", "claude", "org-1")),
		).toBe(Math.floor(now.getTime() / 1000));
		expect(
			await redis.get(oauthGrantRevocationKey("me", "claude", "org-2")),
		).toBeUndefined();
		expect(writes).toEqual([
			"begin",
			"revoke:refresh",
			"revoke:access",
			"delete:consent",
			"commit",
		]);
	});

	test("reports false and changes nothing when the grant is gone", async () => {
		const redis = new MemoryRedis();
		const { db, writes } = fakeDb(new Map());
		expect(await revokeConnectedApp(db, redis, grant, now)).toBe(false);
		expect(
			await redis.get(oauthGrantRevocationKey("me", "claude", "org-1")),
		).toBeUndefined();
		expect(writes).toEqual([]);
	});

	test("leaves the database untouched when the marker cannot be written", async () => {
		const redis = new MemoryRedis();
		redis.set = async () => {
			throw new Error("redis down");
		};
		const { db, writes } = fakeDb(
			new Map<unknown, Row[]>([[schema.oauthRefreshToken, [{ id: "r1" }]]]),
		);
		await expect(revokeConnectedApp(db, redis, grant, now)).rejects.toThrow(
			"redis down",
		);
		expect(writes).toEqual([]);
	});
});

describe("canRevokeGrant", () => {
	test("members can disconnect only their own apps", () => {
		expect(
			canRevokeGrant({
				viewerUserId: "me",
				viewerRole: "member",
				targetUserId: "me",
			}),
		).toBe(true);
		expect(
			canRevokeGrant({
				viewerUserId: "me",
				viewerRole: "member",
				targetUserId: "teammate",
			}),
		).toBe(false);
	});

	test("owners and admins can disconnect any member's app", () => {
		for (const viewerRole of ["owner", "admin", "member,admin"]) {
			expect(
				canRevokeGrant({
					viewerUserId: "me",
					viewerRole,
					targetUserId: "teammate",
				}),
			).toBe(true);
		}
	});

	test("recognizes admin roles in comma-separated role lists", () => {
		expect(isOrgAdminRole("member,admin")).toBe(true);
		expect(isOrgAdminRole("owner")).toBe(true);
		expect(isOrgAdminRole("member")).toBe(false);
		expect(isOrgAdminRole(null)).toBe(false);
	});
});
