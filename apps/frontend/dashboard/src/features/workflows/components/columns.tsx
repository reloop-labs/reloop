import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Workflow } from "../workflow-types";
import { getWorkflowSummary } from "../workflow-validation";
import { WorkflowStatusBadge } from "./workflow-status-badge";

export const workflowColumns: ColumnDef<Workflow>[] = [
	{
		id: "select",
		size: 32,
		enableSorting: false,
		enableHiding: false,
		header: ({ table }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select all"
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(value === true)
					}
				/>
			</div>
		),
		cell: ({ row }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select row"
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onCheckedChange={(value) => row.toggleSelected(value === true)}
				/>
			</div>
		),
	},
	{
		id: "name",
		enableHiding: false,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="workflow" className="h-3 w-3" />
				<span className="text-xs">Name</span>
			</div>
		),
		cell: ({ row }) => {
			const workflow = row.original;
			return (
				<div className="flex min-w-0 items-center pr-3">
					<Link
						href={`/automation/${workflow.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
					>
						{workflow.name}
					</Link>
				</div>
			);
		},
	},
	{
		id: "trigger",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="route" className="h-3 w-3" />
				<span className="text-xs">Trigger</span>
			</div>
		),
		cell: ({ row }) => {
			const { eventLabel } = getWorkflowSummary(row.original);
			return (
				<div className="flex min-w-0 items-center pr-2">
					<span className="truncate font-mono text-text-sub-600 text-xs">
						{eventLabel}
					</span>
				</div>
			);
		},
	},
	{
		id: "steps",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="layers" className="h-3 w-3" />
				<span className="text-xs">Steps</span>
			</div>
		),
		cell: ({ row }) => {
			const { stepCount } = getWorkflowSummary(row.original);
			return (
				<div className="flex items-center">
					<span className="text-text-sub-600 text-xs tabular-nums">
						{stepCount}
					</span>
				</div>
			);
		},
	},
	{
		id: "updatedAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="history" className="h-3 w-3" />
				<span className="text-xs">Updated</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{formatRelativeTime(row.original.updatedAt)}
				</span>
			</div>
		),
	},
	{
		id: "status",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="activity" className="h-3 w-3" />
				<span className="text-xs">Status</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<WorkflowStatusBadge status={row.original.status} />
			</div>
		),
	},
];
