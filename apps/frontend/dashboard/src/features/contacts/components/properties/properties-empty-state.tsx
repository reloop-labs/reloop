import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

interface PropertiesEmptyStateProps {
	onAddProperty?: () => void;
	searchQuery?: string;
	typeFilter?: string[];
	onClearFilters?: () => void;
}

export function PropertiesEmptyState({
	onAddProperty,
	searchQuery = "",
	typeFilter = [],
	onClearFilters,
}: PropertiesEmptyStateProps) {
	const [, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [, setTypeFilter] = useQueryState(
		"type",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [, setCurrentPage] = useQueryState(
		"propertyPage",
		parseAsInteger.withDefault(1),
	);

	const hasSearch = searchQuery.trim() !== "";
	const hasTypeFilter = typeFilter.length > 0;
	const isFiltered = hasSearch || hasTypeFilter;

	const handleClearFilters = () => {
		void setSearchQuery("");
		void setTypeFilter([]);
		void setCurrentPage(1);
		onClearFilters?.();
	};

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
					? "Try adjusting your search or filters."
					: "Store custom attributes per contact — like plans, regions, or any data your app tracks."}
			</p>
			{isFiltered ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={handleClearFilters}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear filters
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
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			)}
		</div>
	);
}
