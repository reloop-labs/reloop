import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { ApiKeyDetail } from "../types";

function MetaField({
	icon,
	label,
	isLoading,
	children,
}: {
	icon: string;
	label: string;
	isLoading?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1.5">
				<Icon name={icon} className="h-3.5 w-3.5 text-text-sub-600" />
				<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
					{label}
				</span>
			</div>
			{isLoading ? <Skeleton className="h-5 w-24 rounded-lg" /> : children}
		</div>
	);
}

export function ApiKeyMetaGrid({
	apiKey,
	isLoading,
}: {
	apiKey: ApiKeyDetail | undefined;
	isLoading?: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const displayPrefix = apiKey?.start || apiKey?.prefix || "---";

	const handleCopyPrefix = async () => {
		const text = apiKey?.start || apiKey?.prefix || "";
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success("API key prefix copied to clipboard");
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy prefix");
		}
	};

	return (
		<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
			<MetaField icon="key-new" label="Key Prefix" isLoading={isLoading}>
				<button
					type="button"
					className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
					onClick={() => void handleCopyPrefix()}
				>
					<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
						{displayPrefix}...
					</code>
					<Icon
						name={copied ? "check" : "copy"}
						className={cn(
							"h-3 w-3 shrink-0 transition-all",
							copied ? "text-success-base" : "text-text-sub-600",
						)}
					/>
				</button>
			</MetaField>

			<MetaField icon="arrow-swap" label="Requests" isLoading={isLoading}>
				<span className="font-medium text-paragraph-sm text-text-strong-950">
					{(apiKey?.requestCount || 0).toLocaleString()} times
				</span>
			</MetaField>

			<MetaField icon="activity-2" label="Status" isLoading={isLoading}>
				<div
					className={cn(
						"flex w-fit items-center gap-1.5 font-medium text-sm capitalize",
						apiKey?.enabled ? "text-success-base" : "text-error-base",
					)}
				>
					<Icon
						name={apiKey?.enabled ? "check-circle" : "cross-circle"}
						className="h-3.5 w-3.5"
					/>
					{apiKey?.enabled ? "Active" : "Disabled"}
				</div>
			</MetaField>

			<MetaField icon="calendar" label="Created" isLoading={isLoading}>
				<span className="font-medium text-paragraph-sm text-text-strong-950">
					{apiKey?.createdAt ? formatRelativeTime(apiKey.createdAt) : "---"}
				</span>
			</MetaField>

			<MetaField icon="history" label="Last Used" isLoading={isLoading}>
				<span className="font-medium text-paragraph-sm text-text-strong-950">
					{apiKey?.lastRequest
						? formatRelativeTime(apiKey.lastRequest)
						: "No activity"}
				</span>
			</MetaField>

			<MetaField icon="user" label="Created By" isLoading={isLoading}>
				<div className="flex items-center gap-2">
					<Avatar.Root size="20" color="blue" className="shrink-0">
						{apiKey?.createdBy?.image ? (
							<Avatar.Image
								src={apiKey.createdBy.image}
								alt={apiKey.createdBy.name || "User"}
							/>
						) : (
							<Avatar.Image asChild>
								<div
									className={cn(
										"flex h-full w-full items-center justify-center rounded-full font-medium text-[8px] text-white uppercase tracking-wide",
										getAvatarGradient(
											apiKey?.createdBy?.email || "unknown@reloop.sh",
										),
									)}
								>
									{getAvatarInitial(
										apiKey?.createdBy?.name || null,
										apiKey?.createdBy?.email || "unknown@reloop.sh",
									)}
								</div>
							</Avatar.Image>
						)}
					</Avatar.Root>
					<p className="-mt-0.5 max-w-[150px] truncate font-medium text-paragraph-sm text-text-strong-950 leading-none">
						{apiKey?.createdBy?.name ||
							apiKey?.createdBy?.email ||
							"Unknown"}
					</p>
				</div>
			</MetaField>
		</div>
	);
}
