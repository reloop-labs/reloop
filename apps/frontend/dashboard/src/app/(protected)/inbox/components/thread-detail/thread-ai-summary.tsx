"use client";

import { cn } from "@reloop/ui/cn";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ThreadAiSummaryProps {
	/** Summary text to display. Component hides when empty. */
	summary: string | null | undefined;
	className?: string;
}

/**
 * Zero-style purple-bordered collapsible AI Summary shell.
 * No summary API yet — parent supplies text from parsed data / preview.
 */
export const ThreadAiSummary = ({
	summary,
	className,
}: ThreadAiSummaryProps) => {
	const [open, setOpen] = useState(true);

	if (!summary?.trim()) return null;

	return (
		<div
			className={cn(
				"mt-2 max-w-3xl rounded-xl border border-[#8B5CF6] bg-white px-4 py-2 dark:bg-[#252525]",
				className,
			)}
		>
			<button
				type="button"
				className="flex w-full cursor-pointer items-center text-left"
				onClick={() => setOpen((v) => !v)}
			>
				<span className="font-medium text-[#929292] text-xs">AI Summary</span>
				<ChevronDown
					className={cn(
						"ml-1 h-3 w-3 text-[#929292] transition-transform",
						open && "rotate-180",
					)}
				/>
			</button>
			{open && (
				<p className="mt-1.5 text-mail-foreground text-sm leading-relaxed">
					{summary}
				</p>
			)}
		</div>
	);
};
