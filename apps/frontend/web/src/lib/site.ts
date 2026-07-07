export const siteName = "Reloop";

export const contactEmail = "reloop.sh@gmail.com";

/** Reloop hosted product signup */
export const hostedSignupHref = "/dashboard/signup";

/**
 * Core product positioning: proprietary-grade email infra, open-source codebase,
 * hosted by Reloop Labs or self-hosted by the user.
 */
export const productOffering =
	"Reloop delivers the same email infrastructure as proprietary platforms—transactional email, campaigns, SMTP relay, templates, webhooks, analytics, and more. Our codebase is open source and self-hostable: use Reloop as a hosted service from Reloop Labs, or deploy it on your own infrastructure.";

export const siteDescription =
	"Open-source, self-hostable email infrastructure—with a hosted service from Reloop Labs or deploy it yourself.";

export const defaultOgImage = "/web-app-manifest-512x512.png";

export const socialProfiles = {
	github: "https://github.com/reloop-labs/reloop",
	discord: "https://discord.gg/bHnkBcp7xR",
	x: "https://x.com/reloophq",
} as const;

export function getSiteUrl() {
	const url = process.env.NEXT_PUBLIC_URL ?? "https://reloop.sh";
	return url.replace(/\/$/, "");
}
