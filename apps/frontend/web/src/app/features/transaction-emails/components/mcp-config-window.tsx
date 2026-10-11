"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useEffect, useState } from "react";

const MCP_CONFIG = `{
  "mcpServers": {
    "reloop": {
      "command": "npx",
      "args": ["-y", "reloop-mcp"],
      "env": {
        "RELOOP_API_KEY": "rl_prod_your_api_key"
      }
    }
  }
}`;

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

/** Colors JSON string values; keys and punctuation stay neutral. */
function highlight(line: string) {
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

/** Copy-paste MCP config for any editor, in a small window frame. */
export function McpConfigWindow() {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 1500);
		return () => window.clearTimeout(timer);
	}, [copied]);

	return (
		<div className="w-full max-w-[480px]">
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full border border-zinc-300 dark:border-zinc-700" />
						<span className="size-2.5 rounded-full border border-zinc-300 dark:border-zinc-700" />
						<span className="size-2.5 rounded-full border border-zinc-300 dark:border-zinc-700" />
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded-md bg-zinc-200/70 px-2 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-white/10 dark:text-white">
							MCP
						</span>
						<button
							type="button"
							onClick={() => {
								navigator.clipboard
									.writeText(MCP_CONFIG)
									.then(() => setCopied(true))
									.catch(() => {});
							}}
							aria-label={copied ? "Copied" : "Copy MCP config"}
							className="flex size-7 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-zinc-200/70 hover:text-text-strong-950 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
						>
							<Icon
								name={copied ? "check" : "copy"}
								className={cn("size-3.5", copied && "text-emerald-600")}
								aria-hidden
							/>
						</button>
					</div>
				</div>
				<pre
					className="overflow-x-auto px-4 py-4 text-[12px] leading-[1.7] [scrollbar-width:none] sm:text-[12.5px] [&::-webkit-scrollbar]:hidden"
					style={{ fontFamily: MONO }}
				>
					<code>
						{MCP_CONFIG.split("\n").map((line, i) => (
							<span key={i} className="block">
								{highlight(line)}
							</span>
						))}
					</code>
				</pre>
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
