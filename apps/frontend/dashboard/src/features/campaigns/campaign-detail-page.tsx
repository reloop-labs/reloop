"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import {
	CampaignsProvider,
	useCampaignQuery,
	useCampaigns,
} from "./campaigns-provider";
import { CampaignEngagementCard } from "./components/campaign-engagement-card";
import { CampaignHeader } from "./components/campaign-header";
import { CampaignMetricsCards } from "./components/campaign-metrics-cards";
import { CampaignPreviewTabs } from "./components/campaign-preview-tabs";
import {
	CampaignRecipientIssuesCard,
	type CategoryTab,
} from "./components/campaign-recipient-issues-card";
import { DeleteCampaignModal } from "./components/delete-campaign";
import { isEditableStatus } from "./utils";

function CampaignDetailContent() {
	const params = useParams();
	const router = useRouter();
	const campaignId = params?.campaignId as string;
	const [, setDeleteId] = useQueryState("delete");
	const { sendCampaign, duplicateCampaign, unscheduleCampaign } =
		useCampaigns();
	const campaignQuery = useCampaignQuery(campaignId);

	const [actionPending, setActionPending] = useState(false);
	const [recipientTab, setRecipientTab] = useState<CategoryTab>("clicked");

	const campaign = campaignQuery.data;

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

	const handleUnschedule = async () => {
		if (!campaign) return;
		setActionPending(true);
		try {
			await unscheduleCampaign(campaign.id);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to remove schedule",
			);
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
			if (!campaign?.id || !isEditableStatus(campaign.status)) return;
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
			<div className="mx-auto max-w-5xl px-4 pt-4 pb-12 sm:px-8 md:pt-10">
				<div className="max-md:hidden">
					<AnimatedBackButton fallbackHref="/campaigns" />
				</div>
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
			<div className="mx-auto max-w-5xl space-y-8 px-4 pt-4 pb-12 sm:px-8 md:pt-10">
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
			<div className="mx-auto max-w-5xl px-4 pt-4 pb-12 sm:px-8 md:pt-10">
				<div className="max-md:hidden">
					<AnimatedBackButton fallbackHref="/campaigns" />
				</div>
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

	return (
		<>
			<div className="mx-auto max-w-5xl space-y-8 px-4 pt-4 pb-12 sm:px-8 md:pt-10">
				<CampaignHeader
					campaign={campaign}
					isLoading={campaignQuery.isLoading}
					isFailed={campaignQuery.isError}
					onRetry={() => void campaignQuery.refetch()}
					onDuplicate={() => void handleDuplicate()}
					onSend={() => void handleSend()}
					onDelete={handleDelete}
					onUnschedule={() => void handleUnschedule()}
					actionPending={actionPending}
				/>

				{/* High-level Metric Cards */}
				{campaign.status !== "draft" && (
					<CampaignMetricsCards
						campaign={campaign}
						onSelectCategory={(tab) => {
							setRecipientTab(tab);
							document
								.getElementById("campaign-recipients")
								?.scrollIntoView({ behavior: "smooth", block: "start" });
						}}
					/>
				)}

				{(campaign.status === "sending" || campaign.status === "sent") && (
					<CampaignEngagementCard campaignId={campaign.id} />
				)}

				{/* Deliverability & Recipient Activity (Unsubscribed, Bounced, Suppressed, Complained, Clicks) */}
				<CampaignRecipientIssuesCard
					campaignId={campaign.id}
					activeTab={recipientTab}
					onActiveTabChange={setRecipientTab}
				/>

				{/* Message Preview Tabs */}
				<CampaignPreviewTabs campaign={campaign} audienceInfo={audienceInfo} />
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
