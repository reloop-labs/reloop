import { appName } from "@reloop/brand";

/** Local-part for platform onboarding test From address. */
export const ONBOARDING_TEST_LOCAL_PART = "onboarding";

/**
 * Subject of the onboarding test email. Also how onboarding sends are found
 * in email_log, so it stays the same for every user; the body is what varies.
 */
export const ONBOARDING_TEST_SUBJECT = `Your ${appName} account is ready to send`;

/** Subjects older onboarding sends were logged under. */
const LEGACY_ONBOARDING_TEST_SUBJECTS = ["Hello World!"];

/** Every subject an onboarding test send may be logged under. */
export const ONBOARDING_TEST_SUBJECTS = [
	ONBOARDING_TEST_SUBJECT,
	...LEGACY_ONBOARDING_TEST_SUBJECTS,
];

/** Plain-text body used when the send's real content isn't known. */
export const ONBOARDING_TEST_TEXT = `This email confirms your ${appName} account can send.`;
