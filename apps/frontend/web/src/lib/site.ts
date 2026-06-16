import { LANGUAGE_SLUGS } from "../app/(main)/features/languages/languages";

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

/** Marketing and content routes included in sitemap.xml */
export const sitemapRoutes = [
	"/",
	"/contact",
	"/pricing",
	"/compare",
	"/compare/resend",
	"/compare/mailgun",
	"/compare/sendgrid",
	"/compare/aws-ses",
	"/compare/postmark",
	"/compare/loops",
	"/compare/mailchimp",
	"/features",
	"/features/ai-agents",
	"/features/api-reference",
	"/features/campaign-builder",
	"/features/campaigns",
	"/features/deliverability",
	"/features/developers",
	"/features/email-analytics",
	"/features/email-templates",
	"/features/email-validation",
	"/features/getting-started",
	"/features/integration",
	"/features/languages",
	"/features/marketing-teams",
	"/features/smtp",
	"/features/SDKs",
	"/features/transaction-emails",
	"/features/webhooks",
	"/resources/changelog",
	"/resources/community",
	"/resources/glossary",
	"/resources/self-hosting-guide",
	"/resources/status",
	"/resources/tools",
	"/company/about-us",
	"/company/blog",
	"/company/contact-us",
	"/company/license",
	"/company/privacy",
	"/company/terms-and-conditions",
	"/philosophy/engineering",
	"/philosophy/our-product-beliefs",
	"/philosophy/what-we-stand-for",
	"/philosophy/why-open-source",
	"/philosophy/why-reloop",
	...LANGUAGE_SLUGS.map((slug) => `/features/languages/${slug}`),
];
