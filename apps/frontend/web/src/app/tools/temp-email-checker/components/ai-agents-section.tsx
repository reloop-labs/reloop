"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import Link from "next/link";

type AgentCard = {
	title: string;
	description: string;
	code: string;
	lang: string;
	fileName: string;
	href: string;
	linkText: string;
};

const CARDS: AgentCard[] = [
	{
		title: "MCP Server",
		description:
			"Connect Claude Desktop, Cursor, or OpenClaw directly to Reloop. Auto-discovered tools for send, status & logs with zero glue code.",
		lang: "bash",
		fileName: "mcp.sh",
		code: `# Connect Claude to Reloop
claude mcp add reloop \\
  -e RELOOP_API_KEY=rl_xxx \\
  -- npx -y reloop-mcp`,
		href: "/docs/integrations/ai-tools/mcp-server",
		linkText: "Explore MCP Server",
	},
	{
		title: "Developer CLI",
		description:
			"Deterministic CLI for humans and agents. Built with machine-readable JSON output, stdin piping, and live webhook streaming.",
		lang: "bash",
		fileName: "send.sh",
		code: `# Send transactional email
reloop emails send \\
  --to user@example.com \\
  --json`,
		href: "/docs/integrations/ai-tools/cli-agents",
		linkText: "CLI Reference",
	},
	{
		title: "Agent Skills",
		description:
			"Equip Cursor, Claude Code, and autonomous agents with domain knowledge on Reloop templates, batching, and deliverability.",
		lang: "bash",
		fileName: "skills.sh",
		code: `# Install CLI agent skill
npx skills add \\
  reloop/reloop-skills \\
  --global`,
		href: "/docs/integrations/agent-skills/reloop-skill",
		linkText: "Install Agent Skills",
	},
];

export function AiAgentsSection() {
	return (
		<section
			id="ai-agents"
			aria-labelledby="ai-agents-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			{/* Section Header */}
			<div className="border-stroke-soft-200 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<h2
					id="ai-agents-heading"
					className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white"
				>
					Easily connect with your AI agents
				</h2>
				<p className="mt-3 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Connect Reloop to any AI agent or MCP client in minutes.
				</p>
			</div>

			{/* 3 Step Cards Grid */}
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{CARDS.map((card) => {
					const si = getLanguageIcon(card.lang);
					return (
						<div
							key={card.title}
							className="relative flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9"
						>
							<div>
								{/* Card Title */}
								<div className="mb-5">
									<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-[21px] dark:text-white">
										{card.title}
									</h3>
								</div>

								{/* Reloop CopyCodeBlock with Natural Snug Fit */}
								<div className="mb-5">
									<CopyCodeBlock
										code={card.code}
										lang={card.lang}
										title={card.fileName}
										si={si}
										hideLineNumbers={false}
										className="w-full"
									/>
								</div>

								{/* Description */}
								<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{card.description}
								</p>
							</div>

							{/* Footer Link */}
							<div className="mt-8 border-stroke-soft-200 border-t pt-4 dark:border-white/10">
								<Link
									href={card.href}
									className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
								>
									<span>{card.linkText}</span>
									<Icon
										name="arrow-right"
										className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
										aria-hidden
									/>
								</Link>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
