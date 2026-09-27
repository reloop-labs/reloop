import { unlink } from "node:fs/promises";
import {
	seedAdminSetupKeyFile,
	seedRuntimeSignupLockFromEnvFile,
} from "@reloop/auth/setup/setup-mode";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

import { authConfig } from "./auth.config";

const redis = new RedisCache("auth");
export const loader = async () => {
	await unlink(`${authConfig.ADMIN_SETUP_KEY_FILE}.lock`).catch(() => {});
	try {
		const seed = authConfig.ADMIN_SETUP_KEY?.trim();
		if (
			seed &&
			(await seedAdminSetupKeyFile(authConfig.ADMIN_SETUP_KEY_FILE, seed))
		) {
			log.info(
				"server",
				"Administrator setup key written from ADMIN_SETUP_KEY",
			);
		}
	} catch (e) {
		log.error({ message: String(e) });
	}

	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await db.execute("SELECT 1 as test");
		log.info("server", "Postgres connected");
		await bus.connect(authConfig.NATS_URL);
		log.info("server", "NATS connected");
	} catch (e) {
		log.error({ message: String(e) });
	}

	try {
		const locked = await seedRuntimeSignupLockFromEnvFile(
			authConfig.RELOOP_ENV_FILE,
		);
		if (locked) log.info("server", "Registration locked by instance env file");
	} catch (e) {
		log.error({ message: String(e) });
	}
};
