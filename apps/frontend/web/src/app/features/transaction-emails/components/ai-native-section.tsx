"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";
import { siClaude, siCursor, siGnubash } from "simple-icons";

type ColumnData = {
	id: "mcp" | "cli" | "skills";
	tag: string;
	iconName: string;
	title: string;
	description: string;
	code: string;
	codeTitle: string;
	docLink: { label: string; href: string };
};

const COLUMNS: ColumnData[] = [
	{
		id: "mcp",
		tag: "reloop-mcp",
		iconName: "agent",
		title: "MCP Server",
		description:
			"Connect Claude Desktop, Cursor, and OpenClaw directly to Reloop. Let AI agents send emails and inspect delivery logs natively.",
		code: `claude mcp add reloop \\
  -e RELOOP_API_KEY=rl_xxxxxxxxx \\
  -- npx -y reloop-mcp`,
		codeTitle: "claude_desktop_config",
		docLink: {
			label: "MCP Server Docs",
			href: "/docs/integrations/ai-tools/mcp-server",
		},
	},
	{
		id: "cli",
		tag: "reloop-cli",
		iconName: "terminal",
		title: "Developer CLI",
		description:
			"Deterministic CLI for humans and agents. Built with machine-readable JSON output, stdin piping, and live webhook streaming.",
		code: `reloop emails send \\
  --from "Acme <auth@app.com>" \\
  --to user@example.com \\
  --subject "Login OTP: 839201" \\
  --json`,
		codeTitle: "terminal",
		docLink: {
			label: "CLI for Agents",
			href: "/docs/integrations/ai-tools/cli-agents",
		},
	},
	{
		id: "skills",
		tag: "reloop-skills",
		iconName: "sparkling",
		title: "Agent Skills",
		description:
			"Equip Cursor, Claude Code, and autonomous agents with domain knowledge on Reloop templates, batching, and deliverability.",
		code: `npx skills add reloop/reloop-skills`,
		codeTitle: "skills.sh",
		docLink: {
			label: "Explore Agent Skills",
			href: "/docs/integrations/agent-skills/reloop-skill",
		},
	},
];

function MiniCodeSnippet({
	code,
	title,
}: {
	code: string;
	title: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<div className="relative flex flex-col overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0d0f12] text-white shadow-inner dark:border-white/10 dark:bg-[#07080a]">
			<div className="flex items-center justify-between border-white/10 border-b bg-white/[0.03] px-3.5 py-2">
				<div className="flex items-center gap-2">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2 rounded-full bg-[#ff5f56]/80" />
						<span className="size-2 rounded-full bg-[#ffbd2e]/80" />
						<span className="size-2 rounded-full bg-[#27c93f]/80" />
					</div>
					<span className="ml-1.5 font-mono text-[11px] text-white/50">{title}</span>
				</div>

				<button
					type="button"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy code"}
					className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
				>
					<Icon
						name={copied ? "check" : "copy"}
						className={cn("size-3", copied && "text-emerald-400")}
					/>
					<span>{copied ? "Copied" : "Copy"}</span>
				</button>
			</div>

			<div className="overflow-x-auto p-3.5 font-mono text-[12px] leading-relaxed text-emerald-300/90 selection:bg-white/20 selection:text-white">
				<pre className="whitespace-pre">
					<code>{code}</code>
				</pre>
			</div>
		</div>
	);
}

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

			{/* 3 Columns Grid: MCP, CLI, Skill */}
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{COLUMNS.map((col) => (
					<div
						key={col.id}
						className="flex flex-col justify-between p-6 sm:p-8 lg:p-9"
					>
						<div>
							{/* Top meta */}
							<div className="mb-4 flex items-center justify-between">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
									<Icon name={col.iconName} className="size-3.5" />
									{col.tag}
								</span>

								{col.id === "mcp" && (
									<div className="flex items-center gap-1.5">
										<span
											className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
											title="Claude Desktop"
										>
											<svg viewBox="0 0 24 24" className="size-3" aria-hidden>
												<path d={siClaude.path} fill="currentColor" />
											</svg>
										</span>
										<span
											className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
											title="Cursor"
										>
											<svg viewBox="0 0 24 24" className="size-3" aria-hidden>
												<path d={siCursor.path} fill="currentColor" />
											</svg>
										</span>
									</div>
								)}

								{col.id === "cli" && (
									<span
										className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
										title="Bash"
									>
										<svg viewBox="0 0 24 24" className="size-3" aria-hidden>
											<path d={siGnubash.path} fill="currentColor" />
										</svg>
									</span>
								)}
							</div>

							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-[22px] dark:text-white">
								{col.title}
							</h3>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{col.description}
							</p>

							{/* Snippet box */}
							<div className="mt-5">
								<MiniCodeSnippet code={col.code} title={col.codeTitle} />
							</div>
						</div>

						{/* Bottom Doc Link */}
						<div className="mt-8 pt-4 border-stroke-soft-200 border-t dark:border-white/10">
							<Link
								href={col.docLink.href}
								className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
							>
								<span>{col.docLink.label}</span>
								<Icon
									name="arrow-right"
									className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden
								/>
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
