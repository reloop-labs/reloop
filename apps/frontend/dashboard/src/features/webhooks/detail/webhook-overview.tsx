import type { WebhookDetailData } from "#/features/webhooks/hooks/use-webhooks-query";
import { WebhookMetaGrid } from "./webhook-meta-grid";

export function WebhookOverview({
	webhook,
	isLoading,
}: {
	webhook: WebhookDetailData | null | undefined;
	isLoading?: boolean;
}) {
	return (
		<div className="space-y-3">
			<div>
				<p className="text-[13px] text-text-sub-600 leading-relaxed">
					Complete configuration and delivery settings for this endpoint.
				</p>
			</div>
			<WebhookMetaGrid webhook={webhook} isLoading={isLoading} />
		</div>
	);
}
