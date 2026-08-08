import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { WebhookAvatar } from "#/features/webhooks/components/webhook-avatar";
import {
	useInvalidateWebhooks,
	type WebhookDetailData,
} from "#/features/webhooks/hooks/use-webhooks-query";
import {
	WebhookHeaderMenu,
	type WebhookHeaderMenuAction,
} from "./webhook-header-menu";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
	const router = useRouter();
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
			router.push(`/webhooks/${webhook.id}/edit`);
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

	const hotkeyOpts = {
		enableOnFormTags: false as const,
		preventDefault: true,
		enabled: !!webhook && !isLoading && !isFailed,
	};

	// Match keycaps shown on primary actions + overflow menu
	useHotkeys(
		"e",
		(e) => {
			e.preventDefault();
			void handleMenuAction("edit");
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"t",
		(e) => {
			e.preventDefault();
			onTriggerTest?.();
		},
		hotkeyOpts,
		[webhook, onTriggerTest],
	);
	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			void handleMenuAction("docs");
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"u",
		(e) => {
			e.preventDefault();
			void handleMenuAction("copy-url");
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"i",
		(e) => {
			e.preventDefault();
			void handleMenuAction("copy-id");
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"p",
		(e) => {
			e.preventDefault();
			if (!webhook) return;
			if (webhook.status === "paused") void handleMenuAction("resume");
			else if (webhook.status === "active" || webhook.status === "failed") {
				void handleMenuAction("pause");
			}
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"x",
		(e) => {
			e.preventDefault();
			void handleMenuAction("toggle");
		},
		hotkeyOpts,
		[webhook],
	);
	useHotkeys(
		"backspace",
		(e) => {
			e.preventDefault();
			void handleMenuAction("delete");
		},
		hotkeyOpts,
		[webhook, onDeleteWebhook],
	);

	if (!webhook && !isLoading) {
		return (
			<div>
				<div className="flex items-center justify-between">
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

	const displayUrl = webhook?.url || "Unnamed webhook";

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-12 w-12 shrink-0 rounded-[14px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<Skeleton className="h-4 w-14 rounded-full" />
								<Skeleton className="h-6 w-48 rounded-lg" />
							</div>
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-3">
							<WebhookAvatar
								seed={webhook?.id || displayUrl}
								size="lg"
								status={webhook?.status}
								alt={`${displayUrl} avatar`}
							/>
							<div className="min-w-0">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Webhook
								</p>
								<h1 className="mb-0.5 truncate font-mono font-semibold text-title-h6 leading-5">
									{displayUrl}
								</h1>
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
								className="gap-1.5 font-semibold"
								onClick={() => router.push(`/webhooks/${webhook.id}/edit`)}
								aria-keyshortcuts="e"
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
								Edit
								<ActionKbd className="w-auto min-w-4 px-1">E</ActionKbd>
							</Button.Root>
							<FancyButton.Root
								variant="blue"
								size="xsmall"
								onClick={() => onTriggerTest?.()}
								className="gap-1.5"
								aria-keyshortcuts="t"
							>
								<FancyButton.Icon
									as={Icon}
									name="send-test"
									className="ml-0.5 h-3.5 w-3.5"
								/>
								Send test event
								<ActionKbd className={actionKbdOnBlueClassName}>T</ActionKbd>
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
