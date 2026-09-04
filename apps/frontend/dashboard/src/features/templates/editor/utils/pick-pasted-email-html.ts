export function isFullEmailHtml(html: string): boolean {
	const lower = html.toLowerCase();
	return (
		lower.includes("<table") ||
		lower.includes("<html") ||
		lower.includes("<!doctype")
	);
}

function isEmailSourceString(html: string): boolean {
	const lower = html.toLowerCase();
	return (
		lower.includes("<!doctype") ||
		(lower.includes("<html") &&
			(lower.includes("<table") || lower.includes("<style")))
	);
}

function unwrapClipboardHtml(html: string): string {
	const start = html.indexOf("<!--StartFragment-->");
	const end = html.indexOf("<!--EndFragment-->");
	if (start >= 0 && end > start) {
		return html.slice(start + "<!--StartFragment-->".length, end).trim();
	}
	return html;
}

/**
 * The HTML code editor pastes `text/plain` (the source string).
 * TipTap's default paste uses `text/html`, which is often empty or a
 * browser wrapper when copying source from a file/demo — then the
 * canvas shows the tags as text. Prefer the source string.
 */
export function pickPastedEmailHtml(
	richHtml: string,
	plain: string,
): string | null {
	const rich = richHtml.trim();
	const text = plain.trim();
	const plainIsEmail = Boolean(text && isFullEmailHtml(text));
	const richIsEmail = Boolean(rich && isFullEmailHtml(rich));

	if (plainIsEmail && isEmailSourceString(text)) return text;
	if (richIsEmail && isEmailSourceString(rich) && !plainIsEmail) {
		return unwrapClipboardHtml(rich);
	}
	if (plainIsEmail) return text;
	if (richIsEmail) return unwrapClipboardHtml(rich);
	return null;
}
