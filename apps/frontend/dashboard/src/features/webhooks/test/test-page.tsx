import { buildAppHref } from "#/lib/navigation-url";
import { useRouter } from "next/navigation";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { TriggerWebhookTester } from "#/features/webhooks/components/trigger-webhook-tester";
import { WebhookAvatar } from "#/features/webhooks/components/webhook-avatar";
import { useWebhookDetailQuery } from "#/features/webhooks/hooks/use-webhooks-query";

import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

function statusBadgeLabel(status: string) {
	switch (status) {
		case "active":
			return "Enabled";
		case "paused":
			return "Paused";
		case "disabled":
			return "Disabled";
		case "failed":
			return "Failed";
		default:
			return status;
	}
}

function statusBadgeClass(status: string) {
	switch (status) {
		case "active":
			return "bg-success-lighter text-success-base";
		case "paused":
			return "bg-warning-lighter text-warning-base";
		case "failed":
			return "bg-error-lighter text-error-base";
		default:
			return "bg-bg-weak-50 text-text-sub-600";
	}
}

export function WebhookTestPage({ webhookId }: { webhookId: string }) {
	const router = useRouter();
	const { data: webhook, isPending: isLoading } =
		useWebhookDetailQuery(webhookId);

	const displayName = webhook?.name || webhook?.url || "Webhook";

	const goBack = () => {
		router.push(buildAppHref({ to: "/webhooks/$webhookId", params: { webhookId } }));
	};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-8 p-6 pb-16 lg:p-8">
			<div>
				<div className="pt-1">
					<AnimatedBackButton onClick={goBack} />
				</div>

				{/* Page title — create-style */}
				<div className="pt-6">
					<h1 className="font-semibold text-lg text-text-strong-950 tracking-tight">
						Test webhook events
					</h1>
					<p className="mt-1 text-sm text-text-sub-600 leading-relaxed">
						Send a sample event to verify your endpoint.
					</p>
				</div>

				{/* Target webhook identity */}
				<div className="mt-5">
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 shrink-0 rounded-[12px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-36 rounded-lg" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-56 rounded-lg" />
							</div>
						</div>
					) : webhook ? (
						<div className="flex min-w-0 items-center gap-3">
							<WebhookAvatar
								seed={webhook.id || displayName}
								size="md"
								alt={`${displayName} avatar`}
							/>
							<div className="min-w-0">
								<div className="flex min-w-0 flex-wrap items-center gap-2">
									<p className="truncate font-semibold text-text-strong-950 text-title-h6 leading-8 tracking-tight">
										{displayName}
									</p>
									{webhook.status ? (
										<span
											className={cn(
												"inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium text-[11px]",
												statusBadgeClass(webhook.status),
											)}
										>
											{statusBadgeLabel(webhook.status)}
										</span>
									) : null}
								</div>
								<p className="truncate font-medium font-mono text-[13px] text-text-sub-600 leading-snug">
									{webhook.url}
								</p>
							</div>
						</div>
					) : null}
				</div>
			</div>

			{isLoading ? (
				<div className="grid gap-4 lg:grid-cols-2">
					<Skeleton className="h-80 w-full rounded-[18px]" />
					<Skeleton className="h-64 w-full rounded-[18px]" />
				</div>
			) : webhook ? (
				<TriggerWebhookTester
					webhookId={webhook.id}
					webhookEvents={webhook.events}
					onCancel={goBack}
				/>
			) : (
				<p className="text-sm text-text-sub-600">Webhook not found.</p>
			)}
		</div>
	);
}
