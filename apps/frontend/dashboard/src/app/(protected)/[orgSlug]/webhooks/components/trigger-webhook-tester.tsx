"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface TriggerWebhookTesterProps {
	webhookId: string;
	webhookEvents?: string[];
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

const categoryBadgeColors: Record<string, { light: string; dark: string }> = {
	domain: { light: "bg-[#0A438A]", dark: "dark:bg-[#1E57A8]" },
	"api-key": { light: "bg-[#8A5A0A]", dark: "dark:bg-[#A87A1E]" },
	contact: { light: "bg-[#0A6B3A]", dark: "dark:bg-[#1E8A4E]" },
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
	webhookEvents,
}: TriggerWebhookTesterProps) => {
	const filteredEvents = useMemo(() => {
		if (webhookEvents) {
			return WEBHOOK_EVENTS.filter((e) => webhookEvents.includes(e.id));
		}
		return WEBHOOK_EVENTS;
	}, [webhookEvents]);

	const [selectedEventId, setSelectedEventId] = useState<string>(
		filteredEvents[0]?.id || "",
	);
	const [activeTab, setActiveTab] = useState<Tab>("timeline");

	useEffect(() => {
		if (!selectedEventId && filteredEvents.length > 0) {
			setSelectedEventId(filteredEvents[0].id);
		} else if (
			selectedEventId &&
			webhookEvents &&
			!webhookEvents.includes(selectedEventId)
		) {
			if (filteredEvents.length > 0) setSelectedEventId(filteredEvents[0].id);
		}
	}, [selectedEventId, filteredEvents, webhookEvents]);

	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [isTriggering, setIsTriggering] = useState(false);
	const [result, setResult] = useState<TriggerResult | null>(null);
	const [isCopyingPayload, setIsCopyingPayload] = useState(false);

	const selectedEvent = useMemo(
		() => filteredEvents.find((e) => e.id === selectedEventId),
		[filteredEvents, selectedEventId],
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

	const tabs: { id: Tab; label: string; iconName: string }[] = [
		{ id: "timeline", label: "Timeline", iconName: "activity" },
		{ id: "response", label: "Response", iconName: "code" },
		{ id: "headers", label: "Headers", iconName: "list" },
	];

	const activeIndex = tabs.findIndex((t) => t.id === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const currentTabEl = buttonRefs.current[currentIdx];
	const rect = currentTabEl?.getBoundingClientRect();

	const isSuccess =
		result?.status != null && result.status >= 200 && result.status < 300;

	return (
		<div className="flex flex-col gap-6 pb-12">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* ── Left: Event selector + Payload ── */}
				<div className="flex min-h-0 flex-col gap-4">
					{/* Event list */}
					<div className="flex flex-col gap-2">
						<p className="px-1 font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Choose event type
						</p>
						<div className="flex max-h-72 flex-col overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
							{filteredEvents.map((event, i) => {
								const isSelected = selectedEventId === event.id;
								const isLast = i === filteredEvents.length - 1;
								return (
									<button
										key={event.id}
										type="button"
										aria-pressed={isSelected}
										onClick={() => handleSelectEvent(event.id)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-weak-50/50",
											isSelected && "bg-bg-weak-50/60",
											!isLast &&
												"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
										)}
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<div
												className={cn(
													"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
													isSelected
														? "border-primary-base bg-primary-base"
														: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40",
												)}
											>
												{isSelected && (
													<div className="h-1.5 w-1.5 rounded-full bg-white" />
												)}
											</div>
											<span className="truncate font-medium text-label-sm text-text-strong-950">
												{event.name}
											</span>
										</div>
										<div
											className={cn(
												"ml-3 shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[10px] text-white",
												categoryBadgeColors[event.category]?.light,
												categoryBadgeColors[event.category]?.dark,
											)}
										>
											{event.category
												.replace("-", " ")
												.replace(/\b\w/g, (c) => c.toUpperCase())}
										</div>
									</button>
								);
							})}
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
					<div className="border-stroke-soft-200 border-b bg-bg-weak-50 px-2">
						<TabMenuHorizontal.Root
							value={activeTab}
							onValueChange={(val) => setActiveTab(val as Tab)}
						>
							<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! border-transparent! py-0">
								{tabs.map((tab, index) => (
									<TabMenuHorizontal.Trigger
										key={tab.id}
										value={tab.id}
										ref={(el) => {
											if (el) {
												buttonRefs.current[index] = el;
											}
										}}
										onPointerEnter={() => setHoveredIdx(index)}
										onPointerLeave={() => setHoveredIdx(undefined)}
										className={cn(
											"flex cursor-pointer items-center gap-2 px-2.5 py-0! text-sm transition-colors",
											hoveredIdx === undefined && activeIndex === index
												? "text-text-strong-950"
												: "text-text-sub-600",
										)}
									>
										<Icon name={tab.iconName} className="h-4 w-4" />
										{tab.label}
									</TabMenuHorizontal.Trigger>
								))}
								<AnimatePresence>
									{rect && activeIndex !== -1 ? (
										<motion.div
											className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
											initial={{
												pointerEvents: "none",
												width: rect.width,
												height: rect.height - 20,
												left:
													rect.left -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.left || 0),
												top:
													rect.top -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.top || 0) +
													10,
												opacity: 0,
											}}
											animate={{
												pointerEvents: "none",
												width: rect.width,
												height: rect.height - 20,
												left:
													rect.left -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.left || 0),
												top:
													rect.top -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.top || 0) +
													10,
												opacity: 1,
											}}
											exit={{
												pointerEvents: "none",
												opacity: 0,
												width: rect.width,
												height: rect.height - 20,
												left:
													rect.left -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.left || 0),
												top:
													rect.top -
													(currentTabEl?.offsetParent?.getBoundingClientRect()
														.top || 0) +
													10,
											}}
											transition={{ duration: 0.14 }}
										/>
									) : null}
								</AnimatePresence>
							</TabMenuHorizontal.List>
						</TabMenuHorizontal.Root>
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
