import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { ApiKeyDetail } from "../types";

function IconAction({
	label,
	icon,
	onClick,
	active,
}: {
	label: string;
	icon: string;
	onClick: () => void;
	active?: boolean;
}) {
	return (
		<Tooltip.Provider delayDuration={200}>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={onClick}
						className={cn(
							"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
							"hover:bg-bg-weak-50 hover:text-text-strong-950",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20",
							active && "text-success-base hover:text-success-base",
						)}
						aria-label={label}
					>
						<Icon name={icon} className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="top" size="small">
					{label}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}

function StatItem({
	label,
	value,
	isLoading,
}: {
	label: string;
	value: string;
	isLoading?: boolean;
}) {
	return (
		<div className="min-w-0">
			<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</p>
			{isLoading ? (
				<Skeleton className="mt-1 h-5 w-20 rounded-lg" />
			) : (
				<p className="mt-1 truncate font-medium text-sm text-text-strong-950 tabular-nums">
					{value}
				</p>
			)}
		</div>
	);
}

/** Always-visible key prefix + usage snapshot (above tabs). */
export function ApiKeySummary({
	apiKey,
	isLoading,
}: {
	apiKey: ApiKeyDetail | undefined;
	isLoading?: boolean;
}) {
	const [copiedPrefix, setCopiedPrefix] = useState(false);
	const displayPrefix = apiKey?.start || apiKey?.prefix || "";

	const handleCopyPrefix = async () => {
		if (!displayPrefix) return;
		try {
			await navigator.clipboard.writeText(displayPrefix);
			toast.success("API key prefix copied");
			setCopiedPrefix(true);
			setTimeout(() => setCopiedPrefix(false), 2000);
		} catch {
			toast.error("Failed to copy prefix");
		}
	};

	return (
		<div className="mt-8 grid gap-4 lg:grid-cols-2">
			{/* Usage snapshot */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="space-y-3 p-4">
					<div>
						<p className="font-medium text-sm text-text-strong-950">Usage</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
							Request volume and recent activity for this key.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
						<StatItem
							label="Requests"
							value={(apiKey?.requestCount || 0).toLocaleString()}
							isLoading={isLoading}
						/>
						<StatItem
							label="Last used"
							value={
								apiKey?.lastRequest
									? formatRelativeTime(apiKey.lastRequest)
									: "No activity"
							}
							isLoading={isLoading}
						/>
						<StatItem
							label="Created"
							value={
								apiKey?.createdAt ? formatRelativeTime(apiKey.createdAt) : "—"
							}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>

			{/* Key prefix */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="space-y-3 p-4">
					<div>
						<p className="font-medium text-sm text-text-strong-950">
							Key prefix
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
							Visible identifier for this key. The full secret is only shown
							once at creation.
						</p>
					</div>

					{isLoading ? (
						<Skeleton className="h-10 w-full rounded-xl" />
					) : (
						<div className="flex items-center gap-2 rounded-xl bg-bg-weak-50 py-2 pr-2 pl-3 dark:bg-bg-weak-50/50">
							<code className="min-w-0 flex-1 truncate font-medium font-mono text-[13px] text-text-strong-950">
								{displayPrefix ? `${displayPrefix}…` : "—"}
							</code>
							{displayPrefix ? (
								<div className="flex shrink-0 items-center border-stroke-soft-100 border-l pl-1 dark:border-stroke-soft-100/40">
									<IconAction
										label={copiedPrefix ? "Copied" : "Copy prefix"}
										icon={copiedPrefix ? "check" : "copy"}
										onClick={() => void handleCopyPrefix()}
										active={copiedPrefix}
									/>
								</div>
							) : null}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
