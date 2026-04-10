"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EditWebhookModal } from "../../components/edit-webhook-modal";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	secret: string | null;
	status: "active" | "paused" | "disabled" | "failed";
	customHeaders: Record<string, string> | null;
	rateLimitEnabled: boolean;
	maxRequestsPerMinute: number;
	maxRetries: number;
	retryBackoffMultiplier: number;
	filteringOptions: Record<string, unknown> | null;
	lastTriggeredAt: string | null;
	successCount: number;
	failureCount: number;
	consecutiveFailures: number;
	createdAt: string;
	updatedAt: string;
	events?: string[];
}

interface WebhookHeaderProps {
	webhook: WebhookData | null;
	isLoading: boolean;
	isFailed?: boolean;
	onDeleteWebhook?: () => void;
	onTriggerTest?: () => void;
}

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "font-medium border border-success-base bg-success-light/20 text-success-base";
		case "paused":
			return "font-medium border border-warning-base bg-warning-light/20 text-warning-base";
		case "disabled":
			return "font-medium border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600";
		case "failed":
			return "font-medium border border-error-base bg-error-light/20 text-error-base";
		default:
			return "font-medium border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600";
	}
};

const getStatusIconColor = (status: string) => {
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
			return "check-circle";
		case "paused":
			return "pause-circle";
		case "disabled":
			return "x-circle";
		case "failed":
			return "alert-circle";
		default:
			return "circle";
	}
};

export const WebhookHeader = ({
	webhook,
	isLoading,
	isFailed,
	onDeleteWebhook,
	onTriggerTest,
}: WebhookHeaderProps) => {
	const { push } = useUserOrganization();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [copiedSecret, setCopiedSecret] = useState(false);
	const [isSecretVisible, setIsSecretVisible] = useState(false);

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handleCopySecret = async () => {
		if (webhook?.secret) {
			try {
				await navigator.clipboard.writeText(webhook.secret);
				toast.success("Webhook secret copied to clipboard");
				setCopiedSecret(true);
				setTimeout(() => setCopiedSecret(false), 2000);
			} catch {
				toast.error("Failed to copy secret");
			}
		}
	};

	const getMenuItems = (status: string) => [
		{
			id: "docs",
			label: "Go to docs",
			icon: "file-text" as const,
			isDanger: false,
		},
		{
			id: "rotate",
			label: "Rotate secret",
			icon: "rotate-cw" as const,
			isDanger: false,
		},
		{
			id: "edit",
			label: "Edit Webhook",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "toggle",
			label: status === "disabled" ? "Enable webhook" : "Disable webhook",
			icon: (status === "disabled" ? "play" : "pause") as any,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete webhook",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentMenuItems = getMenuItems(webhook?.status || "active");
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = currentMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "docs") {
			window.open("https://reloop.sh/docs/webhooks", "_blank");
		} else if (itemId === "edit") {
			setIsEditModalOpen(true);
		} else if (itemId === "delete") {
			onDeleteWebhook?.();
		}
		// Implement rotate and toggle as needed
	};

	if (!webhook && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/webhooks")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Webhook{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							Webhook not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName = webhook?.name || webhook?.url || "Unnamed Webhook";
	const successRate =
		webhook && webhook.successCount + webhook.failureCount > 0
			? Math.round(
					(webhook.successCount /
						(webhook.successCount + webhook.failureCount)) *
						100,
				)
			: 0;

	return (
		<>
			<div className="border-stroke-soft-200 border-b border-dashed pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/webhooks")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						{isLoading ? (
							<div className="flex items-center gap-1.5">
								<Skeleton className="h-4 w-12 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-20 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<div className="flex items-center gap-1">
									<Skeleton className="h-3.5 w-3.5 rounded-full" />
									<Skeleton className="h-4 w-16 rounded-full" />
								</div>
							</div>
						) : (
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Webhook{" "}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									{isFailed
										? "---"
										: webhook?.createdAt
											? formatRelativeTime(webhook.createdAt)
											: "---"}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<div
									className={cn(
										"flex items-center gap-1",
										getStatusIconColor(webhook?.status || ""),
									)}
								>
									<Icon
										name={getStatusIcon(webhook?.status || "")}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-xs capitalize">
										{webhook?.status || "Unknown"}
									</p>
								</div>
							</div>
						)}
						{isLoading ? (
							<div className="mt-2 flex flex-col gap-1.5">
								<Skeleton className="h-7 w-48 rounded-lg" />
								<Skeleton className="h-4 w-64 rounded-lg" />
							</div>
						) : (
							<div className="mt-1 flex flex-col">
								<h1 className="font-medium text-title-h6 leading-8">
									{displayName}
								</h1>
								<div className="flex items-center gap-1.5 truncate font-medium font-mono text-[11px] text-text-sub-600 leading-tight">
									{webhook?.url}
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isLoading ? (
							<>
								<Skeleton className="h-9 w-32 rounded-lg" />
								<Skeleton className="h-9 w-32 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</>
						) : isFailed ? (
							<Button.Root variant="error" size="small" mode="lighter">
								Try Again
							</Button.Root>
						) : webhook ? (
							<>
								<Button.Root
									variant="neutral"
									size="xsmall"
									className="font-semibold"
									onClick={() => onTriggerTest?.()}
								>
									<Icon name="webhook" className="h-4 w-4" />
									Trigger Test Event
								</Button.Root>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={() => setIsEditModalOpen(true)}
								>
									<Icon name="edit" className="h-4 w-4" />
									Edit Webhook
								</Button.Root>
								<PopoverRoot>
									<PopoverTrigger asChild>
										<Button.Root variant="neutral" mode="stroke" size="xsmall">
											<Icon
												name="more-vertical"
												className="h-3.5 w-3.5 text-text-sub-600"
											/>
										</Button.Root>
									</PopoverTrigger>
									<PopoverContent
										align="end"
										sideOffset={8}
										className="w-44 rounded-xl p-1.5"
										showArrow
									>
										<div className="relative">
											{currentMenuItems.map((item, idx) => (
												<button
													key={item.id}
													ref={(el) => {
														if (el) buttonRefs.current[idx] = el;
													}}
													type="button"
													onPointerEnter={() => setHoverIdx(idx)}
													onPointerLeave={() => setHoverIdx(undefined)}
													onClick={() => handleMenuItemClick(item.id)}
													className={cn(
														"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-normal text-xs transition-colors",
														item.isDanger
															? "text-error-base"
															: "text-text-strong-950",
														!currentRect &&
															hoverIdx === idx &&
															(item.isDanger
																? "bg-red-alpha-10"
																: "bg-neutral-alpha-10"),
													)}
												>
													<Icon
														name={item.icon}
														className={cn(
															"h-4 w-4",
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
							</>
						) : null}
					</div>
				</div>

				<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
					{/* Status */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="check-circle"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Status
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-20 rounded-lg" />
						) : (
							<span
								className={cn(
									"inline-flex w-fit rounded-md px-[6px] py-0.5 text-[10px] capitalize",
									getStatusColor(webhook?.status || ""),
								)}
							>
								{webhook?.status || "Unknown"}
							</span>
						)}
					</div>

					{/* Total Deliveries */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="activity-2"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Deliveries
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{(
									(webhook?.successCount || 0) + (webhook?.failureCount || 0)
								).toLocaleString()}{" "}
								times
							</span>
						)}
					</div>

					{/* Success Rate */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="activity-2"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Success Rate
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{successRate}%
							</span>
						)}
					</div>

					{/* Last Triggered */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="clock" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Last Triggered
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{webhook?.lastTriggeredAt
									? formatRelativeTime(webhook.lastTriggeredAt)
									: "No activity"}
							</span>
						)}
					</div>

					{/* Webhook Secret */}
					<div className="col-span-2 flex min-w-0 flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="key-new" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Webhook Secret
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										readOnly
										className="font-medium font-mono text-text-strong-950 text-xs"
										value={
											!webhook?.secret
												? "No secret"
												: isSecretVisible
													? webhook.secret
													: webhook.secret.startsWith("whsec_")
														? `whsec_${"•".repeat(32)}`
														: "•".repeat(32)
										}
									/>
									{webhook?.secret && (
										<Input.InlineAffix className="mr-1 flex items-center gap-1.5">
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={() => setIsSecretVisible(!isSecretVisible)}
												title={isSecretVisible ? "Hide secret" : "Show secret"}
											>
												<Icon
													name={
														isSecretVisible
															? "eye-outline"
															: "eye-slash-outline"
													}
													className="h-4 w-4 text-text-sub-600"
												/>
											</Button.Root>
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={handleCopySecret}
												title="Copy secret"
											>
												<Icon
													name={copiedSecret ? "check" : "copy"}
													className={cn(
														"h-4 w-4 transition-colors",
														copiedSecret
															? "text-success-base"
															: "text-text-sub-600",
													)}
												/>
											</Button.Root>
										</Input.InlineAffix>
									)}
								</Input.Wrapper>
							</Input.Root>
						)}
					</div>
				</div>
			</div>

			{/* Modals */}
			{webhook && (
				<EditWebhookModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					webhook={webhook}
				/>
			)}
		</>
	);
};
