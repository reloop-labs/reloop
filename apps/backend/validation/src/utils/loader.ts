import { withDeadline } from "@be/validation/utils/deadline";
import { validationConfig } from "@be/validation/validation.config";
import { RedisCache } from "@reloop/cache/redis-client";
import { warmCatalogue } from "@reloop/email-validation";
import { log } from "evlog";

export const redis = new RedisCache(
	"validation",
	60,
	validationConfig.REDIS_URL,
);

export const loader = async () => {
	try {
		await withDeadline(redis.healthCheck(), 2_000, "Redis");
		log.info("Redis", "Connected");
	} catch (e) {
		log.error({
			message: "Redis unavailable — rate limiting will fail open",
			error: e instanceof Error ? e.message : String(e),
		});
	}

	try {
		const { domains, wildcards } = warmCatalogue();
		log.info(
			"Catalogue",
			`Loaded ${domains.toLocaleString()} disposable domains and ${wildcards} wildcard suffixes`,
		);
	} catch (e) {
		log.error({
			message: "Failed to load the disposable catalogue",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
