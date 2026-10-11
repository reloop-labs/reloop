import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/email-html-editor";
export const toolTitle = "Email HTML Editor";
export const metaTitle = "Free Email HTML Editor";
export const metaDescription =
	"Open a free email template on a visual canvas, tweak styles in the inspector, add variables, and flip to the HTML source. Same editor as Reloop Templates. No account, no save, no send.";
export const toolDescription =
	"Pick a template to open it on the canvas. Edit styles, add variables, and flip to the HTML source. Nothing leaves your browser.";

export const toolKeywords = [
	"email HTML editor",
	"React Email editor",
	"paste email HTML",
	"visual email editor",
	"email source editor",
];

export const reasons = [
	{
		icon: "code" as const,
		title: "Start from a template",
		description:
			"Open a ready-made email on the canvas. Columns, images, and buttons stay editable blocks, and you can paste your own HTML over it.",
	},
	{
		icon: "settings" as const,
		title: "Inspect the same tree",
		description:
			"Select a heading, cell, or button. Padding, color, and type edit the live document, then source updates to match.",
	},
	{
		icon: "layout" as const,
		title: "Source stays in sync",
		description:
			"Flip to code. Canvas typing and inspect writes compose back into the HTML. Edit source and the canvas updates.",
	},
	{
		icon: "lock" as const,
		title: "Nothing leaves the browser",
		description:
			"No account, save, send, or test. The document lives in this tab until you copy it out.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "Does this send email?",
		answer:
			"No. There is no From, Subject, send, or test. Copy the HTML if you want to use it elsewhere.",
	},
	{
		question: "Is this the same as Reloop Templates?",
		answer:
			"The canvas, inspector, variables, and code view are the same as the Templates editor. This page does not include save, history, publish, send, or collaboration.",
	},
	{
		question: "Will inspect change the source?",
		answer:
			"Yes. After you tweak a block or type on the canvas, the code view shows the composed HTML. Editing source updates the canvas.",
	},
	{
		question: "Is there an API?",
		answer:
			"No. This tool runs entirely in the browser. Other Reloop tools that look up DNS or spam scores have public APIs; this one does not.",
	},
];

export const faqGroups = [{ title: "Editor", items: faqs }];
