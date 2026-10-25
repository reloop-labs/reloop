/** Markdown blockquote for marketing `.md` twins (AFDocs llms-txt-directive-md). */
export const WEB_LLMS_MD_DIRECTIVE = `> For the site documentation index, see [llms.txt](/llms.txt). Docs index: [llms-docs.txt](/llms-docs.txt). Marketing corpus: [llms-full.txt](/llms-full.txt). Docs corpus: [llms-full-docs.txt](/llms-full-docs.txt). Product skill: [skill.md](/skill.md). Prefer markdown URLs (append \`.md\`) when available.
`;

export type MarkdownMeta = {
	canonical?: string;
	lastUpdated?: string;
};

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

function firstH1(body: string): { title: string; index: number } | null {
	const match = body.match(/^# (.+)$/m);
	return match?.index === undefined
		? null
		: { title: match[1]!.trim(), index: match.index };
}

/** First `> ...` line directly under the H1, used as the frontmatter description. */
function leadQuote(body: string, afterIndex: number): string | undefined {
	const rest = body.slice(afterIndex).split("\n").slice(1);
	for (const line of rest) {
		const trimmed = line.trim();
		if (trimmed === "") continue;
		return trimmed.startsWith("> ") ? trimmed.slice(2).trim() : undefined;
	}
	return undefined;
}

/**
 * Shape a marketing `.md` twin for agents: `---` frontmatter (title,
 * description, canonical, last-updated), then the `# H1`, then the llms.txt
 * directive. Agents expect the document to open with frontmatter or a heading,
 * so the directive sits under the H1 instead of above it.
 */
export function injectMarkdownAgentDirective(
	rawContent: string,
	meta: MarkdownMeta = {},
): string {
	const existing = rawContent.match(FRONTMATTER)?.[0];
	const body = existing ? rawContent.slice(existing.length) : rawContent;
	const h1 = firstH1(body);

	let withDirective = `${WEB_LLMS_MD_DIRECTIVE}\n${body}`;
	if (h1) {
		const lineEnd = body.indexOf("\n", h1.index);
		const cut = lineEnd === -1 ? body.length : lineEnd + 1;
		withDirective = `${body.slice(0, cut)}\n${WEB_LLMS_MD_DIRECTIVE}\n${body.slice(cut).replace(/^\n+/, "")}`;
	}

	if (existing) return existing + withDirective;
	if (!h1) return withDirective;

	const fields: Array<[string, string | undefined]> = [
		["title", h1.title],
		["description", leadQuote(body, h1.index)],
		["canonical", meta.canonical],
		["last-updated", meta.lastUpdated],
	];
	const frontmatter = fields
		.filter((field): field is [string, string] => Boolean(field[1]))
		.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
		.join("\n");

	return `---\n${frontmatter}\n---\n\n${withDirective}`;
}
