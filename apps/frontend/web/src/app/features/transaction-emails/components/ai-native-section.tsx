"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import Link from "next/link";

type StepCard = {
	title: string;
	description: string;
	dotColor: string;
	glowClass: string;
	code: string;
	lang: string;
	fileName: string;
	href: string;
	linkText: string;
};

const CARDS: StepCard[] = [
	{
		title: "MCP Server",
		description:
			"Connect Claude Desktop, Cursor, or OpenClaw directly to Reloop. Auto-discovered tools for send, status & logs with zero glue code.",
		dotColor: "#06b6d4",
		glowClass: "bg-cyan-500/15 dark:bg-cyan-500/20",
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
		dotColor: "#10b981",
		glowClass: "bg-emerald-500/15 dark:bg-emerald-500/20",
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
		dotColor: "#ec4899",
		glowClass: "bg-pink-500/15 dark:bg-pink-500/20",
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

export function AiNativeSection() {
	return (
		<section
			id="ai-native"
			aria-labelledby="ai-native-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			{/* Section Header */}
			<div className="border-stroke-soft-200 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<h2
					id="ai-native-heading"
					className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white"
				>
					AI Native
				</h2>
			</div>

			{/* 3 Step Cards Grid */}
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{CARDS.map((card) => {
					const si = getLanguageIcon(card.lang);
					return (
						<div
							key={card.title}
							className="relative flex flex-col justify-between overflow-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
						>
							{/* Halftone Dot Pattern Background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 top-0 h-48"
								style={{
									backgroundImage: `radial-gradient(circle, ${card.dotColor} 1.4px, transparent 1.4px)`,
									backgroundSize: "14px 14px",
									maskImage:
										"linear-gradient(to bottom, black 25%, transparent 95%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, black 25%, transparent 95%)",
									opacity: 0.38,
								}}
							/>

							{/* Soft Color Glow Behind the Dots */}
							<div
								aria-hidden
								className={cn(
									"-top-12 -left-12 pointer-events-none absolute size-48 rounded-full blur-[70px]",
									card.glowClass,
								)}
							/>

							<div className="relative z-10">
								{/* Card Title */}
								<div className="mb-6">
									<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-[21px] dark:text-white">
										{card.title}
									</h3>
								</div>

								{/* Exact Reloop CopyCodeBlock with Fixed Height */}
								<div className="mb-6 h-[162px]">
									<CopyCodeBlock
										code={card.code}
										lang={card.lang}
										title={card.fileName}
										si={si}
										hideLineNumbers={false}
										className="flex h-full flex-col justify-between"
									/>
								</div>

								{/* Description */}
								<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{card.description}
								</p>
							</div>

							{/* Footer Link */}
							<div className="relative z-10 mt-8 border-stroke-soft-200 border-t pt-4 dark:border-white/10">
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
