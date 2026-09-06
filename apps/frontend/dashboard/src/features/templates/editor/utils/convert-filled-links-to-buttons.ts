import { cssHasPaintedBackground } from "./preserve-email-link-underlines";

export interface TipTapJsonNode {
	type?: string;
	attrs?: Record<string, unknown>;
	content?: TipTapJsonNode[];
	marks?: Array<{
		type: string;
		attrs?: Record<string, unknown>;
	}>;
	text?: string;
	[key: string]: unknown;
}

function hasPaintedBackgroundCss(style: string): boolean {
	if (!style) return false;
	if (typeof document !== "undefined" && cssHasPaintedBackground(style)) {
		return true;
	}
	const s = style.toLowerCase();
	const bgMatch = s.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/);
	if (bgMatch && bgMatch[1]) {
		const val = bgMatch[1].trim();
		return (
			val !== "" &&
			val !== "none" &&
			val !== "transparent" &&
			val !== "inherit" &&
			val !== "initial" &&
			val !== "rgba(0, 0, 0, 0)" &&
			val !== "rgba(0,0,0,0)"
		);
	}
	return false;
}

function hasButtonPaddingCss(style: string): boolean {
	if (!style) return false;
	const s = style.toLowerCase();
	if (/\bpadding\s*:\s*(?!0(?:\s|px|rem|em|;|$))/.test(s)) return true;
	if (/\bpadding-(?:top|bottom|left|right)\s*:\s*(?!0(?:\s|px|rem|em|;|$))/.test(s))
		return true;
	return false;
}

function isCtaLinkMark(mark: {
	type: string;
	attrs?: Record<string, unknown>;
}): boolean {
	if (mark.type !== "link" || !mark.attrs) return false;
	const style = String(mark.attrs.style || "");
	const cls = String(mark.attrs.class || "");
	const dataId = String(mark.attrs["data-id"] || "");

	if (dataId === "react-email-button") return true;
	if (/(?:^|\s)button\b/i.test(cls)) return true;

	const hasBg =
		hasPaintedBackgroundCss(style) ||
		/(?:^|\s)bg-(?!transparent|none)/i.test(cls);
	const hasPadding =
		hasButtonPaddingCss(style) ||
		/(?:^|\s)(?:p|px|py|pt|pb|pl|pr)-(?!0)/i.test(cls);
	const hasInlineBlock =
		/\bdisplay\s*:\s*inline-block/i.test(style) ||
		/\bdisplay\s*:\s*block/i.test(style);

	// A button must have painted background AND (padding or inline-block display or button styling)
	return hasBg && (hasPadding || hasInlineBlock);
}

/**
 * Checks if a paragraph node in TipTap JSON represents a CTA button
 * (i.e. single link with button styling inside a paragraph) and returns
 * the button attributes and contents if so.
 */
export function extractButtonFromParagraphJson(
	node: TipTapJsonNode,
): { attrs: Record<string, unknown>; content: TipTapJsonNode[] } | null {
	if (node.type !== "paragraph" || !node.content || node.content.length === 0) {
		return null;
	}

	// Filter out empty whitespace text nodes
	const meaningfulNodes = node.content.filter(
		(child) => child.text !== undefined && child.text.trim().length > 0,
	);
	if (meaningfulNodes.length === 0) return null;

	// All meaningful text nodes must belong to the same CTA link
	const firstChild = meaningfulNodes[0];
	if (!firstChild?.marks) return null;

	const linkMark = firstChild.marks.find(isCtaLinkMark);
	if (!linkMark || !linkMark.attrs) return null;

	const linkHref = String(linkMark.attrs.href || "#");
	const linkStyle = String(linkMark.attrs.style || "");

	// Verify all other meaningful nodes share the exact same CTA link href
	for (const child of meaningfulNodes) {
		const m = child.marks?.find(
			(mk) => mk.type === "link" && String(mk.attrs?.href || "#") === linkHref,
		);
		if (!m) return null;
	}

	// Determine alignment
	const alignment =
		node.attrs?.alignment ||
		node.attrs?.align ||
		(linkStyle.includes("margin: 0 auto") || linkStyle.includes("margin:0 auto")
			? "center"
			: "left");

	// Build clean button style from the link mark styles
	const buttonStyle = linkStyle.trim();

	// Clean marks on content text nodes: strip the link mark, retain bold
	const buttonContent: TipTapJsonNode[] = meaningfulNodes.map((child) => {
		const cleanMarks = (child.marks || []).filter((mk) => mk.type !== "link");
		return {
			type: "text",
			text: child.text,
			...(cleanMarks.length > 0 ? { marks: cleanMarks } : {}),
		};
	});

	return {
		attrs: {
			class: "button",
			href: linkHref,
			alignment,
			align: alignment,
			...(buttonStyle ? { style: buttonStyle } : {}),
		},
		content: buttonContent,
	};
}

/**
 * Traverses TipTap JSON and converts any standalone CTA link paragraphs
 * into native TipTap `button` nodes.
 * Returns `true` if any nodes were converted.
 */
export function convertFilledLinksToButtonsInJson(root: TipTapJsonNode): boolean {
	let modified = false;

	function walk(node: TipTapJsonNode) {
		if (!node.content || !Array.isArray(node.content)) return;

		for (let i = 0; i < node.content.length; i++) {
			const child = node.content[i];
			if (!child) continue;

			if (child.type === "paragraph") {
				const buttonData = extractButtonFromParagraphJson(child);
				if (buttonData) {
					node.content[i] = {
						type: "button",
						attrs: buttonData.attrs,
						content: buttonData.content,
					};
					modified = true;
					continue;
				}
			}

			walk(child);
		}
	}

	walk(root);
	return modified;
}
