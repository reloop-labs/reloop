import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as StatusBadge from "@reloop/ui/status-badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Campaign, CampaignStatus } from "../campaign-types";
import { CampaignAvatar } from "./campaign-avatar";
import {
	CampaignHeaderMenu,
	type CampaignHeaderMenuAction,
} from "./campaign-header-menu";

const STATUS_MAP: Record<
	CampaignStatus,
	{ label: string; status: "completed" | "pending" | "disabled" | "failed" }
> = {
	sent: { label: "Sent", status: "completed" },
	sending: { label: "Sending", status: "pending" },
	scheduled: { label: "Scheduled", status: "pending" },
	draft: { label: "Draft", status: "disabled" },
	cancelled: { label: "Cancelled", status: "failed" },
};

export function CampaignHeader({
	campaign,
	isLoading,
	isFailed,
	onRetry,
	onDuplicate,
	onSend,
	onDelete,
	actionPending,
}: {
	campaign: Campaign | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onRetry?: () => void;
	onDuplicate?: () => void;
	onSend?: () => void;
	onDelete?: () => void;
	actionPending?: boolean;
}) {
	const router = useRouter();

	const handleCopy = async (value: string, successMessage: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(successMessage);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const handleMenuAction = (id: CampaignHeaderMenuAction) => {
		if (id === "docs") {
			window.open("https://reloop.sh/docs/campaigns", "_blank");
			return;
		}
		if (id === "edit" && campaign?.id && campaign.status === "draft") {
			router.push(`/campaigns/${campaign.id}/edit`);
			return;
		}
		if (id === "duplicate") {
			onDuplicate?.();
			return;
		}
		if (id === "copy-id" && campaign?.id) {
			void handleCopy(campaign.id, "Campaign ID copied");
			return;
		}
		if (id === "delete") {
			onDelete?.();
		}
	};

	if (!campaign && !isLoading) {
		return (
			<div>
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-1.5 text-error-base">
							<Icon name="alert-circle" className="h-3.5 w-3.5" />
							<p className="font-medium text-paragraph-xs">Not found</p>
						</div>
						<h1 className="mt-1 font-medium text-title-h6 leading-8">
							Campaign not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName = campaign?.name || "Unnamed Campaign";
	const statusConfig =
		(campaign?.status && STATUS_MAP[campaign.status]) || STATUS_MAP.draft;

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
							<CampaignAvatar
								size="lg"
								status={campaign?.status}
								alt={`${displayName} avatar`}
							/>
							<div className="min-w-0">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Campaign
								</p>
								<div className="flex items-center gap-2">
									<h1 className="truncate font-semibold text-title-h6 leading-5">
										{displayName}
									</h1>
									<StatusBadge.Root
										variant="light"
										status={statusConfig.status}
										className="capitalize"
									>
										<StatusBadge.Dot />
										{statusConfig.label}
									</StatusBadge.Root>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-8 w-20 rounded-lg" />
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
					) : campaign ? (
						<>
							{campaign.status === "draft" ? (
								<>
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xsmall"
										className="gap-1.5 font-semibold"
										onClick={() =>
											router.push(`/campaigns/${campaign.id}/edit`)
										}
										disabled={actionPending}
									>
										<Icon name="edit" className="h-3.5 w-3.5" />
										<span>Edit</span>
										<ActionKbd className="ml-0.5 w-auto min-w-4 px-1">
											E
										</ActionKbd>
									</Button.Root>

									<FancyButton.Root
										variant="blue"
										size="xsmall"
										className="gap-1.5"
										onClick={onSend}
										disabled={actionPending}
									>
										<Icon name="mail-send" className="h-3.5 w-3.5" />
										<span>Send to all</span>
										<ActionKbd className="ml-0.5 w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
											S
										</ActionKbd>
									</FancyButton.Root>
								</>
							) : (
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									className="gap-1.5 font-semibold"
									onClick={onDuplicate}
									disabled={actionPending}
								>
									<Icon name="copy" className="h-3.5 w-3.5" />
									<span>Duplicate</span>
									<ActionKbd className="ml-0.5 w-auto min-w-4 px-1">
										D
									</ActionKbd>
								</Button.Root>
							)}

							<CampaignHeaderMenu
								canEdit={campaign.status === "draft"}
								onAction={handleMenuAction}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
