"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { siCursor } from "simple-icons";

export function AiPromptBlock({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const handleOpenInCursor = () => {
		window.open(`cursor://?prompt=${encodeURIComponent(prompt)}`, "_blank");
	};

	return (
		<div
			className={cn(
				"overflow-hidden rounded-[18px] border border-stroke-soft-100 bg-[#fafafa] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0e]",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
				<div className="flex min-w-0 items-center gap-2">
					<Icon name="sparkling" className="h-4 w-4 shrink-0" />
					<span className="truncate font-semibold text-[13px] text-text-strong-950 dark:text-white">
						AI prompt
					</span>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<button
						type="button"
						onClick={handleOpenInCursor}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 transition-colors hover:border-stroke-sub-300 hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:text-white"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="h-3.5 w-3.5 shrink-0"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden
						>
							<path d={siCursor.path} />
						</svg>
						Open in Cursor
					</button>
					<button
						type="button"
						onClick={handleCopy}
						aria-label={copied ? "Copied" : "Copy prompt"}
						className="cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white"
					>
						<Icon
							name={copied ? "check" : "copy"}
							className="size-4 stroke-3"
						/>
					</button>
				</div>
			</div>
			<div className="max-h-[240px] overflow-y-auto px-4 py-3">
				<p className="select-text whitespace-pre-wrap font-mono text-[13px] text-text-strong-950 leading-relaxed dark:text-white/85">
					{prompt}
				</p>
			</div>
		</div>
	);
}
