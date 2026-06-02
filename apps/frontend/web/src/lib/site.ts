import { LANGUAGE_SLUGS } from "../app/(main)/features/languages/languages";

export const siteName = "Reloop";

export const contactEmail = "reloop.sh@gmail.com";

export const siteDescription =
	"An open-source and self-hostable SendGrid, Mailchimp, Resend, and Loops alternative.";

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
