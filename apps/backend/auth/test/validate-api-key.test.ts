import { beforeAll, describe, expect, test } from "bun:test";
import { generateApiKey, hashApiKey, validateApiKey } from "@reloop/apikey";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { apikey, organization, user } from "@reloop/db/schema";

const redis = new RedisCache("apikey-test", 60, process.env.REDIS_URL);

let userId: string;
let organizationId: string;

beforeAll(async () => {
	userId = `user-${crypto.randomUUID()}`;
	organizationId = `org-${crypto.randomUUID()}`;

	await db.insert(user).values({
		id: userId,
		name: "Key Owner",
		email: `${userId}@example.com`,
	});
	await db.insert(organization).values({
		id: organizationId,
		name: "Key Org",
		slug: `slug-${crypto.randomUUID()}`,
		createdAt: new Date(),
	});
});

async function insertKey(enabled: boolean): Promise<string> {
	const raw = generateApiKey();
	await db.insert(apikey).values({
		id: `key-${crypto.randomUUID()}`,
		key: hashApiKey(raw),
		userId,
		organizationId,
		enabled,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	return raw;
}

describe("validateApiKey characterization", () => {
	test("valid enabled key resolves to its owner + org", async () => {
		const raw = await insertKey(true);

		const result = await validateApiKey(raw, redis);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(userId);
		expect(result?.organizationId).toBe(organizationId);
		expect(result?.authType).toBe("apikey");
	});

	test("invalid / malformed keys return null", async () => {
		expect(await validateApiKey(null, redis)).toBeNull();
		expect(await validateApiKey("", redis)).toBeNull();
		expect(await validateApiKey("no-underscore", redis)).toBeNull();
		expect(await validateApiKey("rl_prod_doesnotexist", redis)).toBeNull();
	});

	test("revoked (disabled) key returns null", async () => {
		const raw = await insertKey(false);

		const result = await validateApiKey(raw, redis);

		expect(result).toBeNull();
	});
});
