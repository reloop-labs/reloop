import { StarterKit } from "@react-email/editor/extensions";
import { Extension, Mark } from "@tiptap/core";
import {
	NodeSelection,
	Plugin,
	PluginKey,
	TextSelection,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { EMAIL_DECORATION_ATTR } from "./preserve-email-link-underlines";

export const EMAIL_FONT_COLOR_MARK = "emailFontColor";

/** Selection color so inspect can paint a word, not only the parent block. */
const emailFontColor = Mark.create({
	name: EMAIL_FONT_COLOR_MARK,
	addAttributes() {
		return {
			color: {
				default: null,
				parseHTML: (element) => element.style.color || null,
				renderHTML: (attributes) => {
					if (!attributes.color) return {};
					return { style: `color: ${attributes.color}` };
				},
			},
		};
	},
	parseHTML() {
		return [{ tag: "span[data-email-font-color]" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["span", { "data-email-font-color": "", ...HTMLAttributes }, 0];
	},
});

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
								// Strip horizontal align only — never touch vertical-align.
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
		return [
			new Plugin({
				key: new PluginKey("emailActiveTextBlockPlugin"),
				props: {
					decorations(state) {
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

						state.doc.nodesBetween(
							selection.from,
							selection.to,
							(node, pos) => {
								if (node.isTextblock && !seen.has(pos)) {
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
								if (node.isTextblock) {
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
				}),
				emailLinkDecoration,
				emailFontColor,
				emailAlignmentSync,
				emailButtonSelection,
				emailImageSelection,
				emailSectionSelection,
				emailActiveTextBlock,
			];
		},
	});
}
