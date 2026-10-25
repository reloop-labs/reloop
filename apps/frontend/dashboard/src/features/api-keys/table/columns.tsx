import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { ApiKeyData } from "../types";

export type ApiKeyTableMeta = {
	editingApiKeyId: string | null;
};

/** "All domains", or the first allowed domain/address with "+N" and a full list on hover. */
function DomainsCell({ scope }: { scope: ApiKeyData["scope"] }) {
	const entries = scope ?? [];
	if (entries.length === 0) {
		return (
			<div className="flex min-w-0 items-center gap-1.5">
				<Icon name="globe" className="size-3.5 shrink-0 text-text-sub-600" />
				<span className="truncate font-medium text-sm text-text-sub-600">
					All domains
				</span>
			</div>
		);
	}
	const [first, ...rest] = entries;
	const label = (e: (typeof entries)[number]) => e.email ?? e.domain;
	const content = (
		<div className="flex min-w-0 items-center gap-1.5">
			<Icon
				name={first?.email ? "mail" : "globe"}
				className="size-3.5 shrink-0 text-text-sub-600"
			/>
			<span className="truncate font-medium text-sm text-text-strong-950 dark:text-white">
				{first ? label(first) : ""}
			</span>
			{rest.length > 0 ? (
				<span className="shrink-0 font-medium text-sm text-text-soft-400">
					+{rest.length}
				</span>
			) : null}
		</div>
	);
	return (
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<div className="min-w-0 cursor-default">{content}</div>
				</Tooltip.Trigger>
				<Tooltip.Content side="top" size="small" className="max-w-xs">
					{entries.slice(0, 10).map((e) => (
						<p key={`${e.domainId}:${e.email ?? "*"}`} className="truncate">
							{e.email ?? `${e.domain} (all addresses)`}
						</p>
					))}
					{entries.length > 10 ? <p>and {entries.length - 10} more</p> : null}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
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
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="key-new" className="h-3 w-3" />
				<span className="text-xs">Name</span>
			</div>
		),
		cell: ({ row, table }) => {
			const apiKey = row.original;
			const displayName =
				apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
			const meta = table.options.meta as ApiKeyTableMeta | undefined;
			const isEditing = meta?.editingApiKeyId === apiKey.id;
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Icon name="key-new" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<Link
						href={`/api-keys/${apiKey.id}`}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-text-strong-950 dark:text-white dark:hover:text-white"
						onClick={(e) => {
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
		id: "domains",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="shield" className="h-3 w-3" />
				<span className="text-xs">Access</span>
			</div>
		),
		cell: ({ row }) => <DomainsCell scope={row.original.scope} />,
	},
	{
		id: "prefix",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="hash" className="h-3 w-3" />
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
							"relative flex min-h-[22px] items-center overflow-hidden py-0.5 font-medium text-[13px] capitalize transition-colors duration-200",
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
						: "-"}
				</span>
			</div>
		),
	},
];
