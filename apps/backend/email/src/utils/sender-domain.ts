import { emailConfig } from "@reloop/email/email.config";

/**
 * Platform system-mail From domain. Throws if RELOOP_SENDER_DOMAIN is unset.
 * Never fall back to localhost or any default.
 */
export function requireReloopSenderDomain(): string {
	const domain = emailConfig.RELOOP_SENDER_DOMAIN.trim();
	if (!domain) {
		throw new Error(
			"RELOOP_SENDER_DOMAIN is not configured. Set it in the email service environment (e.g. reloop.sh).",
		);
	}
	return domain;
}

/**
 * Onboarding test From domain. Throws if ONBOARDING_TEST_DOMAIN is unset.
 */
export function requireOnboardingTestDomain(): string {
	const domain = emailConfig.ONBOARDING_TEST_DOMAIN.trim();
	if (!domain) {
		throw new Error(
			"ONBOARDING_TEST_DOMAIN is not configured. Set it in the email service environment.",
		);
	}
	return domain;
}
