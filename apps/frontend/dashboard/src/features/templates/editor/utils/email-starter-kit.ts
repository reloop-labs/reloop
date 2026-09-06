import { StarterKit } from "@react-email/editor/extensions";
import { Extension, Mark } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
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
			];
		},
	});
}
