import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { StripeSecret } from "#/features/webhooks/components/blurred-secret";
import type { WebhookDetailData } from "#/features/webhooks/hooks/use-webhooks-query";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
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

function IconAction({
	label,
	icon,
	onClick,
	disabled,
	spin,
	active,
}: {
	label: string;
	icon: string;
	onClick: () => void;
	disabled?: boolean;
	spin?: boolean;
	active?: boolean;
}) {
	return (
		<Tooltip.Provider delayDuration={200}>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={onClick}
						disabled={disabled}
						className={cn(
							"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
							"hover:bg-bg-weak-50 hover:text-text-strong-950",
							"disabled:pointer-events-none disabled:opacity-40",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20",
							active && "text-success-base hover:text-success-base",
						)}
						aria-label={label}
					>
						<Icon
							name={icon}
							className={cn("h-4 w-4", spin && "animate-spin")}
						/>
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="top" size="small">
					{label}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}

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
			setIsSecretVisible(false);
		} catch {
			toast.error("Failed to rotate webhook secret");
		} finally {
			setIsRotatingSecret(false);
		}
	};

	return (
		<>
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Signing secret */}
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<div className="space-y-3 p-4">
						<div>
							<p className="font-medium text-sm text-text-strong-950">
								Signing secret
							</p>
							<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
								Used to verify webhook signatures on your server.
							</p>
						</div>

						{isLoading ? (
							<Skeleton className="h-10 w-full rounded-xl" />
						) : (
							<div className="flex items-center gap-2 rounded-xl bg-bg-weak-50 py-2 pr-2 pl-3 dark:bg-bg-weak-50/50">
								<div className="min-w-0 flex-1 overflow-hidden">
									{webhook?.secret ? (
										<StripeSecret
											secret={webhook.secret}
											prefixLength={6}
											revealed={isSecretVisible}
										/>
									) : (
										<span className="font-mono text-[13px] text-text-sub-600">
											No secret
										</span>
									)}
								</div>
								{webhook?.secret ? (
									<div className="flex shrink-0 items-center border-stroke-soft-100 border-l pl-1 dark:border-stroke-soft-100/40">
										<IconAction
											label={isSecretVisible ? "Hide secret" : "Show secret"}
											icon={
												isSecretVisible ? "eye-outline" : "eye-slash-outline"
											}
											onClick={() => setIsSecretVisible((v) => !v)}
										/>
										<IconAction
											label={copiedSecret ? "Copied" : "Copy secret"}
											icon={copiedSecret ? "check" : "copy"}
											onClick={() => void handleCopySecret()}
											active={copiedSecret}
										/>
										<IconAction
											label="Rotate secret"
											icon={isRotatingSecret ? "loader-2" : "refresh-cw"}
											onClick={() => setIsRotateModalOpen(true)}
											disabled={isRotatingSecret}
											spin={isRotatingSecret}
										/>
									</div>
								) : null}
							</div>
						)}
					</div>
				</div>

				{/* Subscribed events */}
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<div className="space-y-3 p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="font-medium text-sm text-text-strong-950">
									Subscribed events
								</p>
								<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
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
							<div className="flex max-h-[120px] flex-wrap gap-1.5 overflow-y-auto">
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
