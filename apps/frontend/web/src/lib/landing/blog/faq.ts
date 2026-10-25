import type { BlogFaqItem } from "../types";

const ACCORDION_REGEX =
	/<Accordion\s+title=(["'])([\s\S]*?)\1\s*>([\s\S]*?)<\/Accordion>/g;

/** Reduce MDX/markdown to the plain text a search engine should read. */
function toPlainText(source: string): string {
	return source
		.replace(/^\s*```.*$/gm, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/(\*\*|__)(.+?)\1/g, "$2")
		.replace(/(\*|_)(.+?)\1/g, "$2")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
}

/** Question/answer pairs from a post's `<Accordion title="...">` blocks. */
export function extractFaq(content: string): BlogFaqItem[] {
	const items: BlogFaqItem[] = [];

	for (const match of content.matchAll(ACCORDION_REGEX)) {
		const question = toPlainText(match[2] ?? "");
		const answer = toPlainText(match[3] ?? "");

		if (question && answer) {
			items.push({ question, answer });
		}
	}

	return items;
}
