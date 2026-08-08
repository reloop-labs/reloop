import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { DeleteWebhookModal } from "#/features/webhooks/components/delete-webhook-modal";
import { useWebhookDetailQuery } from "#/features/webhooks/hooks/use-webhooks-query";
import { DeliveryLogs } from "./delivery-logs";
import { WebhookHeader } from "./webhook-header";
import { WebhookOverview } from "./webhook-overview";
import { WebhookSecretEvents } from "./webhook-secret-events";

const TABS = [
	{ id: "deliveries", label: "Delivery logs", icon: "activity-2" },
	{ id: "overview", label: "Overview", icon: "layout-grid" },
] as const;

export function WebhookDetailPage({ webhookId }: { webhookId: string }) {
	const router = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("deliveries"),
	);
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>();
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const { data, error, isPending, isFetching, refetch } =
		useWebhookDetailQuery(webhookId);

	const isLoading = isPending || (isFetching && !data);

	const tabValue =
		activeTab === "deliveries" || activeTab === "overview"
			? activeTab
			: "deliveries";
	const activeIndex = TABS.findIndex((t) => t.id === tabValue);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tabEl = buttonRefs.current[currentIdx];
	const rect = tabEl?.getBoundingClientRect();

	if (error && !data) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
				<div className="flex flex-col items-center justify-center gap-3 py-20">
					<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
					<p className="text-sm text-text-sub-600">Failed to load webhook</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className="font-medium text-sm text-text-strong-950 underline-offset-2 hover:underline"
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
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
		<>
			<div className="mx-auto max-w-5xl space-y-8 px-6 pt-8 pb-12 sm:px-8">
				<WebhookHeader
					webhook={data}
					isLoading={isLoading}
					isFailed={!!error}
					onRetry={() => void refetch()}
					onDeleteWebhook={() => {
						if (data) void setDeleteId(data.id);
					}}
					onTriggerTest={() => router.push(`/webhooks/${webhookId}/test`)}
				/>

				{/* Always visible above tabs */}
				<WebhookSecretEvents webhook={data} isLoading={isLoading} />

				<TabMenu.Root
					value={tabValue}
					onValueChange={(v) => void setActiveTab(v)}
				>
					<TabMenu.List className="relative h-12 gap-0 border-b! py-0">
						{TABS.map((tab, index) => (
							<TabMenu.Trigger
								key={tab.id}
								value={tab.id}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								onPointerEnter={() => setHoveredIdx(index)}
								onPointerLeave={() => setHoveredIdx(undefined)}
								className={cn(
									"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
									hoveredIdx === undefined &&
										activeIndex === index &&
										"text-text-strong-950",
								)}
							>
								<Icon name={tab.icon} className="h-4 w-4" />
								{tab.label}
							</TabMenu.Trigger>
						))}
						<AnimatePresence>
							{rect && activeIndex !== -1 ? (
								<motion.div
									className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(tabEl?.offsetParent?.getBoundingClientRect().left || 0),
										top:
											rect.top -
											(tabEl?.offsetParent?.getBoundingClientRect().top || 0) +
											7,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(tabEl?.offsetParent?.getBoundingClientRect().left || 0),
										top:
											rect.top -
											(tabEl?.offsetParent?.getBoundingClientRect().top || 0) +
											7,
										opacity: 1,
									}}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</TabMenu.List>

					<TabMenu.Content value="deliveries" className="pt-6 outline-none">
						<DeliveryLogs webhookId={data?.id ?? webhookId} />
					</TabMenu.Content>

					<TabMenu.Content value="overview" className="pt-6 outline-none">
						<WebhookOverview webhook={data} isLoading={isLoading} />
					</TabMenu.Content>
				</TabMenu.Root>
			</div>

			{data ? (
				<DeleteWebhookModal
					webhook={data}
					onSuccess={() => {
						router.push("/webhooks");
					}}
				/>
			) : null}
		</>
	);
}
