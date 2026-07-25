import type { WebhookDetailData } from "#/features/webhooks/hooks/use-webhooks-query";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { RotateWebhookSecretModal } from "./rotate-webhook-secret-modal";

const CATEGORY_META: Record<
	string,
	{ label: string; icon: string; chip: string }
> = {
	email: {
		label: "Email",
		icon: "mail-send",
		chip: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
	},
	domain: {
		label: "Domains",
		icon: "globe",
		chip: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
	},
	"api-key": {
		label: "API Keys",
		icon: "key-new",
		chip: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
	},
	contact: {
		label: "Contacts",
		icon: "contacts",
		chip: "bg-green-500/10 text-green-700 dark:text-green-300",
	},
};

/** Always-visible signing secret + subscribed events (above tabs). */
export function WebhookSecretEvents({
	webhook,
	isLoading,
}: {
	webhook: WebhookDetailData | undefined | null;
	isLoading?: boolean;
}) {
	const invalidate = useInvalidateWebhooks();
	const [copiedSecret, setCopiedSecret] = useState(false);
	const [isSecretVisible, setIsSecretVisible] = useState(false);
	const [isRotatingSecret, setIsRotatingSecret] = useState(false);
	const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);

	const handleCopySecret = async () => {
		if (!webhook?.secret) return;
		try {
			await navigator.clipboard.writeText(webhook.secret);
			toast.success("Webhook secret copied");
			setCopiedSecret(true);
			setTimeout(() => setCopiedSecret(false), 2000);
		} catch {
			toast.error("Failed to copy secret");
		}
	};

	const handleRotateSecret = async () => {
		if (!webhook) return;
		try {
			setIsRotatingSecret(true);
			const array = new Uint8Array(16);
			window.crypto.getRandomValues(array);
			const newSecret = `whsec_${Array.from(array, (byte) =>
				byte.toString(16).padStart(2, "0"),
			).join("")}`;

			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{ secret: newSecret },
				{ withCredentials: true },
			);
			await invalidate();
			toast.success("Webhook secret rotated successfully");
			setIsRotateModalOpen(false);
		} catch {
			toast.error("Failed to rotate webhook secret");
		} finally {
			setIsRotatingSecret(false);
		}
	};

	const maskedSecret = !webhook?.secret
		? "No secret"
		: isSecretVisible
			? webhook.secret
			: webhook.secret.startsWith("whsec_")
				? `whsec_${"•".repeat(28)}`
				: "•".repeat(32);

	return (
		<>
			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				{/* Signing secret */}
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
					<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40">
						<div>
							<div className="flex items-center gap-1.5">
								<Icon name="key-new" className="h-3.5 w-3.5 text-text-sub-600" />
								<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
									Signing secret
								</span>
							</div>
							<p className="mt-1 text-[12px] text-text-sub-600 leading-relaxed">
								Used to verify webhook signatures on your server.
							</p>
						</div>

						{isLoading ? (
							<Skeleton className="h-9 w-full rounded-xl" />
						) : (
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										readOnly
										className="font-medium font-mono text-text-strong-950 text-xs"
										value={maskedSecret}
									/>
									{webhook?.secret ? (
										<Input.InlineAffix className="mr-1 flex items-center gap-1">
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={() => setIsSecretVisible((v) => !v)}
												title={
													isSecretVisible ? "Hide secret" : "Show secret"
												}
											>
												<Icon
													name={
														isSecretVisible
															? "eye-outline"
															: "eye-slash-outline"
													}
													className="h-3.5 w-3.5 text-text-sub-600"
												/>
											</Button.Root>
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={() => void handleCopySecret()}
												title="Copy secret"
											>
												<Icon
													name={copiedSecret ? "check" : "copy"}
													className={cn(
														"h-3.5 w-3.5",
														copiedSecret
															? "text-success-base"
															: "text-text-sub-600",
													)}
												/>
											</Button.Root>
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="h-7 w-7 p-0"
												onClick={() => setIsRotateModalOpen(true)}
												disabled={isRotatingSecret}
												title="Rotate secret"
											>
												<Icon
													name={isRotatingSecret ? "loader-2" : "rotate-cw"}
													className={cn(
														"h-3.5 w-3.5 text-text-sub-600",
														isRotatingSecret && "animate-spin",
													)}
												/>
											</Button.Root>
										</Input.InlineAffix>
									) : null}
								</Input.Wrapper>
							</Input.Root>
						)}
					</div>
				</div>

				{/* Subscribed events */}
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
					<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40">
						<div className="flex items-start justify-between gap-3">
							<div>
								<div className="flex items-center gap-1.5">
									<Icon name="list" className="h-3.5 w-3.5 text-text-sub-600" />
									<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
										Subscribed events
									</span>
								</div>
								<p className="mt-1 text-[12px] text-text-sub-600 leading-relaxed">
									Event types this endpoint receives.
								</p>
							</div>
							{!isLoading && webhook?.events?.length ? (
								<span className="shrink-0 rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 tabular-nums dark:bg-bg-weak-50/50">
									{webhook.events.length}
								</span>
							) : null}
						</div>

						{isLoading ? (
							<div className="flex flex-wrap gap-1.5">
								<Skeleton className="h-7 w-28 rounded-lg" />
								<Skeleton className="h-7 w-32 rounded-lg" />
								<Skeleton className="h-7 w-24 rounded-lg" />
							</div>
						) : webhook?.events?.length ? (
							<div className="flex max-h-[140px] flex-wrap gap-1.5 overflow-y-auto">
								{webhook.events.map((eventId) => {
									const def = WEBHOOK_EVENTS.find((e) => e.id === eventId);
									const meta = def ? CATEGORY_META[def.category] : undefined;
									return (
										<span
											key={eventId}
											className={cn(
												"inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium font-mono text-[11px]",
												meta?.chip ??
													"bg-bg-weak-50 text-text-sub-600 dark:bg-bg-weak-50/50",
											)}
											title={def?.description || eventId}
										>
											{meta ? (
												<Icon name={meta.icon} className="h-3 w-3 shrink-0" />
											) : null}
											{def?.name || eventId}
										</span>
									);
								})}
							</div>
						) : (
							<p className="text-[13px] text-text-sub-600 italic">
								No events subscribed
							</p>
						)}
					</div>
				</div>
			</div>

			{webhook ? (
				<RotateWebhookSecretModal
					isOpen={isRotateModalOpen}
					onClose={() => setIsRotateModalOpen(false)}
					onConfirm={() => void handleRotateSecret()}
					isRotating={isRotatingSecret}
				/>
			) : null}
		</>
	);
}
