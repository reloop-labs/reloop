"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

function PromptCard({ prompt }: { prompt: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : `Copy prompt: ${prompt}`}
			className={cn(
				"group flex h-full w-full cursor-pointer items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 text-left transition-colors",
				"hover:border-stroke-soft-300 hover:bg-bg-weak-50/60",
				"dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.04]",
			)}
		>
			<p className="min-w-0 flex-1 text-[14px] text-text-strong-950 leading-[1.6] dark:text-white/85">
				“{prompt}”
			</p>
			<span className="-mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-text-soft-400 transition-colors group-hover:text-text-strong-950 dark:text-white/35 dark:group-hover:text-white">
				<Icon name={copied ? "check" : "copy"} className="size-3.5" />
			</span>
		</button>
	);
}

/** Copyable prompt cards (same prompts as the dashboard MCP page). */
export function PromptGrid({
	prompts,
	columns = 3,
}: {
	prompts: string[];
	columns?: 2 | 3;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-3 sm:grid-cols-2",
				columns === 3 && "lg:grid-cols-3",
			)}
		>
			{prompts.map((prompt) => (
				<PromptCard key={prompt} prompt={prompt} />
			))}
		</div>
	);
}
