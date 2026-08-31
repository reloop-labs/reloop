import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Campaign } from "../campaign-types";
import { getStatusColorClass, getStatusIcon, getStatusLabel } from "../utils";

export const campaignColumns: ColumnDef<Campaign>[] = [
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
		id: "campaign",
		enableHiding: false,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="mega-phone" className="h-3 w-3" />
				<span className="text-xs">Campaign</span>
			</div>
		),
		cell: ({ row }) => {
			const campaign = row.original;
			return (
				<div className="flex min-w-0 items-center pr-3">
					<Link
						href={`/campaigns/${campaign.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
					>
						{campaign.name}
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
						"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px]",
						getStatusColorClass(row.original.status),
					)}
				>
					<Icon
						name={getStatusIcon(row.original.status)}
						className={cn(
							"h-3.5 w-3.5",
							row.original.status === "sending" && "animate-spin",
						)}
					/>
					{getStatusLabel(row.original.status)}
				</div>
			</div>
		),
	},
	{
		id: "audience",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="contacts" className="h-3 w-3" />
				<span className="text-xs">Audience</span>
			</div>
		),
		cell: ({ row }) => {
			const campaign = row.original;
			return (
				<div className="flex min-w-0 items-center pr-2">
					<span className="truncate font-medium text-sm text-text-sub-600">
						{campaign.audienceTargetName || "All Contacts"}
					</span>
				</div>
			);
		},
	},
	{
		id: "sentAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="clock" className="h-3 w-3" />
				<span className="text-xs">Sent</span>
			</div>
		),
		cell: ({ row }) => {
			const campaign = row.original;
			const label = campaign.sentAt
				? formatRelativeTime(campaign.sentAt)
				: campaign.status === "scheduled" && campaign.scheduledAt
					? formatRelativeTime(campaign.scheduledAt)
					: "—";
			return (
				<div className="flex items-center">
					<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
						{label}
					</span>
				</div>
			);
		},
	},
];
