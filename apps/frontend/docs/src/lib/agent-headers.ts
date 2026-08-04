/** Cache policy for agent-facing docs content (HTML, markdown, indexes). */
export const AGENT_CACHE_CONTROL =
	"public, max-age=300, s-maxage=3600, must-revalidate";

/**
 * Agent discovery lives on the marketing web app (source of truth).
 * Absolute origin paths so docs basePath does not prefix them.
 */
export const AGENT_LINK_HEADER =
	'</llms.txt>; rel="llms-txt", </llms-docs.txt>; rel="docs-llms-txt", </llms-full-docs.txt>; rel="llms-full-txt", </skill.md>; rel="skill-md", </docs/sitemap.md>; rel="sitemap"';

export const AGENT_CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";
