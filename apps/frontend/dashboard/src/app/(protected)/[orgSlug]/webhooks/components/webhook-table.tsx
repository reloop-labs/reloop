"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getAnimationProps } from "@fe/dashboard/utils/audience";
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
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { DeleteWebhookModal } from "./delete-webhook-modal";

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
			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
					<div className="grid grid-cols-[1fr_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(120px,auto)_minmax(100px,auto)_minmax(40px,auto)]">
						<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
							<div className="py-2.5">Webhook Name</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Status</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Success</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Failed</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Success Rate</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5">Created At</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5" />
						</div>
						{isLoading
							? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="my-1 pl-5">
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="px-3">
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="px-3">
											<Skeleton className="h-4 w-12" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="px-3">
											<Skeleton className="h-4 w-12" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="px-3">
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-4" />
									</div>
								</div>
							))
							: webhooks.map((webhook, index) => {
								const successRate =
									webhook.successCount + webhook.failureCount > 0
										? Math.round(
											(webhook.successCount /
												(webhook.successCount + webhook.failureCount)) *
											100,
										)
										: 0;

								return (
									<div
										key={`webhook-${index}`}
										className="group/row contents"
									>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 0)}
												className="flex items-center gap-2 pl-5"
											>
												<Link
													href={`/${activeOrganizationSlug}/webhooks/${webhook.id}`}
													className="flex items-center gap-2"
												>
													<Icon
														name="webhook"
														className="h-4 w-4 text-text-sub-600"
													/>

													<div
														className={cn(
															"truncate text-label-xs text-text-sub-400 text-xs",
														)}
													>
														{webhook.url}
													</div>
												</Link>
											</motion.div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 1)}
												className="flex items-center gap-2 px-3"
											>
												<div
													className={cn(
														"py flex items-center rounded-full border px-1 font-medium text-xs",
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
											</motion.div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 pl-1 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 2)}
												className="flex items-center gap-2 px-3 font-medium"
											>
												<span className="text-label-sm text-text-strong-950">
													{webhook.successCount}
												</span>
											</motion.div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 3)}
												className="flex items-center gap-2 px-3 font-medium"
											>
												<span className="text-label-sm text-text-strong-950">
													{webhook.failureCount}
												</span>
											</motion.div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 pr-1 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 4)}
												className="flex items-center gap-2 px-3 font-medium"
											>
												<span className="text-label-sm text-text-strong-950">
													{successRate}%
												</span>
											</motion.div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 pr-1 group-hover/row:bg-bg-weak-50">
											<motion.span
												{...getAnimationProps(index + 1, 5)}
												className="text-label-sm text-text-strong-950"
											>
												{formatRelativeTime(webhook.createdAt)}
											</motion.span>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
											<motion.div
												{...getAnimationProps(index + 1, 6)}
												className="flex items-center justify-center"
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
																<Icon
																	name="eye-outline"
																	className="h-4 w-4"
																/>
																View Details
															</Button.Root>
															<Button.Root
																variant="error"
																mode="ghost"
																size="small"
																onClick={() =>
																	handleDeleteWebhook(webhook.id)
																}
																className="w-full justify-start"
															>
																<Icon name="trash" className="h-4 w-4" />
																Delete Webhook
															</Button.Root>
														</div>
													</PopoverContent>
												</PopoverRoot>
											</motion.div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</AnimatePresence>
			<DeleteWebhookModal webhooks={webhooks} />
		</>
	);
};
