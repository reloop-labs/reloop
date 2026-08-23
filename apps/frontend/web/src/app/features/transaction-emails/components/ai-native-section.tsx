"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";
import { siClaude, siCursor, siGnubash } from "simple-icons";

type StepCard = {
	title: string;
	description: string;
	dotColor: string;
	glowClass: string;
	code: string;
	href: string;
	linkText: string;
	visual: "mcp" | "cli" | "skills";
};

const CARDS: StepCard[] = [
	{
		title: "MCP Server",
		description:
			"Connect Claude Desktop, Cursor, or OpenClaw directly to Reloop. Auto-discovered tools for send, status & logs with zero glue code.",
		dotColor: "#06b6d4",
		glowClass: "bg-cyan-500/15 dark:bg-cyan-500/20",
		code: `claude mcp add reloop \\
  -e RELOOP_API_KEY=rl_xxx \\
  -- npx -y reloop-mcp`,
		href: "/docs/integrations/ai-tools/mcp-server",
		linkText: "Explore MCP Server",
		visual: "mcp",
	},
	{
		title: "Developer CLI",
		description:
			"Deterministic CLI for humans and agents. Built with machine-readable JSON output, stdin piping, and live webhook streaming.",
		dotColor: "#10b981",
		glowClass: "bg-emerald-500/15 dark:bg-emerald-500/20",
		code: `reloop emails send \\
  --to user@example.com \\
  --subject "OTP: 839201" \\
  --json`,
		href: "/docs/integrations/ai-tools/cli-agents",
		linkText: "CLI Reference",
		visual: "cli",
	},
	{
		title: "Agent Skills",
		description:
			"Equip Cursor, Claude Code, and autonomous agents with domain knowledge on Reloop templates, batching, and deliverability.",
		dotColor: "#ec4899",
		glowClass: "bg-pink-500/15 dark:bg-pink-500/20",
		code: `npx skills add \\
  reloop/reloop-skills`,
		href: "/docs/integrations/agent-skills/reloop-skill",
		linkText: "Install Agent Skills",
		visual: "skills",
	},
];

function CopyButton({ code }: { code: string }) {
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
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy code snippet"}
			className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-text-sub-600 transition-colors hover:bg-black/5 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("size-3", copied && "text-emerald-500 dark:text-emerald-400")}
			/>
			<span>{copied ? "Copied" : "Copy"}</span>
		</button>
	);
}

function McpWindowVisual({ code }: { code: string }) {
	return (
		<div className="flex h-[142px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0/95 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-[#0d0e12]/95 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
			{/* Window Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full bg-[#ff5f56]" />
						<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
						<span className="size-2.5 rounded-full bg-[#27c93f]" />
					</div>
					<span className="ml-1.5 font-mono text-[11px] text-text-sub-600 dark:text-white/50">
						reloop-mcp
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<span
							className="inline-flex size-4.5 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-white/80"
							title="Claude Desktop"
						>
							<svg viewBox="0 0 24 24" className="size-2.5" aria-hidden>
								<path d={siClaude.path} fill="currentColor" />
							</svg>
						</span>
						<span
							className="inline-flex size-4.5 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-white/80"
							title="Cursor"
						>
							<svg viewBox="0 0 24 24" className="size-2.5" aria-hidden>
								<path d={siCursor.path} fill="currentColor" />
							</svg>
						</span>
					</div>
					<CopyButton code={code} />
				</div>
			</div>

			{/* Window Body */}
			<div className="flex flex-1 items-center p-3.5 font-mono text-[11.5px] leading-relaxed text-text-strong-950 dark:text-cyan-300/90">
				<pre className="overflow-x-auto whitespace-pre">
					<code>{code}</code>
				</pre>
			</div>
		</div>
	);
}

function CliWindowVisual({ code }: { code: string }) {
	return (
		<div className="flex h-[142px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0/95 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-[#0d0e12]/95 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
			{/* Window Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full bg-[#ff5f56]" />
						<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
						<span className="size-2.5 rounded-full bg-[#27c93f]" />
					</div>
					<span className="ml-1.5 font-mono text-[11px] text-text-sub-600 dark:text-white/50">
						reloop-cli
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span
						className="inline-flex size-4.5 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-white/80"
						title="Bash"
					>
						<svg viewBox="0 0 24 24" className="size-2.5" aria-hidden>
							<path d={siGnubash.path} fill="currentColor" />
						</svg>
					</span>
					<CopyButton code={code} />
				</div>
			</div>

			{/* Window Body */}
			<div className="flex flex-1 items-center p-3.5 font-mono text-[11.5px] leading-relaxed text-text-strong-950 dark:text-emerald-300/90">
				<pre className="overflow-x-auto whitespace-pre">
					<code>{code}</code>
				</pre>
			</div>
		</div>
	);
}

function SkillsWindowVisual({ code }: { code: string }) {
	return (
		<div className="flex h-[142px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0/95 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-[#0d0e12]/95 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
			{/* Window Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full bg-[#ff5f56]" />
						<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
						<span className="size-2.5 rounded-full bg-[#27c93f]" />
					</div>
					<span className="ml-1.5 font-mono text-[11px] text-text-sub-600 dark:text-white/50">
						reloop-skills
					</span>
				</div>

				<CopyButton code={code} />
			</div>

			{/* Window Body */}
			<div className="flex flex-1 items-center p-3.5 font-mono text-[11.5px] leading-relaxed text-text-strong-950 dark:text-pink-300/90">
				<pre className="overflow-x-auto whitespace-pre">
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

			{/* 3 Step Cards Grid */}
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{CARDS.map((card) => (
					<div
						key={card.title}
						className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-9"
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
								"pointer-events-none absolute -top-12 -left-12 size-48 rounded-full blur-[70px]",
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

							{/* Mock Window Visual */}
							<div className="mb-6">
								{card.visual === "mcp" && <McpWindowVisual code={card.code} />}
								{card.visual === "cli" && <CliWindowVisual code={card.code} />}
								{card.visual === "skills" && (
									<SkillsWindowVisual code={card.code} />
								)}
							</div>

							{/* Description */}
							<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{card.description}
							</p>
						</div>

						{/* Footer Link */}
						<div className="relative z-10 mt-8 pt-4 border-stroke-soft-200 border-t dark:border-white/10">
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
				))}
			</div>
		</section>
	);
}
