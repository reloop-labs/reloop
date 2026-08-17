import type { FeatureCtaBand } from "@reloop/web/components/landing/types";

const defaultSignupCta = {
	label: "Get Started ",
	href: "/dashboard/signup",
} as const;

const defaultDocsCta = {
	label: "Documentation",
	href: "/docs",
} as const;

export function defaultLandingCta(
	_title?: string,
	_description?: string,
): FeatureCtaBand {
	return {
		title: "Email infrastructure",
		titleMuted: "for developers",
		primary: defaultSignupCta,
		secondary: defaultDocsCta,
	};
}
