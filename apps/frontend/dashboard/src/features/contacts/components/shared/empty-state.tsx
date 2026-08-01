import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateClick?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
}

export function EmptyState({
	onCreateClick,
	searchQuery = "",
	onClearSearch,
}: EmptyStateProps) {
	const isFiltered = searchQuery.trim() !== "";

	return (
		<div className="flex w-full flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
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
				>
					<Icon name="plus" className="h-4 w-4" />
					Create channel
				</FancyButton.Root>
			)}
		</div>
	);
}
