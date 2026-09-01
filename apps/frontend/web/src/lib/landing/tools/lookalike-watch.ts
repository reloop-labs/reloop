import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "lookalike-watch",
	path: "/tools/lookalike-watch",
	toolType: "lookalike-watch",
	titleLines: ["Lookalike Domain", "Watch & Phish Scanner"],
	description:
		"Discover registered domain twins and typosquats that look like your brand, and check if they have active mail servers configured to send email.",
	keywords: [
		"lookalike domain checker",
		"phishing domain scanner",
		"typosquatting detector",
		"homoglyph domain test",
		"brand impersonation monitoring",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Brand Defense Guide",
		href: "/docs",
	},
	sections: [
		{
			title: "Lookalike domain checks",
			items: [
				{
					title: "Candidate Permutations",
					description:
						"Generates bounded candidate variations across popular alternative TLDs, common typos, prefix hyphens, and IDN homoglyphs.",
				},
				{
					title: "Mail-Ready Verification",
					description:
						"Queries live public DNS for MX and SPF records to identify which lookalikes can actively send email.",
				},
				{
					title: "Attack Simulation",
					description:
						"Visualizes how lookalikes bypass DMARC to fool employees with convincing From addresses.",
				},
			],
		},
	],
	cta: {
		title: "Protect your domain and brand with Reloop",
		titleMuted: "Start free today.",
		description:
			"Authenticate your real outbound mail with SPF, DKIM, and DMARC enforcement so legitimate emails are unmistakable.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
};
