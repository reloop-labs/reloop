"use client";

import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Campaign } from "../campaign-types";
import { useCampaigns } from "../campaigns-provider";
import { CampaignEmptyState } from "./campaign-empty-state";

interface CampaignTableProps {
	campaigns: Campaign[];
	isLoading?: boolean;
	isTotalEmpty?: boolean;
	onCreate: () => void;
}

const getStatusBadgeColor = (status: Campaign["status"]) => {
	switch (status) {
		case "sent":
			return "font-medium border border-success-base/40 bg-success-light/20 text-success-base";
		case "sending":
			return "font-medium border border-blue-500/40 bg-blue-500/10 text-blue-500";
		case "scheduled":
			return "font-medium border border-warning-base/40 bg-warning-light/20 text-warning-base";
		case "cancelled":
			return "font-medium border border-error-base/40 bg-error-light/20 text-error-base";
		default:
			return "font-medium border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600";
	}
};

const getStatusIconColor = (status: Campaign["status"]) => {
	switch (status) {
		case "sent":
			return "bg-success-base";
		case "sending":
			return "bg-blue-500 animate-pulse";
		case "scheduled":
			return "bg-warning-base";
		case "cancelled":
			return "bg-error-base";
		default:
			return "bg-text-sub-600";
	}
};

export const CampaignTable = ({
	campaigns,
	isLoading,
	isTotalEmpty,
	onCreate,
}: CampaignTableProps) => {
	const router = useRouter();
	const { sendCampaign, duplicateCampaign, deleteCampaign } = useCampaigns();
	const [actionPendingId, setActionPendingId] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-16 animate-pulse rounded-lg border border-stroke-soft-100 bg-bg-weak-50"
					/>
				))}
			</div>
		);
	}

	if (isTotalEmpty) {
		return <CampaignEmptyState onCreate={onCreate} />;
	}

	const handleSendNow = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		setActionPendingId(id);
		try {
			await sendCampaign(id);
		} finally {
			setActionPendingId(null);
		}
	};

	const handleDuplicate = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		setActionPendingId(id);
		try {
			await duplicateCampaign(id);
		} finally {
			setActionPendingId(null);
		}
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		setActionPendingId(id);
		try {
			await deleteCampaign(id);
		} finally {
			setActionPendingId(null);
		}
	};

	return (
		<div className="flex flex-col divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
			{campaigns.map((campaign) => {
				const openRate =
					campaign.deliveredCount > 0
						? Math.round((campaign.openedCount / campaign.deliveredCount) * 100)
						: 0;
				const clickRate =
					campaign.deliveredCount > 0
						? Math.round(
								(campaign.clickedCount / campaign.deliveredCount) * 100,
							)
						: 0;

				return (
					<div
						key={campaign.id}
						onClick={() => router.push(`/campaigns/${campaign.id}`)}
						className="group relative flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-bg-weak-50/70"
					>
						{/* Icon and name/subject */}
						<div className="flex min-w-0 flex-1 items-center gap-3.5">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50 text-text-strong-950 transition-colors group-hover:bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/50">
								<Icon name="mega-phone" className="h-4 w-4 text-text-sub-600" />
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{campaign.name}
									</p>
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] capitalize",
											getStatusBadgeColor(campaign.status),
										)}
									>
										<span
											className={cn(
												"h-1.5 w-1.5 rounded-full",
												getStatusIconColor(campaign.status),
											)}
										/>
										{campaign.status}
									</span>
								</div>
								<p className="mt-0.5 truncate text-text-sub-600 text-xs">
									<span className="font-medium text-text-sub-600">
										Subject:
									</span>{" "}
									{campaign.subject}
								</p>
							</div>
						</div>

						{/* Audience target */}
						<div className="hidden shrink-0 items-center gap-1.5 md:flex">
							<div className="flex items-center gap-1 rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-1 text-text-sub-600 text-xs dark:border-stroke-soft-100/30">
								<Icon name="contacts" className="h-3 w-3" />
								<span>{campaign.audienceTargetName || "All Contacts"}</span>
								{campaign.recipientCount > 0 && (
									<span className="font-medium text-text-strong-950">
										({campaign.recipientCount.toLocaleString()})
									</span>
								)}
							</div>
						</div>

						{/* Performance stats (when sent) */}
						{campaign.status === "sent" ? (
							<div className="hidden shrink-0 items-center gap-4 text-right lg:flex">
								<div>
									<p className="font-medium text-text-strong-950 text-xs tabular-nums">
										{campaign.deliveredCount.toLocaleString()}
									</p>
									<p className="text-[10px] text-text-sub-600">Delivered</p>
								</div>
								<div>
									<p className="font-medium text-text-strong-950 text-xs tabular-nums">
										{openRate}%
									</p>
									<p className="text-[10px] text-text-sub-600">Opens</p>
								</div>
								<div>
									<p className="font-medium text-text-strong-950 text-xs tabular-nums">
										{clickRate}%
									</p>
									<p className="text-[10px] text-text-sub-600">Clicks</p>
								</div>
							</div>
						) : (
							<div className="hidden shrink-0 text-text-sub-600 text-xs lg:block">
								{campaign.status === "scheduled" && campaign.scheduledAt
									? `Scheduled for ${new Date(campaign.scheduledAt).toLocaleDateString()}`
									: "Draft — Not sent"}
							</div>
						)}

						{/* Relative date */}
						<div className="hidden shrink-0 text-right text-text-sub-600 text-xs sm:block">
							{campaign.sentAt
								? `Sent ${formatRelativeTime(campaign.sentAt)}`
								: `Updated ${formatRelativeTime(campaign.updatedAt)}`}
						</div>

						{/* Action Menu */}
						<div
							className="flex shrink-0 items-center gap-1"
							onClick={(e) => e.stopPropagation()}
						>
							{campaign.status === "draft" && (
								<button
									type="button"
									onClick={(e) => void handleSendNow(e, campaign.id)}
									disabled={actionPendingId === campaign.id}
									className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 font-medium text-text-strong-950 text-xs shadow-xs transition-colors hover:bg-bg-weak-50"
								>
									<Icon name="mail-send" className="h-3 w-3" />
									Send
								</button>
							)}

							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<button
										type="button"
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-soft-200/50 hover:text-text-strong-950"
										aria-label="Actions"
									>
										<Icon name="dots-horizontal" className="h-4 w-4" />
									</button>
								</Dropdown.Trigger>
								<Dropdown.Content align="end" className="w-48">
									<Dropdown.Item
										onClick={() => router.push(`/campaigns/${campaign.id}`)}
										className="gap-2"
									>
										<Icon name="fat-row" className="h-3.5 w-3.5" />
										View Analytics & Preview
									</Dropdown.Item>

									{campaign.status === "draft" && (
										<Dropdown.Item
											onClick={(e) =>
												void handleSendNow(
													e as unknown as React.MouseEvent,
													campaign.id,
												)
											}
											className="gap-2"
										>
											<Icon name="mail-send" className="h-3.5 w-3.5" />
											Send to All Contacts Now
										</Dropdown.Item>
									)}

									<Dropdown.Item
										onClick={(e) =>
											void handleDuplicate(
												e as unknown as React.MouseEvent,
												campaign.id,
											)
										}
										className="gap-2"
									>
										<Icon name="copy" className="h-3.5 w-3.5" />
										Duplicate Campaign
									</Dropdown.Item>

									<Dropdown.Separator />

									<Dropdown.Item
										onClick={(e) =>
											void handleDelete(
												e as unknown as React.MouseEvent,
												campaign.id,
											)
										}
										className="gap-2 text-error-base hover:text-error-base"
									>
										<Icon name="trash" className="h-3.5 w-3.5" />
										Delete Campaign
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>

							<Icon
								name="chevron-right"
								className="h-4 w-4 text-text-sub-600 opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};
