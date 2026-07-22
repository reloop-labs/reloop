/** Escape plain text and wrap paragraphs for the compose editor. */
export function plainToHtml(text: string) {
	const escaped = text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
	return escaped
		.split(/\n\s*\n/)
		.map((p) => `<p>${p.replaceAll("\n", "<br />")}</p>`)
		.join("");
}
