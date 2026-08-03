import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";

export type GroupTableMeta = {
	editingGroupId: string | null;
};

function GroupContactsCount({ groupId }: { groupId: string }) {
	const { data, isPending: isLoading } = useQuery({
		queryKey: ["contacts", "group-count", groupId],
		queryFn: async () => {
			const res = await fetch(
				`/api/contacts/v1/groups/${groupId}/contacts?limit=1`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ total: number }>;
		},
	});

	if (isLoading) return <Skeleton className="h-4 w-8" />;
	return (
		<span className="font-medium text-sm text-text-sub-600">
			{data?.total ?? "—"}
		</span>
	);
}

export const groupColumns: ColumnDef<Group>[] = [
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
				<Icon name="modules" className="h-3 w-3" />
				<span className="text-xs">Name</span>
			</div>
		),
		cell: ({ row, table }) => {
			const group = row.original;
			const meta = table.options.meta as GroupTableMeta | undefined;
			const isEditing = meta?.editingGroupId === group.id;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Icon name="modules" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<Link
						href={`/contacts/groups/${group.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
						onClick={(e) => {
							if (isEditing) e.preventDefault();
						}}
					>
						{group.name}
					</Link>
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
		id: "contacts",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="users" className="h-3 w-3" />
				<span className="text-xs">Contacts</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<GroupContactsCount groupId={row.original.id} />
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
