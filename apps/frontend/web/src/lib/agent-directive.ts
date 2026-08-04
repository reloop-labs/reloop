/** Markdown blockquote for marketing `.md` twins (AFDocs llms-txt-directive-md). */
export const WEB_LLMS_MD_DIRECTIVE = `> For the site documentation index, see [llms.txt](/llms.txt). Docs index: [llms-docs.txt](/llms-docs.txt). Marketing corpus: [llms-full.txt](/llms-full.txt). Docs corpus: [llms-full-docs.txt](/llms-full-docs.txt). Product skill: [skill.md](/skill.md). Prefer markdown URLs (append \`.md\`) when available.
`;

export function injectMarkdownAgentDirective(rawContent: string): string {
	const directive = `${WEB_LLMS_MD_DIRECTIVE}\n`;
	if (rawContent.startsWith("---\n") || rawContent.startsWith("---\r\n")) {
		const match = rawContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
		if (match) {
			const end = match[0].length;
			return rawContent.slice(0, end) + directive + rawContent.slice(end);
		}
	}
	return directive + rawContent;
}
