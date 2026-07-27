import { useRouter } from "next/navigation";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import * as Tooltip from "@reloop/ui/tooltip";

import axios from "axios";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DeleteWebhookModal } from "./delete-webhook-modal";

import { EmptyState } from "./empty-state";
import { WebhookTableSkeleton } from "./webhook-table-skeleton";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
	events?: string[];
}

interface WebhookTableProps {
	webhooks: WebhookData[];
	isLoading?: boolean;
	loadingRows?: number;
	isTotalEmpty?: boolean;
	searchQuery?: string;
	statusFilter?: string;
	onClearFilters?: () => void;
	onMutate?: () => void;
	onDeleteSuccess?: (deletedName: string) => void;
}

const GRID =
	"grid-cols-[minmax(0,1fr)_100px_110px_120px_minmax(40px,auto)]";

const getStatusColorClass = (status: string) => {
	switch (status) {
		case "active":
			return "text-success-base";
		case "paused":
			return "text-warning-base";
		case "failed":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
};

const getStatusIcon = (status: string) => {
	switch (status) {
		case "active":
			return "check-circle" as const;
		case "paused":
			return "pause-circle" as const;
		case "failed":
			return "alert-circle" as const;
		case "disabled":
			return "minus-circle" as const;
		default:
			return "circle" as const;
	}
};

function HealthCell({
	successCount,
	failureCount,
}: {
	successCount: number;
	failureCount: number;
}) {
	const total = successCount + failureCount;
	if (total === 0) {
		return (
			<span className="font-medium text-[13px] text-text-soft-400">—</span>
		);
	}
	const rate = Math.round((successCount / total) * 100);
	const tone =
		rate >= 95
			? "text-success-base"
			: rate >= 80
				? "text-warning-base"
				: "text-error-base";

	return (
		<Tooltip.Root delayDuration={200}>
			<Tooltip.Trigger asChild>
				<div className="flex flex-col gap-0.5">
					<span className={cn("font-medium text-[13px] tabular-nums", tone)}>
						{rate}%
					</span>
					<span className="font-medium text-[10px] text-text-soft-400 tabular-nums">
						{successCount.toLocaleString()}
						<span className="text-text-disabled-300"> / </span>
						{failureCount.toLocaleString()}
					</span>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content sideOffset={4} className="rounded-lg px-2.5 py-1.5">
				<p className="text-xs">
					{successCount.toLocaleString()} delivered ·{" "}
					{failureCount.toLocaleString()} failed
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

interface WebhookActionsDropdownProps {
	webhook: WebhookData;
	isToggling: boolean;
	onViewDetails: (id: string) => void;
	onTest: (id: string) => void;
	onEdit: (id: string) => void;
	onCopyUrl: (url: string) => void;
	onCopyId: (id: string) => void;
	onSetStatus: (
		id: string,
		status: "active" | "paused" | "disabled",
	) => void;
	onDelete: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

const WebhookActionsDropdown = ({
	webhook,
	isToggling,
	onViewDetails,
	onTest,
	onEdit,
	onCopyUrl,
	onCopyId,
	onSetStatus,
	onDelete,
	onOpenChange,
}: WebhookActionsDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const isDisabled = webhook.status === "disabled";
	const isPaused = webhook.status === "paused";
	const isActive = webhook.status === "active" || webhook.status === "failed";

	const menuItems = [
		{
			id: "view",
			label: "View details",
			icon: "info-outline" as const,
			isDanger: false,
			dividerAfter: false,
		},
		{
			id: "test",
			label: "Send test event",
			icon: "play" as const,
			isDanger: false,
			dividerAfter: false,
		},
		{
			id: "edit",
			label: "Edit",
			icon: "edit" as const,
			isDanger: false,
			dividerAfter: true,
		},
		{
			id: "copy-url",
			label: "Copy URL",
			icon: "copy" as const,
			isDanger: false,
			dividerAfter: false,
		},
		{
			id: "copy-id",
			label: "Copy ID",
			icon: "copy" as const,
			isDanger: false,
			dividerAfter: true,
		},
		...(isPaused
			? [
					{
						id: "resume",
						label: "Resume",
						icon: "play" as const,
						isDanger: false,
						dividerAfter: false,
					},
				]
			: isActive
				? [
						{
							id: "pause",
							label: "Pause",
							icon: "pause" as const,
							isDanger: false,
							dividerAfter: false,
						},
					]
				: []),
		{
			id: "toggle",
			label: isDisabled ? "Enable" : "Disable",
			icon: (isDisabled ? "check-circle" : "minus-circle") as
				| "check-circle"
				| "minus-circle",
			isDanger: false,
			dividerAfter: true,
		},
		{
			id: "delete",
			label: "Delete",
			icon: "trash" as const,
			isDanger: true,
			dividerAfter: false,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "view") onViewDetails(webhook.id);
		else if (itemId === "test") onTest(webhook.id);
		else if (itemId === "edit") onEdit(webhook.id);
		else if (itemId === "copy-url") onCopyUrl(webhook.url);
		else if (itemId === "copy-id") onCopyId(webhook.id);
		else if (itemId === "pause") onSetStatus(webhook.id, "paused");
		else if (itemId === "resume") onSetStatus(webhook.id, "active");
		else if (itemId === "toggle") {
			onSetStatus(webhook.id, isDisabled ? "active" : "disabled");
		} else if (itemId === "delete") onDelete(webhook.id);
		setPopoverOpen(false);
	};

	return (
		<div className="flex items-center justify-center">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						disabled={isToggling}
						className="h-7 w-7 p-0 opacity-60 transition-opacity group-hover/row:opacity-100 data-[state=open]:opacity-100"
					>
						<Icon name="more-horizontal" className="h-3.5 w-3.5" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					sideOffset={6}
					className="w-48 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<div key={item.id}>
								<button
									ref={(el) => {
										if (el) buttonRefs.current[idx] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleItemClick(item.id)}
									disabled={
										(item.id === "toggle" ||
											item.id === "pause" ||
											item.id === "resume") &&
										isToggling
									}
									className={cn(
										"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
										item.isDanger
											? "text-error-base"
											: "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
										isToggling &&
											(item.id === "toggle" ||
												item.id === "pause" ||
												item.id === "resume") &&
											"cursor-not-allowed opacity-50",
									)}
								>
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
									<span>{item.label}</span>
								</button>
								{item.dividerAfter ? (
									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
								) : null}
							</div>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</PopoverContent>
			</PopoverRoot>
		</div>
	);
};

export const WebhookTable = ({
	webhooks,
	isLoading,
	loadingRows = 5,
	isTotalEmpty,
	searchQuery = "",
	statusFilter = "all",
	onClearFilters,
	onMutate,
	onDeleteSuccess,
}: WebhookTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
	const isFiltered =
		searchQuery.trim() !== "" || statusFilter !== "all";

	const goToDetail = (webhookId: string) => {
		router.push(`/webhooks/${webhookId}`);
	};

	const goToTest = (webhookId: string) => {
		router.push(`/webhooks/${webhookId}/test`);
	};

	const goToEdit = (webhookId: string) => {
		router.push(`/webhooks/${webhookId}/edit`);
	};

	const handleCopyUrl = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Endpoint URL copied");
		} catch {
			toast.error("Failed to copy URL");
		}
	};

	const handleCopyId = async (id: string) => {
		try {
			await navigator.clipboard.writeText(id);
			toast.success("Webhook ID copied");
		} catch {
			toast.error("Failed to copy ID");
		}
	};

	const handleSetStatus = async (
		webhookId: string,
		nextStatus: "active" | "paused" | "disabled",
	) => {
		if (isTogglingStatus) return;

		const labels: Record<string, string> = {
			active: "enabled",
			paused: "paused",
			disabled: "disabled",
		};

		try {
			setIsTogglingStatus(webhookId);
			await axios.patch(
				`/api/webhook/v1/${webhookId}`,
				{ status: nextStatus },
				{ withCredentials: true },
			);
			toast.success(`Webhook ${labels[nextStatus]} successfully`);
			onMutate?.();
		} catch {
			toast.error(`Failed to update webhook status`);
		} finally {
			setIsTogglingStatus(null);
		}
	};

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={cn(
						`grid ${GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40`,
					)}
				>
					<div className="flex items-center gap-1">
						<Icon name="link" className="h-3 w-3" />
						<span className="text-xs">URL</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="check-circle" className="h-3 w-3" />
						<span className="text-xs">Health</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="clock" className="h-3 w-3" />
						<span className="text-xs">Last trigger</span>
					</div>
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading ? (
						<WebhookTableSkeleton rows={loadingRows} />
					) : isTotalEmpty ? (
						<EmptyState />
					) : webhooks.length === 0 ? (
						<EmptyState
							isFiltered={isFiltered}
							onClearFilters={onClearFilters}
						/>
					) : (
						webhooks.map((webhook) => {
							const isRowActive = activeDropdownId === webhook.id;
							const isToggling = isTogglingStatus === webhook.id;

							return (
								<div
									key={webhook.id}
									role="link"
									tabIndex={0}
									onClick={() => goToDetail(webhook.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											goToDetail(webhook.id);
										}
									}}
									className={cn(
										`group/row grid w-full cursor-pointer ${GRID} items-center px-4 py-2.5 text-left transition-colors duration-150`,
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:bg-bg-weak-50/50",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									{/* URL only */}
									<div className="min-w-0 pr-3">
										<p className="truncate font-medium font-mono text-label-sm text-text-strong-950">
											{webhook.url}
										</p>
									</div>

									{/* Status */}
									<div className="flex items-center">
										<div
											className={cn(
												"flex items-center gap-1.5 font-medium text-[13px] capitalize",
												getStatusColorClass(webhook.status),
											)}
										>
											<Icon
												name={getStatusIcon(webhook.status)}
												className="h-3.5 w-3.5"
											/>
											{webhook.status}
										</div>
									</div>

									{/* Health */}
									<div className="flex items-center">
										<HealthCell
											successCount={webhook.successCount}
											failureCount={webhook.failureCount}
										/>
									</div>

									{/* Last trigger */}
									<div className="flex items-center">
										<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
											{webhook.lastTriggeredAt
												? formatRelativeTime(webhook.lastTriggeredAt)
												: "Never"}
										</span>
									</div>

									{/* Actions */}
									<div
										className="flex items-center justify-center text-text-soft-400"
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => e.stopPropagation()}
									>
										<WebhookActionsDropdown
											webhook={webhook}
											isToggling={isToggling}
											onViewDetails={goToDetail}
											onTest={goToTest}
											onEdit={goToEdit}
											onCopyUrl={handleCopyUrl}
											onCopyId={handleCopyId}
											onSetStatus={handleSetStatus}
											onDelete={(id) => void setDeleteId(id)}
											onOpenChange={(open) =>
												setActiveDropdownId(open ? webhook.id : null)
											}
										/>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<DeleteWebhookModal
				webhook={webhooks.find((w) => w.id === deleteId) || null}
				onSuccess={(name) => {
					onDeleteSuccess?.(name || "Webhook");
					onMutate?.();
				}}
			/>
		</>
	);
};
