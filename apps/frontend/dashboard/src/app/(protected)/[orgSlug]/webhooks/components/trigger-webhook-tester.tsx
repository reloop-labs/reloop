"use client";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface TriggerWebhookTesterProps {
	webhookId: string;
	webhookName?: string;
	webhookUrl?: string;
}

type Tab = "timeline" | "response" | "headers";

interface TriggerResult {
	status: number | null;
	responseBody: string | null;
	responseHeaders: Record<string, string> | null;
	durationMs: number | null;
	triggeredAt: string | null;
	error: string | null;
}

const categoryColors: Record<string, "blue" | "orange" | "green" | "gray"> = {
	domain: "blue",
	"api-key": "orange",
	contact: "green",
};

const getPayloadForEvent = (
	eventId: string,
	category: string,
): Record<string, unknown> => {
	const base = {
		id: `evt_${Math.random().toString(36).substring(2, 12)}`,
		type: eventId,
		created: Math.floor(Date.now() / 1000),
	};
	if (category === "domain") {
		return {
			...base,
			data: {
				domain_id: "dom_a1b2c3d4",
				name: "example.com",
				status: "active",
			},
		};
	}
	if (category === "api-key") {
		return {
			...base,
			data: {
				api_key_id: "key_x1y2z3",
				name: "Production Key",
				prefix: "sk_live_",
			},
		};
	}
	if (category === "contact") {
		return {
			...base,
			data: {
				contact_id: "ctr_q1w2e3",
				email: "jane@example.com",
				name: "Jane Doe",
			},
		};
	}
	return { ...base, data: {} };
};

export const TriggerWebhookTester = ({
	webhookId,
	webhookName,
	webhookUrl,
}: TriggerWebhookTesterProps) => {
	const [selectedEventId, setSelectedEventId] = useState<string>(
		WEBHOOK_EVENTS[0].id,
	);
	const [activeTab, setActiveTab] = useState<Tab>("timeline");
	const [isTriggering, setIsTriggering] = useState(false);
	const [result, setResult] = useState<TriggerResult | null>(null);
	const [isCopyingPayload, setIsCopyingPayload] = useState(false);

	const selectedEvent = useMemo(
		() => WEBHOOK_EVENTS.find((e) => e.id === selectedEventId),
		[selectedEventId],
	);

	const payload = useMemo(() => {
		if (!selectedEvent) return {};
		return getPayloadForEvent(selectedEvent.id, selectedEvent.category);
	}, [selectedEvent]);

	const payloadString = JSON.stringify(payload, null, 2);

	const handleSelectEvent = (eventId: string) => {
		setSelectedEventId(eventId);
		setResult(null);
	};

	const handleCopyPayload = async () => {
		try {
			await navigator.clipboard.writeText(payloadString);
			setIsCopyingPayload(true);
			setTimeout(() => setIsCopyingPayload(false), 2000);
		} catch {
			toast.error("Failed to copy payload");
		}
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
			const durationMs = Date.now() - startTime;
			setResult({
				status: response.status,
				responseBody:
					typeof response.data === "string"
						? response.data
						: JSON.stringify(response.data, null, 2),
				responseHeaders: response.headers as Record<string, string>,
				durationMs,
				triggeredAt: new Date().toISOString(),
				error: null,
			});
			setActiveTab("response");
			toast.success("Test event triggered successfully");
			await mutate(
				(key) => typeof key === "string" && key.includes("/deliveries"),
				undefined,
				{ revalidate: true },
			);
		} catch (error: unknown) {
			const durationMs = Date.now() - startTime;
			if (axios.isAxiosError(error)) {
				const status = error.response?.status ?? null;
				setResult({
					status,
					responseBody: error.response?.data
						? typeof error.response.data === "string"
							? error.response.data
							: JSON.stringify(error.response.data, null, 2)
						: null,
					responseHeaders:
						(error.response?.headers as Record<string, string>) ?? null,
					durationMs,
					triggeredAt: new Date().toISOString(),
					error: error.response?.data?.message ?? "Request failed",
				});
				setActiveTab("response");
				toast.error(
					error.response?.data?.message ?? "Failed to trigger test event",
				);
			} else {
				setResult({
					status: null,
					responseBody: null,
					responseHeaders: null,
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

	const groupedEvents = useMemo(() => {
		const groups: Record<string, (typeof WEBHOOK_EVENTS)[number][]> = {};
		for (const event of WEBHOOK_EVENTS) {
			const group = groups[event.category] ?? [];
			group.push(event);
			groups[event.category] = group;
		}
		return groups;
	}, []);

	const tabs: { id: Tab; label: string }[] = [
		{ id: "timeline", label: "Timeline" },
		{ id: "response", label: "Response" },
		{ id: "headers", label: "Headers" },
	];

	const isSuccess =
		result?.status != null && result.status >= 200 && result.status < 300;

	return (
		<div className="flex flex-col gap-6 pb-12">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* ── Left: Event selector + Payload ── */}
				<div className="flex min-h-0 flex-col gap-4">
					{/* Send test event card */}
					<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
						{/* Card header */}
						<div className="border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3">
							<p className="font-semibold text-paragraph-xs text-text-strong-950">
								Send test event
							</p>
							{(webhookName || webhookUrl) && (
								<p className="mt-0.5 truncate font-medium text-paragraph-xs text-text-sub-600">
									{webhookName && <span>{webhookName}</span>}
									{webhookName && webhookUrl && (
										<span className="mx-1 text-text-soft-400">·</span>
									)}
									{webhookUrl && (
										<span className="font-mono text-[11px]">{webhookUrl}</span>
									)}
								</p>
							)}
						</div>

						{/* Event list */}
						<div className="p-3">
							<p className="mb-2 px-1 font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Choose event type
							</p>
							<div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
								{Object.entries(groupedEvents).map(([category, events]) => (
									<div key={category}>
										<p className="mt-2 mb-1 px-2 font-medium text-[9px] text-text-soft-400 uppercase tracking-widest first:mt-0">
											{category}
										</p>
										{events.map((event) => {
											const isSelected = selectedEventId === event.id;
											return (
												<button
													key={event.id}
													type="button"
													onClick={() => handleSelectEvent(event.id)}
													className={cn(
														"flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
														isSelected
															? "border-primary-base bg-primary-lighter"
															: "border-transparent hover:bg-bg-weak-50",
													)}
												>
													{/* Radio */}
													<div
														className={cn(
															"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
															isSelected
																? "border-primary-base bg-primary-base"
																: "border-stroke-soft-200 bg-bg-white-0",
														)}
													>
														{isSelected && (
															<div className="h-1.5 w-1.5 rounded-full bg-white" />
														)}
													</div>
													{/* Text */}
													<div className="min-w-0 flex-1">
														<p
															className={cn(
																"truncate font-medium text-paragraph-xs",
																isSelected
																	? "text-primary-base"
																	: "text-text-strong-950",
															)}
														>
															{event.name}
														</p>
														<p className="truncate text-[11px] text-text-sub-600">
															{event.description}
														</p>
													</div>
													{/* Badge */}
													<Badge.Root
														size="small"
														variant="lighter"
														color={categoryColors[event.category] ?? "gray"}
														className="shrink-0 capitalize"
													>
														{event.category}
													</Badge.Root>
												</button>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Payload card */}
					<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
						<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3">
							<p className="font-semibold text-paragraph-xs text-text-strong-950">
								Payload
							</p>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xxsmall"
								className="h-7 w-7 p-0"
								onClick={handleCopyPayload}
								title="Copy payload"
							>
								<Icon
									name={isCopyingPayload ? "check" : "copy"}
									className={cn(
										"h-3.5 w-3.5 transition-colors",
										isCopyingPayload
											? "text-success-base"
											: "text-text-sub-600",
									)}
								/>
							</Button.Root>
						</div>
						<pre className="overflow-x-auto bg-bg-weak-25 p-4 font-mono text-[12px] text-text-strong-950 leading-relaxed">
							{payloadString}
						</pre>
					</div>

					{/* Send button */}
					<Button.Root
						variant="primary"
						size="small"
						className="w-full font-semibold"
						onClick={handleTrigger}
						disabled={isTriggering || !selectedEventId}
					>
						{isTriggering ? (
							<Icon name="refresh-cw" className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Icon name="send" className="mr-2 h-4 w-4" />
						)}
						{isTriggering ? "Sending..." : "Send test"}
					</Button.Root>
				</div>

				{/* ── Right: Response panel ── */}
				<div className="flex flex-col overflow-hidden rounded-xl border border-stroke-soft-200">
					{/* Tabs bar */}
					<div className="flex items-center border-stroke-soft-200 border-b bg-bg-weak-50 px-2">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"relative px-3 py-3 font-medium text-paragraph-xs transition-colors",
									activeTab === tab.id
										? "text-text-strong-950"
										: "text-text-sub-600 hover:text-text-strong-950",
								)}
							>
								{tab.label}
								{activeTab === tab.id && (
									<span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-text-strong-950" />
								)}
							</button>
						))}
					</div>

					{/* Panel body */}
					<div className="flex flex-1 flex-col bg-bg-white-0 p-4">
						{!result ? (
							/* Empty state */
							<div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-weak-50">
									<Icon name="send" className="h-5 w-5 text-text-sub-600" />
								</div>
								<div className="text-center">
									<p className="font-semibold text-paragraph-sm text-text-strong-950">
										Ready to send
									</p>
									<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
										Pick an event and hit Send test
									</p>
								</div>
							</div>
						) : (
							<div className="flex flex-1 flex-col gap-3">
								{/* Timeline */}
								{activeTab === "timeline" && (
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-25 px-4 py-3">
											<div
												className={cn(
													"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
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
												<p className="font-semibold text-paragraph-xs text-text-strong-950">
													{isSuccess
														? "Event delivered successfully"
														: (result.error ?? "Delivery failed")}
												</p>
												<p className="text-[11px] text-text-sub-600">
													{result.triggeredAt
														? new Date(result.triggeredAt).toLocaleTimeString()
														: ""}
													{result.durationMs != null
														? ` · ${result.durationMs}ms`
														: ""}
												</p>
											</div>
											{result.status != null && (
												<span
													className={cn(
														"shrink-0 font-mono font-semibold text-sm",
														isSuccess ? "text-success-base" : "text-error-base",
													)}
												>
													{result.status}
												</span>
											)}
										</div>

										<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-25 px-4 py-3">
											<p className="mb-1 font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
												Event
											</p>
											<p className="font-medium font-mono text-paragraph-xs text-text-strong-950">
												{selectedEvent?.name}
											</p>
										</div>

										<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-25 px-4 py-3">
											<p className="mb-1 font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
												Sent at
											</p>
											<p className="font-medium text-paragraph-xs text-text-strong-950">
												{result.triggeredAt
													? new Date(result.triggeredAt).toLocaleString()
													: "—"}
											</p>
										</div>
									</div>
								)}

								{/* Response */}
								{activeTab === "response" && (
									<div className="flex flex-col gap-3">
										<div className="flex items-center justify-between">
											<p className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
												Response body
											</p>
											{result.status != null && (
												<span
													className={cn(
														"font-mono font-semibold text-xs",
														isSuccess ? "text-success-base" : "text-error-base",
													)}
												>
													{result.status}
												</span>
											)}
										</div>
										{result.responseBody ? (
											<pre className="overflow-x-auto rounded-lg bg-bg-weak-25 p-3 font-mono text-[12px] text-text-strong-950 leading-relaxed">
												{result.responseBody}
											</pre>
										) : (
											<p className="py-6 text-center text-paragraph-xs text-text-sub-600 italic">
												No response body
											</p>
										)}
									</div>
								)}

								{/* Headers */}
								{activeTab === "headers" && (
									<div className="flex flex-col gap-3">
										<p className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
											Response headers
										</p>
										{result.responseHeaders &&
										Object.keys(result.responseHeaders).length > 0 ? (
											<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
												{Object.entries(result.responseHeaders).map(
													([key, value], idx, arr) => (
														<div
															key={key}
															className={cn(
																"flex items-start gap-4 px-4 py-2.5",
																idx < arr.length - 1 &&
																	"border-stroke-soft-200 border-b",
															)}
														>
															<span className="w-40 shrink-0 font-mono text-[11px] text-text-sub-600">
																{key}
															</span>
															<span className="min-w-0 break-all font-mono text-[11px] text-text-strong-950">
																{value}
															</span>
														</div>
													),
												)}
											</div>
										) : (
											<p className="py-6 text-center text-paragraph-xs text-text-sub-600 italic">
												No response headers
											</p>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
