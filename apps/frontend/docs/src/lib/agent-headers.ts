/** Cache policy for agent-facing docs content (HTML, markdown, indexes). */
export const AGENT_CACHE_CONTROL =
	"public, max-age=300, s-maxage=3600, must-revalidate";

/** Link header advertising agent discovery endpoints (paths include basePath). */
export const AGENT_LINK_HEADER =
	'</docs/llms.txt>; rel="llms-txt", </docs/llms-full.txt>; rel="llms-full-txt", </docs/sitemap.md>; rel="sitemap", </docs/skill.md>; rel="skill-md"';

export const AGENT_CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";
