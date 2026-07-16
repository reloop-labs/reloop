import { WebhooksApiDetails } from "#/components/api-details/webhooks";
import { useWebhooks } from "#/features/webhooks/components/use-webhooks";
import { DocsButton } from "#/features/webhooks/components/docs-button";
import { WebhookError } from "#/features/webhooks/components/webhook-error";
import { WebhookTable } from "#/features/webhooks/components/webhook-table";
import { WebhookToolbar } from "#/features/webhooks/components/webhook-toolbar";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";

export function WebhooksPage() {
	const {
		statusFilter,
		setStatusFilter,
		searchQuery,
		setSearchQuery,
		webhooks,
		isLoading,
		error,
		isTotalEmpty,
		mutate,
	} = useWebhooks();
	const navigate = useNavigate();

	const handleCreateWebhook = () => {
		void navigate({ to: "/webhooks/create" });
	};

	useHotkeys(
		"mod+a",
		(event) => {
			event.preventDefault();
			handleCreateWebhook();
		},
		{ enabled: true },
	);

	if (error) {
		return <WebhookError />;
	}

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
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
						onMutate={mutate}
					/>
				</div>
			</div>
		</div>
	);
}
