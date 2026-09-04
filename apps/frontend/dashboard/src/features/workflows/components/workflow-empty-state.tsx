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
	if (isFiltered) {
		return (
			<div className="flex flex-col items-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-6 py-14 text-center dark:border-stroke-soft-100/50">
				<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50">
					<Icon name="search" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					{title ?? "No automations found"}
				</h3>
				<p className="mx-auto mb-6 max-w-[280px] text-balance text-sm text-text-sub-600">
					{description ?? "Try a different name or clear the status filter."}
				</p>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={onClearFilters}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross" className="h-4 w-4" />
					Clear filters
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-6 py-14 text-center dark:border-stroke-soft-100/50">
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title ?? "Create your first automation"}
			</h3>
			<p className="mx-auto mb-6 max-w-[320px] text-balance text-sm text-text-sub-600">
				{description ??
					"Start from an event, wait if you need to, then send the email."}
			</p>
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
		</div>
	);
};
