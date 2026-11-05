import { EmailNode } from "@react-email/editor/core";
import { type CSSProperties, createElement, type ReactNode } from "react";
import { parseInlineStyle } from "./email-starter-kit";

type ImageAttrs = {
	src?: string;
	alt?: string;
	href?: string | null;
	width?: number | string;
	height?: number | string;
	alignment?: string;
	align?: string;
	style?: string;
};

const ALIGN_MARGINS: Record<string, CSSProperties> = {
	center: { marginLeft: "auto", marginRight: "auto" },
	right: { marginLeft: "auto", marginRight: 0 },
	left: { marginLeft: 0, marginRight: "auto" },
};

/**
 * react-email's image serializer only uses theme styles: it drops the node's
 * own inline style (size, radius, margins set in the inspector) and its
 * alignment, so every image was sent left-aligned while the canvas showed it
 * centered. Wrap it in a one-cell table whose `align` Outlook honors, and
 * keep the inline style.
 */
export function withImageLayout<T extends EmailNode<any, any>>(image: T): T {
	// `as never`: EmailNode and this file can resolve different @tiptap/core copies.
	return EmailNode.from(image as never, ({ node, style }) => {
		const attrs = (node.attrs ?? {}) as ImageAttrs;
		const align = attrs.alignment || attrs.align || "center";
		const size = (value: number | string | undefined) =>
			value === undefined || value === "auto" || value === ""
				? undefined
				: value;
		let content: ReactNode = createElement("img", {
			alt: attrs.alt ?? "",
			src: attrs.src ?? "",
			width: size(attrs.width),
			height: size(attrs.height),
			style: {
				display: "block",
				outline: "none",
				border: "none",
				textDecoration: "none",
				...style,
				...(ALIGN_MARGINS[align] ?? {}),
				...parseInlineStyle(attrs.style),
			},
		});
		if (attrs.href) {
			content = createElement(
				"a",
				{
					href: attrs.href,
					target: "_blank",
					style: { textDecoration: "none" },
				},
				content,
			);
		}
		return createElement(
			"table",
			{
				role: "presentation",
				width: "100%",
				border: 0,
				cellPadding: 0,
				cellSpacing: 0,
			},
			createElement(
				"tbody",
				null,
				createElement("tr", null, createElement("td", { align }, content)),
			),
		);
	}) as T;
}
