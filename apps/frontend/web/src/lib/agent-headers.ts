/** Cache policy for agent-facing marketing content. */
export const AGENT_CACHE_CONTROL =
	"public, max-age=300, s-maxage=3600, must-revalidate";

export const AGENT_LINK_HEADER =
	'</llms.txt>; rel="llms-txt", </llms-docs.txt>; rel="docs-llms-txt", </llms-full.txt>; rel="llms-full-txt", </llms-full-docs.txt>; rel="docs-llms-full-txt", </sitemap.md>; rel="sitemap", </skill.md>; rel="skill-md"';

export const AGENT_CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";
