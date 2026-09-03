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
 * TipTap drops attributes that are not declared on the mark. Link.parseHTML
 * copies `data-email-decoration`, then the schema throws it away unless this
 * global attribute is registered.
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
