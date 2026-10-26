import { Icon } from "@reloop/ui/icon";
import { OPENAI_PATH } from "@reloop/web/app/(home)/components/agent-cards";
import { McpClientIcon } from "@reloop/web/app/features/mcp/components/client-icons";
import { CLI_PAGE_PATH } from "@reloop/web/lib/landing/ai-tools/cli";
import {
	MCP_DOCS_HREF,
	mcpClientPath,
	mcpClients,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import Link from "next/link";
import type { ReactNode } from "react";

type AgentTool = { id: string; name: string; href: string; icon: ReactNode };

const ICON_CLASS = "size-7 sm:size-8";

/** Claude and Claude Code share a mark, so the row shows it once. */
const tools: AgentTool[] = [
	...mcpClients
		.filter((client) => client.slug !== "claude")
		.map((client) => ({
			id: client.slug,
			name: client.name,
			href: mcpClientPath(client.slug),
			icon: <McpClientIcon slug={client.slug} className={ICON_CLASS} />,
		})),
	{
		id: "chatgpt",
		name: "ChatGPT",
		href: MCP_DOCS_HREF,
		icon: (
			<svg
				viewBox="0 0 24 24"
				className={`${ICON_CLASS} fill-text-strong-950 dark:fill-white`}
				aria-hidden
			>
				<path d={OPENAI_PATH} />
			</svg>
		),
	},
];

const links = [
	{ label: "MCP setup", href: MCP_DOCS_HREF },
	{ label: "CLI", href: CLI_PAGE_PATH },
	{ label: "API reference", href: "/docs/api" },
];

/** "03 · AI agents": what an agent can do with Reloop over MCP, plus links to MCP, CLI and API docs. */
export function CompareAgentsSection() {
	return (
		<section className="flex flex-col items-center border-stroke-soft-100 border-b px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-12 dark:border-white/10">
			<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
				03 · AI agents
			</span>

			<ul className="mt-6 flex flex-wrap justify-center gap-3">
				{tools.map((tool) => (
					<li key={tool.id}>
						<Link
							href={tool.href}
							aria-label={`Reloop with ${tool.name}`}
							title={tool.name}
							className="flex size-14 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 transition-colors hover:bg-bg-weak-50 sm:size-16 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							{tool.icon}
						</Link>
					</li>
				))}
			</ul>

			<h2 className="mt-8 max-w-3xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white">
				Your AI agent sends email, works its own inbox and checks delivery
			</h2>
			<p className="mt-4 max-w-2xl text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
				Connect Claude, ChatGPT, Cursor, VS Code or Codex over MCP, or script it
				with the Reloop CLI. Agents can send email, read and reply from a
				mailbox, manage contacts and automations, and check domain reputation.
			</p>

			<div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
				{links.map((link) => (
					<Link
						key={link.label}
						href={link.href}
						className="group inline-flex items-center gap-1.5 font-medium text-[15px] text-text-strong-950 dark:text-white"
					>
						{link.label}
						<Icon
							name="arrow-right"
							className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
