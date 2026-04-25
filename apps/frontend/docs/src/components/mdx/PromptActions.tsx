"use client";

import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { cn } from "@reloop/fe-docs/lib/cn";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

interface PromptActionsProps {
	prompt: string;
}

export function PromptActions({ prompt }: PromptActionsProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (typeof window !== "undefined" && navigator.clipboard) {
			navigator.clipboard
				.writeText(prompt)
				.then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				})
				.catch((err) => {
					console.error("Failed to copy: ", err);
				});
		}
	};

	const handleOpenCursor = () => {
		if (typeof window !== "undefined") {
			window.open(`cursor://?prompt=${encodeURIComponent(prompt)}`, "_blank");
		}
	};

	return (
		<div className="mt-4 flex flex-wrap items-center gap-3">
			<button
				type="button"
				onClick={handleCopy}
				className={cn(
					"group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-semibold text-[13px] transition-all duration-300",
					copied
						? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg"
						: "bg-zinc-900 text-zinc-100 hover:bg-black hover:shadow-black/10 hover:shadow-xl active:scale-[0.98]",
				)}
			>
				<div className="flex items-center gap-2">
					{copied ? (
						<Check className="h-3.5 w-3.5" />
					) : (
						<Copy className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
					)}
					<span>{copied ? "Copied!" : "Copy prompt"}</span>
				</div>
			</button>

			<button
				type="button"
				onClick={handleOpenCursor}
				className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 font-semibold text-[13px] text-zinc-600 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-md active:scale-[0.98]"
			>
				<SimpleIcon
					name="siCursor"
					size={14}
					className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12"
				/>
				<span>Open in Cursor</span>
			</button>
		</div>
	);
}
