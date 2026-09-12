"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	CampaignsProvider,
	useCampaignQuery,
	useCampaignRecipientsQuery,
	useCampaigns,
} from "./campaigns-provider";
import { CampaignPreviewTabs } from "./components/campaign-preview-tabs";

function CampaignDetailContent() {
	const params = useParams();
	const router = useRouter();
	const campaignId = params?.campaignId as string;
	const { sendCampaign, duplicateCampaign, deleteCampaign } = useCampaigns();
	const campaignQuery = useCampaignQuery(campaignId);
	const recipientsQuery = useCampaignRecipientsQuery(campaignId);

	const [actionPending, setActionPending] = useState(false);

	const campaign = campaignQuery.data;
	const recipients = recipientsQuery.data?.recipients ?? [];

	const toEmails = useMemo<string[]>(() => {
		if (recipients.length > 0) {
			return recipients.map((r) => r.email);
		}
		if (campaign?.csvEmails && campaign.csvEmails.length > 0) {
			return campaign.csvEmails;
		}
		return [];
	}, [recipients, campaign?.csvEmails]);

	const audienceInfo = useMemo(() => {
		if (!campaign) return null;
		const count = campaign.recipientCount ?? 0;
		const countLabel = `${count.toLocaleString()} ${count === 1 ? "recipient" : "recipients"}`;
		const targetName = campaign.audienceTargetName?.trim();

		if (campaign.audienceType === "group") {
			return {
				name: targetName || "Group",
				type: "group" as const,
				typeLabel: "Group",
				countLabel,
				href: campaign.audienceTargetId
					? `/contacts/groups/${campaign.audienceTargetId}`
					: undefined,
			};
		}

		if (campaign.audienceType === "channel") {
			return {
				name: targetName?.replace(/^Channel:\s*/i, "") || "Channel",
				type: "channel" as const,
				typeLabel: "Channel",
				countLabel,
				href: campaign.audienceTargetId
					? `/contacts?channelId=${campaign.audienceTargetId}`
					: undefined,
			};
		}

		if (campaign.audienceType === "csv") {
			return {
				name: targetName || "CSV Upload",
				type: "csv" as const,
				typeLabel: "CSV",
				countLabel,
				href: undefined,
			};
		}

		return {
			name: targetName || "All Contacts",
			type: "all" as const,
			typeLabel: "All Contacts",
			countLabel,
			href: "/contacts",
		};
	}, [campaign]);

	if (campaignQuery.isLoading) {
		return (
			<div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
				<div className="h-8 w-48 animate-pulse rounded-lg bg-bg-weak-100" />
				<div className="h-48 animate-pulse rounded-xl bg-bg-weak-50" />
			</div>
		);
	}

	if (!campaign) {
		return (
			<div className="mx-auto max-w-md p-12 text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50">
					<Icon name="alert-triangle" className="h-6 w-6 text-warning-base" />
				</div>
				<h2 className="font-semibold text-lg text-text-strong-950">
					Campaign Not Found
				</h2>
				<p className="mt-1 text-sm text-text-sub-600">
					The requested campaign could not be located in your workspace.
				</p>
				<Button.Root variant="neutral" size="small" asChild className="mt-6">
					<Link href="/campaigns">Return to Campaigns</Link>
				</Button.Root>
			</div>
		);
	}

	const openRate =
		campaign.deliveredCount > 0
			? Math.round((campaign.openedCount / campaign.deliveredCount) * 100)
			: 0;
	const clickRate =
		campaign.deliveredCount > 0
			? Math.round((campaign.clickedCount / campaign.deliveredCount) * 100)
			: 0;
	const deliveryRate =
		campaign.sentCount > 0
			? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
			: 0;

	const handleSend = async () => {
		setActionPending(true);
		try {
			await sendCampaign(campaign.id);
		} finally {
			setActionPending(false);
		}
	};

	const handleDuplicate = async () => {
		setActionPending(true);
		try {
			const cloned = await duplicateCampaign(campaign.id);
			router.push(`/campaigns/${cloned.id}`);
		} finally {
			setActionPending(false);
		}
	};

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this campaign?")) {
			setActionPending(true);
			try {
				await deleteCampaign(campaign.id);
				router.push("/campaigns");
			} finally {
				setActionPending(false);
			}
		}
	};

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
			{/* Breadcrumb & Navigation */}
			<div className="flex items-center gap-2 text-text-sub-600 text-xs">
				<Link href="/campaigns" className="hover:text-text-strong-950">
					Campaigns
				</Link>
				<Icon name="chevron-right" className="h-3 w-3" />
				<span className="truncate font-medium text-text-strong-950">
					{campaign.name}
				</span>
			</div>

			{/* Title & Actions Bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="font-semibold text-2xl text-text-strong-950">
							{campaign.name}
						</h1>
						<span className="rounded-full border border-stroke-soft-100 bg-bg-weak-50 px-2.5 py-0.5 font-medium text-text-strong-950 text-xs capitalize">
							{campaign.status}
						</span>
					</div>
					<p className="mt-1 text-sm text-text-sub-600">{campaign.subject}</p>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-center">
					{campaign.status === "draft" && (
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleSend}
							disabled={actionPending}
							className="gap-1.5"
						>
							<Icon name="mail-send" className="h-3.5 w-3.5" />
							Send to All Contacts
						</Button.Root>
					)}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleDuplicate}
						disabled={actionPending}
						className="gap-1.5"
					>
						<Icon name="copy" className="h-3.5 w-3.5" />
						Duplicate
					</Button.Root>
					<Button.Root
						variant="error"
						mode="stroke"
						size="small"
						onClick={handleDelete}
						disabled={actionPending}
						className="border-error-sub-300 text-error-base hover:bg-error-lighter"
					>
						Delete
					</Button.Root>
				</div>
			</div>

			{/* High-level Metric Cards */}
			{campaign.status !== "draft" && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							TOTAL SENT
						</p>
						<p className="mt-2 font-semibold text-2xl text-text-strong-950">
							{campaign.sentCount.toLocaleString()}
						</p>
						<p className="mt-0.5 text-text-sub-600 text-xs">
							{campaign.sentAt
								? `Broadcasted ${formatRelativeTime(campaign.sentAt)}`
								: "Broadcasted"}
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							DELIVERED ({deliveryRate}%)
						</p>
						<p className="mt-2 font-semibold text-2xl text-text-strong-950">
							{campaign.deliveredCount.toLocaleString()}
						</p>
						<p className="mt-0.5 text-text-sub-600 text-xs">
							{campaign.failedCount.toLocaleString()} bounced / failed
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							UNIQUE OPENS ({openRate}%)
						</p>
						<p className="mt-2 font-semibold text-2xl text-text-strong-950">
							{campaign.openedCount.toLocaleString()}
						</p>
						<p className="mt-0.5 text-text-sub-600 text-xs">
							Verified pixel loads
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							CLICKS ({clickRate}%)
						</p>
						<p className="mt-2 font-semibold text-2xl text-text-strong-950">
							{campaign.clickedCount.toLocaleString()}
						</p>
						<p className="mt-0.5 text-text-sub-600 text-xs">
							Link interactions
						</p>
					</div>
				</div>
			)}

			{/* Delivery Info - Email Header Style */}
			<section>
				<div className="flex flex-col gap-3.5">
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							From
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{campaign.fromName
								? `${campaign.fromName} <${campaign.fromEmail}>`
								: campaign.fromEmail}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							To
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{audienceInfo ? (
								<>
									{audienceInfo.href ? (
										<Link
											href={audienceInfo.href}
											className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
										>
											{audienceInfo.name}
										</Link>
									) : (
										<span>{audienceInfo.name}</span>
									)}
									<span className="font-normal text-text-sub-600">
										{" "}
										(
										{audienceInfo.type !== "all"
											? `${audienceInfo.typeLabel} · `
											: ""}
										{toEmails.length === 1 ? (
											<>
												1 recipient:{" "}
												<Link
													href={`/contacts/detail/${encodeURIComponent(toEmails[0] ?? "")}`}
													className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
												>
													{toEmails[0]}
												</Link>
											</>
										) : (
											audienceInfo.countLabel
										)}
										)
									</span>
								</>
							) : null}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Date
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{new Date(campaign.sentAt || campaign.createdAt).toLocaleString(
								undefined,
								{
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								},
							)}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Subject
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{campaign.subject}
						</span>
					</div>
				</div>
			</section>

			{/* Message Preview Tabs */}
			<CampaignPreviewTabs campaign={campaign} />
		</div>
	);
}

export function CampaignDetailPage() {
	return (
		<CampaignsProvider>
			<CampaignDetailContent />
		</CampaignsProvider>
	);
}
