import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "ai-agent-inbox",
	path: "/use-cases/ai-agent-inbox",
	titleLines: ["AI Agent", "Email Inbox"],
	description:
		"Email infrastructure for autonomous agents—dedicated inbox, drafting, human-in-the-loop, and contextual memory.",
	keywords: [
		"AI email agent",
		"agent inbox API",
		"LLM email infrastructure",
		"autonomous email agent",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "AI Agents feature",
		href: "/features/ai-agents",
	},
	sections: [
		{
			title: "Built for agents",
			items: [
				{
					title: "Agent inbox API",
					description:
						"Let agents read, draft, and send email with structured thread access.",
				},
				{
					title: "Human-in-the-loop",
					description:
						"Review and approve agent drafts before they reach customers.",
				},
				{
					title: "Contextual memory",
					description:
						"Thread history and metadata agents need for coherent replies.",
				},
			],
		},
	],
	cta: {
		title: "Power your AI agents with email",
		titleMuted: "Start free today.",
		description: "Open-source infrastructure with agent-native APIs.",
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
