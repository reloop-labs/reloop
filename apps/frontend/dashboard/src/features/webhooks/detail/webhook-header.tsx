import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

const categoryBadgeColors: Record<string, { light: string; dark: string }> = {
	domain: { light: "bg-[#0A438A]", dark: "dark:bg-[#1E57A8]" },
	"api-key": { light: "bg-[#8A5A0A]", dark: "dark:bg-[#A87A1E]" },
	contact: { light: "bg-[#0A6B3A]", dark: "dark:bg-[#1E8A4E]" },
};

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
	const navigate = useNavigate();
	const invalidate = useInvalidateWebhooks();
	const [copiedSecret, setCopiedSecret] = useState(false);
	const [isSecretVisible, setIsSecretVisible] = useState(false);
	const [isRotatingSecret, setIsRotatingSecret] = useState(false);
	const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
	const [isTogglingStatus, setIsTogglingStatus] = useState(false);

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

	const handleRotateSecret = async () => {
		if (!webhook) return;

		try {
			setIsRotatingSecret(true);
			const array = new Uint8Array(16);
			window.crypto.getRandomValues(array);
			const newSecret = `whsec_${Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;

			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{
					secret: newSecret,
				},
				{ withCredentials: true },
			);

			await invalidate();
			toast.success("Webhook secret rotated successfully");
			setIsRotateModalOpen(false);
		} catch (_error) {
			toast.error("Failed to rotate webhook secret");
		} finally {
			setIsRotatingSecret(false);
		}
	};

	const handleToggleStatus = async () => {
		if (!webhook || isTogglingStatus) return;

		const nextStatus = webhook.status === "disabled" ? "active" : "disabled";

		try {
			setIsTogglingStatus(true);
			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{
					status: nextStatus,
				},
				{ withCredentials: true },
			);

			await invalidate();
			toast.success(
				`Webhook ${nextStatus === "active" ? "enabled" : "disabled"} successfully`,
			);
		} catch (_error) {
			toast.error(
				`Failed to ${nextStatus === "active" ? "enable" : "disable"} webhook`,
			);
		} finally {
			setIsTogglingStatus(false);
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
		} else if (itemId === "toggle") {
			handleToggleStatus();
		} else if (itemId === "delete") {
			onDeleteWebhook?.();
		}
	};

	if (!webhook && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => void navigate({ to: "/webhooks" })} />
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
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => void navigate({ to: "/webhooks" })} />
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
										sideOffset={0}
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
														"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-medium text-xs transition-colors",
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
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={() => setIsRotateModalOpen(true)}
												disabled={isRotatingSecret}
												title="Rotate secret"
											>
												<Icon
													name={isRotatingSecret ? "loader-2" : "rotate-cw"}
													className={cn(
														"h-4 w-4 text-text-sub-600",
														isRotatingSecret && "animate-spin",
													)}
												/>
											</Button.Root>
										</Input.InlineAffix>
									)}
								</Input.Wrapper>
							</Input.Root>
						)}
					</div>

					{/* Webhook Events */}
					<div className="col-span-3 flex min-w-0 flex-col gap-2">
						<div className="flex items-center gap-1.5">
							<Icon name="list" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Subscribed Events
							</span>
						</div>
						{isLoading ? (
							<div className="flex flex-wrap gap-2">
								<Skeleton className="h-6 w-24 rounded-md" />
								<Skeleton className="h-6 w-32 rounded-md" />
							</div>
						) : (
							<div className="flex flex-wrap gap-2">
								{webhook?.events?.length ? (
									webhook.events.map((eventId) => {
										const eventDefinition = WEBHOOK_EVENTS.find(
											(e) => e.id === eventId,
										);
										return (
											<span
												key={eventId}
												className={cn(
													"inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 font-medium text-[10px] text-white",
													eventDefinition?.category &&
														categoryBadgeColors[eventDefinition.category]
															?.light,
													eventDefinition?.category &&
														categoryBadgeColors[eventDefinition.category]?.dark,
												)}
											>
												{eventDefinition?.name || eventId}
											</span>
										);
									})
								) : (
									<span className="text-paragraph-sm text-text-sub-600 italic">
										No events subscribed
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{webhook && (
				<RotateWebhookSecretModal
					isOpen={isRotateModalOpen}
					onClose={() => setIsRotateModalOpen(false)}
					onConfirm={handleRotateSecret}
					isRotating={isRotatingSecret}
				/>
			)}
		</>
	);
};

interface RotateWebhookSecretModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isRotating: boolean;
}

export const RotateWebhookSecretModal = ({
	isOpen,
	onClose,
	onConfirm,
	isRotating,
}: RotateWebhookSecretModalProps) => {
	return (
		<Modal.Root open={isOpen} onOpenChange={onClose}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md">
				<Modal.Body className="p-6">
					<div className="flex items-start gap-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
							<Icon name="rotate-cw" className="h-5 w-5" />
						</div>
						<div className="space-y-1.5">
							<Modal.Title className="font-semibold text-gray-900 text-lg leading-6">
								Rotate Webhook Secret
							</Modal.Title>
							<p className="text-sm text-text-sub-600 leading-relaxed">
								Are you sure you want to rotate the webhook secret? Any current
								integrations using this secret will fail until updated with the
								new one.
							</p>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex items-center justify-end gap-3 border-stroke-soft-100 border-t bg-bg-weak-50/50 px-6 py-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						onClick={onClose}
						disabled={isRotating}
						className="gap-1.5"
					>
						Cancel
						<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
							Esc
						</span>
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						onClick={onConfirm}
						disabled={isRotating}
						className="gap-2"
					>
						{isRotating ? (
							<>
								<Icon name="loader-2" className="h-4 w-4 animate-spin" />
								Rotating...
							</>
						) : (
							<>
								Rotate Secret
								<Icon name="rotate-cw" className="h-4 w-4" />
							</>
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
