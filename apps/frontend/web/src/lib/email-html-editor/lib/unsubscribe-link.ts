export const UNSUBSCRIBE_URL_VARIABLE = "unsubscribe_url";
export const DEFAULT_UNSUBSCRIBE_LINK_TITLE = "Unsubscribe";
export const UNSUBSCRIBE_HREF_PLACEHOLDER = `{{{${UNSUBSCRIBE_URL_VARIABLE}}}}`;
export const UNSUBSCRIBE_LINK_ATTR = "data-unsubscribe-link";

export function isUnsubscribeHref(href: string | null | undefined): boolean {
	if (!href) return false;
	const compact = href.replace(/\s/g, "").toLowerCase();
	return (
		compact === "{{{unsubscribe_url}}}" ||
		compact === "{{unsubscribe_url}}" ||
		compact.includes("unsubscribe_url")
	);
}

export function unsubscribeLinkTitle(raw?: string | null): string {
	const title = raw?.trim();
	return title || DEFAULT_UNSUBSCRIBE_LINK_TITLE;
}

export function unsubscribeAnchorHtml(title?: string | null): string {
	const text = escapeHtml(unsubscribeLinkTitle(title));
	return (
		`<a href="${UNSUBSCRIBE_HREF_PLACEHOLDER}" ${UNSUBSCRIBE_LINK_ATTR}="true">` +
		`${text}</a>`
	);
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
