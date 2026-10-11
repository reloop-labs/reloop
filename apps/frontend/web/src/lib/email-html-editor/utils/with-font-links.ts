/**
 * Composed canvas HTML drops the source email's `<link>` font stylesheets.
 * The imported editor CSS still carries them as `@import url(...)` lines, so
 * put them back in `<head>` for anything that renders the HTML elsewhere.
 */
export function withFontLinks(html: string, importedCss: string): string {
	const hrefs = [
		...importedCss.matchAll(/@import\s+url\(\s*['"]?([^'")]+)['"]?\s*\)/g),
	]
		.map((match) => match[1]?.trim())
		.filter((href): href is string => !!href && !html.includes(href));
	if (!hrefs.length) return html;

	const links = [...new Set(hrefs)]
		.map((href) => `<link href="${href}" rel="stylesheet" />`)
		.join("");
	return /<\/head>/i.test(html)
		? html.replace(/<\/head>/i, `${links}</head>`)
		: `${links}${html}`;
}
