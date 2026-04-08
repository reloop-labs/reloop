"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

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
	activeOrganizationSlug: string;
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

const GRID = "grid-cols-[2fr_1.5fr_1fr_1fr_96px]";
const BORDER = "border-stroke-soft-100 dark:border-stroke-soft-100/50";

export const WebhookTable = ({
	webhooks,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 3,
	isTotalEmpty,
}: WebhookTableProps) => {
	const { push } = useUserOrganization();

	const handleViewDetails = (webhookId: string) => {
		push(`/webhooks/${webhookId}`);
	};

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			<div
				className={`grid ${GRID} items-center border-b bg-bg-weak-50/50 px-4 py-2.5 text-text-sub-600 dark:bg-bg-weak-50/40 ${BORDER}`}
			>
				<div className="font-medium text-xs">Endpoint</div>
				<div className="font-medium text-xs">Events</div>
				<div className="font-medium text-xs">Status</div>
				<div className="whitespace-nowrap font-medium text-xs">
					Last Triggered
				</div>
				<div />
			</div>

			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
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
					webhooks.map((webhook, index) => (
						<div
							key={`webhook-${index}`}
							className={cn(
								`group/row grid w-full cursor-pointer ${GRID} items-center px-4 py-2 text-left transition-colors`,
								"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
							)}
						>
							<Link
								href={`/${activeOrganizationSlug}/webhooks/${webhook.id}`}
								className="contents"
							>
								<div className="flex items-center gap-2">
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

								<div className="flex items-center pr-4">
									<div className="truncate text-label-sm text-text-sub-600">
										{webhook.events && webhook.events.length > 0
											? webhook.events.join(", ")
											: "All events"}
									</div>
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
								className="flex items-center justify-end gap-1.5"
								onClick={(e) => e.stopPropagation()}
							>
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={() => handleViewDetails(webhook.id)}
								>
									<Icon name="eye-outline" className="h-3 w-3" />
								</Button.Root>
								<Button.Root variant="neutral" mode="ghost" size="xxsmall">
									<Icon name="send" className="h-3 w-3" />
								</Button.Root>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
