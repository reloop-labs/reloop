import { JsonLd } from "@reloop/web/components/json-ld";
import { MarketingPageShell } from "@reloop/web/components/page-shell";
import {
	CLI_DOCS_HREF,
	CLI_PAGE_PATH,
	cliFaq,
	cliQuickstart,
} from "@reloop/web/lib/landing/ai-tools/cli";
import { MCP_PAGE_PATH } from "@reloop/web/lib/landing/ai-tools/mcp";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { StepCards } from "../mcp/components/step-cards";
import { CliFaq } from "./components/cli-faq";
import CTA from "./components/cta";
import Examples from "./components/examples";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}${CLI_PAGE_PATH}`;

const description =
	"Send, schedule and receive email from your terminal, CI or a coding agent. JSON output, stdin piping, batch sends and idempotency keys on every command.";

export const metadata: Metadata = {
	title: "Email CLI for Developers and AI Agents",
	description,
	keywords: [
		"email CLI",
		"send email from terminal",
		"command line email",
		"email CLI for AI agents",
		"Reloop CLI",
		"webhook CLI",
		"open source email CLI",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email CLI for Developers and AI Agents | Reloop",
		description,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email CLI for Developers and AI Agents | Reloop",
		description,
	},
};

const CliPage = () => {
	return (
		<>
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{ name: "CLI", path: CLI_PAGE_PATH },
					]),
					faqPageJsonLd(cliFaq),
				]}
			/>
			<MarketingPageShell
				titleLines={["Email from", "your terminal."]}
				description="The Reloop CLI sends, schedules and receives email from a shell, a CI job or a coding agent. Every command speaks JSON."
				primaryCta={{ label: "Install the CLI", href: "#install" }}
				secondaryCta={{ label: "CLI docs", href: CLI_DOCS_HREF }}
				fullViewportHero
			>
				<StepCards
					id="install"
					title="Up and running in a minute"
					description="Sign in through the browser, give your agent the skill, and send."
					steps={cliQuickstart}
				/>
				<Examples />
				<div className="mx-auto max-w-[1320px] px-4 pb-16 text-center sm:px-6 sm:pb-20 lg:px-8">
					<p className="text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
						Working in Claude, Cursor or VS Code instead of a shell? Use the{" "}
						<Link
							href={MCP_PAGE_PATH}
							className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-[3px] dark:text-white dark:decoration-white/20"
						>
							Reloop MCP server
						</Link>
						.
					</p>
				</div>
				<CTA />
				<CliFaq />
			</MarketingPageShell>
		</>
	);
};

export default CliPage;
