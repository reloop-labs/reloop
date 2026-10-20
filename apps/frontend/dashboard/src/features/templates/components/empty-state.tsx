import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useCreateTemplate } from "#/features/templates/hooks/use-templates-query";

/** `onBrowseExamples` adds a link to the Explore tab on the no-templates state. */
export const EmptyState = ({
	onBrowseExamples,
}: {
	onBrowseExamples?: () => void;
} = {}) => {
	const { isCreating, create } = useCreateTemplate();
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);

	const isFiltered = statusFilter.length > 0 || searchQuery.trim() !== "";

	useHotkeys(
		"b",
		(e) => {
			e.preventDefault();
			onBrowseExamples?.();
		},
		{
			enabled: !!onBrowseExamples && !isFiltered,
			enableOnFormTags: false,
			preventDefault: true,
		},
	);

	const handleClearFilters = () => {
		void setSearchQuery("");
		void setStatusFilter([]);
	};

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "layout"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered ? "No templates found" : "Create your first template"}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? "Try adjusting your search or filters."
					: "Design reusable emails with drag-and-drop, then send them via API or campaigns."}
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
				<div className="flex items-center gap-2">
					<FancyButton.Root
						type="button"
						variant="neutral"
						size="small"
						onClick={() => void create()}
						disabled={isCreating}
						className="gap-1.5 rounded-xl"
						aria-keyshortcuts="c"
					>
						{isCreating ? (
							<>
								<Spinner size={14} color="currentColor" />
								Creating...
							</>
						) : (
							<>
								<Icon name="plus" className="h-4 w-4" />
								Create template
								<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
							</>
						)}
					</FancyButton.Root>
					{onBrowseExamples ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={onBrowseExamples}
							className="gap-1.5 rounded-xl"
							aria-keyshortcuts="b"
						>
							Browse templates
							<ActionKbd>B</ActionKbd>
						</Button.Root>
					) : null}
				</div>
			)}
		</div>
	);
};
