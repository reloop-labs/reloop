import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import {
	ACTIVE_WEBHOOK_EVENTS,
	buildApiKeyWebhookData,
	buildContactGroupWebhookData,
	buildContactWebhookData,
	buildDomainWebhookData,
	buildEmailWebhookData,
	buildInboundEmailWebhookData,
	statusForEmailWebhookType,
	WEBHOOK_EVENTS,
} from "@reloop/webhook-events";
import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/** How long to wait for a delivery row after publish. */
const POLL_TIMEOUT_MS = 25_000;
/** Interval between delivery list fetches. */
const POLL_INTERVAL_MS = 1_000;
/** Allow small clock skew when matching createdAt. */
const CREATED_SKEW_MS = 5_000;

type WebhookStatus = "active" | "paused" | "disabled" | "failed";

interface TriggerWebhookTesterProps {
	webhookId: string;
	webhookEvents?: string[];
	/** When not active, deliveries are skipped server-side. */
	webhookStatus?: WebhookStatus;
	onCancel?: () => void;
	onReenable?: () => void | Promise<void>;
	isReenabling?: boolean;
}

type DeliveryStatus = "pending" | "success" | "failed" | "retrying";

interface DeliverySnapshot {
	id: string;
	status: DeliveryStatus;
	eventType: string;
	responseStatus: number | null;
	responseBody: string | null;
	errorMessage: string | null;
	durationMs: number | null;
	attemptNumber: number;
	maxAttempts: number;
	createdAt: string;
	completedAt: string | null;
}

/**
 * Publish is sync to the API; delivery is async via the worker.
 * `phase` tracks where we are in that pipeline.
 */
interface TriggerResult {
	phase:
		| "awaiting_delivery"
		| "delivering"
		| "delivered"
		| "timeout"
		| "publish_error";
	eventType: string;
	triggeredAt: string;
	publishMs: number | null;
	apiStatus: number | null;
	message: string;
	errorDetail: string | null;
	delivery: DeliverySnapshot | null;
}

interface DeliveryListItem {
	id: string;
	eventType: string;
	status: DeliveryStatus;
	responseStatus: number | null;
	responseBody: string | null;
	errorMessage: string | null;
	durationMs: number | null;
	attemptNumber: number;
	maxAttempts: number;
	createdAt: string;
	completedAt: string | null;
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
	email: { label: "Email", icon: "mail-send" },
	domain: { label: "Domains", icon: "globe" },
	"api-key": { label: "API Keys", icon: "key-new" },
	contact: { label: "Contacts", icon: "contacts" },
	other: { label: "Other", icon: "webhook" },
};

/**
 * Canonical sample for envelope.data — must match builders in @reloop/webhook-events
 * (same shapes production dispatches use).
 */
const getPayloadForEvent = (eventId: string): Record<string, unknown> => {
	if (eventId === "email.received") {
		return buildInboundEmailWebhookData({
			emailId: "em_test_inbound_a1b2c3",
			mailboxId: "mb_test_a1b2c3",
			from: "sender@example.com",
			fromName: "Test Sender",
			to: ["inbox@example.com"],
			cc: [],
			subject: "Test inbound email",
			threadId: "thr_test_a1b2c3",
			hasAttachments: false,
			isSpam: false,
			messageId: "<test-message-id@example.com>",
		}) as unknown as Record<string, unknown>;
	}

	if (eventId.startsWith("email.")) {
		const status =
			statusForEmailWebhookType(eventId) ?? eventId.replace("email.", "");
		const withError =
			eventId === "email.bounced" ||
			eventId === "email.delivery_delayed" ||
			eventId === "email.complained" ||
			eventId === "email.failed";

		return buildEmailWebhookData({
			emailId: "em_test_a1b2c3",
			from: "hello@example.com",
			to: ["user@example.com"],
			subject: "Test email event",
			status,
			...(withError
				? {
						error: {
							code: 550,
							message: "Simulated failure for webhook test",
						},
					}
				: {}),
			...(eventId === "email.clicked"
				? { url: "https://example.com/clicked" }
				: {}),
		}) as unknown as Record<string, unknown>;
	}

	if (eventId.startsWith("domain.")) {
		return buildDomainWebhookData({
			id: "dom_test_a1b2c3",
			name: "example.com",
			status:
				eventId === "domain.verify"
					? "active"
					: eventId === "domain.delete"
						? "deleted"
						: "pending",
		}) as unknown as Record<string, unknown>;
	}

	if (eventId.startsWith("contact.group.")) {
		return buildContactGroupWebhookData({
			id: "grp_test_a1b2c3",
			name: "Test group",
		}) as unknown as Record<string, unknown>;
	}

	if (eventId.startsWith("contact.")) {
		const status =
			eventId === "contact.unsubscribed"
				? "unsubscribed"
				: eventId === "contact.blocked"
					? "blocked"
					: "subscribed";
		return buildContactWebhookData({
			id: "con_test_a1b2c3",
			email: "user@example.com",
			firstName: "Ada",
			lastName: "Lovelace",
			status,
			source: "webhook_test",
		}) as unknown as Record<string, unknown>;
	}

	if (eventId.startsWith("api-key.")) {
		return buildApiKeyWebhookData({
			apiKeyId: "key_test_a1b2c3",
			status: eventId === "api-key.delete" ? "deleted" : "active",
			action:
				eventId === "api-key.revoke"
					? "revoked"
					: eventId === "api-key.create"
						? "created"
						: eventId === "api-key.update"
							? "updated"
							: eventId === "api-key.delete"
								? "deleted"
								: undefined,
		}) as unknown as Record<string, unknown>;
	}

	return {
		id: "evt_test_a1b2c3",
		type: eventId,
	};
};

/** Full POST body shape (envelope) the endpoint receives — id/created_at are server-generated. */
const getEnvelopePreview = (
	eventId: string,
	data: Record<string, unknown>,
): Record<string, unknown> => ({
	id: "whev_test_sample",
	type: eventId,
	created_at: new Date(0).toISOString(),
	data,
});

function inactiveCopy(status: WebhookStatus): {
	title: string;
	body: string;
	cta: string;
} {
	switch (status) {
		case "failed":
			return {
				title: "This webhook is failed",
				body: "After too many delivery failures, Reloop stops sending. Re-enable it, then send a test.",
				cta: "Re-enable webhook",
			};
		case "paused":
			return {
				title: "This webhook is paused",
				body: "Paused endpoints don’t receive events. Resume it to deliver a test.",
				cta: "Resume webhook",
			};
		case "disabled":
			return {
				title: "This webhook is disabled",
				body: "Disabled endpoints don’t receive events. Enable it to deliver a test.",
				cta: "Enable webhook",
			};
		default:
			return {
				title: "Webhook not active",
				body: "Only active webhooks can receive deliveries.",
				cta: "Activate webhook",
			};
	}
}

function isTerminalStatus(status: DeliveryStatus) {
	return status === "success" || status === "failed";
}

function toSnapshot(d: DeliveryListItem): DeliverySnapshot {
	return {
		id: d.id,
		status: d.status,
		eventType: d.eventType,
		responseStatus: d.responseStatus,
		responseBody: d.responseBody,
		errorMessage: d.errorMessage,
		durationMs: d.durationMs,
		attemptNumber: d.attemptNumber,
		maxAttempts: d.maxAttempts,
		createdAt: d.createdAt,
		completedAt: d.completedAt,
	};
}

async function fetchRecentDeliveries(
	webhookId: string,
): Promise<DeliveryListItem[]> {
	const res = await fetch(
		`/api/webhook/v1/${webhookId}/deliveries?page=1&limit=15&status=`,
		{ credentials: "include" },
	);
	if (!res.ok) {
		throw new Error(`Failed to load deliveries (${res.status})`);
	}
	const data = (await res.json()) as { deliveries?: DeliveryListItem[] };
	return data.deliveries ?? [];
}

/**
 * Newest delivery for this event type created at/after the trigger moment.
 * List is expected newest-first.
 */
function findMatchingDelivery(
	deliveries: DeliveryListItem[],
	eventType: string,
	triggeredAtMs: number,
): DeliveryListItem | null {
	const minCreated = triggeredAtMs - CREATED_SKEW_MS;
	for (const d of deliveries) {
		if (d.eventType !== eventType) continue;
		const created = new Date(d.createdAt).getTime();
		if (Number.isNaN(created) || created < minCreated) continue;
		return d;
	}
	return null;
}

function sleep(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException("Aborted", "AbortError"));
			return;
		}
		const id = window.setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			window.clearTimeout(id);
			reject(new DOMException("Aborted", "AbortError"));
		};
		signal.addEventListener("abort", onAbort, { once: true });
	});
}

function isHttpSuccess(status: number | null) {
	return status != null && status >= 200 && status < 300;
}

export const TriggerWebhookTester = ({
	webhookId,
	webhookEvents,
	webhookStatus = "active",
	onCancel,
	onReenable,
	isReenabling = false,
}: TriggerWebhookTesterProps) => {
	const invalidate = useInvalidateWebhooks();
	const isDeliverable = webhookStatus === "active";
	const pollAbortRef = useRef<AbortController | null>(null);

	const filteredEvents = useMemo(() => {
		if (webhookEvents && webhookEvents.length > 0) {
			return webhookEvents.map((id) => {
				const known =
					ACTIVE_WEBHOOK_EVENTS.find((e) => e.id === id) ??
					WEBHOOK_EVENTS.find((e) => e.id === id);
				return (
					known ?? {
						id,
						name: id,
						category: "other",
						description: id,
						isActive: false,
					}
				);
			});
		}
		return ACTIVE_WEBHOOK_EVENTS;
	}, [webhookEvents]);

	const [selectedEventId, setSelectedEventId] = useState(
		filteredEvents[0]?.id || "",
	);
	const [isPublishing, setIsPublishing] = useState(false);
	const [result, setResult] = useState<TriggerResult | null>(null);

	const selectedEvent = useMemo(
		() => filteredEvents.find((e) => e.id === selectedEventId),
		[filteredEvents, selectedEventId],
	);

	const payload = useMemo(() => {
		if (!selectedEvent) return {};
		return getPayloadForEvent(selectedEvent.id);
	}, [selectedEvent]);

	const payloadPreview = useMemo(() => {
		if (!selectedEvent) return "";
		return JSON.stringify(
			getEnvelopePreview(selectedEvent.id, payload),
			null,
			2,
		);
	}, [selectedEvent, payload]);

	const isPolling =
		result?.phase === "awaiting_delivery" || result?.phase === "delivering";
	const isBusy = isPublishing || isPolling;

	const canSend =
		Boolean(selectedEventId) &&
		!isBusy &&
		!isReenabling &&
		isDeliverable &&
		filteredEvents.length > 0;

	useEffect(() => {
		return () => {
			pollAbortRef.current?.abort();
		};
	}, []);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (canSend) void handleTrigger();
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"escape",
		(e) => {
			if (isBusy) return;
			e.preventDefault();
			onCancel?.();
		},
		{ enableOnFormTags: true },
	);

	const modKey =
		typeof navigator !== "undefined" &&
		/Mac|iPhone|iPod|iPad/i.test(navigator.platform)
			? "⌘"
			: "Ctrl";

	const stopPolling = () => {
		pollAbortRef.current?.abort();
		pollAbortRef.current = null;
	};

	const handleSelectEvent = (eventId: string) => {
		if (isBusy) return;
		setSelectedEventId(eventId);
		setResult(null);
	};

	const pollDeliveryResult = async (
		eventType: string,
		triggeredAtMs: number,
		base: Omit<TriggerResult, "phase" | "delivery" | "message"> & {
			message?: string;
		},
	) => {
		stopPolling();
		const controller = new AbortController();
		pollAbortRef.current = controller;
		const { signal } = controller;

		setResult({
			...base,
			phase: "awaiting_delivery",
			message: "Waiting for delivery…",
			delivery: null,
		});
		// Publish finished; keep the panel busy via result.phase instead.
		setIsPublishing(false);

		const deadline = Date.now() + POLL_TIMEOUT_MS;
		let lastDeliveryId: string | null = null;

		try {
			while (Date.now() < deadline) {
				if (signal.aborted) return;

				const deliveries = await fetchRecentDeliveries(webhookId);
				if (signal.aborted) return;

				const match = findMatchingDelivery(
					deliveries,
					eventType,
					triggeredAtMs,
				);

				if (match) {
					const snapshot = toSnapshot(match);
					lastDeliveryId = snapshot.id;

					if (isTerminalStatus(snapshot.status)) {
						const deliveredOk =
							snapshot.status === "success" ||
							isHttpSuccess(snapshot.responseStatus);

						setResult({
							...base,
							phase: "delivered",
							message: deliveredOk
								? "Endpoint responded successfully"
								: (snapshot.errorMessage ?? "Delivery failed"),
							delivery: snapshot,
						});

						if (deliveredOk) {
							const code = snapshot.responseStatus;
							toast.success(
								code != null
									? `Endpoint returned HTTP ${code}`
									: "Delivery succeeded",
							);
						} else {
							const code = snapshot.responseStatus;
							toast.error(
								snapshot.errorMessage ??
									(code != null
										? `Endpoint returned HTTP ${code}`
										: "Delivery failed"),
							);
						}
						await invalidate();
						return;
					}

					// In-flight
					setResult({
						...base,
						phase: "delivering",
						message:
							snapshot.status === "retrying"
								? `Retrying delivery (attempt ${snapshot.attemptNumber}/${snapshot.maxAttempts})…`
								: "Delivering to your endpoint…",
						delivery: snapshot,
					});
				}

				await sleep(POLL_INTERVAL_MS, signal);
			}

			// Timed out
			if (lastDeliveryId) {
				// Still pending/retrying after timeout
				const deliveries = await fetchRecentDeliveries(webhookId).catch(
					() => [] as DeliveryListItem[],
				);
				const match = deliveries.find((d) => d.id === lastDeliveryId);
				const snapshot = match ? toSnapshot(match) : null;

				setResult({
					...base,
					phase: "timeout",
					message:
						"Delivery is still in progress. Check delivery logs for the final result.",
					delivery: snapshot,
				});
				toast.message("Still waiting on delivery", {
					description: "Open delivery logs to see when it finishes.",
				});
			} else {
				setResult({
					...base,
					phase: "timeout",
					message:
						"No delivery appeared for this webhook. The event may still be queuing, or this endpoint wasn’t targeted.",
					delivery: null,
				});
				toast.error("No delivery found", {
					description: "Check delivery logs or try again.",
				});
			}
			await invalidate();
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult({
				...base,
				phase: "timeout",
				message:
					err instanceof Error
						? err.message
						: "Failed while waiting for delivery",
				delivery: null,
			});
			toast.error("Could not load delivery status");
		} finally {
			if (pollAbortRef.current === controller) {
				pollAbortRef.current = null;
			}
		}
	};

	const handleTrigger = async () => {
		if (!selectedEventId || !isDeliverable || isBusy) return;

		stopPolling();
		setIsPublishing(true);
		setResult(null);
		const startTime = Date.now();
		const triggeredAt = new Date().toISOString();

		try {
			const response = await axios.post(
				"/api/webhook/v1/trigger",
				{ webhookId, event: selectedEventId, payload },
				{ withCredentials: true },
			);
			const data = response.data as {
				success?: boolean;
				message?: string;
				jobId?: string;
			};
			const ok = data.success !== false;
			const publishMs = Date.now() - startTime;
			const base = {
				eventType: selectedEventId,
				triggeredAt,
				publishMs,
				apiStatus: response.status,
				errorDetail: null as string | null,
			};

			if (!ok) {
				setResult({
					...base,
					phase: "publish_error",
					message: data.message ?? "Failed to publish test event",
					delivery: null,
				});
				toast.error(data.message ?? "Failed to publish test event");
				return;
			}

			// Hand off to delivery polling — keep busy until phase updates.
			await pollDeliveryResult(selectedEventId, startTime, base);
		} catch (error: unknown) {
			const publishMs = Date.now() - startTime;
			if (axios.isAxiosError(error)) {
				const message =
					(typeof error.response?.data?.message === "string"
						? error.response.data.message
						: null) ?? "Failed to publish test event";
				setResult({
					phase: "publish_error",
					eventType: selectedEventId,
					triggeredAt,
					publishMs,
					apiStatus: error.response?.status ?? null,
					message,
					errorDetail: error.response?.data
						? typeof error.response.data === "string"
							? error.response.data
							: JSON.stringify(error.response.data, null, 2)
						: null,
					delivery: null,
				});
				toast.error(message);
			} else {
				setResult({
					phase: "publish_error",
					eventType: selectedEventId,
					triggeredAt,
					publishMs,
					apiStatus: null,
					message: "An unexpected error occurred",
					errorDetail: null,
					delivery: null,
				});
				toast.error("Failed to publish test event");
			}
		} finally {
			setIsPublishing(false);
		}
	};

	const inactive = !isDeliverable ? inactiveCopy(webhookStatus) : null;

	const deliveryOk =
		result?.phase === "delivered" &&
		result.delivery != null &&
		(result.delivery.status === "success" ||
			isHttpSuccess(result.delivery.responseStatus));

	const resultTone: "success" | "error" | "neutral" | "pending" = (() => {
		if (!result) return "neutral";
		if (result.phase === "publish_error") return "error";
		if (result.phase === "delivered") {
			return deliveryOk ? "success" : "error";
		}
		if (result.phase === "timeout") {
			return result.delivery ? "pending" : "error";
		}
		return "pending";
	})();

	const showBusyPanel = isPublishing || isPolling;

	return (
		<div className="space-y-4">
			{inactive ? (
				<div className="flex flex-col gap-3 rounded-2xl border border-error-base/20 bg-error-lighter/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-error-base/25 dark:bg-error-base/10">
					<div className="flex min-w-0 items-start gap-3">
						<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-error-lighter text-error-base dark:bg-error-base/15">
							<Icon name="alert-circle" className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<p className="font-semibold text-sm text-text-strong-950">
								{inactive.title}
							</p>
							<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
								{inactive.body}
							</p>
						</div>
					</div>
					{onReenable ? (
						<Button.Root
							type="button"
							variant="error"
							mode="lighter"
							size="xsmall"
							disabled={isReenabling || isBusy}
							onClick={() => void onReenable()}
							className="shrink-0 gap-1.5 rounded-xl"
						>
							{isReenabling ? (
								<>
									<Spinner size={14} color="currentColor" />
									Enabling…
								</>
							) : (
								<>
									<Icon name="play" className="h-3.5 w-3.5" />
									{inactive.cta}
								</>
							)}
						</Button.Root>
					) : null}
				</div>
			) : null}

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
				{/* ── Left: Event picker ── */}
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<div className="space-y-3 px-4 pt-4 pb-3">
						<div>
							<Label.Root>
								Event to send
								<Label.Asterisk />
							</Label.Root>
							<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
								Choose one of this webhook&apos;s subscribed event types.
							</p>
						</div>

						<div className="max-h-[min(420px,55vh)] space-y-1 overflow-y-auto pr-0.5">
							{filteredEvents.length === 0 ? (
								<div className="rounded-xl border border-stroke-soft-200 border-dashed px-4 py-8 text-center dark:border-stroke-soft-100/40">
									<p className="font-medium text-sm text-text-strong-950">
										No events subscribed
									</p>
									<p className="mt-0.5 text-[12px] text-text-sub-600">
										Edit the webhook to add events first.
									</p>
								</div>
							) : (
								filteredEvents.map((event) => {
									const isSelected = selectedEventId === event.id;
									const meta = CATEGORY_META[event.category];
									return (
										<button
											key={event.id}
											type="button"
											aria-pressed={isSelected}
											disabled={isBusy}
											onClick={() => handleSelectEvent(event.id)}
											className={cn(
												"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out",
												isBusy && "cursor-not-allowed opacity-60",
												isSelected
													? "border-stroke-soft-200 bg-bg-weak-50 shadow-regular-xs dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40"
													: "border-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-stroke-soft-100/40",
											)}
										>
											<span
												className={cn(
													"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ease-out",
													isSelected
														? "border-text-strong-950 bg-text-strong-950 dark:border-white dark:bg-white"
														: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50",
												)}
												aria-hidden
											>
												{isSelected ? (
													<span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
												) : null}
											</span>
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<span className="font-medium font-mono text-[13px] text-text-strong-950">
														{event.id}
													</span>
													{meta ? (
														<span className="inline-flex items-center gap-1 rounded-md bg-bg-soft-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-bg-weak-50/50">
															<Icon name={meta.icon} className="h-3 w-3" />
															{meta.label}
														</span>
													) : null}
												</div>
												{event.description ? (
													<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
														{event.description}
													</p>
												) : null}
											</div>
										</button>
									);
								})
							)}
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 border-stroke-soft-200 border-t px-4 py-2.5 dark:border-stroke-soft-100/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onCancel}
							disabled={isBusy}
							className="gap-1.5 rounded-xl"
						>
							Cancel
							<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="blue"
							size="xsmall"
							disabled={!canSend}
							onClick={() => void handleTrigger()}
							className="gap-1.5 rounded-xl active:scale-[0.97]"
							title={
								!isDeliverable
									? "Re-enable the webhook before sending a test"
									: undefined
							}
						>
							{isBusy ? (
								<>
									<Spinner size={14} color="currentColor" />
									{isPublishing ? "Sending…" : "Waiting…"}
								</>
							) : (
								<>
									Send test event
									<span className="inline-flex items-center gap-0.5">
										<ActionKbd className={actionKbdOnBlueClassName}>
											{modKey}
										</ActionKbd>
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</span>
								</>
							)}
						</FancyButton.Root>
					</div>
				</div>

				{/* ── Right: Preview / progress / result ── */}
				<div className="min-w-0">
					{showBusyPanel ? (
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
							<div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
								<Spinner size={20} color="currentColor" />
								<p className="font-medium text-sm text-text-strong-950">
									{isPublishing
										? "Publishing test event…"
										: result?.phase === "delivering"
											? "Delivering to your endpoint…"
											: "Waiting for delivery…"}
								</p>
								<p className="max-w-[260px] text-[12px] text-text-sub-600 leading-relaxed">
									{isPublishing ? (
										<>
											Queuing a sample{" "}
											<span className="font-mono text-text-strong-950">
												{selectedEventId}
											</span>{" "}
											payload.
										</>
									) : result?.phase === "delivering" && result.delivery ? (
										<>
											Attempt {result.delivery.attemptNumber || 1}
											{result.delivery.maxAttempts
												? ` of ${result.delivery.maxAttempts}`
												: ""}
											. Polling for the HTTP response.
										</>
									) : (
										<>
											Event published. Watching delivery logs for{" "}
											<span className="font-mono text-text-strong-950">
												{selectedEventId}
											</span>
											.
										</>
									)}
								</p>
							</div>
						</div>
					) : result ? (
						<div
							className={cn(
								"overflow-hidden rounded-[18px] border",
								resultTone === "success" &&
									"border-success-base/25 bg-success-lighter/30 dark:bg-success-base/10",
								resultTone === "error" &&
									"border-error-base/25 bg-error-lighter/30 dark:bg-error-base/10",
								(resultTone === "pending" || resultTone === "neutral") &&
									"border-stroke-soft-200 bg-bg-soft-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20",
							)}
						>
							<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200/60 bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
											resultTone === "success" &&
												"bg-success-lighter text-success-base",
											resultTone === "error" &&
												"bg-error-lighter text-error-base",
											(resultTone === "pending" || resultTone === "neutral") &&
												"bg-bg-weak-50 text-text-sub-600",
										)}
									>
										<Icon
											name={
												resultTone === "success"
													? "check-circle"
													: resultTone === "error"
														? "alert-circle"
														: "clock"
											}
											className="h-4 w-4"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-sm text-text-strong-950">
											{result.phase === "delivered" && deliveryOk
												? "Endpoint responded successfully"
												: result.phase === "delivered"
													? "Delivery failed"
													: result.phase === "timeout"
														? "Timed out waiting"
														: result.message}
										</p>
										<p className="mt-0.5 text-[12px] text-text-sub-600">
											{new Date(result.triggeredAt).toLocaleString()}
											{result.delivery?.durationMs != null
												? ` · ${result.delivery.durationMs}ms`
												: result.publishMs != null
													? ` · publish ${result.publishMs}ms`
													: ""}
											{result.delivery?.responseStatus != null
												? ` · HTTP ${result.delivery.responseStatus}`
												: result.apiStatus != null &&
														result.phase === "publish_error"
													? ` · API ${result.apiStatus}`
													: ""}
										</p>
										{result.phase === "timeout" ||
										(result.phase === "delivered" && !deliveryOk) ? (
											<p className="mt-2 text-[12px] text-text-sub-600 leading-relaxed">
												{result.message}
											</p>
										) : null}
									</div>
								</div>

								{/* Endpoint response / error body */}
								{result.delivery?.responseBody ? (
									<div className="space-y-1.5">
										<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
											Response body
										</p>
										<pre className="max-h-[min(280px,40vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											{result.delivery.responseBody}
										</pre>
									</div>
								) : null}

								{result.delivery?.errorMessage &&
								!result.delivery.responseBody ? (
									<div className="space-y-1.5">
										<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
											Error
										</p>
										<pre className="max-h-[min(200px,30vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											{result.delivery.errorMessage}
										</pre>
									</div>
								) : null}

								{result.errorDetail ? (
									<pre className="max-h-[min(280px,40vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
										{result.errorDetail}
									</pre>
								) : null}

								{result.delivery ? (
									<p className="font-mono text-[11px] text-text-soft-400">
										{result.delivery.id}
										{result.delivery.status
											? ` · ${result.delivery.status}`
											: ""}
										{result.delivery.attemptNumber
											? ` · attempt ${result.delivery.attemptNumber}/${result.delivery.maxAttempts}`
											: ""}
									</p>
								) : null}

								<div className="flex flex-wrap items-center gap-2 pt-0.5">
									{result.phase !== "publish_error" ? (
										<>
											<Button.Root
												type="button"
												variant="neutral"
												mode="stroke"
												size="xsmall"
												asChild
												className="gap-1.5 rounded-xl"
											>
												<Link href={`/webhooks/${webhookId}`}>
													<Icon name="list" className="h-3.5 w-3.5" />
													View delivery logs
												</Link>
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xsmall"
												onClick={() => {
													stopPolling();
													setResult(null);
												}}
												className="gap-1.5 rounded-xl"
											>
												Send another
											</Button.Root>
										</>
									) : (
										<Button.Root
											type="button"
											variant="neutral"
											mode="stroke"
											size="xsmall"
											disabled={!canSend}
											onClick={() => void handleTrigger()}
											className="gap-1.5 rounded-xl"
										>
											<Icon name="refresh-cw" className="h-3.5 w-3.5" />
											Try again
										</Button.Root>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
							<div className="space-y-3 px-4 py-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-semibold text-sm text-text-strong-950">
											Sample request body
										</p>
										<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
											{selectedEvent
												? "JSON envelope POSTed to your endpoint. id and created_at are set when the event is delivered."
												: "Select an event to preview the sample payload."}
										</p>
									</div>
									{selectedEvent ? (
										<span className="shrink-0 rounded-full bg-bg-weak-50 px-2.5 py-1 font-mono text-[11px] text-text-sub-600 dark:bg-bg-weak-50/50">
											{selectedEvent.id}
										</span>
									) : null}
								</div>
								{selectedEvent ? (
									<pre className="max-h-[min(360px,50vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
										{payloadPreview}
									</pre>
								) : (
									<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stroke-soft-200 border-dashed px-4 py-12 text-center dark:border-stroke-soft-100/40">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-weak-50 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/30 dark:ring-stroke-soft-100/40">
											<Icon name="send" className="h-4 w-4 text-text-sub-600" />
										</div>
										<p className="font-medium text-sm text-text-strong-950">
											No event selected
										</p>
										<p className="max-w-[220px] text-[12px] text-text-sub-600 leading-relaxed">
											Pick an event on the left to preview the sample payload.
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
