import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Domain } from "../types";
import { getStatusColorClass, getStatusIcon, getStatusLabel } from "../utils";

export const domainColumns: ColumnDef<Domain>[] = [
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
		id: "domain",
		enableHiding: false,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="globe" className="h-3 w-3" />
				<span className="text-xs">Domain</span>
			</div>
		),
		cell: ({ row }) => {
			const domain = row.original;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Icon
						name="globe"
						className={cn(
							"h-4 w-4 shrink-0",
							getStatusColorClass(domain.status),
						)}
					/>
					<Link
						href={`/domain/${domain.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
					>
						{domain.domain}
					</Link>
				</div>
			);
		},
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
				<div
					className={cn(
						"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
						getStatusColorClass(row.original.status),
					)}
				>
					<Icon
						name={getStatusIcon(row.original.status)}
						className="h-3.5 w-3.5"
					/>
					{getStatusLabel(row.original.status)}
				</div>
			</div>
		),
	},
	{
		id: "createdAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="clock" className="h-3 w-3" />
				<span className="text-xs">Created At</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{row.original.createdAt
						? formatRelativeTime(row.original.createdAt)
						: "—"}
				</span>
			</div>
		),
	},
];
