import { competitorBrands } from "../app/compare/competitor-brands";
import { LANGUAGE_SLUGS, languages } from "../app/features/languages/languages";
import {
	alternativeConfigs,
	blogPosts,
	glossaryTerms,
	integrationConfigs,
	personaConfigs,
	toolConfigs,
	useCaseConfigs,
} from "./landing/routes";

export type GlossaryLink = {
	title: string;
	href: string;
};

export type GlossarySection = {
	title: string;
	hub?: GlossaryLink;
	links: GlossaryLink[];
};

export function getSectionSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function landingLinks(
	items: {
		titleLines?: string[];
		title?: string;
		path: string;
		slug?: string;
	}[],
	titleKey: "titleLines" | "title" = "titleLines",
): GlossaryLink[] {
	return items.map((item) => ({
		title:
			titleKey === "titleLines"
				? (item.titleLines?.join(" ") ?? item.slug ?? item.path)
				: (item.title ?? item.slug ?? item.path),
		href: item.path,
	}));
}

function section(
	title: string,
	links: GlossaryLink[],
	hub?: GlossaryLink,
): GlossarySection {
	return { title, links, hub };
}

/** All marketing pages grouped for the /glossary directory */
export function getGlossarySections(): GlossarySection[] {
	return [
		section("Get started", [
			{ title: "Get Started", href: "/get-started" },
			{ title: "Pricing", href: "/pricing" },
			{ title: "Contact", href: "/contact" },
			{ title: "Documentation", href: "/docs" },
		]),
		section("Free tools", landingLinks(toolConfigs), {
			title: "View all tools",
			href: "/tools",
		}),
		section("Use cases", landingLinks(useCaseConfigs), {
			title: "View all use cases",
			href: "/use-cases",
		}),
		section("Alternatives", landingLinks(alternativeConfigs), {
			title: "View all alternatives",
			href: "/alternatives",
		}),
		section(
			"Compare",
			competitorBrands.map((brand) => ({
				title: `Reloop vs ${brand.name}`,
				href: brand.href,
			})),
			{ title: "View all comparisons", href: "/compare" },
		),
		section("Integrations", landingLinks(integrationConfigs), {
			title: "View all integrations",
			href: "/integrations",
		}),
		section("Who it's for", landingLinks(personaConfigs), {
			title: "See all teams",
			href: "/for",
		}),
		section(
			"Features",
			[
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
				{ title: "SDKs", href: "/docs/resources/sdks" },
				{ title: "SMTP Relay", href: "/features/smtp" },
				{ title: "Transaction Emails", href: "/features/transaction-emails" },
				{ title: "Webhooks", href: "/features/webhooks" },
			],
			{ title: "View all features", href: "/features" },
		),
		section(
			"Language SDKs",
			LANGUAGE_SLUGS.map((slug) => {
				const lang = languages.find((l) => l.slug === slug);
				return {
					title: lang?.name ?? slug,
					href: `/features/languages/${slug}`,
				};
			}),
			{ title: "View all SDKs", href: "/docs/resources/sdks" },
		),
		section(
			"Blog",
			blogPosts.map((post) => ({
				title: post.title,
				href: `/company/blog/${post.slug}`,
			})),
			{ title: "View all posts", href: "/company/blog" },
		),
		section("Resources", [
			{ title: "Changelog", href: "/resources/changelog" },
			{ title: "Community", href: "/resources/community" },
			{ title: "Self-hosting Guide", href: "/docs/self-host" },
			{ title: "Status", href: "/resources/status" },
			{ title: "Tools overview", href: "/resources/tools" },
		]),
		section("Company", [
			{ title: "About Us", href: "/about" },
			{ title: "Blog", href: "/company/blog" },
			{ title: "Contact Us", href: "/contact" },
			{ title: "License", href: "/company/license" },
			{ title: "Privacy Policy", href: "/company/privacy" },
			{ title: "Terms and Conditions", href: "/company/terms-and-conditions" },
		]),
		section("Philosophy", [
			{ title: "Why Reloop", href: "/philosophy/why-reloop" },
			{ title: "Why Open Source", href: "/philosophy/why-open-source" },
			{ title: "What We Stand For", href: "/philosophy/what-we-stand-for" },
			{ title: "Our Product Beliefs", href: "/philosophy/our-product-beliefs" },
			{ title: "Engineering", href: "/philosophy/engineering" },
		]),
		section(
			"Glossary",
			glossaryTerms.map((term) => ({
				title: term.title,
				href: `/glossary/${term.slug}`,
			})),
		),
	];
}

export function getGlossaryLinkCount(): number {
	return getGlossarySections().reduce(
		(sum, section) => sum + section.links.length,
		0,
	);
}

export function getGlossaryPageDescription(_totalLinks: number): string {
	return "Explore the Reloop site directory. Browse our full collection of developer tools, integrations, language SDKs, blog posts, glossary terms, and guides.";
}

export function getGlossaryPageOgDescription(_totalLinks: number): string {
	return "Find everything you need to build with Reloop. Browse our directory of developer tools, integrations, SDKs, and guides.";
}
