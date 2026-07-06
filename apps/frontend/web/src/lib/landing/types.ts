import type {
	FeatureCtaBand,
	FeatureCtaLink,
} from "@reloop/web/components/landing/types";

export type LandingSection = {
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
		| "email-validator"
		| "deliverability-tester"
		| "template-generator"
		| "auth-checker"
		| "subject-tester"
		| "mobile-preview";
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

export type BlogPostDefinition = {
	slug: string;
	title: string;
	description: string;
	keywords: string[];
	publishedAt: string;
	tag: string;
	readTime: string;
	sections: { heading?: string; paragraphs: string[] }[];
};
