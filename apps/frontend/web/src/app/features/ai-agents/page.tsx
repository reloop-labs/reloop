import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

const pagePath = "/features/ai-agents";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Email for AI Agents | Reloop",
	description:
		"Send, receive, and manage email from autonomous AI agents and LLMs. API-first email infrastructure designed for agentic workflows, tool-use, and programmatic communication.",
	keywords: [
		"AI agent email",
		"LLM email API",
		"email for AI agents",
		"agentic email infrastructure",
		"programmatic email",
		"AI email automation",
		"open source email API",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email for AI Agents | Reloop",
		description:
			"API-first email infrastructure designed for autonomous AI agents, LLMs, and agentic workflows.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email for AI Agents | Reloop",
		description:
			"API-first email infrastructure designed for autonomous AI agents, LLMs, and agentic workflows.",
	},
};

const AiAgentsPage = () => {
	return (
		<div>
			<Hero />
			<Sandbox />
			<Bento />
			<Metrics />
			<Guide />
			<CTA />
		</div>
	);
};

export default AiAgentsPage;
