import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface EmptyStateProps {
	onCreateClick?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
	className?: string;
}

export function EmptyState({
	onCreateClick,
	searchQuery = "",
	onClearSearch,
	className,
}: EmptyStateProps) {
	const isFiltered = searchQuery.trim() !== "";

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-6 py-12 text-center dark:border-stroke-soft-100/10 dark:bg-bg-weak-50/30",
				className,
			)}
		>
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "notification-indicator"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered ? "No channels found" : "Create your first channel"}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? "Try adjusting your search query."
					: "Organise contacts by interest so they only receive the messages they care about."}
			</p>
			{isFiltered ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={onClearSearch}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear search
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={onCreateClick}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create channel
					<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
				</FancyButton.Root>
			)}
		</div>
	);
}
