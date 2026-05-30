"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import * as Tooltip from "@reloop/ui/tooltip";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";

import { DeleteWebhookModal } from "./delete-webhook-modal";
import { EmptyState } from "./empty-state";
import { WebhookTableSkeleton } from "./webhook-table-skeleton";

const categoryBadgeColors: Record<string, { light: string; dark: string }> = {
	domain: { light: "bg-[#0A438A]", dark: "dark:bg-[#1E57A8]" },
	"api-key": { light: "bg-[#8A5A0A]", dark: "dark:bg-[#A87A1E]" },
	contact: { light: "bg-[#0A6B3A]", dark: "dark:bg-[#1E8A4E]" },
};

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
}

const getStatusBadgeColor = () => {
	return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
};

const getStatusIconColor = (status: string) => {
	switch (status) {
		case "active":
			return "bg-success-base";
		case "paused":
			return "bg-warning-base";
		case "disabled":
			return "bg-warning-base";
		case "failed":
			return "bg-error-base";
		default:
			return "bg-faded-base";
	}
};

interface WebhookActionsDropdownProps {
	webhook: WebhookData;
	onViewDetails: (id: string) => void;
	onDeleteKey: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

const WebhookActionsDropdown = ({
	webhook,
	onViewDetails,
	onDeleteKey,
	onOpenChange,
}: WebhookActionsDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete Webhook",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "view") {
			onViewDetails(webhook.id);
			setPopoverOpen(false);
		} else if (itemId === "delete") {
			onDeleteKey(webhook.id);
			setPopoverOpen(false);
		}
	};

	return (
		<div className="flex items-center justify-end">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-vertical" className="h-3 w-3" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					sideOffset={-10}
					className="w-40 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<button
								key={item.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleItemClick(item.id)}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
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

const GRID = "grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_120px_140px_32px]";
const BORDER = "border-stroke-soft-100 dark:border-stroke-soft-100/50";

export const WebhookTable = ({
	webhooks,
	isLoading,
	loadingRows = 3,
	isTotalEmpty,
}: WebhookTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useQueryState("delete");

	const handleViewDetails = (webhookId: string) => {
		router.push(`/webhooks/${webhookId}`);
	};

	const handleDeleteWebhook = (webhookId: string) => {
		setDeleteId(webhookId);
	};

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={cn(
						`grid ${GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 text-text-sub-600 dark:bg-bg-weak-50/40`,
					)}
				>
					<div className="font-medium text-xs">Endpoint</div>
					<div className="font-medium text-xs">Events</div>
					<div className="font-medium text-xs">Status</div>
					<div className="whitespace-nowrap font-medium text-xs">
						Last Triggered
					</div>
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
					{isLoading ? (
						<WebhookTableSkeleton rows={loadingRows} />
					) : isTotalEmpty ? (
						<div className="w-full">
							<EmptyState />
						</div>
					) : webhooks.length === 0 ? (
						<div className="flex w-full items-center justify-center p-8 text-sm text-text-sub-600">
							No endpoints matching your search.
						</div>
					) : (
						webhooks.map((webhook, index) => {
							const isRowActive = activeDropdownId === webhook.id;
							return (
								<div
									key={`webhook-${index}`}
									className={cn(
										`group/row grid w-full cursor-pointer ${GRID} items-center px-4 py-2 text-left transition-colors`,
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									<Link href={`/webhooks/${webhook.id}`} className="contents">
										<div className="flex min-w-0 items-center gap-2">
											<Icon
												name="link"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<div className="flex min-w-0 flex-col pr-4">
												<div className="truncate font-medium text-label-sm text-text-strong-950">
													{webhook.name || webhook.url}
												</div>
												<div className="mt-0.5 truncate font-mono text-[11px] text-text-sub-600">
													{webhook.url}
												</div>
											</div>
										</div>

										<div className="flex min-w-0 items-center pr-4">
											{!webhook.events || webhook.events.length === 0 ? (
												<span className="truncate text-label-sm text-text-sub-600">
													All events
												</span>
											) : (
												<Tooltip.Root delayDuration={0}>
													<Tooltip.Trigger asChild>
														<div className="flex flex-col items-start gap-1">
															{webhook.events[0] &&
																(() => {
																	const firstId = webhook.events?.[0];
																	const event = WEBHOOK_EVENTS.find(
																		(e) => e.id === firstId,
																	);
																	if (!event) return null;
																	return (
																		<div
																			key={event.id}
																			className={cn(
																				"shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[10px] text-white",
																				categoryBadgeColors[event.category]
																					?.light,
																				categoryBadgeColors[event.category]
																					?.dark,
																			)}
																		>
																			{event.name}
																		</div>
																	);
																})()}
															{webhook.events.length > 1 && (
																<div className="flex items-center gap-1">
																	{(() => {
																		const secondId = webhook.events?.[1];
																		const event = WEBHOOK_EVENTS.find(
																			(e) => e.id === secondId,
																		);
																		if (!event) return null;
																		return (
																			<div
																				key={event.id}
																				className={cn(
																					"shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[10px] text-white",
																					categoryBadgeColors[event.category]
																						?.light,
																					categoryBadgeColors[event.category]
																						?.dark,
																				)}
																			>
																				{event.name}
																			</div>
																		);
																	})()}
																	{webhook.events.length > 2 && (
																		<span className="shrink-0 font-medium text-text-sub-600 text-xs">
																			+{webhook.events.length - 2}
																		</span>
																	)}
																</div>
															)}
														</div>
													</Tooltip.Trigger>
													<Tooltip.Content
														sideOffset={4}
														className="max-w-[280px] rounded-xl p-2"
													>
														<div className="flex flex-wrap gap-1">
															{webhook.events.map((eventId) => {
																const event = WEBHOOK_EVENTS.find(
																	(e) => e.id === eventId,
																);
																if (!event) return null;
																return (
																	<div
																		key={event.id}
																		className={cn(
																			"shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[10px] text-white",
																			categoryBadgeColors[event.category]
																				?.light,
																			categoryBadgeColors[event.category]?.dark,
																		)}
																	>
																		{event.name}
																	</div>
																);
															})}
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											)}
										</div>

										<div className="flex items-center">
											<span
												className={cn(
													"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
													getStatusBadgeColor(),
												)}
											>
												<span
													className={cn(
														"mr-1.5 h-2 w-2 rounded-full",
														getStatusIconColor(webhook.status),
													)}
												/>
												<span className="capitalize">{webhook.status}</span>
											</span>
										</div>

										<div className="flex items-center">
											<span className="whitespace-nowrap text-label-sm text-text-sub-600">
												{webhook.lastTriggeredAt
													? formatRelativeTime(webhook.lastTriggeredAt)
													: "Never"}
											</span>
										</div>
									</Link>

									<div
										className="flex items-center justify-end"
										onClick={(e) => e.stopPropagation()}
									>
										<WebhookActionsDropdown
											webhook={webhook}
											onViewDetails={handleViewDetails}
											onDeleteKey={handleDeleteWebhook}
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
			/>
		</>
	);
};
