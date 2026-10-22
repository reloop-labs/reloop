import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Toolbar refresh for the sent/received email lists (`R` hotkey lives in the list). */
export function RefreshButton({
	isFetching,
	onRefresh,
	subject,
	className,
}: {
	isFetching: boolean;
	onRefresh: () => void;
	/** What gets reloaded, e.g. "sent emails". */
	subject: string;
	className?: string;
}) {
	return (
		<Tooltip.Provider delayDuration={200}>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={onRefresh}
						disabled={isFetching}
						className={cn(
							dataTableToolbarControlClassName,
							"gap-2 px-1.5",
							isFetching ? "pointer-events-none" : "cursor-pointer",
							className,
						)}
						aria-label={`Refresh ${subject}`}
						aria-keyshortcuts="r"
						aria-busy={isFetching}
					>
						<Icon
							name="rotate-cw"
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								isFetching && "animate-spin",
							)}
						/>
						<ActionKbd>R</ActionKbd>
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content
					side="top"
					sideOffset={-1}
					size="medium"
					variant="light"
					className="max-w-63 p-2.5"
				>
					<div className="flex items-start gap-2.5">
						<div
							className={cn(
								"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
								"bg-bg-weak-50 ring-1 ring-stroke-soft-200",
							)}
							aria-hidden
						>
							<Icon
								name="rotate-cw"
								className={cn(
									"h-3.5 w-3.5 text-text-sub-600",
									isFetching && "animate-spin",
								)}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-3">
								<p className="font-medium text-label-sm text-text-strong-950">
									{isFetching ? "Refreshing…" : "Refresh"}
								</p>
								<ActionKbd>R</ActionKbd>
							</div>
							<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
								{isFetching
									? `Fetching ${subject}.`
									: `Reload ${subject} from the server.`}
							</p>
						</div>
					</div>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}
