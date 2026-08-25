import { initDeliverabilityInboundSubscriber } from "@be/tools/subscribers/deliverability-inbound.subscriber";
import { toolsConfig } from "@be/tools/tools.config";
import { withDeadline } from "@be/tools/utils/deadline";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { warmCatalogue } from "@reloop/email-validation";
import { log } from "evlog";

export const redis = new RedisCache("tools", 60, toolsConfig.REDIS_URL);

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export async function loader(): Promise<void> {
	try {
		await withDeadline(redis.healthCheck(), 2_000, "Redis");
		log.info("Redis", "Connected");
	} catch (error) {
		log.error({
			message: "Redis unavailable - rate limiting will fail open",
			error: errorMessage(error),
		});
	}

	let natsConnected = false;
	try {
		await bus.connect(toolsConfig.NATS_URL);
		log.info("NATS", "Connected");
		natsConnected = true;
	} catch (error) {
		log.warn({
			message: "NATS connection skipped or unavailable for tools service",
			error: errorMessage(error),
		});
	}

	if (natsConnected) {
		try {
			await bus.ensureStream("kumomta-inbound", ["kumomta.inbound_received"]);
		} catch (error) {
			log.warn({
				message:
					"JetStream stream setup failed - continuing with core NATS subscribe",
				error: errorMessage(error),
			});
		}

		try {
			await initDeliverabilityInboundSubscriber();
		} catch (error) {
			log.error({
				message: "Failed to initialize deliverability inbound subscriber",
				error: errorMessage(error),
			});
		}
	}

	try {
		const { domains, wildcards } = warmCatalogue();
		log.info(
			"Catalogue",
			`Loaded ${domains.toLocaleString()} disposable domains and ${wildcards} wildcard suffixes`,
		);
	} catch (error) {
		log.error({
			message: "Failed to load the disposable catalogue",
			error: errorMessage(error),
		});
	}
}
