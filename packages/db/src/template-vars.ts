/**
 * template-vars.ts
 *
 * Shared by the mail API (step 5), campaigns and workflows so every send path
 * fills template variables the same way.
 *
 * Variable values come from API callers and from contact data (a first name a
 * stranger typed into a signup form), so they are HTML-escaped when they land
 * in an HTML body. Otherwise a value like `<a href="https://evil.example">`
 * would render as a real link in a mail sent from the customer's domain.
 * Subjects, plain-text bodies and recipients are not HTML, so they get the raw
 * value.
 */

const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

/** Escape a value for HTML text or a quoted attribute. */
export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace `{{{name}}}` placeholders (whitespace inside the braces allowed).
 * Set `html` when `input` is an HTML body so values are escaped.
 */
export function fillTripleBraceVars(
	input: string,
	vars: Record<string, string | number>,
	options: { html: boolean },
): string {
	let out = input;
	for (const [name, value] of Object.entries(vars)) {
		const raw = String(value);
		const replacement = options.html ? escapeHtml(raw) : raw;
		// A function replacer, so `$&` or `$1` in a value stay literal.
		out = out.replace(
			new RegExp(`{{{\\s*${escapeRegExp(name)}\\s*}}}`, "g"),
			() => replacement,
		);
	}
	return out;
}
