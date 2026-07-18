import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

interface ThreadAiSummaryProps {
	/** Summary text to display. Component hides when empty. */
	summary: string | null | undefined;
	className?: string;
}

/**
 * Collapsible AI summary — only renders when text exists; collapsed by default.
 */
export const ThreadAiSummary = ({
	summary,
	className,
}: ThreadAiSummaryProps) => {
	const [open, setOpen] = useState(false);

	if (!summary?.trim()) return null;

	return (
		<div
			className={cn(
				"mt-3 max-w-3xl rounded-xl border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-4 py-2",
				className,
			)}
		>
			<button
				type="button"
				className="flex w-full cursor-pointer items-center text-left"
				onClick={() => setOpen((v) => !v)}
			>
				<span className="font-medium text-mail-muted text-xs">AI Summary</span>
				<Icon
					name="chevron-down"
					className={cn(
						"ml-1 h-3 w-3 text-mail-muted transition-transform duration-150 ease-out",
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
