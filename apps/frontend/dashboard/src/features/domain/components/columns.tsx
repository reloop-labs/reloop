import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Domain } from "../types";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
	getStatusPillClass,
} from "../utils";
import { DomainFavicon } from "./domain-favicon";
import { rootDomainOf } from "./domain-groups";

/** Domain status pill. */
export function DomainStatusCell({ status }: { status: Domain["status"] }) {
	return (
		<div className="flex items-center">
			<span
				className={cn(
					"inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-md border px-1 font-medium text-xs leading-none",
					getStatusPillClass(status),
				)}
			>
				<Icon name={getStatusIcon(status)} className="h-3 w-3 shrink-0" />
				{getStatusLabel(status)}
			</span>
		</div>
	);
}

/** Per-domain email counts shown as columns, in column order. */
const DOMAIN_COUNTS = [
	{
		id: "sending",
		label: "Sent",
		icon: "mail-send",
		pick: (d: Domain) => d.sentCount ?? 0,
	},
	{
		id: "receiving",
		label: "Received",
		icon: "mail-receive",
		pick: (d: Domain) => d.receivedCount ?? 0,
	},
] as const;

const countFormat = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

function countColumn(
	column: (typeof DOMAIN_COUNTS)[number],
): ColumnDef<Domain> {
	return {
		id: column.id,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name={column.icon} className="h-3 w-3" />
				<span className="whitespace-nowrap text-xs">{column.label}</span>
			</div>
		),
		cell: ({ row }) => {
			const value = column.pick(row.original);
			return (
				<span
					title={value.toLocaleString("en-US")}
					className={cn(
						"text-label-sm tabular-nums",
						value === 0
							? "text-text-soft-400"
							: "text-text-strong-950 dark:text-white",
					)}
				>
					{countFormat.format(value)}
				</span>
			);
		},
	};
}

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
				<div className="flex min-w-0 items-center gap-1">
					<DomainFavicon
						domain={rootDomainOf(domain.domain)}
						fallbackClassName={getStatusColorClass(domain.status)}
					/>
					<Link
						href={`/domain/${domain.id}`}
						title={domain.domain}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-text-sub-600"
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
		cell: ({ row }) => <DomainStatusCell status={row.original.status} />,
	},
	...DOMAIN_COUNTS.map(countColumn),
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
						: "-"}
				</span>
			</div>
		),
	},
];
