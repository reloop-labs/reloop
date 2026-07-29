import { createSessionCacheRedis } from "@reloop/auth/middleware";
import { emailConfig } from "@reloop/email/email.config";

export const onboardingSessionRedis = createSessionCacheRedis(
	emailConfig.REDIS_URL,
	5,
);

export const onboardingSessionOpts = {
	baseUrl: emailConfig.BASE_URL,
	redis: onboardingSessionRedis,
	ttl: 5,
} as const;
