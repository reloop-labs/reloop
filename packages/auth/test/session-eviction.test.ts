import { describe, expect, test } from "bun:test";
import {
	type AuthContext,
	applySessionCacheEviction,
	evictAllSessionsForUser,
	evictionEventFromAuthPath,
	evictSessionByToken,
	handleAuthLifecycleEviction,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "@reloop/auth/middleware";
import { MemoryRedis } from "./memory-redis";

async function seedUserSessions(
	redis: MemoryRedis,
	userId: string,
	tokens: string[],
): Promise<void> {
	for (const token of tokens) {
		const ctx: AuthContext = {
			userId,
			organizationId: "org-1",
			platformRole: "user",
			authType: "session",
		};
		await redis.set(sessionTokenCacheKey(token), ctx, 5);
	}
	await redis.set(sessionUserIndexKey(userId), tokens, 5);
}

describe("session cache eviction", () => {
	test("logout evicts the specific session-token entry and prunes the user index", async () => {
		const redis = new MemoryRedis();
		const userId = "user-1";
		const keep = "tok-keep";
		const drop = "tok-drop";
		await seedUserSessions(redis, userId, [keep, drop]);

		await applySessionCacheEviction(redis, {
			type: "logout",
			sessionToken: drop,
			userId,
		});

		expect(await redis.get(sessionTokenCacheKey(drop))).toBeUndefined();
		expect(await redis.get(sessionTokenCacheKey(keep))).toBeDefined();
		expect(await redis.get<string[]>(sessionUserIndexKey(userId))).toEqual([
			keep,
		]);
	});

	test("logout without userId still deletes the token entry", async () => {
		const redis = new MemoryRedis();
		const token = "tok-solo";
		await redis.set(sessionTokenCacheKey(token), {
			userId: "u",
			organizationId: "o",
			platformRole: null,
			authType: "session",
		} satisfies AuthContext);

		await applySessionCacheEviction(redis, {
			type: "logout",
			sessionToken: token,
		});

		expect(await redis.get(sessionTokenCacheKey(token))).toBeUndefined();
	});

	test("password-change evicts all tokens via the per-user index", async () => {
		const redis = new MemoryRedis();
		const userId = "user-pw";
		const tokens = ["t1", "t2", "t3"];
		await seedUserSessions(redis, userId, tokens);

		await applySessionCacheEviction(redis, {
			type: "password-change",
			userId,
		});

		for (const t of tokens) {
			expect(await redis.get(sessionTokenCacheKey(t))).toBeUndefined();
		}
		expect(await redis.get(sessionUserIndexKey(userId))).toBeUndefined();
	});

	test("organization-switch evicts all tokens via the per-user index", async () => {
		const redis = new MemoryRedis();
		const userId = "user-org";
		const tokens = ["a", "b"];
		await seedUserSessions(redis, userId, tokens);

		await applySessionCacheEviction(redis, {
			type: "organization-switch",
			userId,
		});

		for (const t of tokens) {
			expect(await redis.get(sessionTokenCacheKey(t))).toBeUndefined();
		}
		expect(await redis.get(sessionUserIndexKey(userId))).toBeUndefined();
	});

	test("evictAllSessionsForUser is a no-op when the index is empty", async () => {
		const redis = new MemoryRedis();
		await evictAllSessionsForUser(redis, "nobody");
		expect(await redis.get(sessionUserIndexKey("nobody"))).toBeUndefined();
	});

	test("evictSessionByToken removes the last index entry entirely", async () => {
		const redis = new MemoryRedis();
		const userId = "user-last";
		const token = "only";
		await seedUserSessions(redis, userId, [token]);

		await evictSessionByToken(redis, token, userId);

		expect(await redis.get(sessionTokenCacheKey(token))).toBeUndefined();
		expect(await redis.get(sessionUserIndexKey(userId))).toBeUndefined();
	});
});

describe("evictionEventFromAuthPath (lifecycle mapping)", () => {
	test("maps /sign-out to logout with token from cookie", () => {
		const event = evictionEventFromAuthPath({
			path: "/sign-out",
			cookieHeader: "reloop.session_token=abc123.sig; other=1",
			userId: "u1",
		});
		expect(event).toEqual({
			type: "logout",
			sessionToken: "abc123",
			userId: "u1",
		});
	});

	test("maps /sign-out with __Secure- session cookie (HTTPS Better Auth)", () => {
		const event = evictionEventFromAuthPath({
			path: "/sign-out",
			cookieHeader: "__Secure-reloop.session_token=secureTok.sig%3D; other=1",
			userId: "u1",
		});
		expect(event).toEqual({
			type: "logout",
			sessionToken: "secureTok",
			userId: "u1",
		});
	});

	test("maps /change-password and /reset-password to password-change", () => {
		expect(
			evictionEventFromAuthPath({ path: "/change-password", userId: "u" }),
		).toEqual({ type: "password-change", userId: "u" });
		expect(
			evictionEventFromAuthPath({ path: "/reset-password", userId: "u" }),
		).toEqual({ type: "password-change", userId: "u" });
	});

	test("maps /organization/set-active to organization-switch", () => {
		expect(
			evictionEventFromAuthPath({
				path: "/organization/set-active",
				userId: "u",
			}),
		).toEqual({ type: "organization-switch", userId: "u" });
	});

	test("ignores unrelated paths", () => {
		expect(
			evictionEventFromAuthPath({ path: "/get-session", userId: "u" }),
		).toBeNull();
	});

	test("handleAuthLifecycleEviction drives logout end-to-end", async () => {
		const redis = new MemoryRedis();
		const token = "live-tok";
		const userId = "live-user";
		await seedUserSessions(redis, userId, [token, "other"]);

		const event = await handleAuthLifecycleEviction(redis, {
			path: "/sign-out",
			cookieHeader: `reloop.session_token=${token}.sig`,
			userId,
		});

		expect(event?.type).toBe("logout");
		expect(await redis.get(sessionTokenCacheKey(token))).toBeUndefined();
		expect(await redis.get(sessionTokenCacheKey("other"))).toBeDefined();
	});

	test("handleAuthLifecycleEviction drives password-change end-to-end", async () => {
		const redis = new MemoryRedis();
		const userId = "pw-user";
		await seedUserSessions(redis, userId, ["x", "y"]);

		const event = await handleAuthLifecycleEviction(redis, {
			path: "/change-password",
			userId,
		});

		expect(event?.type).toBe("password-change");
		expect(await redis.get(sessionTokenCacheKey("x"))).toBeUndefined();
		expect(await redis.get(sessionTokenCacheKey("y"))).toBeUndefined();
		expect(await redis.get(sessionUserIndexKey(userId))).toBeUndefined();
	});

	test("handleAuthLifecycleEviction drives organization-switch end-to-end", async () => {
		const redis = new MemoryRedis();
		const userId = "org-user";
		await seedUserSessions(redis, userId, ["o1"]);

		const event = await handleAuthLifecycleEviction(redis, {
			path: "/organization/set-active",
			userId,
		});

		expect(event?.type).toBe("organization-switch");
		expect(await redis.get(sessionTokenCacheKey("o1"))).toBeUndefined();
		expect(await redis.get(sessionUserIndexKey(userId))).toBeUndefined();
	});
});
