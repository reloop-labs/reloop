"use client";

import { WebhookError } from "./components/webhook-error";
import { WebhookMetrics } from "./components/webhook-metrics";
import { WebhookTable } from "./components/webhook-table";
import { WebhookToolbar } from "./components/webhook-toolbar";
import { useWebhooks } from "./components/use-webhooks";

const WebhooksPage = () => {
	const {
		activeOrganization,
		statusFilter,
		setStatusFilter,
		searchQuery,
		setSearchQuery,
		webhooks,
		metrics,
		isLoading,
		error,
		isTotalEmpty,
	} = useWebhooks();

	if (error) {
		return <WebhookError />;
	}

	return (
		<div>
			{!isTotalEmpty && (
				<WebhookMetrics
					totalEndpoints={metrics.totalEndpoints}
					totalDeliveries={metrics.totalDeliveries}
					failureRate={metrics.failureRate}
				/>
			)}

			<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
				{!isTotalEmpty && (
					<WebhookToolbar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
					/>
				)}

				<WebhookTable
					webhooks={webhooks}
					activeOrganizationSlug={activeOrganization?.slug || ""}
					isLoading={isLoading}
					loadingRows={4}
					isTotalEmpty={isTotalEmpty}
				/>
			</div>
		</div>
	);
};

export default WebhooksPage;
