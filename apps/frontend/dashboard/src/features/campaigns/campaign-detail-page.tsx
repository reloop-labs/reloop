"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	CampaignsProvider,
	useCampaignQuery,
	useCampaignRecipientsQuery,
	useCampaigns,
} from "./campaigns-provider";
import { CampaignHeader } from "./components/campaign-header";
import { CampaignPreviewTabs } from "./components/campaign-preview-tabs";
import { DeleteCampaignModal } from "./components/delete-campaign";

function CampaignDetailContent() {
	const params = useParams();
	const router = useRouter();
	const campaignId = params?.campaignId as string;
	const [, setDeleteId] = useQueryState("delete");
	const { sendCampaign, duplicateCampaign } = useCampaigns();
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

	const handleSend = async () => {
		if (!campaign) return;
		setActionPending(true);
		try {
			await sendCampaign(campaign.id);
		} finally {
			setActionPending(false);
		}
	};

	const handleDuplicate = async () => {
		if (!campaign) return;
		setActionPending(true);
		try {
			const cloned = await duplicateCampaign(campaign.id);
			router.push(`/campaigns/${cloned.id}`);
		} finally {
			setActionPending(false);
		}
	};

	const handleDelete = () => {
		if (campaign?.id) {
			void setDeleteId(campaign.id);
		}
	};

	useHotkeys(
		"e",
		(e) => {
			if (!campaign?.id || campaign?.status !== "draft") return;
			e.preventDefault();
			router.push(`/campaigns/${campaign.id}/edit`);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			if (!campaign?.id || actionPending) return;
			e.preventDefault();
			void handleDuplicate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"s",
		(e) => {
			if (!campaign?.id || campaign?.status !== "draft" || actionPending)
				return;
			e.preventDefault();
			void handleSend();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"x",
		(e) => {
			if (!campaign?.id) return;
			e.preventDefault();
			handleDelete();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const isLoading =
		campaignQuery.isPending || (campaignQuery.isFetching && !campaign);

	if (campaignQuery.isError) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
						Failed to load campaign
					</h2>
					<p className="mb-4 text-text-sub-600">
						{campaignQuery.error instanceof Error
							? campaignQuery.error.message
							: "An error occurred"}
					</p>
					<button
						type="button"
						onClick={() => void campaignQuery.refetch()}
						className="font-medium text-sm text-text-strong-950 underline-offset-2 hover:underline"
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-8 px-6 pt-8 pb-12 sm:px-8">
				<CampaignHeader campaign={undefined} isLoading={true} />
				<div className="space-y-4">
					<div className="h-32 animate-pulse rounded-xl bg-bg-weak-50" />
					<div className="h-48 animate-pulse rounded-xl bg-bg-weak-50" />
				</div>
			</div>
		);
	}

	if (!campaign) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
						Campaign not found
					</h2>
					<p className="text-text-sub-600">
						The campaign you&apos;re looking for doesn&apos;t exist or has been
						deleted.
					</p>
				</div>
			</div>
		);
	}

	const openRate =
		campaign && campaign.deliveredCount > 0
			? Math.round((campaign.openedCount / campaign.deliveredCount) * 100)
			: 0;
	const clickRate =
		campaign && campaign.deliveredCount > 0
			? Math.round((campaign.clickedCount / campaign.deliveredCount) * 100)
			: 0;
	const deliveryRate =
		campaign && campaign.sentCount > 0
			? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
			: 0;

	return (
		<>
			<div className="mx-auto max-w-5xl space-y-8 px-6 pt-8 pb-12 sm:px-8">
				<CampaignHeader
					campaign={campaign}
					isLoading={campaignQuery.isLoading}
					isFailed={campaignQuery.isError}
					onRetry={() => void campaignQuery.refetch()}
					onDuplicate={() => void handleDuplicate()}
					onSend={() => void handleSend()}
					onDelete={handleDelete}
					actionPending={actionPending}
				/>

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

			<DeleteCampaignModal campaigns={campaign ? [campaign] : []} />
		</>
	);
}

export function CampaignDetailPage() {
	return (
		<CampaignsProvider>
			<CampaignDetailContent />
		</CampaignsProvider>
	);
}
