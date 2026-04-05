"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";

import Link from "next/link";
import { useQueryState } from "nuqs";
import { DeleteWebhookModal } from "./delete-webhook-modal";
import { EmptyState } from "./empty-state";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
}

interface WebhookTableProps {
	webhooks: WebhookData[];
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
	onAddWebhook?: () => void;
}

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "text-success-base border-success-base bg-success-light/20";
		case "paused":
			return "text-warning-base border-warning-base bg-warning-light/20";
		case "disabled":
			return "text-faded-base border-faded-base bg-faded-light/20";
		case "failed":
			return "text-error-base border-error-base bg-error-light/20";
		default:
			return "text-faded-base border-faded-base bg-faded-light/20";
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

export const WebhookTable = ({
	webhooks,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 3,
	onAddWebhook,
}: WebhookTableProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");

	const handleDeleteWebhook = (webhookId: string) => {
		setDeleteId(webhookId);
	};

	const handleViewDetails = (webhookId: string) => {
		push(`/webhooks/${webhookId}`);
	};

	return (
		<>
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Table Header */}
				<div className="grid grid-cols-[2fr_1fr_1fr_48px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50">
					<div className="flex items-center gap-2">
						<Icon name="webhook" className="h-4 w-4" />
						<span className="text-xs">URL</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-4 w-4" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created</span>
					</div>
					<div />
				</div>

				{/* Table Body */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{isLoading ? (
						Array.from({ length: loadingRows }).map((_, index) => (
							<div
								key={`skeleton-${index}-${activeOrganizationSlug}`}
								className="grid grid-cols-[2fr_1fr_1fr_48px] items-center px-4 py-2"
							>
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-32" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center justify-end">
									<Skeleton className="h-4 w-4 rounded" />
								</div>
							</div>
						))
					) : webhooks.length === 0 ? (
						<div className="w-full">
							<EmptyState onCreateWebhook={onAddWebhook || (() => {})} />
						</div>
					) : (
						webhooks.map((webhook, index) => (
							<div
								key={`webhook-${index}`}
								className={cn(
									"group/row grid w-full cursor-pointer grid-cols-[2fr_1fr_1fr_48px] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
								)}
							>
								<Link
									href={`/${activeOrganizationSlug}/webhooks/${webhook.id}`}
									className="contents"
								>
									{/* URL Column */}
									<div className="flex items-center gap-2 pr-4">
										<Icon
											name="webhook"
											className="h-4 w-4 shrink-0 text-text-sub-600"
										/>
										<div className="truncate font-medium text-label-sm text-text-strong-950">
											{webhook.url}
										</div>
									</div>

									{/* Status Column */}
									<div className="flex items-center">
										<div
											className={cn(
												"py flex items-center rounded-full border px-2 font-medium text-[10px]",
												getStatusColor(webhook.status),
											)}
										>
											<Icon
												name={getStatusIcon(webhook.status)}
												className="mr-1 h-3 w-3"
											/>
											{webhook.status.charAt(0).toUpperCase() +
												webhook.status.slice(1)}
										</div>
									</div>

									{/* Created At Column */}
									<div className="flex items-center">
										<span className="whitespace-nowrap text-label-sm text-text-sub-600">
											{formatRelativeTime(webhook.createdAt)}
										</span>
									</div>
								</Link>

								{/* Actions Column */}
								<div
									className="flex items-center justify-end"
									onClick={(e) => e.stopPropagation()}
								>
									<PopoverRoot>
										<PopoverTrigger asChild>
											<Button.Root
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												className="rounded p-1"
											>
												<Icon
													name="more-vertical"
													className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
												/>
											</Button.Root>
										</PopoverTrigger>
										<PopoverContent align="end" className="w-48 p-2">
											<div className="flex flex-col gap-1">
												<Button.Root
													variant="neutral"
													mode="ghost"
													size="small"
													onClick={() => handleViewDetails(webhook.id)}
													className="w-full justify-start"
												>
													<Icon name="eye-outline" className="h-4 w-4" />
													View Details
												</Button.Root>
												<Button.Root
													variant="error"
													mode="ghost"
													size="small"
													onClick={() => handleDeleteWebhook(webhook.id)}
													className="w-full justify-start"
												>
													<Icon name="trash" className="h-4 w-4" />
													Delete Webhook
												</Button.Root>
											</div>
										</PopoverContent>
									</PopoverRoot>
								</div>
							</div>
						))
					)}
				</div>
			</div>
			<DeleteWebhookModal webhooks={webhooks} />
		</>
	);
};
