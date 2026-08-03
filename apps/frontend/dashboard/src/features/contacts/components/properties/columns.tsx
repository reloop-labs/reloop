import * as Badge from "@reloop/ui/badge";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import type { Property } from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";

export type PropertyTableMeta = {
	editingPropertyId: string | null;
	onEditProperty?: (property: Property) => void;
};

const getBadgeColor = (type: string) => {
	switch (type?.toLowerCase()) {
		case "string":
			return "blue";
		case "number":
			return "purple";
		default:
			return "gray";
	}
};

export const propertyColumns: ColumnDef<Property>[] = [
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
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="tag" className="h-3 w-3" />
				<span className="text-xs">Name</span>
			</div>
		),
		cell: ({ row, table }) => {
			const property = row.original;
			const meta = table.options.meta as PropertyTableMeta | undefined;
			const isEditing = meta?.editingPropertyId === property.id;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Icon name="tag" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<button
						type="button"
						onClick={() => meta?.onEditProperty?.(property)}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
					>
						{property.propertyName}
					</button>
					{isEditing && (
						<span className="rounded-md bg-bg-white-0 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100">
							Editing
						</span>
					)}
				</div>
			);
		},
	},
	{
		id: "type",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="file-code" className="h-3 w-3" />
				<span className="text-xs">Type</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<Badge.Root
					size="small"
					variant="lighter"
					color={getBadgeColor(row.original.propertyType)}
					className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
				>
					{row.original.propertyType}
				</Badge.Root>
			</div>
		),
	},
	{
		id: "default",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="file-text" className="h-3 w-3" />
				<span className="text-xs">Default</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex min-w-0 items-center">
				<span className="truncate font-medium text-sm text-text-sub-600">
					{row.original.defaultValue || "—"}
				</span>
			</div>
		),
	},
	{
		id: "updatedAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="history" className="h-3 w-3" />
				<span className="text-xs">Updated At</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{row.original.updatedAt
						? formatRelativeTime(row.original.updatedAt)
						: "—"}
				</span>
			</div>
		),
	},
	{
		id: "createdAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="calendar" className="h-3 w-3" />
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
