import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { createApiKeyCredential } from "@reloop/api-key/credential/api-key-credential";
import {
	authRedisAsCredentialStore,
	createApiKeyCredentialCache,
} from "@reloop/auth/apikey/credential-cache";
import { createSessionCacheRedis } from "@reloop/auth/middleware";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

/** Management rate-limit Redis (api-key prefix) — not used for auth credentials. */
export const redis = new RedisCache("api-key", 86400);

/** Same Redis family as request-auth validation cache (reloop-session prefix). */
const authCredentialRedis = createSessionCacheRedis(apiKeyConfig.REDIS_URL);

/** Uses deleteStrict so invalidate fails closed without breaking session soft-delete. */
export const apiKeyCredentialCache = createApiKeyCredentialCache(
	authRedisAsCredentialStore(authCredentialRedis),
);

export const apiKeyCredential = createApiKeyCredential({
	db,
	credentialCache: apiKeyCredentialCache,
	bus,
});

export const loader = async () => {
	try {
		await Promise.all([
			redis.healthCheck().then(() => log.info("Redis", "Connected")),
			db
				.execute("SELECT 1 as test")
				.then(() => log.info("Postgres", "Connected")),
			bus
				.connect(apiKeyConfig.NATS_URL)
				.then(() => log.info("NATS", "Connected")),
		]);
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "Error during service initialization",
		});
	}
};
