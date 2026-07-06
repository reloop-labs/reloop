import { alternativeConfigs } from "./alternatives";
import { blogPosts } from "./blog";
import { glossaryTerms } from "./glossary";
import { integrationConfigs } from "./integrations";
import { personaConfigs } from "./personas";
import { toolConfigs } from "./tools";
import { useCaseConfigs } from "./use-cases";

/** All independent marketing landing routes for sitemap.xml */
export function getLandingSitemapRoutes(): string[] {
	return [
		"/get-started",
		"/glossary",
		"/tools",
		...toolConfigs.map((c) => c.path),
		"/use-cases",
		...useCaseConfigs.map((c) => c.path),
		"/alternatives",
		...alternativeConfigs.map((c) => c.path),
		"/integrations",
		...integrationConfigs.map((c) => c.path),
		"/for",
		...personaConfigs.map((c) => c.path),
		...glossaryTerms.map((t) => `/glossary/${t.slug}`),
		...blogPosts.map((p) => `/company/blog/${p.slug}`),
	];
}

export {
	toolConfigs,
	useCaseConfigs,
	alternativeConfigs,
	integrationConfigs,
	personaConfigs,
	glossaryTerms,
	blogPosts,
};
