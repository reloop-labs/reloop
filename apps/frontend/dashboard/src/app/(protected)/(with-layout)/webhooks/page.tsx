"use client";

import { WebhooksApiDetails } from "@fe/dashboard/components/api-details/webhooks";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { DocsButton } from "./components/docs-button";
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
	const router = useRouter();

	const handleCreateWebhook = () => {
		if (activeOrganization?.slug) {
			router.push("/webhooks/create");
		}
	};

	useHotkeys(
		"mod+a",
		(event) => {
			event.preventDefault();
			handleCreateWebhook();
		},
		{
			enabled: true,
		},
	);

	if (error) {
		return <WebhookError />;
	}

	return (
		<div className="mx-auto max-w-3xl pt-10 sm:px-8">
			<div className="flex items-center justify-between pb-6">
				<h1 className="font-medium text-2xl">Webhooks</h1>
				<div className="flex items-center gap-2 self-end">
					<DocsButton size="xsmall" mode="stroke" />
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={handleCreateWebhook}
						className="gap-2"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create webhook
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
					<WebhooksApiDetails size="xsmall" mode="ghost" />
				</div>
			</div>

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
