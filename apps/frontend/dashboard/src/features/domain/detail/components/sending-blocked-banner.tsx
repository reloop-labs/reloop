import * as Alert from "@reloop/ui/alert";
import type { Domain } from "#/features/domain/types";

/** Shown while Reloop has blocked sending from this domain. */
export const SendingBlockedBanner = ({ domain }: { domain?: Domain }) => {
	if (!domain?.sendingBlockedAt) return null;

	return (
		<Alert.Root
			variant="lighter"
			status="error"
			size="large"
			className="rounded-2xl ring-1 ring-stroke-soft-200 ring-inset"
		>
			<div className="min-w-0 space-y-0.5">
				<div className="font-medium text-label-md text-text-strong-950">
					Sending from {domain.domain} is blocked
				</div>
				<p className="text-paragraph-sm text-text-sub-600">
					{domain.sendingBlockedMessage ||
						"Contact support to review the block on this domain."}
				</p>
			</div>
		</Alert.Root>
	);
};
