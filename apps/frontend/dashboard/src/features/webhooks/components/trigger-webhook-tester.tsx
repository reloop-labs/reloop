import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { ACTIVE_WEBHOOK_EVENTS, WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface TriggerWebhookTesterProps {
	webhookId: string;
	webhookEvents?: string[];
	onCancel?: () => void;
}

interface TriggerResult {
	status: number | null;
	responseBody: string | null;
	durationMs: number | null;
	triggeredAt: string | null;
	error: string | null;
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
	email: { label: "Email", icon: "mail-send" },
	domain: { label: "Domains", icon: "globe" },
	"api-key": { label: "API Keys", icon: "key-new" },
	contact: { label: "Contacts", icon: "contacts" },
	other: { label: "Other", icon: "webhook" },
};

const getPayloadForEvent = (eventId: string): Record<string, unknown> => {
	if (eventId.startsWith("email.")) {
		return {
			email_id: "em_test_a1b2c3",
			from: "hello@example.com",
			to: ["user@example.com"],
			subject: "Test email event",
			status: eventId.replace("email.", ""),
			...(eventId === "email.bounced" ||
			eventId === "email.delivery_delayed" ||
			eventId === "email.complained"
				? {
						error: {
							code: 550,
							message: "Simulated failure for webhook test",
						},
					}
				: {}),
		};
	}
	return {
		id: `evt_${Math.random().toString(36).substring(2, 12)}`,
		type: eventId,
	};
};

export const TriggerWebhookTester = ({
	webhookId,
	webhookEvents,
	onCancel,
}: TriggerWebhookTesterProps) => {
	const invalidate = useInvalidateWebhooks();

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
	const [isTriggering, setIsTriggering] = useState(false);
	const [result, setResult] = useState<TriggerResult | null>(null);

	const selectedEvent = useMemo(
		() => filteredEvents.find((e) => e.id === selectedEventId),
		[filteredEvents, selectedEventId],
	);

	const payload = useMemo(() => {
		if (!selectedEvent) return {};
		return getPayloadForEvent(selectedEvent.id);
	}, [selectedEvent]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!isTriggering && selectedEventId) void handleTrigger();
		},
		{ enableOnFormTags: true },
	);

	const modKey =
		typeof navigator !== "undefined" &&
		/Mac|iPhone|iPod|iPad/i.test(navigator.platform)
			? "⌘"
			: "Ctrl";

	const handleSelectEvent = (eventId: string) => {
		setSelectedEventId(eventId);
		setResult(null);
	};

	const handleTrigger = async () => {
		if (!selectedEventId) return;
		setIsTriggering(true);
		setResult(null);
		const startTime = Date.now();
		try {
			const response = await axios.post(
				"/api/webhook/v1/trigger",
				{ webhookId, event: selectedEventId, payload },
				{ withCredentials: true },
			);
			setResult({
				status: response.status,
				responseBody:
					typeof response.data === "string"
						? response.data
						: JSON.stringify(response.data, null, 2),
				durationMs: Date.now() - startTime,
				triggeredAt: new Date().toISOString(),
				error: null,
			});
			toast.success("Test event triggered successfully");
			await invalidate();
		} catch (error: unknown) {
			const durationMs = Date.now() - startTime;
			if (axios.isAxiosError(error)) {
				setResult({
					status: error.response?.status ?? null,
					responseBody: error.response?.data
						? typeof error.response.data === "string"
							? error.response.data
							: JSON.stringify(error.response.data, null, 2)
						: null,
					durationMs,
					triggeredAt: new Date().toISOString(),
					error: error.response?.data?.message ?? "Request failed",
				});
				toast.error(
					error.response?.data?.message ?? "Failed to trigger test event",
				);
			} else {
				setResult({
					status: null,
					responseBody: null,
					durationMs,
					triggeredAt: new Date().toISOString(),
					error: "An unexpected error occurred",
				});
				toast.error("Failed to trigger test event");
			}
		} finally {
			setIsTriggering(false);
		}
	};

	const isSuccess =
		result?.status != null && result.status >= 200 && result.status < 300;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
				{/* ── Left: Event picker ── */}
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
					<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 pt-4 pb-3 dark:border-stroke-soft-100/40">
						<div className="flex items-start justify-between gap-3">
							<div>
								<Label.Root>
									Event to send
									<Label.Asterisk />
								</Label.Root>
								<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
									Choose one of this webhook&apos;s subscribed event types.
								</p>
							</div>
							{selectedEvent ? (
								<span className="shrink-0 rounded-full bg-bg-weak-50 px-2.5 py-1 font-mono text-[11px] text-text-sub-600 dark:bg-bg-weak-50/50">
									{selectedEvent.id}
								</span>
							) : null}
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
											onClick={() => handleSelectEvent(event.id)}
											className={cn(
												"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
												isSelected
													? "border-stroke-soft-200 bg-bg-weak-50 shadow-regular-xs dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40"
													: "border-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-stroke-soft-100/40",
											)}
										>
											<span
												className={cn(
													"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
													isSelected
														? "border-text-strong-950 bg-text-strong-950 dark:border-white dark:bg-white"
														: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50",
												)}
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
					<div className="flex items-center justify-end gap-2 px-4 py-2.5">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onCancel}
							disabled={isTriggering}
							className="gap-1.5 rounded-xl"
						>
							Cancel
							<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="blue"
							size="xsmall"
							disabled={isTriggering || !selectedEventId}
							onClick={() => void handleTrigger()}
							className="gap-1.5 rounded-xl"
						>
							{isTriggering ? (
								<>
									<Spinner size={14} color="currentColor" />
									Sending...
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

				{/* ── Right: Delivery result ── */}
				<div className="min-w-0">
					{result ? (
						<div
							className={cn(
								"overflow-hidden rounded-[18px] border",
								isSuccess
									? "border-success-base/25 bg-success-lighter/30 dark:bg-success-base/10"
									: "border-error-base/25 bg-error-lighter/30 dark:bg-error-base/10",
							)}
						>
							<div className="m-0.5 space-y-3 rounded-2xl border border-stroke-soft-200/60 bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
											isSuccess
												? "bg-success-lighter text-success-base"
												: "bg-error-lighter text-error-base",
										)}
									>
										<Icon
											name={isSuccess ? "check-circle" : "alert-circle"}
											className="h-4 w-4"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-sm text-text-strong-950">
											{isSuccess
												? "Event delivered successfully"
												: (result.error ?? "Delivery failed")}
										</p>
										<p className="mt-0.5 text-[12px] text-text-sub-600">
											{result.triggeredAt
												? new Date(result.triggeredAt).toLocaleString()
												: ""}
											{result.durationMs != null
												? ` · ${result.durationMs}ms`
												: ""}
											{result.status != null ? ` · HTTP ${result.status}` : ""}
										</p>
									</div>
								</div>
								{result.responseBody ? (
									<pre className="max-h-[min(360px,50vh)] overflow-auto rounded-xl bg-bg-weak-50 p-3 font-mono text-[11px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
										{result.responseBody}
									</pre>
								) : null}
							</div>
						</div>
					) : (
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 border-dashed bg-bg-soft-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
							<div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-white-0 ring-1 ring-stroke-soft-100 dark:bg-bg-white-0/5 dark:ring-stroke-soft-100/40">
									<Icon name="send" className="h-4 w-4 text-text-sub-600" />
								</div>
								<p className="font-medium text-sm text-text-strong-950">
									Ready to send
								</p>
								<p className="max-w-[220px] text-[12px] text-text-sub-600 leading-relaxed">
									Pick an event, then send a test delivery.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
