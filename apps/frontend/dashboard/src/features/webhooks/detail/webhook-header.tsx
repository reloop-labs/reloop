import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { WebhookAvatar } from "#/features/webhooks/components/webhook-avatar";
import {
	useInvalidateWebhooks,
	type WebhookDetailData,
} from "#/features/webhooks/hooks/use-webhooks-query";
import { useNavigate } from "#/lib/navigation";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import {
	WebhookHeaderMenu,
	type WebhookHeaderMenuAction,
} from "./webhook-header-menu";

function statusBadgeLabel(status: string) {
	switch (status) {
		case "active":
			return "Enabled";
		case "paused":
			return "Paused";
		case "disabled":
			return "Disabled";
		case "failed":
			return "Failed";
		default:
			return status;
	}
}

function statusBadgeClass(status: string) {
	switch (status) {
		case "active":
			return "bg-success-lighter text-success-base";
		case "paused":
			return "bg-warning-lighter text-warning-base";
		case "failed":
			return "bg-error-lighter text-error-base";
		default:
			return "bg-bg-weak-50 text-text-sub-600";
	}
}

interface WebhookHeaderProps {
	webhook: WebhookDetailData | null | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onDeleteWebhook?: () => void;
	onTriggerTest?: () => void;
	onRetry?: () => void;
}

export function WebhookHeader({
	webhook,
	isLoading,
	isFailed,
	onDeleteWebhook,
	onTriggerTest,
	onRetry,
}: WebhookHeaderProps) {
	const navigate = useNavigate();
	const invalidate = useInvalidateWebhooks();
	const [isTogglingStatus, setIsTogglingStatus] = useState(false);

	const handleSetStatus = async (
		nextStatus: "active" | "paused" | "disabled",
	) => {
		if (!webhook || isTogglingStatus) return;
		try {
			setIsTogglingStatus(true);
			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{ status: nextStatus },
				{ withCredentials: true },
			);
			await invalidate();
			const labels: Record<string, string> = {
				active: "resumed",
				paused: "paused",
				disabled: "disabled",
			};
			toast.success(
				`Webhook ${nextStatus === "active" && webhook.status === "disabled" ? "enabled" : labels[nextStatus]} successfully`,
			);
		} catch {
			toast.error("Failed to update webhook status");
		} finally {
			setIsTogglingStatus(false);
		}
	};

	const handleMenuAction = async (id: WebhookHeaderMenuAction) => {
		if (!webhook) return;
		if (id === "edit") {
			void navigate({
				to: "/webhooks/$webhookId/edit",
				params: { webhookId: webhook.id },
			});
			return;
		}
		if (id === "docs") {
			window.open("https://reloop.sh/docs/webhooks", "_blank");
			return;
		}
		if (id === "copy-url") {
			try {
				await navigator.clipboard.writeText(webhook.url);
				toast.success("Endpoint URL copied");
			} catch {
				toast.error("Failed to copy URL");
			}
			return;
		}
		if (id === "copy-id") {
			try {
				await navigator.clipboard.writeText(webhook.id);
				toast.success("Webhook ID copied");
			} catch {
				toast.error("Failed to copy ID");
			}
			return;
		}
		if (id === "pause") void handleSetStatus("paused");
		if (id === "resume") void handleSetStatus("active");
		if (id === "toggle") {
			void handleSetStatus(
				webhook.status === "disabled" ? "active" : "disabled",
			);
		}
		if (id === "delete") onDeleteWebhook?.();
	};

	if (!webhook && !isLoading) {
		return (
			<div className="pt-10 pb-2">
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/webhooks" })}
				/>
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5 text-error-base">
							<Icon name="alert-circle" className="h-3.5 w-3.5" />
							<p className="font-medium text-paragraph-xs">Not found</p>
						</div>
						<h1 className="mt-1 font-medium text-title-h6 leading-8">
							Webhook not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName = webhook?.name || webhook?.url || "Unnamed webhook";

	return (
		<div className="pt-10 pb-2">
			<AnimatedBackButton onClick={() => void navigate({ to: "/webhooks" })} />

			<div className="flex items-start justify-between gap-4 pt-6">
				<div className="min-w-0">
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 shrink-0 rounded-[12px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<Skeleton className="h-6 w-40 rounded-lg" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-72 rounded-lg" />
							</div>
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-3">
							<WebhookAvatar
								seed={webhook?.id || displayName}
								size="md"
								alt={`${displayName} avatar`}
							/>
							<div className="min-w-0">
								<div className="flex min-w-0 flex-wrap items-center gap-2">
									<h1 className="truncate font-semibold text-text-strong-950 text-title-h6 leading-8 tracking-tight">
										{displayName}
									</h1>
									{webhook?.status ? (
										<span
											className={cn(
												"inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium text-[11px]",
												statusBadgeClass(webhook.status),
											)}
										>
											{statusBadgeLabel(webhook.status)}
										</span>
									) : null}
								</div>
								<p className="truncate font-medium font-mono text-[13px] text-text-sub-600 leading-snug">
									{webhook?.url}
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-8 w-24 rounded-lg" />
							<Skeleton className="h-8 w-28 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</>
					) : isFailed ? (
						<Button.Root
							variant="error"
							size="small"
							mode="lighter"
							onClick={onRetry}
						>
							Try again
						</Button.Root>
					) : webhook ? (
						<>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								className="font-semibold"
								onClick={() =>
									void navigate({
										to: "/webhooks/$webhookId/edit",
										params: { webhookId: webhook.id },
									})
								}
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
								Edit
							</Button.Root>
							<FancyButton.Root
								variant="blue"
								size="xsmall"
								onClick={() => onTriggerTest?.()}
							>
								<FancyButton.Icon
									as={Icon}
									name="send-test"
									className="ml-0.5 h-3.5 w-3.5"
								/>
								Send test event
							</FancyButton.Root>
							<WebhookHeaderMenu
								status={webhook.status}
								onAction={(id) => void handleMenuAction(id)}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
