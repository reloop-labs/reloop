import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "email-html-editor",
	path: "/tools/email-html-editor",
	toolType: "email-html-editor",
	titleLines: ["Email HTML", "Editor"],
	description:
		"Paste React Email or raw HTML, inspect it on a canvas, and keep source in sync. No account, save, or send.",
	keywords: [
		"email HTML editor",
		"React Email editor",
		"visual email editor",
		"email source editor",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "All tools",
		href: "/tools",
	},
	sections: [
		{
			title: "What you can do",
			items: [
				{
					title: "Paste HTML",
					description:
						"Drop in a full email document. The canvas reconstructs the column, images, and buttons.",
				},
				{
					title: "Inspect and type",
					description:
						"Change padding, color, and copy on the same tree the visual editor uses.",
				},
				{
					title: "Flip to source",
					description:
						"Canvas and inspect updates compose back into HTML. Edit source and the canvas follows.",
				},
			],
		},
	],
	cta: {
		title: "Build templates that actually send.",
		titleMuted: "Use Reloop.",
		description:
			"This tool is a scratch pad. Reloop Templates adds save, variables, and send when you are ready.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "All tools",
			href: "/tools",
		},
	},
	relatedLinks: [
		{
			label: "Spam words checker",
			href: "/tools/email-spam-words-checker",
		},
		{
			label: "Deliverability tester",
			href: "/tools/deliverability-tester",
		},
	],
};
