"use client";

import Link from "next/link";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { Workflow } from "../workflow-types";
import { getWorkflowSummary } from "../workflow-validation";
import { WorkflowEmptyState } from "./workflow-empty-state";

interface WorkflowTableProps {
	workflows: Workflow[];
	isLoading?: boolean;
	isTotalEmpty?: boolean;
	onCreate: () => void;
}

const getStatusBadgeColor = (status: Workflow["status"]) => {
	switch (status) {
		case "active":
			return "font-medium border border-success-base bg-success-light/20 text-success-base";
		case "paused":
			return "font-medium border border-warning-base bg-warning-light/20 text-warning-base";
		default:
			return "font-medium border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600";
	}
};

const getStatusIconColor = (status: Workflow["status"]) => {
	switch (status) {
		case "active":
			return "bg-success-base";
		case "paused":
			return "bg-warning-base";
		default:
			return "bg-text-sub-600";
	}
};

export const WorkflowTable = ({
	workflows,
	isLoading,
	isTotalEmpty,
	onCreate,
}: WorkflowTableProps) => {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-16 animate-pulse rounded-lg border border-stroke-soft-100 bg-bg-weak-50"
					/>
				))}
			</div>
		);
	}

	if (isTotalEmpty) {
		return <WorkflowEmptyState onCreate={onCreate} />;
	}

	return (
		<div className="flex flex-col">
			{workflows.map((workflow) => {
				const { eventLabel, stepCount } = getWorkflowSummary(workflow);
				return (
					<Link href={`/workflows/${workflow.id}`} key={workflow.id} className="group flex items-center gap-4 border-stroke-soft-100 border-b px-4 py-3 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/50">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/50">
							<Icon name="workflow" className="h-4 w-4 text-text-sub-600" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm text-text-strong-950">
								{workflow.name}
							</p>
							<p className="truncate text-text-sub-600 text-xs">
								{eventLabel} · {stepCount} step{stepCount === 1 ? "" : "s"}
							</p>
						</div>
						<div className="hidden shrink-0 text-text-sub-600 text-xs sm:block">
							{formatRelativeTime(workflow.updatedAt)}
						</div>
						<span
							className={cn(
								"inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs capitalize",
								getStatusBadgeColor(workflow.status),
							)}
						>
							<span
								className={cn(
									"h-1.5 w-1.5 rounded-full",
									getStatusIconColor(workflow.status),
								)}
							/>
							{workflow.status}
						</span>
						<Icon
							name="chevron-right"
							className="h-4 w-4 shrink-0 text-text-sub-600 opacity-0 transition-opacity group-hover:opacity-100"
						/>
					</Link>
				);
			})}
		</div>
	);
};
