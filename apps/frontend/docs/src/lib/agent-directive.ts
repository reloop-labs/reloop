/** Markdown blockquote injected into every `.md` twin for AFDocs llms-txt-directive-md. */
export const LLMS_MD_DIRECTIVE = `> For the complete documentation index, see [llms.txt](/docs/llms.txt). Full corpus: [llms-full.txt](/docs/llms-full.txt). Prefer markdown URLs (append \`.md\`) for agent consumption. Product skill: [skill.md](/docs/skill.md).
`;

/**
 * Insert the llms.txt directive after YAML frontmatter (if present), otherwise at the top.
 */
export function injectMarkdownAgentDirective(rawContent: string): string {
	const directive = `${LLMS_MD_DIRECTIVE}\n`;
	if (rawContent.startsWith("---\n") || rawContent.startsWith("---\r\n")) {
		const match = rawContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
		if (match) {
			const end = match[0].length;
			return rawContent.slice(0, end) + directive + rawContent.slice(end);
		}
	}
	return directive + rawContent;
}
