import { DeleteWebhookModal } from "#/features/webhooks/components/delete-webhook-modal";
import { useWebhookDetailQuery } from "#/features/webhooks/hooks/use-webhooks-query";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { DeliveryLogs } from "./delivery-logs";
import { WebhookHeader } from "./webhook-header";

export function WebhookDetailPage({ webhookId }: { webhookId: string }) {
	const navigate = useNavigate();
	const [, setDeleteId] = useQueryState("delete");
	const { data, error, isPending, isFetching } =
		useWebhookDetailQuery(webhookId);

	const isLoading = isPending || (isFetching && !data);

	if (error && !data) {
		return (
			<div className="mx-auto w-full max-w-6xl px-6 py-12 text-center">
				<p className="text-sm text-text-sub-600">Failed to load webhook</p>
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto w-full max-w-6xl px-6">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
						Webhook not found
					</h2>
					<p className="text-text-sub-600">
						The webhook you&apos;re looking for doesn&apos;t exist or has been
						deleted.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-6">
			<WebhookHeader
				webhook={data ?? null}
				isLoading={isLoading}
				isFailed={!!error}
				onDeleteWebhook={() => {
					if (data) void setDeleteId(data.id);
				}}
				onTriggerTest={() =>
					void navigate({
						to: "/webhooks/$webhookId/test",
						params: { webhookId },
					})
				}
			/>

			<DeliveryLogs webhookId={data?.id ?? webhookId} />

			{data && (
				<DeleteWebhookModal
					webhook={data}
					onSuccess={() => {
						void navigate({ to: "/webhooks" });
					}}
				/>
			)}
		</div>
	);
}
