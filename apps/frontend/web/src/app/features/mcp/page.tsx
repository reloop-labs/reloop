import { JsonLd } from "@reloop/web/components/json-ld";
import { MarketingPageShell } from "@reloop/web/components/page-shell";
import {
	MCP_DASHBOARD_HREF,
	MCP_PAGE_PATH,
	mcpFaq,
	mcpHowItWorks,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Capabilities from "./components/capabilities";
import CTA from "./components/cta";
import { McpFaq } from "./components/mcp-faq";
import Prompts from "./components/prompts";
import SelfHost from "./components/self-host";
import { StepCards } from "./components/step-cards";
import WorksWith from "./components/works-with";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}${MCP_PAGE_PATH}`;

const description =
	"Connect Claude Code, Claude, Cursor, VS Code, Codex or any MCP client to Reloop. Sign in with OAuth and your agent can do everything you can do in the Reloop dashboard.";

export const metadata: Metadata = {
	title: "Email MCP Server: Connect Any AI Agent to Reloop",
	description,
	keywords: [
		"email MCP server",
		"MCP server for email",
		"Reloop MCP",
		"Claude email MCP",
		"Cursor MCP email",
		"Codex MCP",
		"remote MCP server OAuth",
		"open source MCP server",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email MCP Server | Reloop",
		description,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email MCP Server | Reloop",
		description,
	},
};

const McpPage = () => {
	return (
		<>
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{ name: "MCP server", path: MCP_PAGE_PATH },
					]),
					faqPageJsonLd(mcpFaq),
				]}
			/>
			<MarketingPageShell
				titleLines={["Connect any AI agent", "to Reloop."]}
				description="The Reloop MCP server lets your AI agent do everything you can do in the Reloop dashboard. Add one URL, sign in with Reloop, and ask in plain language."
				primaryCta={{ label: "Connect your agent", href: MCP_DASHBOARD_HREF }}
				secondaryCta={{ label: "See how it works", href: "#how-it-works" }}
				fullViewportHero
			>
				<WorksWith />
				<StepCards
					id="how-it-works"
					title="How it works"
					description="No API key to create, paste or rotate. Your client signs in with Reloop."
					steps={mcpHowItWorks.map((step) => ({
						...step,
						lang: "text",
					}))}
				/>
				<Capabilities />
				<Prompts />
				<SelfHost />
				<CTA />
				<McpFaq />
			</MarketingPageShell>
		</>
	);
};

export default McpPage;
