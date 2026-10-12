import { Icon } from "@reloop/ui/icon";
import { siModelcontextprotocol } from "simple-icons";
import { CardHeader } from "../../../(home)/components/agent-cards";
import { CliTerminal, CliTitleBar } from "./cli-terminal";
import { LearnMoreLink, McpConfigWindow } from "./mcp-config-window";

export function AgentToolsSection() {
	return (
		<section
			id="agent-tools"
			aria-labelledby="agent-tools-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="robot" className="size-3.5" aria-hidden />
					AI native
				</span>
				<h2
					id="agent-tools-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Built for AI agents
					<br />
					and the terminal
				</h2>
				<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					Let your AI agent send and manage email through the MCP server, or
					test every send straight from the CLI.
				</p>
			</div>

			<AgentToolsGrid />
		</section>
	);
}

/** MCP setup and CLI cards, shared by pages that pitch the agent tooling. */
export function AgentToolsGrid({
	mcpLede = "Connect Reloop to your AI agent.",
	mcpDescription = "Let Claude, Cursor, or Codex send and manage email.",
}: {
	mcpLede?: string;
	mcpDescription?: string;
}) {
	return (
		<div className="grid w-full grid-cols-1 lg:grid-cols-2 [&>*]:min-w-0">
			{/* MCP Server */}
			<div className="flex flex-col border-stroke-soft-100 lg:border-r dark:border-white/10">
				<div className="space-y-4 p-6 md:px-12 md:pt-12 md:pb-6">
					<CardHeader
						icon={
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="text-zinc-400 dark:text-zinc-500"
								aria-hidden
							>
								<path d={siModelcontextprotocol.path} />
							</svg>
						}
						title="MCP Server"
						lede={mcpLede}
						description={mcpDescription}
					/>
				</div>
				<div className="flex flex-1 flex-col border-stroke-soft-100 border-t dark:border-white/10">
					<McpConfigWindow />
				</div>
				<div className="border-stroke-soft-100 border-t px-6 py-4 md:px-12 dark:border-white/10">
					<LearnMoreLink href="/features/mcp" />
				</div>
			</div>

			{/* Developer CLI */}
			<div className="flex flex-col border-stroke-soft-100 border-t lg:border-t-0 dark:border-white/10">
				<div className="space-y-4 p-6 md:px-12 md:pt-12 md:pb-6">
					<CardHeader
						icon={
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#9ca3af"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden
							>
								<path d="M4 17 L9 12 L4 7" />
								<path d="M12 19 H20" />
							</svg>
						}
						title="Developer CLI"
						lede="Send email from your terminal."
						description="Test deliveries and fix configuration without a dashboard."
					/>
				</div>
				<div className="flex flex-1 flex-col border-stroke-soft-100 border-t dark:border-white/10">
					<CliTitleBar />
					<div className="flex flex-1 items-center py-8">
						<CliTerminal />
					</div>
				</div>
				<div className="border-stroke-soft-100 border-t px-6 py-4 md:px-12 dark:border-white/10">
					<LearnMoreLink href="/features/cli" />
				</div>
			</div>
		</div>
	);
}
