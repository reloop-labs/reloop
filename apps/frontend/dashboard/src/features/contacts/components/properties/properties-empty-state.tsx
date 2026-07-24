import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

interface PropertiesEmptyStateProps {
	onAddProperty?: () => void;
	searchQuery?: string;
	typeFilter?: string;
	onClearFilters?: () => void;
}

export function PropertiesEmptyState({
	onAddProperty,
	searchQuery = "",
	typeFilter = "",
	onClearFilters,
}: PropertiesEmptyStateProps) {
	const hasSearch = searchQuery.trim() !== "";
	const hasTypeFilter = Boolean(typeFilter && typeFilter !== "");
	const isFiltered = hasSearch || hasTypeFilter;

	let emptyMessage = "Try adjusting your search or filters.";
	if (hasSearch && hasTypeFilter) {
		emptyMessage = `No ${typeFilter} properties found matching "${searchQuery}".`;
	} else if (hasSearch) {
		emptyMessage = `No properties found matching "${searchQuery}".`;
	} else if (hasTypeFilter) {
		emptyMessage = `No ${typeFilter} properties found.`;
	}

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "tag"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered ? "No properties found" : "Create your first property"}
			</h3>
			<p className="mx-auto mb-6 max-w-80 text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? emptyMessage
					: "Store custom attributes per contact — like plans, regions, or any data your app tracks."}
			</p>
			{isFiltered ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={onClearFilters}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear search & filters
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={onAddProperty}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create property
				</FancyButton.Root>
			)}
		</div>
	);
}
