import type {
	FeatureCtaBand,
	FeatureCtaLink,
} from "@reloop/web/components/landing/types";

type LandingSection = {
	title: string;
	description?: string;
	alt?: boolean;
	items: { title: string; description: string }[];
};

export type LandingPageDefinition = {
	slug: string;
	path: string;
	titleLines: string[];
	description: string;
	keywords: string[];
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	sections: LandingSection[];
	cta: FeatureCtaBand;
	relatedLinks?: { label: string; href: string }[];
};

export type ToolDefinition = LandingPageDefinition & {
	toolType:
		| "dns-lookup"
		| "spoof-checker"
		| "who-sends"
		| "domain-age"
		| "lookalike-watch"
		| "email-spam-words-checker"
		| "blocklist-checker"
		| "temp-email-checker"
		| "email-validator"
		| "deliverability-tester"
		| "auth-checker"
		| "bimi-checker"
		| "spf-generator"
		| "dkim-generator"
		| "dmarc-generator";
};

export type AlternativeDefinition = LandingPageDefinition & {
	competitorName: string;
	compareHref: string;
	highlights: string[];
};

export type GlossaryTermDefinition = {
	slug: string;
	title: string;
	description: string;
	keywords: string[];
	body: string;
	relatedTerms?: { slug: string; title: string }[];
	relatedFeatureHref?: string;
};

export type BlogPostAuthor = {
	name: string;
	avatar?: string;
	role?: string;
};

export type BlogCategoryDefinition = {
	slug: string;
	name: string;
	description: string;
};

export type BlogPostDefinition = {
	slug: string;
	title: string;
	description: string;
	keywords: string[];
	publishedAt: string;
	category: string;
	tags: string[];
	readTime: string;
	author: BlogPostAuthor;
	image?: string;
	draft?: boolean;
	relatedSlugs?: string[];
};

export type BlogTocItem = {
	title: string;
	url: string;
	depth: number;
};
