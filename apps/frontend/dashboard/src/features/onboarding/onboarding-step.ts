import { parseAsInteger } from "nuqs";

/**
 * Onboarding step in the URL.
 * `history: 'push'` so the browser back button moves between steps instead of
 * leaving the whole flow (nuqs default is `replace`).
 */
export const onboardingStepParser = parseAsInteger
	.withDefault(1)
	.withOptions({ history: "push" });
