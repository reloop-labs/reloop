"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	getMcpClient,
	MCP_SERVER_URL,
	type McpClientSlug,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siClaude, siCursor, siModelcontextprotocol } from "simple-icons";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

type Lang = "json" | "bash" | "text";

type Step = {
	title: string;
	body: string;
	code?: { value: string; lang: Lang };
};

type ClientTab = {
	id: string;
	name: string;
	icon?: SimpleIcon;
	/** Multi-color logo file, for brands simple-icons doesn't carry. */
	iconSrc?: string;
	steps: Step[];
	install?: { label: string; href: string };
};

/** Setup steps come from the MCP page data so both stay in sync. */
function stepsFor(slug: McpClientSlug): Step[] {
	return (getMcpClient(slug)?.steps ?? []).map((step) => ({
		title: step.title,
		body: step.body,
		code: step.code && {
			value: step.code.value,
			lang: (["json", "bash"].includes(step.code.lang)
				? step.code.lang
				: "text") as Lang,
		},
	}));
}

const TABS: ClientTab[] = [
	{
		id: "claude",
		name: "Claude",
		icon: siClaude,
		steps: stepsFor("claude"),
		install: {
			label: "Add to Claude",
			href: "https://claude.ai/new?modal=add-custom-connector#customize/connectors",
		},
	},
	{
		id: "claude-code",
		name: "Claude Code",
		icon: siClaude,
		steps: stepsFor("claude-code"),
	},
	{
		id: "antigravity",
		name: "Antigravity",
		iconSrc: "/apps/antigravity.svg",
		steps: [
			{
				title: "Add the server",
				body: "In the agent panel, open Manage MCP Servers → View raw config and add Reloop.",
				code: {
					value: JSON.stringify(
						{ mcpServers: { reloop: { serverUrl: MCP_SERVER_URL } } },
						null,
						2,
					),
					lang: "json",
				},
			},
			{
				title: "Sign in",
				body: "Refresh the server list and approve the workspace in your browser.",
			},
		],
	},
	{
		id: "cursor",
		name: "Cursor",
		icon: siCursor,
		steps: stepsFor("cursor"),
		install: getMcpClient("cursor")?.installLink,
	},
	{
		id: "others",
		name: "Others",
		icon: siModelcontextprotocol,
		steps: [
			{
				title: "Add the server URL",
				body: "Any client with remote MCP support connects here and signs in through your browser.",
				code: { value: MCP_SERVER_URL, lang: "text" },
			},
			{
				title: "Local-only clients",
				body: "Clients that only launch local servers can run the npm package with an API key instead.",
				code: {
					value: "RELOOP_API_KEY=rl_prod_your_api_key npx -y reloop-mcp",
					lang: "text",
				},
			},
		],
	},
];

/** Colors JSON string values; keys and punctuation stay neutral. */
function highlightJson(line: string) {
	const parts = line.split(/("(?:[^"\\]|\\.)*")/);
	return parts.map((part, i) => {
		if (!part.startsWith('"')) {
			return (
				<span key={i} className="text-zinc-400 dark:text-zinc-500">
					{part}
				</span>
			);
		}
		const isKey = parts[i + 1]?.trimStart().startsWith(":");
		return (
			<span
				key={i}
				className={
					isKey
						? "text-zinc-950 dark:text-white"
						: "text-orange-600 dark:text-orange-400"
				}
			>
				{part}
			</span>
		);
	});
}

/** Shell: the command name in the accent, the rest neutral. */
function highlightShell(line: string) {
	const [cmd, ...rest] = line.split(" ");
	return (
		<>
			<span className="text-orange-600 dark:text-orange-400">{cmd}</span>
			<span className="text-zinc-950 dark:text-white"> {rest.join(" ")}</span>
		</>
	);
}

function highlight(lang: Lang, line: string) {
	if (lang === "json") return highlightJson(line);
	if (lang === "bash") return highlightShell(line);
	return <span className="text-zinc-950 dark:text-white">{line}</span>;
}

/** Per-client MCP setup: install button where one exists, then the snippet. */
export function McpConfigWindow() {
	const [activeId, setActiveId] = useState(TABS[0]?.id ?? "");
	const [copied, setCopied] = useState<string | null>(null);
	const tab = TABS.find((t) => t.id === activeId) ?? TABS[0];

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(null), 1500);
		return () => window.clearTimeout(timer);
	}, [copied]);

	if (!tab) return null;
	const external = tab.install?.href.startsWith("http");

	return (
		<div className="flex w-full flex-1 flex-col bg-bg-white-0 dark:bg-black">
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-6 py-3.5 md:px-12 dark:border-white/10">
				<div
					role="tablist"
					aria-label="MCP client"
					className="-ml-3 flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					{TABS.map((t) => {
						const active = t.id === tab.id;
						return (
							<button
								key={t.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => {
									setActiveId(t.id);
									setCopied(null);
								}}
								className={cn(
									"relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-[12.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-stroke-soft-200",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
								)}
							>
								{active && (
									<motion.span
										aria-hidden
										layoutId="mcp-client-pill"
										transition={{ duration: 0.2, ease: "easeOut" }}
										className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-white/10"
									/>
								)}
								{t.icon && (
									<svg
										viewBox="0 0 24 24"
										className="relative size-3.5"
										aria-hidden
									>
										<path
											d={t.icon.path}
											fill={
												t.icon.hex === "000000"
													? "currentColor"
													: `#${t.icon.hex}`
											}
										/>
									</svg>
								)}
								{t.iconSrc && (
									<img
										src={t.iconSrc}
										alt=""
										aria-hidden
										className="relative size-3.5"
									/>
								)}
								<span className="relative">{t.name}</span>
							</button>
						);
					})}
				</div>
			</div>

			<div
				role="tabpanel"
				aria-label={`${tab.name} setup`}
				className="min-h-[368px] flex-1 px-6 py-6 md:px-12"
			>
				<ol className="relative space-y-5">
					{tab.steps.map((step, i) => {
						const key = `${tab.id}-${i}`;
						return (
							<li key={key} className="relative flex gap-3">
								{/* Connector from this step's number down to the next one */}
								{i < tab.steps.length - 1 && (
									<span
										aria-hidden
										className="-bottom-5 absolute top-5 left-[9.5px] w-px bg-stroke-soft-100 dark:bg-white/10"
									/>
								)}
								<span className="relative flex size-5 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-medium text-[10.5px] text-text-strong-950 dark:border-white/15 dark:bg-black dark:text-white">
									{i + 1}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-3">
										<p className="font-medium text-[13px] text-text-strong-950 leading-5 dark:text-white">
											{step.title}
										</p>
										{i === 0 && tab.install && (
											<a
												href={tab.install.href}
												target={external ? "_blank" : undefined}
												rel={external ? "noopener noreferrer" : undefined}
												className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-text-strong-950 px-3 font-medium text-[12px] text-white transition-colors hover:bg-text-strong-950/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
											>
												{tab.install.label}
												<Icon
													name="arrow-right"
													className="size-3"
													aria-hidden
												/>
											</a>
										)}
									</div>
									<p className="mt-0.5 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{step.body}
									</p>
									{step.code && (
										<div className="relative mt-2.5 rounded-xl border border-stroke-soft-100 dark:border-white/10">
											<button
												type="button"
												onClick={() => {
													navigator.clipboard
														.writeText(step.code?.value ?? "")
														.then(() => setCopied(key))
														.catch(() => {});
												}}
												aria-label={copied === key ? "Copied" : "Copy"}
												className="absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-zinc-200/70 hover:text-text-strong-950 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
											>
												<Icon
													name={copied === key ? "check" : "copy"}
													className={cn(
														"size-3.5",
														copied === key && "text-emerald-600",
													)}
													aria-hidden
												/>
											</button>
											<pre
												className="overflow-x-auto py-2.5 pr-10 pl-3 text-[12px] leading-[1.7] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
												style={{ fontFamily: MONO }}
											>
												<code>
													{step.code.value.split("\n").map((line, j) => (
														<span key={`${key}-${j}`} className="block">
															{highlight(step.code?.lang ?? "text", line)}
														</span>
													))}
												</code>
											</pre>
										</div>
									)}
								</div>
							</li>
						);
					})}
				</ol>
			</div>
		</div>
	);
}

export function LearnMoreLink({ href }: { href: string }) {
	return (
		<Link
			href={href}
			className="group inline-flex w-fit items-center gap-1 font-medium text-[14px] text-text-strong-950 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
		>
			Learn more
			<Icon
				name="arrow-right"
				className="size-3.5 transition-transform group-hover:translate-x-0.5"
				aria-hidden
			/>
		</Link>
	);
}
