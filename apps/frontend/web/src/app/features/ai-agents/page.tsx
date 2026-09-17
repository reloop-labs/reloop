import { JsonLd } from "@reloop/web/components/json-ld";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import AgentFacts, { agentFaq } from "./components/agent-facts";
import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Sandbox from "./components/sandbox";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/features/ai-agents";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Email API for AI Agents: Inbox, MCP and Inbound Email",
	description:
		"Give AI agents an email address, an inbound webhook, an MCP server and a send API. Open-source email infrastructure for agents, hosted or self-hosted.",
	keywords: [
		"email API for AI agents",
		"AI agent inbox",
		"email infrastructure for AI agents",
		"MCP email server",
		"inbound email for AI agents",
		"AI agent email",
		"LLM email API",
		"open source email API",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email API for AI Agents | Reloop",
		description:
			"API-first email infrastructure designed for autonomous AI agents, LLMs, and agentic workflows.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email API for AI Agents | Reloop",
		description:
			"API-first email infrastructure designed for autonomous AI agents, LLMs, and agentic workflows.",
	},
};

const AiAgentsPage = () => {
	return (
		<div>
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{ name: "Email for AI agents", path: pagePath },
					]),
					faqPageJsonLd(agentFaq),
				]}
			/>
			<Hero />
			<Sandbox />
			<Bento />
			<AgentFacts />
			<Guide />
			<CTA />
		</div>
	);
};

export default AiAgentsPage;
