"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

interface WorkflowEmptyStateProps {
	onCreate: () => void;
	isFiltered?: boolean;
	onClearFilters?: () => void;
	title?: string;
	description?: string;
	createLabel?: string;
}

export const WorkflowEmptyState = ({
	onCreate,
	isFiltered = false,
	onClearFilters,
	title,
	description,
	createLabel = "Create automation",
}: WorkflowEmptyStateProps) => {
	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "workflow"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered
					? (title ?? "No automations found")
					: (title ?? "Create your first automation")}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? (description ?? "Try adjusting your search or filters.")
					: (description ??
						"Trigger emails from events — delays, conditions, and sends.")}
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
					Clear filters
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={onCreate}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					{createLabel}
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			)}
		</div>
	);
};
