import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import type { Campaign } from "../campaign-types";

const QUOTA_ERROR = /daily email limit|quota|credits|payment overdue/i;

/** Shown while a sending campaign is held back by its last send error. */
export const CampaignPausedBanner = ({
	campaign,
	onResume,
	resumePending,
}: {
	campaign: Campaign;
	onResume: () => void;
	resumePending?: boolean;
}) => {
	if (campaign.status !== "sending" || !campaign.lastError) return null;

	const isQuota = QUOTA_ERROR.test(campaign.lastError);

	return (
		<Alert.Root
			variant="lighter"
			status="warning"
			size="large"
			className="rounded-2xl ring-1 ring-stroke-soft-200 ring-inset"
		>
			<div className="flex w-full flex-wrap items-center justify-between gap-3">
				<div className="min-w-0 space-y-0.5">
					<div className="font-medium text-label-md text-text-strong-950">
						{isQuota ? "Paused: sending limit reached" : "Sending is paused"}
					</div>
					<p className="text-paragraph-sm text-text-sub-600">
						{campaign.lastError.replace(/\.$/, "")}.{" "}
						{isQuota
							? "Remaining recipients send automatically once credits are available or the daily limit resets. Resume to retry now."
							: "Resume to retry the remaining recipients."}
					</p>
				</div>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="font-semibold"
					onClick={onResume}
					disabled={resumePending}
				>
					Resume
				</Button.Root>
			</div>
		</Alert.Root>
	);
};
