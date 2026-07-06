import type { FeatureCtaBand } from "@reloop/web/components/landing/types";

export const defaultSignupCta = {
	label: "Get started free",
	href: "/dashboard/signup",
} as const;

export const defaultDocsCta = {
	label: "Read documentation",
	href: "/docs",
} as const;

export function defaultLandingCta(
	title: string,
	description: string,
): FeatureCtaBand {
	return {
		title,
		titleMuted: "Start free today.",
		description,
		primary: defaultSignupCta,
		secondary: defaultDocsCta,
	};
}
