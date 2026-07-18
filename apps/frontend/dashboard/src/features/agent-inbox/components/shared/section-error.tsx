import { cn } from "@reloop/ui/cn";

/** Inline error for a single inbox section — never blanks the full shell. */
export function SectionError({
	message,
	onRetry,
	className,
	compact = false,
}: {
	message: string;
	onRetry?: () => void;
	className?: string;
	compact?: boolean;
}) {
	return (
		<div
			role="alert"
			className={cn(
				"flex flex-col items-center justify-center gap-2 text-center text-mail-muted",
				compact ? "px-2 py-3" : "px-4 py-8",
				className,
			)}
		>
			<p className={cn("leading-snug", compact ? "text-[11px]" : "text-sm")}>
				{message}
			</p>
			{onRetry ? (
				<button
					type="button"
					onClick={onRetry}
					className={cn(
						"font-medium text-mail-foreground underline-offset-2 hover:underline",
						compact ? "text-[11px]" : "text-sm",
					)}
				>
					Retry
				</button>
			) : null}
		</div>
	);
}
