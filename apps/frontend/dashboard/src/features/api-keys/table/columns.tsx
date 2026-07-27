import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link } from "#/lib/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { ApiKeyData } from "../types";

export const apiKeyColumns: ColumnDef<ApiKeyData>[] = [
	{
		id: "name",
		header: () => <span className="text-xs">Name</span>,
		cell: ({ row }) => {
			const apiKey = row.original;
			const displayName =
				apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
			return (
				<div className="flex min-w-0 items-center gap-2">
					<Link
						to="/api-keys/$apiKeyId"
						params={{ apiKeyId: apiKey.id }}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
					>
						{displayName}
					</Link>
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
];
