import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "spoof-checker",
	path: "/tools/spoof-checker",
	toolType: "spoof-checker",
	titleLines: ["Can Anyone Spoof", "My Domain?"],
	description:
		"Instant yes/no answer on whether Gmail, Yahoo, and Outlook will deliver unauthorized spoofed emails using your domain.",
	keywords: [
		"can anyone spoof my domain",
		"email spoofing checker",
		"domain spoofing test",
		"DMARC p=none test",
		"CEO fraud protection",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "What is DMARC?",
		href: "/glossary/dmarc",
	},
	sections: [
		{
			title: "Anti-spoofing checks",
			items: [
				{
					title: "DMARC Policy",
					description:
						"Verifies whether receivers are instructed to reject or quarantine fraudulent messages.",
				},
				{
					title: "SPF Loopholes",
					description:
						"Ensures '+all' or missing mechanisms do not authorize the internet to send as you.",
				},
				{
					title: "Subdomain Protection",
					description:
						"Audits 'sp=' policies to close impersonation holes on subdomains.",
				},
			],
		},
	],
	cta: {
		title: "Lock your domain with Reloop",
		titleMuted: "Start free today.",
		description:
			"1-click SPF, DKIM, and DMARC enforcement with real-time drift alerts.",
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
