import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import {
	getFullName,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "#/features/contacts/audience";
import type { Contact } from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";

export type ContactTableMeta = {
	editingContactId: string | null;
};

export const contactColumns: ColumnDef<Contact>[] = [
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
		id: "email",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="mail-single" className="h-3 w-3" />
				<span className="text-xs">Email</span>
			</div>
		),
		cell: ({ row, table }) => {
			const contact = row.original;
			const meta = table.options.meta as ContactTableMeta | undefined;
			const isEditing = meta?.editingContactId === contact.id;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-[10px] text-white uppercase tracking-wide shadow-sm">
						{contact.email.charAt(0).toUpperCase()}
					</div>
					<Link
						href={`/contacts/detail/${contact.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
						onClick={(e) => {
							if (isEditing) e.preventDefault();
						}}
					>
						{contact.email}
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
		id: "name",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="user" className="h-3 w-3" />
				<span className="text-xs">Name</span>
			</div>
		),
		cell: ({ row }) => {
			const fullName = getFullName(
				row.original.firstName,
				row.original.lastName,
			);
			return (
				<div className="flex min-w-0 items-center">
					<span className="truncate font-medium text-sm text-text-sub-600">
						{fullName || "—"}
					</span>
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
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<div className="flex items-center">
					<div
						className={cn(
							"relative flex min-h-[22px] items-center overflow-hidden py-0.5 font-medium text-[13px] capitalize transition-colors duration-200",
							getStatusColorClass(status),
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.div
								key={status}
								initial={{ y: "-100%", opacity: 0 }}
								animate={{ y: "0%", opacity: 1 }}
								exit={{ y: "100%", opacity: 0 }}
								transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								className="flex items-center gap-2"
							>
								<Icon
									name={getStatusIcon(status)}
									className="h-3.5 w-3.5 shrink-0"
								/>
								<span>{getStatusLabel(status)}</span>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			);
		},
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
