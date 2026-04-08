"use client";

import { useWebhooks } from "./components/use-webhooks";
import { WebhookError } from "./components/webhook-error";
import { WebhookTable } from "./components/webhook-table";
import { WebhookToolbar } from "./components/webhook-toolbar";

const WebhooksPage = () => {
	const {
		activeOrganization,
		statusFilter,
		setStatusFilter,
		searchQuery,
		setSearchQuery,
		webhooks,
		isLoading,
		error,
		isTotalEmpty,
	} = useWebhooks();

	if (error) {
		return <WebhookError />;
	}

	return (
		<div>
			<div>
				<WebhookToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
				/>

				<div className="mt-4">
					<WebhookTable
						webhooks={webhooks}
						activeOrganizationSlug={activeOrganization?.slug || ""}
						isLoading={isLoading}
						loadingRows={4}
						isTotalEmpty={isTotalEmpty}
					/>
				</div>
			</div>
		</div>
	);
};

export default WebhooksPage;
