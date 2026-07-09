"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

interface MessageParsedDataProps {
	parsed: Record<string, unknown>;
	isExpanded: boolean;
	onToggle: () => void;
}

/**
 * Collapsible section showing the AI-parsed structured data from the email.
 */
export const MessageParsedData = ({
	parsed,
	isExpanded,
	onToggle,
}: MessageParsedDataProps) => {
	if (!parsed || Object.keys(parsed).length === 0) return null;

	return (
		<div className="border-mail-border border-mail-border/10 border-t py-4">
			<button
				type="button"
				onClick={onToggle}
				className="mb-3 flex w-full items-center justify-between text-left"
			>
				<span className="font-medium text-mail-muted text-xs">Parsed data</span>
				<Icon
					name="chevron-down"
					className={cn(
						"h-4 w-4 text-mail-muted transition-transform",
						isExpanded && "rotate-180",
					)}
				/>
			</button>

			{isExpanded && (
				<div className="/20 flex flex-col gap-2 rounded-lg border border-mail-border border-mail-border/10 bg-offset-light/50 p-3">
					{Object.entries(parsed).map(([k, v]) => (
						<div
							key={k}
							className="grid grid-cols-[minmax(0,120px)_1fr] gap-2 text-xs"
						>
							<span className="font-medium text-mail-muted capitalize">
								{k.replace(/([A-Z])/g, " $1").trim()}
							</span>
							<span className="break-words text-mail-foreground dark:text-neutral-350">
								{typeof v === "object" ? JSON.stringify(v) : String(v)}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
