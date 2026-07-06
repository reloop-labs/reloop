import { languages, LANGUAGE_SLUGS } from "../app/features/languages/languages";
import { competitorBrands } from "../app/compare/competitor-brands";
import {
	alternativeConfigs,
	blogPosts,
	glossaryTerms,
	integrationConfigs,
	personaConfigs,
	toolConfigs,
	useCaseConfigs,
} from "./landing/routes";

export type GrosoryLink = {
	title: string;
	href: string;
};

export type GrosorySection = {
	title: string;
	hub?: GrosoryLink;
	links: GrosoryLink[];
};

export function getSectionSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function landingLinks(
	items: { titleLines?: string[]; title?: string; path: string; slug?: string }[],
	titleKey: "titleLines" | "title" = "titleLines",
): GrosoryLink[] {
	return items.map((item) => ({
		title:
			titleKey === "titleLines"
				? (item.titleLines?.join(" ") ?? item.slug ?? item.path)
				: (item.title ?? item.slug ?? item.path),
		href: item.path,
	}));
}

/** All marketing pages grouped for the /grosory directory */
export function getGrosorySections(): GrosorySection[] {
	return [
		{
			title: "Get started",
			links: [
				{ title: "Get Started", href: "/get-started" },
				{ title: "Pricing", href: "/pricing" },
				{ title: "Contact", href: "/contact" },
				{ title: "Documentation", href: "/docs" },
			],
		},
		{
			title: "Free tools",
			hub: { title: "All tools", href: "/tools" },
			links: landingLinks(toolConfigs),
		},
		{
			title: "Use cases",
			hub: { title: "All use cases", href: "/use-cases" },
			links: landingLinks(useCaseConfigs),
		},
		{
			title: "Alternatives",
			hub: { title: "All alternatives", href: "/alternatives" },
			links: landingLinks(alternativeConfigs),
		},
		{
			title: "Compare",
			hub: { title: "Compare index", href: "/compare" },
			links: competitorBrands.map((brand) => ({
				title: `Reloop vs ${brand.name}`,
				href: brand.href,
			})),
		},
		{
			title: "Integrations",
			hub: { title: "All integrations", href: "/integrations" },
			links: landingLinks(integrationConfigs),
		},
		{
			title: "Who it's for",
			hub: { title: "All audiences", href: "/for" },
			links: landingLinks(personaConfigs),
		},
		{
			title: "Features",
			hub: { title: "All features", href: "/features" },
			links: [
				{ title: "AI Agents", href: "/features/ai-agents" },
				{ title: "API Reference", href: "/features/api-reference" },
				{ title: "Campaign Builder", href: "/features/campaign-builder" },
				{ title: "Campaigns", href: "/features/campaigns" },
				{ title: "Deliverability", href: "/features/deliverability" },
				{ title: "Developers", href: "/features/developers" },
				{ title: "Email Analytics", href: "/features/email-analytics" },
				{ title: "Email Templates", href: "/features/email-templates" },
				{ title: "Email Validation", href: "/features/email-validation" },
				{ title: "Getting Started", href: "/features/getting-started" },
				{ title: "Integrations", href: "/features/integration" },
				{ title: "Marketing Teams", href: "/features/marketing-teams" },
				{ title: "SDKs", href: "/features/SDKs" },
				{ title: "SMTP Relay", href: "/features/smtp" },
				{ title: "Transaction Emails", href: "/features/transaction-emails" },
				{ title: "Webhooks", href: "/features/webhooks" },
			],
		},
		{
			title: "Language SDKs",
			hub: { title: "All languages", href: "/features/languages" },
			links: LANGUAGE_SLUGS.map((slug) => {
				const lang = languages.find((l) => l.slug === slug);
				return {
					title: lang?.name ?? slug,
					href: `/features/languages/${slug}`,
				};
			}),
		},
		{
			title: "Email glossary",
			hub: { title: "Glossary index", href: "/resources/glossary" },
			links: glossaryTerms.map((term) => ({
				title: term.title,
				href: `/glossary/${term.slug}`,
			})),
		},
		{
			title: "Blog",
			hub: { title: "All posts", href: "/company/blog" },
			links: blogPosts.map((post) => ({
				title: post.title,
				href: `/company/blog/${post.slug}`,
			})),
		},
		{
			title: "Resources",
			links: [
				{ title: "Changelog", href: "/resources/changelog" },
				{ title: "Community", href: "/resources/community" },
				{ title: "Self-hosting Guide", href: "/resources/self-hosting-guide" },
				{ title: "Status", href: "/resources/status" },
				{ title: "Free Tools (resources)", href: "/resources/tools" },
			],
		},
		{
			title: "Company",
			links: [
				{ title: "About Us", href: "/company/about-us" },
				{ title: "Blog", href: "/company/blog" },
				{ title: "Contact Us", href: "/company/contact-us" },
				{ title: "License", href: "/company/license" },
				{ title: "Privacy Policy", href: "/company/privacy" },
				{ title: "Terms and Conditions", href: "/company/terms-and-conditions" },
			],
		},
		{
			title: "Philosophy",
			links: [
				{ title: "Why Reloop", href: "/philosophy/why-reloop" },
				{ title: "Why Open Source", href: "/philosophy/why-open-source" },
				{ title: "What We Stand For", href: "/philosophy/what-we-stand-for" },
				{ title: "Our Product Beliefs", href: "/philosophy/our-product-beliefs" },
				{ title: "Engineering", href: "/philosophy/engineering" },
			],
		},
	];
}

export function getGrosoryLinkCount(): number {
	return getGrosorySections().reduce((sum, section) => sum + section.links.length, 0);
}
