import Link from "next/link";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { ApiKeyData } from "../types";

export type ApiKeyTableMeta = {
	editingApiKeyId: string | null;
};

function CreatedByCell({
	createdBy,
}: {
	createdBy: ApiKeyData["createdBy"];
}) {
	if (!createdBy) {
		return (
			<span className="font-medium text-sm text-text-sub-600">Unknown</span>
		);
	}

	const label =
		createdBy.name ||
		(createdBy.email ? createdBy.email.split("@")[0] : "Unknown");
	const safeEmail = createdBy.email || "unknown@reloop.sh";

	return (
		<div className="flex min-w-0 items-center gap-2">
			<Avatar.Root size="20" color="blue" className="shrink-0">
				{createdBy.image ? (
					<Avatar.Image src={createdBy.image} alt={label} />
				) : (
					<Avatar.Image asChild>
						<div
							className={cn(
								"flex h-full w-full items-center justify-center rounded-full font-medium text-[8px] text-white uppercase tracking-wide",
								getAvatarGradient(safeEmail),
							)}
						>
							{getAvatarInitial(createdBy.name ?? null, safeEmail)}
						</div>
					</Avatar.Image>
				)}
			</Avatar.Root>
			<span className="truncate font-medium text-sm text-text-sub-600">
				{label}
			</span>
		</div>
	);
}

export const apiKeyColumns: ColumnDef<ApiKeyData>[] = [
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
		header: () => <span className="text-xs">Name</span>,
		cell: ({ row, table }) => {
			const apiKey = row.original;
			const displayName =
				apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
			const meta = table.options.meta as ApiKeyTableMeta | undefined;
			const isEditing = meta?.editingApiKeyId === apiKey.id;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Link href={`/api-keys/${apiKey.id}`} className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400" onClick={(e) => {
							if (isEditing) e.preventDefault();
						}}
					>
						{displayName}
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
		id: "prefix",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="key-new" className="h-3 w-3" />
				<span className="text-xs">Prefix</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/20">
					{row.original.start || "rl_..."}
				</span>
			</div>
		),
	},
	{
		id: "lastUsed",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="history" className="h-3 w-3" />
				<span className="text-xs">Last Used</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{row.original.lastRequest
						? formatRelativeTime(row.original.lastRequest)
						: "No Activity"}
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
		cell: ({ row }) => {
			const enabled = row.original.enabled;
			return (
				<div className="flex items-center">
					<div
						className={cn(
							"relative flex items-center overflow-hidden py-0.5 font-medium text-[13px] capitalize transition-colors duration-200 min-h-[22px]",
							enabled ? "text-success-base" : "text-error-base",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.div
								key={enabled ? "active" : "disabled"}
								initial={{ y: "-100%", opacity: 0 }}
								animate={{ y: "0%", opacity: 1 }}
								exit={{ y: "100%", opacity: 0 }}
								transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								className="flex items-center gap-2"
							>
								<Icon
									name={enabled ? "check-circle" : "cross-circle"}
									className="h-3.5 w-3.5 shrink-0"
								/>
								<span>{enabled ? "Active" : "Disabled"}</span>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			);
		},
	},
	{
		id: "createdBy",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="user" className="h-3 w-3" />
				<span className="text-xs">Created By</span>
			</div>
		),
		cell: ({ row }) => <CreatedByCell createdBy={row.original.createdBy} />,
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
