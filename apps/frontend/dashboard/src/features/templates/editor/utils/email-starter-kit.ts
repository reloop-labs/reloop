import { EmailMark, EmailNode } from "@react-email/editor/core";
import { StarterKit, TableHeader } from "@react-email/editor/extensions";
import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import {
	type EditorState,
	NodeSelection,
	Plugin,
	PluginKey,
	TextSelection,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { createElement } from "react";
import { EMAIL_DECORATION_ATTR } from "./preserve-email-link-underlines";

export const EMAIL_FONT_COLOR_MARK = "emailFontColor";

export const EmailImage = Node.create({
	name: "image",
	group: "block",
	atom: true,
	draggable: true,
	addAttributes() {
		return {
			src: {
				default: "",
				parseHTML: (element) => element.getAttribute("src") || "",
				renderHTML: (attributes) => {
					if (!attributes.src) return {};
					return { src: attributes.src };
				},
			},
			alt: {
				default: "",
				parseHTML: (element) => element.getAttribute("alt") || "",
				renderHTML: (attributes) => {
					if (!attributes.alt) return {};
					return { alt: attributes.alt };
				},
			},
			width: {
				default: "auto",
				parseHTML: (element) => element.getAttribute("width") || "auto",
				renderHTML: (attributes) => {
					if (!attributes.width || attributes.width === "auto") return {};
					return { width: attributes.width };
				},
			},
			height: {
				default: "auto",
				parseHTML: (element) => element.getAttribute("height") || "auto",
				renderHTML: (attributes) => {
					if (!attributes.height || attributes.height === "auto") return {};
					return { height: attributes.height };
				},
			},
			alignment: {
				default: "center",
				parseHTML: (element) =>
					element.getAttribute("alignment") ||
					element.getAttribute("align") ||
					"center",
				renderHTML: (attributes) => {
					if (!attributes.alignment) return {};
					return { alignment: attributes.alignment };
				},
			},
			href: {
				default: null,
				parseHTML: (element) =>
					element.getAttribute("href") || element.getAttribute("data-href"),
				renderHTML: (attributes) => {
					if (!attributes.href) return {};
					return {
						href: attributes.href,
						"data-href": attributes.href,
					};
				},
			},
		};
	},
	parseHTML() {
		return [{ tag: "img[src]" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["img", mergeAttributes(HTMLAttributes)];
	},
	addCommands() {
		return {
			setImage:
				(attrs: Record<string, unknown>) =>
				({ commands }: any) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

/** Inline typography the inspector can apply to a selected run of text. */
export const EMAIL_TEXT_STYLE_PROPS = [
	"color",
	"fontSize",
	"fontFamily",
	"fontWeight",
	"letterSpacing",
] as const;

export type EmailTextStyleProp = (typeof EMAIL_TEXT_STYLE_PROPS)[number];

function cssPropName(prop: string): string {
	return prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export function parseInlineStyle(cssText: unknown): Record<string, string> {
	const out: Record<string, string> = {};
	if (typeof cssText !== "string") return out;
	for (const part of cssText.split(";")) {
		const colon = part.indexOf(":");
		if (colon < 0) continue;
		const key = part
			.slice(0, colon)
			.trim()
			.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
		const value = part.slice(colon + 1).trim();
		if (key && value) out[key] = value;
	}
	return out;
}

/**
 * Typography on a selected run (a word, not the whole block). Kept under the
 * original `emailFontColor` name so stored documents keep their colors. It is
 * an EmailMark: plain marks are skipped by composeReactEmail, which used to
 * drop these styles from the sent email.
 */
const emailFontColor = EmailMark.create({
	name: EMAIL_FONT_COLOR_MARK,
	addAttributes() {
		return Object.fromEntries(
			EMAIL_TEXT_STYLE_PROPS.map((prop) => [
				prop,
				{
					default: null,
					parseHTML: (element: HTMLElement) =>
						element.style.getPropertyValue(cssPropName(prop)) || null,
					renderHTML: (attributes: Record<string, unknown>) => {
						const value = attributes[prop];
						if (!value) return {};
						return { style: `${cssPropName(prop)}: ${String(value)}` };
					},
				},
			]),
		);
	},
	parseHTML() {
		return [{ tag: "span[data-email-font-color]" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["span", { "data-email-font-color": "", ...HTMLAttributes }, 0];
	},
	renderToReactEmail({ children, mark, style }) {
		const own: Record<string, string> = {};
		for (const prop of EMAIL_TEXT_STYLE_PROPS) {
			const value = mark.attrs?.[prop];
			if (value) own[prop] = String(value);
		}
		return createElement("span", { style: { ...style, ...own } }, children);
	},
});

/**
 * StarterKit's TableHeader is a plain Node, and composeReactEmail drops any
 * node that is not an EmailNode, so `<th>` cells vanished from sent email.
 */
const EmailTableHeader = EmailNode.from(
	TableHeader,
	({ children, node, style }) => {
		const attrs = (node.attrs ?? {}) as Record<string, unknown>;
		const toSpan = (v: unknown) =>
			v === null || v === undefined || v === "" ? undefined : Number(v);
		return createElement(
			"th",
			{
				className: (attrs.class as string) || undefined,
				align:
					(attrs.align as string) || (attrs.alignment as string) || undefined,
				valign: (attrs.valign as string) || undefined,
				colSpan: toSpan(attrs.colspan),
				rowSpan: toSpan(attrs.rowspan),
				scope: (attrs.scope as string) || undefined,
				style: { ...style, ...parseInlineStyle(attrs.style) },
			},
			children,
		);
	},
);

const LAYOUT_STYLE_TYPES = [
	"heading",
	"paragraph",
	"image",
	"blockquote",
	"codeBlock",
	"bulletList",
	"orderedList",
	"listItem",
	"button",
	"horizontalRule",
	"footer",
	"section",
	"div",
	"body",
	"table",
	"tableRow",
	"tableCell",
	"tableHeader",
	"columnsColumn",
	"link",
	"container",
];

/**
 * TipTap drops attributes that are not declared on the schema. Link.parseHTML
 * copies `data-email-decoration`, and image-only rows stamp `data-image-row`
 * / `data-icon-row` on tables. Empty divider cells stamp `data-empty-cell`
 * on the filler paragraph so canvas CSS can collapse them after generateJSON.
 */
const emailLinkDecoration = Extension.create({
	name: "emailLinkDecoration",
	addGlobalAttributes() {
		return [
			{
				types: ["link"],
				attributes: {
					[EMAIL_DECORATION_ATTR]: {
						default: null,
						parseHTML: (element) => element.getAttribute(EMAIL_DECORATION_ATTR),
						renderHTML: (attributes) => {
							const value = attributes[EMAIL_DECORATION_ATTR];
							if (!value) return {};
							return { [EMAIL_DECORATION_ATTR]: value };
						},
					},
					style: {
						default: null,
						parseHTML: (element) => element.getAttribute("style"),
						renderHTML: (attributes) => {
							if (!attributes.style) return {};
							return { style: attributes.style };
						},
					},
				},
			},
			{
				types: ["table", "tableRow", "tableCell", "tableHeader"],
				attributes: {
					style: {
						default: null,
						parseHTML: (element) => element.getAttribute("style"),
						renderHTML: (attributes) => {
							if (!attributes.style) return {};
							return { style: attributes.style };
						},
					},
					bgcolor: {
						default: null,
						parseHTML: (element) => element.getAttribute("bgcolor"),
						renderHTML: (attributes) => {
							if (!attributes.bgcolor) return {};
							return { bgcolor: attributes.bgcolor };
						},
					},
				},
			},
			{
				types: ["table"],
				attributes: {
					"data-icon-row": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-icon-row"),
						renderHTML: (attributes) => {
							const value = attributes["data-icon-row"];
							if (!value) return {};
							return { "data-icon-row": value };
						},
					},
					"data-image-row": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-image-row"),
						renderHTML: (attributes) => {
							const value = attributes["data-image-row"];
							if (!value) return {};
							return { "data-image-row": value };
						},
					},
					"data-shrink-row": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-shrink-row"),
						renderHTML: (attributes) => {
							const value = attributes["data-shrink-row"];
							if (!value) return {};
							return { "data-shrink-row": value };
						},
					},
				},
			},
			{
				types: ["paragraph"],
				attributes: {
					"data-empty-cell": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-empty-cell"),
						renderHTML: (attributes) => {
							const value = attributes["data-empty-cell"];
							if (!value) return {};
							return { "data-empty-cell": value };
						},
					},
				},
			},
			{
				types: ["image"],
				attributes: {
					href: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute("data-href") ||
							(element.parentElement?.tagName === "A"
								? element.parentElement.getAttribute("href")
								: null),
						renderHTML: (attributes) => {
							if (!attributes.href) return {};
							return { "data-href": attributes.href };
						},
					},
				},
			},
		];
	},
});

/**
 * Automatically synchronizes inline CSS `text-align` whenever `alignment` changes,
 * preventing stale inline `text-align` from overriding TipTap alignment attributes.
 */
export const emailAlignmentSync = Extension.create({
	name: "emailAlignmentSync",
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("emailAlignmentSync"),
				appendTransaction(transactions, _oldState, newState) {
					const docChanged = transactions.some((tr) => tr.docChanged);
					if (!docChanged) return;

					let tr: any = null;
					newState.doc.descendants((node, pos) => {
						if (!node.isTextblock) return;
						// Button alignment positions its wrapper. Its own text-align
						// controls the label, which can be centered in a left-aligned CTA.
						if (node.type.name === "button") return;
						const alignment = node.attrs.alignment || node.attrs.align;
						const style = String(node.attrs.style || "");
						if (!alignment && !style) return;

						if (
							alignment &&
							(alignment === "left" ||
								alignment === "center" ||
								alignment === "right" ||
								alignment === "justify")
						) {
							const match = style.match(/text-align\s*:\s*([^;]+)/i);
							const currentTextAlign = match?.[1]?.trim()?.toLowerCase();
							if (currentTextAlign !== alignment) {
								// Strip horizontal align only; never touch vertical-align.
								const clean = style
									.replace(/\btext-align\s*:\s*[^;]+;?/gi, "")
									.replace(/(^|;)\s*align\s*:\s*[^;]+;?/gi, "$1")
									.replace(/(?:text-|vertical-)\s*(?:;|$)/gi, "")
									.replace(/;{2,}/g, ";")
									.trim();
								const newStyle = clean
									? `${clean}; text-align: ${alignment};`
									: `text-align: ${alignment};`;
								if (!tr) tr = newState.tr;
								tr.setNodeMarkup(pos, null, {
									...node.attrs,
									alignment,
									align: alignment,
									style: newStyle,
								});
							}
						}
					});

					return tr;
				},
			}),
		];
	},
});

/**
 * Clicking a button node should establish a NodeSelection on that button,
 * triggering the Button inspector (with link, background, border, etc.) and
 * the button bubble menu.
 * A subsequent click while already selected allows text editing inside the button.
 */
const emailButtonSelection = Extension.create({
	name: "emailButtonSelection",
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("emailButtonSelectionPlugin"),
				props: {
					handleClick(view, pos, event) {
						const { doc, selection } = view.state;
						const $pos = doc.resolve(pos);
						let buttonPos: number | null = null;

						for (let depth = $pos.depth; depth > 0; depth--) {
							if ($pos.node(depth).type.name === "button") {
								buttonPos = $pos.before(depth);
								break;
							}
						}

						if (buttonPos === null) {
							const directNode = doc.nodeAt(pos);
							if (directNode && directNode.type.name === "button") {
								buttonPos = pos;
							}
						}

						if (buttonPos === null && event.target instanceof HTMLElement) {
							const buttonEl = event.target.closest(
								'a[data-id="react-email-button"], .node-button, a.button',
							);
							if (buttonEl) {
								try {
									const domPos = view.posAtDOM(buttonEl, 0);
									const $domPos = doc.resolve(domPos);
									for (let depth = $domPos.depth; depth > 0; depth--) {
										if ($domPos.node(depth).type.name === "button") {
											buttonPos = $domPos.before(depth);
											break;
										}
									}
									if (buttonPos === null) {
										const n = doc.nodeAt(domPos);
										if (n && n.type.name === "button") buttonPos = domPos;
									}
								} catch {
									// ignore DOM lookup error
								}
							}
						}

						if (buttonPos !== null) {
							// If button is already selected as a node, allow subsequent click
							// to place a text cursor for editing button text
							if (
								selection instanceof NodeSelection &&
								selection.from === buttonPos
							) {
								return false;
							}

							try {
								const nodeSel = NodeSelection.create(doc, buttonPos);
								view.dispatch(view.state.tr.setSelection(nodeSel));
								return true;
							} catch {
								return false;
							}
						}

						return false;
					},
				},
			}),
		];
	},
});

/**
 * Clicking an image node should establish a NodeSelection on that image,
 * ensuring image resize handles and toolbar appear reliably even when
 * the image is nested inside table cells or links.
 */
const emailImageSelection = Extension.create({
	name: "emailImageSelection",
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("emailImageSelectionPlugin"),
				props: {
					handleClick(view, pos, event) {
						const target = event.target;
						const imgEl =
							target instanceof HTMLImageElement
								? target
								: target instanceof HTMLElement
									? target.closest("img")
									: null;
						if (!imgEl) return false;

						const { doc } = view.state;
						try {
							let imagePos: number | null = null;
							const direct = doc.nodeAt(pos);
							if (direct?.type.name === "image") {
								imagePos = pos;
							} else if (
								pos > 0 &&
								doc.nodeAt(pos - 1)?.type.name === "image"
							) {
								imagePos = pos - 1;
							}

							if (imagePos === null && imgEl.parentNode) {
								const index = Array.prototype.indexOf.call(
									imgEl.parentNode.childNodes,
									imgEl,
								);
								const domPos = view.posAtDOM(imgEl.parentNode, index);
								const n = doc.nodeAt(domPos);
								if (n?.type.name === "image") imagePos = domPos;
							}

							if (imagePos === null) {
								const src = imgEl.getAttribute("src");
								if (src) {
									doc.descendants((node, p) => {
										if (imagePos !== null) return false;
										if (node.type.name === "image" && node.attrs.src === src) {
											imagePos = p;
											return false;
										}
									});
								}
							}

							if (imagePos !== null) {
								const nodeSel = NodeSelection.create(doc, imagePos);
								view.dispatch(view.state.tr.setSelection(nodeSel));
								return true;
							}
						} catch {
							// fallback to default selection
						}
						return false;
					},
				},
			}),
		];
	},
});

/**
 * Clicking a section or container node outside of child text blocks / buttons / images
 * establishes a NodeSelection on that section, highlighting it and allowing inspection.
 * A subsequent click while already selected allows placing a text cursor inside.
 */
const emailSectionSelection = Extension.create({
	name: "emailSectionSelection",
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("emailSectionSelectionPlugin"),
				props: {
					handleClick(view, pos, event) {
						const target = event.target;
						if (!(target instanceof HTMLElement)) return false;

						// Don't intercept clicks on images or buttons
						if (
							target.closest("img") ||
							target.closest(
								'a[data-id="react-email-button"], .node-button, a.button',
							)
						) {
							return false;
						}

						// If clicking on text elements (p, h1-h6, span, strong, em, etc.), let default cursor placement work
						const isTextElement =
							target.tagName.toLowerCase() === "p" ||
							target.tagName.toLowerCase() === "span" ||
							target.tagName.toLowerCase() === "strong" ||
							target.tagName.toLowerCase() === "em" ||
							target.tagName.toLowerCase() === "u" ||
							target.tagName.toLowerCase() === "s" ||
							target.tagName.toLowerCase() === "code" ||
							target.tagName.toLowerCase() === "a" ||
							/^h[1-6]$/i.test(target.tagName);

						if (isTextElement) {
							return false;
						}

						// Check if clicked element is a section, container, columns, or table element
						const sectionEl = target.closest(
							'section, [data-type="section"], .node-section, [data-type="container"], .node-container, .node-columns, [data-type="twoColumns"], [data-type="threeColumns"], [data-type="fourColumns"]',
						);

						if (!sectionEl) return false;
						// Only a click on the layout block's own background selects it.
						// Clicks on a child (a divider, an empty column, a list bullet)
						// belong to that child; selecting the whole section there meant
						// the next keystroke replaced the entire layout.
						if (target !== sectionEl) return false;

						const { doc, selection } = view.state;
						let sectionPos: number | null = null;

						try {
							const domPos = view.posAtDOM(sectionEl, 0);
							const $domPos = doc.resolve(domPos);
							for (let depth = $domPos.depth; depth > 0; depth--) {
								const n = $domPos.node(depth);
								if (
									n.type.name === "section" ||
									n.type.name === "container" ||
									n.type.name === "twoColumns" ||
									n.type.name === "threeColumns" ||
									n.type.name === "fourColumns"
								) {
									sectionPos = $domPos.before(depth);
									break;
								}
							}

							if (sectionPos === null) {
								const direct = doc.nodeAt(domPos);
								if (
									direct &&
									(direct.type.name === "section" ||
										direct.type.name === "container" ||
										direct.type.name === "twoColumns" ||
										direct.type.name === "threeColumns" ||
										direct.type.name === "fourColumns")
								) {
									sectionPos = domPos;
								}
							}
						} catch {
							// fallback
						}

						if (sectionPos === null) {
							const $pos = doc.resolve(pos);
							for (let depth = $pos.depth; depth > 0; depth--) {
								const n = $pos.node(depth);
								if (
									n.type.name === "section" ||
									n.type.name === "container" ||
									n.type.name === "twoColumns" ||
									n.type.name === "threeColumns" ||
									n.type.name === "fourColumns"
								) {
									sectionPos = $pos.before(depth);
									break;
								}
							}
						}

						if (sectionPos !== null) {
							// If already selected, allow subsequent click to place text cursor
							if (
								selection instanceof NodeSelection &&
								selection.from === sectionPos
							) {
								return false;
							}

							try {
								const nodeSel = NodeSelection.create(doc, sectionPos);
								view.dispatch(view.state.tr.setSelection(nodeSel));
								return true;
							} catch {
								return false;
							}
						}

						return false;
					},
				},
			}),
		];
	},
});

/**
 * When text is selected or focused, decorates the containing text block
 * (heading, paragraph, blockquote, codeBlock) with the selection outline class
 * so users can clearly see the blue line around the active text block.
 */
const emailActiveTextBlock = Extension.create({
	name: "emailActiveTextBlock",
	addProseMirrorPlugins() {
		const editor = this.editor;
		return [
			new Plugin({
				key: new PluginKey("emailActiveTextBlockPlugin"),
				props: {
					decorations(state) {
						// On blur the selection resets to the document start; without
						// this the first block kept a "selected" outline.
						if (!editor.isFocused) return DecorationSet.empty;
						const { selection } = state;
						if (!(selection instanceof TextSelection)) {
							return DecorationSet.empty;
						}

						// If selection is inside a button, let the button's selection outline handle it
						const { $from } = selection;
						for (let d = $from.depth; d > 0; d--) {
							if ($from.node(d).type.name === "button") {
								return DecorationSet.empty;
							}
						}

						const decorations: Decoration[] = [];
						const seen = new Set<number>();

						const isNonEmptyTextblock = (node: any) => {
							if (!node?.isTextblock) return false;
							if (node.content?.size === 0) return false;
							const text = node.textContent;
							if (!text || text.trim() === "") return false;
							return true;
						};

						state.doc.nodesBetween(
							selection.from,
							selection.to,
							(node, pos) => {
								if (isNonEmptyTextblock(node) && !seen.has(pos)) {
									seen.add(pos);
									decorations.push(
										Decoration.node(pos, pos + node.nodeSize, {
											class: "email-selected-text-node",
										}),
									);
								}
							},
						);

						// Fallback: if nodesBetween didn't catch the block (e.g. cursor at block edge)
						if (decorations.length === 0) {
							for (let d = $from.depth; d > 0; d--) {
								const node = $from.node(d);
								if (isNonEmptyTextblock(node)) {
									const pos = $from.before(d);
									decorations.push(
										Decoration.node(pos, pos + node.nodeSize, {
											class: "email-selected-text-node",
										}),
									);
									break;
								}
							}
						}

						return DecorationSet.create(state.doc, decorations);
					},
				},
			}),
		];
	},
});

/**
 * Mod-a inside a text block selects that block's text first; a second press
 * selects the whole email. Plain select-all made the next keystroke replace
 * every section of the template.
 */
const emailScopedSelectAll = Extension.create({
	name: "emailScopedSelectAll",
	addKeyboardShortcuts() {
		return {
			"Mod-a": ({ editor }) => {
				const { selection } = editor.state;
				const { $from, $to } = selection;
				if (!$from.sameParent($to) || !$from.parent.isTextblock) return false;
				const start = $from.start();
				const end = $from.end();
				if (selection.from === start && selection.to === end) return false;
				return editor.commands.setTextSelection({ from: start, to: end });
			},
		};
	},
});

function isWholeEmailNodeSelection(selection: unknown): boolean {
	return (
		selection instanceof NodeSelection &&
		selection.node.type.name === "container"
	);
}

/**
 * Clicking the gap beside a block can node-select the email container. Any
 * keystroke would then replace the entire email, so ignore typing and
 * deletion there; select-all still clears the email deliberately.
 */
const emailProtectContainerSelection = Extension.create({
	name: "emailProtectContainerSelection",
	addKeyboardShortcuts() {
		const guard = () => isWholeEmailNodeSelection(this.editor.state.selection);
		return { Backspace: guard, Delete: guard, Enter: guard };
	},
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("emailProtectContainerSelection"),
				props: {
					handleTextInput: (view) =>
						isWholeEmailNodeSelection(view.state.selection),
				},
			}),
		];
	},
});

/** True when `node` holds nothing visible: no text, image, divider or button. */
/** Whitespace plus the zero-width / non-breaking spacers email HTML uses. */
const INVISIBLE_TEXT = /[\s\u00a0\u200b-\u200d\u2060\ufeff]/g;

/** A border or background makes a blank row visible (e.g. a divider line). */
function drawsSomething(node: PMNode): boolean {
	const style = String(node.attrs?.style ?? "").toLowerCase();
	const background = String(
		node.attrs?.backgroundColor ?? node.attrs?.bgcolor ?? "",
	);
	if (background && !/^(transparent|none|#fff(fff)?|white)$/i.test(background))
		return true;
	for (const match of style.matchAll(
		/(?:^|;)\s*(border(?:-top|-bottom|-left|-right)?|background(?:-color)?)\s*:\s*([^;]+)/g,
	)) {
		const value = (match[2] ?? "").trim();
		if (match[1]?.startsWith("background")) {
			if (
				!/^(transparent|none|#fff(fff)?|white|rgba?\([^)]*,\s*0\))$/.test(value)
			)
				return true;
		} else if (
			!/^(none|0(px)?)(\s|$)/.test(value) &&
			!/\b0(px)?\s+(solid|dashed|dotted)/.test(value)
		) {
			return true;
		}
	}
	return false;
}

function isVisuallyEmpty(node: PMNode): boolean {
	if (node.textContent.replace(INVISIBLE_TEXT, "") !== "") return false;
	if (drawsSomething(node)) return false;
	let empty = true;
	node.descendants((child) => {
		if (!empty) return false;
		if (
			(child.isLeaf && !child.isText && child.type.name !== "hardBreak") ||
			drawsSomething(child)
		)
			empty = false;
		return empty;
	});
	return empty;
}

/**
 * Pasted HTML emails are built from layout tables. Once a row's content is
 * deleted, the row and its padding stay behind as blank space that Backspace
 * cannot remove (a table cell never merges with its neighbours). Backspace or
 * Delete in an empty line removes the largest empty row or table around it.
 */
export function findEmptyLayoutAncestor(
	state: EditorState,
): { from: number; to: number } | null {
	const { selection } = state;
	if (!selection.empty) return null;
	const { $from } = selection;
	if (!$from.parent.isTextblock || !isVisuallyEmpty($from.parent)) return null;

	let target: { from: number; to: number } | null = null;
	for (let depth = $from.depth - 1; depth > 0; depth--) {
		const node = $from.node(depth);
		const name = node.type.name;
		if (name !== "tableRow" && name !== "tableCell" && name !== "table") break;
		if (!isVisuallyEmpty(node)) break;
		if (name === "tableRow" || name === "table") {
			const from = $from.before(depth);
			target = { from, to: from + node.nodeSize };
		}
	}
	return target;
}

const emailRemoveEmptyLayoutRow = Extension.create({
	name: "emailRemoveEmptyLayoutRow",
	priority: 1000,
	addKeyboardShortcuts() {
		const remove = () => {
			const range = findEmptyLayoutAncestor(this.editor.state);
			if (!range) return false;
			return this.editor.commands.deleteRange(range);
		};
		return { Backspace: remove, Delete: remove };
	},
});

/**
 * React Email's StyleAttribute list omits `container`, so pasted
 * padding / max-width / background on the email wrapper are dropped.
 */
export function emailStarterKit() {
	return Extension.create({
		name: "emailEditorKit",
		addExtensions() {
			return [
				StarterKit.configure({
					UndoRedo: false,
					StyleAttribute: { types: LAYOUT_STYLE_TYPES },
					ClassAttribute: { types: LAYOUT_STYLE_TYPES },
					TableHeader: false,
				}),
				EmailTableHeader,
				EmailImage,
				emailLinkDecoration,
				emailFontColor,
				emailAlignmentSync,
				emailButtonSelection,
				emailImageSelection,
				emailSectionSelection,
				emailActiveTextBlock,
				emailScopedSelectAll,
				emailProtectContainerSelection,
				emailRemoveEmptyLayoutRow,
			];
		},
	});
}
