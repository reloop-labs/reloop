"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	getMcpClient,
	MCP_SERVER_URL,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siClaude, siCursor } from "simple-icons";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

type ClientTab = {
	id: string;
	name: string;
	icon?: SimpleIcon;
	lang: "json" | "bash" | "text";
	/** Where the snippet goes, shown above the code. */
	hint: string;
	code: string;
	install?: { label: string; href: string };
};

const claudeCode = getMcpClient("claude-code");
const cursor = getMcpClient("cursor");

const TABS: ClientTab[] = [
	{
		id: "claude",
		name: "Claude",
		icon: siClaude,
		lang: "text",
		hint: "Settings → Connectors → Add custom connector",
		code: MCP_SERVER_URL,
		install: {
			label: "Open Claude connectors",
			href: "https://claude.ai/settings/connectors",
		},
	},
	{
		id: "claude-code",
		name: "Claude Code",
		icon: siClaude,
		lang: "bash",
		hint: "Run in your terminal, then /mcp to sign in",
		code:
			claudeCode?.steps[0]?.code?.value ??
			`claude mcp add --transport http reloop ${MCP_SERVER_URL}`,
	},
	{
		id: "antigravity",
		name: "Antigravity",
		lang: "json",
		hint: "Manage MCP Servers → View raw config",
		code: JSON.stringify(
			{ mcpServers: { reloop: { serverUrl: MCP_SERVER_URL } } },
			null,
			2,
		),
	},
	{
		id: "cursor",
		name: "Cursor",
		icon: siCursor,
		lang: "json",
		hint: ".cursor/mcp.json",
		code:
			cursor?.steps[0]?.code?.value ??
			JSON.stringify(
				{ mcpServers: { reloop: { url: MCP_SERVER_URL } } },
				null,
				2,
			),
		install: cursor?.installLink,
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

function highlight(tab: ClientTab, line: string) {
	if (tab.lang === "json") return highlightJson(line);
	if (tab.lang === "bash") return highlightShell(line);
	return <span className="text-zinc-950 dark:text-white">{line}</span>;
}

/** Per-client MCP setup: install button where one exists, then the snippet. */
export function McpConfigWindow() {
	const [activeId, setActiveId] = useState(TABS[0]?.id ?? "");
	const [copied, setCopied] = useState(false);
	const tab = TABS.find((t) => t.id === activeId) ?? TABS[0];

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 1500);
		return () => window.clearTimeout(timer);
	}, [copied]);

	if (!tab) return null;
	const external = tab.install?.href.startsWith("http");

	return (
		<div className="flex w-full flex-1 flex-col bg-bg-white-0 dark:bg-black">
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-6 py-2.5 md:px-12 dark:border-white/10 dark:bg-white/[0.03]">
				<div
					role="tablist"
					aria-label="MCP client"
					className="-ml-2 flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
									setCopied(false);
								}}
								className={cn(
									"inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 font-medium text-[12px] transition-colors",
									active
										? "bg-zinc-200/70 text-text-strong-950 dark:bg-white/10 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
								)}
							>
								{t.icon && (
									<svg viewBox="0 0 24 24" className="size-3" aria-hidden>
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
								{t.name}
							</button>
						);
					})}
				</div>
				{tab.install && (
					<a
						href={tab.install.href}
						target={external ? "_blank" : undefined}
						rel={external ? "noopener noreferrer" : undefined}
						className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-text-strong-950 px-2.5 font-medium text-[12px] text-white transition-colors hover:bg-text-strong-950/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
					>
						{tab.install.label}
						<Icon name="arrow-right" className="size-3" aria-hidden />
					</a>
				)}
			</div>

			<div
				role="tabpanel"
				aria-label={`${tab.name} setup`}
				className="flex-1 px-6 py-6 md:px-12"
			>
				<p className="mb-2.5 text-[11.5px] text-text-soft-400 dark:text-white/40">
					{tab.hint}
				</p>
				<div className="relative min-h-[172px]">
					<button
						type="button"
						onClick={() => {
							navigator.clipboard
								.writeText(tab.code)
								.then(() => setCopied(true))
								.catch(() => {});
						}}
						aria-label={copied ? "Copied" : `Copy ${tab.name} setup`}
						className="-top-1 -right-2 absolute flex size-7 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-zinc-200/70 hover:text-text-strong-950 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon
							name={copied ? "check" : "copy"}
							className={cn("size-3.5", copied && "text-emerald-600")}
							aria-hidden
						/>
					</button>
					<pre
						className="overflow-x-auto pr-9 text-[12px] leading-[1.7] [scrollbar-width:none] sm:text-[12.5px] [&::-webkit-scrollbar]:hidden"
						style={{ fontFamily: MONO }}
					>
						<code>
							{tab.code.split("\n").map((line, i) => (
								<span key={`${tab.id}-${i}`} className="block">
									{highlight(tab, line)}
								</span>
							))}
						</code>
					</pre>
				</div>
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
