import { EmailMark } from "@react-email/editor/core";
import { InputRule, mergeAttributes } from "@tiptap/core";
import {
	DEFAULT_UNSUBSCRIBE_LINK_TITLE,
	isUnsubscribeHref,
	UNSUBSCRIBE_HREF_PLACEHOLDER,
	UNSUBSCRIBE_LINK_ATTR,
	unsubscribeLinkTitle,
} from "../lib/unsubscribe-link";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		unsubscribeLink: {
			insertUnsubscribeLink: (options?: { title?: string }) => ReturnType;
		};
	}
}

export const UnsubscribeLink = EmailMark.create({
	name: "unsubscribeLink",
	inclusive: false,
	excludes: "link",
	keepOnSplit: true,

	addAttributes() {
		return {
			href: {
				default: UNSUBSCRIBE_HREF_PLACEHOLDER,
				parseHTML: (element) =>
					element.getAttribute("href") || UNSUBSCRIBE_HREF_PLACEHOLDER,
				renderHTML: () => ({ href: UNSUBSCRIBE_HREF_PLACEHOLDER }),
			},
			title: {
				default: null,
				parseHTML: (element) => element.getAttribute("title"),
				renderHTML: (attributes) =>
					attributes.title ? { title: attributes.title } : {},
			},
			color: {
				default: null,
				parseHTML: (element) => element.style.color || null,
				renderHTML: (attributes) =>
					attributes.color ? { style: `color: ${attributes.color}` } : {},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: `a[${UNSUBSCRIBE_LINK_ATTR}]`,
				priority: 60,
			},
			{
				tag: "a[href]",
				priority: 60,
				getAttrs: (element) => {
					if (!(element instanceof HTMLElement)) return false;
					if (!isUnsubscribeHref(element.getAttribute("href"))) return false;
					return {};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"a",
			mergeAttributes(HTMLAttributes, {
				href: UNSUBSCRIBE_HREF_PLACEHOLDER,
				[UNSUBSCRIBE_LINK_ATTR]: "true",
			}),
			0,
		];
	},

	renderToReactEmail({ children, mark, style }) {
		const color = mark.attrs?.color as string | undefined;
		return (
			<a
				href={UNSUBSCRIBE_HREF_PLACEHOLDER}
				data-unsubscribe-link="true"
				style={{
					...style,
					...(color ? { color } : {}),
				}}
			>
				{children}
			</a>
		);
	},

	addCommands() {
		return {
			insertUnsubscribeLink:
				(options) =>
				({ chain }) => {
					const title = unsubscribeLinkTitle(options?.title);
					return chain()
						.insertContent([
							{
								type: "text",
								text: title,
								marks: [
									{
										type: this.name,
										attrs: { href: UNSUBSCRIBE_HREF_PLACEHOLDER },
									},
								],
							},
							{ type: "text", text: " " },
						])
						.run();
				},
		};
	},

	addInputRules() {
		return [
			new InputRule({
				find: /\{\{\{\s*unsubscribe_url\s*\}\}\}$/i,
				handler: ({ range, chain }) => {
					chain()
						.deleteRange(range)
						.insertContent({
							type: "text",
							text: DEFAULT_UNSUBSCRIBE_LINK_TITLE,
							marks: [
								{
									type: this.name,
									attrs: { href: UNSUBSCRIBE_HREF_PLACEHOLDER },
								},
							],
						})
						.run();
				},
			}),
		];
	},
});

export default UnsubscribeLink;
