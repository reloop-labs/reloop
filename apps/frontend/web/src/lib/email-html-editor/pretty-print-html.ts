const VOID_TAGS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

/**
 * Indent HTML for the code editor. Does not rewrite tags, attributes, or
 * compile through TipTap — pasted email markup stays intact.
 */
export function prettyPrintHtml(html: string): string {
	const trimmed = html.trim();
	if (!trimmed) return html;

	const lines = trimmed
		.replace(/>(\s*)</g, ">\n<")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const tab = "  ";
	let indent = 0;
	const out: string[] = [];

	for (const token of lines) {
		const isClosing = token.startsWith("</");
		if (isClosing) indent = Math.max(indent - 1, 0);

		out.push(`${tab.repeat(indent)}${token}`);

		const tag = token.match(/^<\/?([a-zA-Z][\w:-]*)/)?.[1]?.toLowerCase();
		const isOpening =
			token.startsWith("<") &&
			!isClosing &&
			!token.startsWith("<!") &&
			!token.startsWith("<?") &&
			!token.endsWith("/>");

		if (isOpening && tag && !VOID_TAGS.has(tag)) {
			indent += 1;
		}
	}

	return out.join("\n");
}
