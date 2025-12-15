"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
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
}

interface WebhookHeaderProps {
	webhook: WebhookData | null;
	isLoading: boolean;
	isFailed?: boolean;
	onOpenSettings?: () => void;
	onDeleteWebhook?: () => void;
}

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "text-green-600";
		case "paused":
			return "text-yellow-600";
		case "disabled":
			return "text-gray-600";
		case "failed":
			return "text-red-600";
		default:
			return "text-gray-600";
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
	onOpenSettings,
	onDeleteWebhook,
}: WebhookHeaderProps) => {
	const { back } = useRouter();

	const handleCopySecret = async () => {
		if (webhook?.secret) {
			try {
				await navigator.clipboard.writeText(webhook.secret);
				toast.success("Webhook secret copied to clipboard");
			} catch {
				toast.error("Failed to copy secret");
			}
		}
	};

	const handleCopyUrl = async () => {
		if (webhook?.url) {
			try {
				await navigator.clipboard.writeText(webhook.url);
				toast.success("Webhook URL copied to clipboard");
			} catch {
				toast.error("Failed to copy URL");
			}
		}
	};

	if (!webhook && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								Webhook{" "}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-red-600">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-sm">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h4 leading-8">
							Webhook not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const successRate =
		webhook && webhook.successCount + webhook.failureCount > 0
			? Math.round(
				(webhook.successCount /
					(webhook.successCount + webhook.failureCount)) *
				100,
			)
			: 0;

	return (
		<div className="pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex justify-between pt-6">
				<div>
					{isLoading ? (
						<>
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
							<Skeleton className="mt-2 mb-4 h-8 w-48 rounded-lg" />
						</>
					) : (
						<>
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-sm text-text-sub-600">
									Webhook{" "}
								</p>
								<p className="font-semibold text-paragraph-sm text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-sm text-text-sub-600">
									{isFailed
										? "---"
										: webhook?.createdAt
											? formatRelativeTime(webhook.createdAt)
											: "---"}
								</p>
								<p className="font-semibold text-paragraph-sm text-text-sub-600">
									•
								</p>
								<div
									className={`flex items-center gap-1 ${getStatusColor(webhook?.status || "")}`}
								>
									<Icon
										name={getStatusIcon(webhook?.status || "")}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-sm">
										{webhook?.status || "Unknown"}
									</p>
								</div>
							</div>
							<div className="flex items-center">
								<h1 className="font-semibold text-title-h4">
									{webhook?.url || "Loading..."}
								</h1>
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleCopyUrl}
									className="mt-1"
								>
									<Icon name="clipboard-copy" className="h-5 w-5" />
								</Button.Root>
							</div>
						</>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
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
								onClick={() => onOpenSettings?.()}
							>
								<Icon name="pause" className="h-4 w-4" />
								Disable webhook
							</Button.Root>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon name="more-vertical" className="h-4 w-4 rotate-90" />
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent align="end" side="bottom" className="p-2">
									<div className="flex flex-col gap-1">
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											onClick={() =>
												window.open("https://reloop.sh/docs/webhooks", "_blank")
											}
											className="w-full justify-start"
										>
											<Icon name="file-text" className="h-4 w-4" />
											Go to docs
										</Button.Root>
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											className="w-full justify-start"
										>
											<Icon name="rotate-cw" className="h-4 w-4" />
											Rotate secret
										</Button.Root>
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											className="w-full justify-start"
										>
											<Icon name="pause" className="h-4 w-4" />
											Disable webhook
										</Button.Root>
										<Button.Root
											variant="error"
											mode="ghost"
											size="small"
											onClick={() => onDeleteWebhook?.()}
											className="w-full justify-start"
										>
											<Icon name="trash" className="h-4 w-4" />
											Delete webhook
										</Button.Root>
									</div>
								</PopoverContent>
							</PopoverRoot>
						</>
					) : null}
				</div>
			</div>

			{isLoading ? (
				<div className="mt-8 mb-3 flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pb-8">
					<div className="flex gap-8">
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="webhook" className="h-4 w-4 text-blue-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Total Deliveries
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon
									name="check-circle"
									className="h-4 w-4 text-success-base"
								/>
								<span className="font-medium text-sm text-text-sub-600">
									Successful
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="cross-circle" className="h-4 w-4 text-red-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Failed
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="activity-2" className="h-5 w-5 text-green-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Success Rate
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-1.5">
							<Icon name="key-new" className="h-4 w-4 text-text-sub-600" />
							<span className="font-medium text-sm text-text-sub-600">
								Webhook Secret
							</span>
						</div>
						<div className="flex items-center gap-2 overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-0.5 pr-0.5 pl-2">
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				</div>
			) : (
				<div className="mt-8 mb-3 flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pb-8">
					<div className="flex gap-8">
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="webhook" className="h-4 w-4 text-blue-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Total Deliveries
								</span>
							</div>
							<span className="font-bold text-2xl text-text-strong-950">
								{(webhook?.successCount || 0) + (webhook?.failureCount || 0)}
							</span>
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon
									name="check-circle"
									className="h-4 w-4 text-success-base"
								/>
								<span className="font-medium text-sm text-text-sub-600">
									Successful
								</span>
							</div>
							<span className="text-left font-bold text-2xl text-text-strong-950">
								{webhook?.successCount || 0}
							</span>
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="cross-circle" className="h-4 w-4 text-red-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Failed
								</span>
							</div>
							<span className="font-bold text-2xl text-text-strong-950">
								{webhook?.failureCount || 0}
							</span>
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="activity-2" className="h-5 w-5 text-green-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Success Rate
								</span>
							</div>
							<span className="font-bold text-2xl text-text-strong-950">
								{successRate}%
							</span>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-1.5">
							<Icon name="key-new" className="h-4 w-4 text-text-sub-600" />
							<span className="font-medium text-sm text-text-sub-600">
								Webhook Secret
							</span>
						</div>
						<div className="flex items-center gap-2 overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-0.5 pr-0.5 pl-2">
							<span className="w-42 truncate font-medium text-xs">
								{webhook?.secret || "No secret set"}
							</span>
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="xxsmall"
								onClick={handleCopySecret}
								className="h-6 w-6 p-0"
								disabled={!webhook?.secret}
							>
								<Icon name="clipboard-copy" className="h-3 w-3" />
							</Button.Root>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
