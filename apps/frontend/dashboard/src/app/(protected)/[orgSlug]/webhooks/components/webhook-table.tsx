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

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "text-success-base";
		case "paused":
			return "text-warning-base";
		case "disabled":
			return "text-warning-base";
		case "failed":
			return "text-error-base";
		default:
			return "text-faded-base";
	}
};

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

	if (isTotalEmpty) {
		return <EmptyState />;
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			<div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_96px] items-center border-stroke-soft-100 border-b px-6 py-3.5 font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:border-stroke-soft-100/50">
				<div>Endpoint</div>
				<div>Events</div>
				<div>Status</div>
				<div>Last Triggered</div>
				<div />
			</div>

			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
				{isLoading ? (
					<WebhookTableSkeleton rows={loadingRows} />
				) : webhooks.length === 0 ? (
					<div className="flex w-full items-center justify-center p-8 text-sm text-text-sub-600">
						No endpoints matching your search.
					</div>
				) : (
					webhooks.map((webhook, index) => (
						<div
							key={`webhook-${index}`}
							className={cn(
								"group/row grid w-full grid-cols-[2fr_1.5fr_1fr_1fr_96px] items-center px-6 py-4 text-left transition-colors",
								"hover:bg-bg-weak-50/50",
							)}
						>
							<Link
								href={`/${activeOrganizationSlug}/webhooks/${webhook.id}`}
								className="contents"
							>
								<div className="flex flex-col pr-4">
									<div className="truncate font-medium text-text-strong-950">
										{webhook.name || webhook.url}
									</div>
									<div className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
										{webhook.url}
									</div>
								</div>

								<div className="pr-4">
									<div className="truncate text-sm text-text-sub-600">
										{webhook.events && webhook.events.length > 0
											? webhook.events.join(", ")
											: "All events"}
									</div>
								</div>

								<div className="flex items-center">
									<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950">
										<div
											className={cn(
												"h-2 w-2 rounded-full",
												getStatusColor(webhook.status).replace("text-", "bg-"),
											)}
										/>
										<span className="capitalize">{webhook.status}</span>
									</div>
								</div>

								<div className="flex items-center">
									<span className="whitespace-nowrap text-sm text-text-sub-600">
										{webhook.lastTriggeredAt
											? formatRelativeTime(webhook.lastTriggeredAt)
											: "Never"}
									</span>
								</div>
							</Link>

							<div className="flex items-center justify-end gap-2">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() => handleViewDetails(webhook.id)}
									className="flex h-8 w-10 items-center justify-center rounded-lg border-stroke-soft-100 p-0 text-text-sub-600 hover:text-text-strong-950"
								>
									<Icon name="eye-outline" className="h-4 w-4" />
								</Button.Root>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									className="flex h-8 w-10 items-center justify-center rounded-lg border-stroke-soft-100 p-0 text-text-sub-600 hover:text-text-strong-950"
								>
									<Icon name="send" className="h-4 w-4" />
								</Button.Root>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
