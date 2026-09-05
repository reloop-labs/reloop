import { StarterKit } from "@react-email/editor/extensions";
import { Extension } from "@tiptap/core";
import { EMAIL_DECORATION_ATTR } from "./preserve-email-link-underlines";

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
			];
		},
	});
}
