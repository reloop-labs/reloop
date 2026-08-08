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
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const FORBIDDEN_BROWSER_HEADERS = new Set([
	"user-agent",
	"host",
	"content-length",
	"connection",
	"accept-encoding",
]);

type WebhookStatus = "active" | "paused" | "disabled" | "failed";

interface TriggerWebhookTesterProps {
	webhookId: string;
	webhookEvents?: string[];
	webhookStatus?: WebhookStatus;
	onCancel?: () => void;
	onReenable?: () => void | Promise<void>;
	isReenabling?: boolean;
}

interface DirectTriggerResult {
	phase: "completed" | "sign_error";
	eventType: string;
	triggeredAt: string;
	durationMs: number | null;
	url?: string;
	responseStatus?: number | null;
	responseBody?: string | null;
	errorMessage?: string | null;
	headersSent?: Record<string, string>;
	requestBodySent?: Record<string, unknown>;
	ok: boolean;
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

/** Sample payload preview envelope */
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

export const TriggerWebhookTester = ({
	webhookId,
	webhookEvents,
	webhookStatus = "active",
	onCancel,
	onReenable,
	isReenabling = false,
}: TriggerWebhookTesterProps) => {
	const isDeliverable = webhookStatus === "active";

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
	const [isSending, setIsSending] = useState(false);
	const [result, setResult] = useState<DirectTriggerResult | null>(null);

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

	const canSend =
		Boolean(selectedEventId) &&
		!isSending &&
		!isReenabling &&
		isDeliverable &&
		filteredEvents.length > 0;

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
			if (isSending) return;
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

	const handleSelectEvent = (eventId: string) => {
		if (isSending) return;
		setSelectedEventId(eventId);
		setResult(null);
	};

	const handleTrigger = async () => {
		if (!selectedEventId || !isDeliverable || isSending) return;

		setIsSending(true);
		setResult(null);
		const triggeredAt = new Date().toISOString();

		let signedData: {
			url: string;
			headers: Record<string, string>;
			body: Record<string, unknown>;
			rawBody: string;
		};

		// 1. Get backend signature & headers without storing any event actions/DB logs
		try {
			const res = await axios.post(
				"/api/webhook/v1/sign-test-event",
				{ webhookId, event: selectedEventId, payload },
				{ withCredentials: true },
			);
			signedData = res.data;
		} catch (err: unknown) {
			const msg =
				axios.isAxiosError(err) && err.response?.data?.message
					? err.response.data.message
					: "Failed to sign test event";
			setResult({
				phase: "sign_error",
				eventType: selectedEventId,
				triggeredAt,
				durationMs: null,
				errorMessage: msg,
				ok: false,
			});
			toast.error(msg);
			setIsSending(false);
			return;
		}

		// Prepare headers for browser fetch (filter out restricted browser headers)
		const browserHeaders: Record<string, string> = {};
		for (const [k, v] of Object.entries(signedData.headers)) {
			if (FORBIDDEN_BROWSER_HEADERS.has(k.toLowerCase())) continue;
			browserHeaders[k] = v;
		}

		// 2. Direct client call from browser to target webhook URL
		const startTime = performance.now();
		try {
			const response = await fetch(signedData.url, {
				method: "POST",
				headers: browserHeaders,
				body: signedData.rawBody,
			});

			const durationMs = Math.round(performance.now() - startTime);
			const status = response.status;
			const isOk = response.ok;
			let responseBodyText: string | null = null;
			try {
				responseBodyText = await response.text();
			} catch {
				responseBodyText = null;
			}

			setResult({
				phase: "completed",
				eventType: selectedEventId,
				triggeredAt,
				durationMs,
				url: signedData.url,
				responseStatus: status,
				responseBody: responseBodyText,
				errorMessage: isOk ? null : `Endpoint returned HTTP ${status}`,
				headersSent: browserHeaders,
				requestBodySent: signedData.body,
				ok: isOk,
			});

			if (isOk) {
				toast.success(`Endpoint returned HTTP ${status}`);
			} else {
				toast.error(`Endpoint returned HTTP ${status}`);
			}
		} catch (err: unknown) {
			const durationMs = Math.round(performance.now() - startTime);
			const errorMsg =
				err instanceof Error
					? err.message
					: "Failed to send request directly from browser (Network or CORS error)";

			setResult({
				phase: "completed",
				eventType: selectedEventId,
				triggeredAt,
				durationMs,
				url: signedData.url,
				responseStatus: null,
				responseBody: null,
				errorMessage: `${errorMsg}. Ensure target endpoint allows cross-origin requests or is reachable from your browser.`,
				headersSent: browserHeaders,
				requestBodySent: signedData.body,
				ok: false,
			});
			toast.error("Failed to reach target endpoint directly from browser");
		} finally {
			setIsSending(false);
		}
	};

	const inactive = !isDeliverable ? inactiveCopy(webhookStatus) : null;

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
							disabled={isReenabling || isSending}
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
											disabled={isSending}
											onClick={() => handleSelectEvent(event.id)}
											className={cn(
												"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out",
												isSending && "cursor-not-allowed opacity-60",
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
							disabled={isSending}
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
							{isSending ? (
								<>
									<Spinner size={14} color="currentColor" />
									Sending from browser…
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

				{/* ── Right: Preview / result ── */}
				<div className="min-w-0">
					{isSending ? (
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
							<div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
								<Spinner size={20} color="currentColor" />
								<p className="font-medium text-sm text-text-strong-950">
									Sending test event from client browser…
								</p>
								<p className="max-w-[260px] text-[12px] text-text-sub-600 leading-relaxed">
									Signing payload on backend and invoking endpoint directly from
									your browser.
								</p>
							</div>
						</div>
					) : result ? (
						<div
							className={cn(
								"overflow-hidden rounded-[18px] border",
								result.ok
									? "border-success-base/25 bg-success-lighter/30 dark:bg-success-base/10"
									: "border-error-base/25 bg-error-lighter/30 dark:bg-error-base/10",
							)}
						>
							<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200/60 bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
											result.ok
												? "bg-success-lighter text-success-base"
												: "bg-error-lighter text-error-base",
										)}
									>
										<Icon
											name={result.ok ? "check-circle" : "alert-circle"}
											className="h-4 w-4"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-sm text-text-strong-950">
											{result.ok
												? "Endpoint responded successfully"
												: result.phase === "sign_error"
													? "Signing failed"
													: "Delivery failed"}
										</p>
										<p className="mt-0.5 text-[12px] text-text-sub-600">
											{new Date(result.triggeredAt).toLocaleString()}
											{result.durationMs != null
												? ` · ${result.durationMs}ms`
												: ""}
											{result.responseStatus != null
												? ` · HTTP ${result.responseStatus}`
												: ""}
										</p>
										{result.url ? (
											<p className="mt-1 truncate font-mono text-[11px] text-text-sub-600">
												Target: {result.url}
											</p>
										) : null}
									</div>
								</div>

								{/* Error message */}
								{result.errorMessage ? (
									<div className="space-y-1.5">
										<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
											Details
										</p>
										<pre className="max-h-[min(200px,30vh)] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											{result.errorMessage}
										</pre>
									</div>
								) : null}

								{/* Response body */}
								{result.responseBody ? (
									<div className="space-y-1.5">
										<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
											Response body
										</p>
										<pre className="max-h-[min(280px,40vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											{result.responseBody}
										</pre>
									</div>
								) : null}

								{/* Request headers sent */}
								{result.headersSent &&
								Object.keys(result.headersSent).length > 0 ? (
									<div className="space-y-1.5">
										<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
											Headers sent from client
										</p>
										<pre className="max-h-[min(180px,25vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											{JSON.stringify(result.headersSent, null, 2)}
										</pre>
									</div>
								) : null}

								<div className="flex flex-wrap items-center gap-2 pt-0.5">
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="xsmall"
										onClick={() => setResult(null)}
										className="gap-1.5 rounded-xl"
									>
										Send another
									</Button.Root>
									<Button.Root
										type="button"
										variant="neutral"
										mode="ghost"
										size="xsmall"
										asChild
										className="gap-1.5 rounded-xl"
									>
										<Link href={`/webhooks/${webhookId}`}>
											<Icon name="list" className="h-3.5 w-3.5" />
											View delivery logs
										</Link>
									</Button.Root>
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
												? "Signed JSON envelope POSTed directly from browser to your endpoint."
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
