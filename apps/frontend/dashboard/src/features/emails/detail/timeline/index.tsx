"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Fragment, useMemo } from "react";
import { formatTimelineDate } from "./timeline-flow-node";
import type { EmailEvent } from "./types";

export function EmailTimeline({
	events,
	sentAt,
	deliveredAt,
	failedAt,
	errorMessage,
	onDeliveredClick,
}: {
	events: EmailEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
	failedAt?: string | null;
	errorMessage?: string | null;
	/** Open delivered details sidebar when the completed Delivered step is clicked */
	onDeliveredClick?: () => void;
}) {
	const isFailed = useMemo(() => {
		return (
			!!errorMessage ||
			!!failedAt ||
			events.some(
				(e) =>
					e.type === "bounced" || e.type === "failed" || e.type === "complaint",
			)
		);
	}, [errorMessage, failedAt, events]);

	// Synthesize events for sent, delivered, and failed if they don't exist in the events array
	const allEvents = useMemo(() => {
		const list = [...(events || [])];

		if (sentAt && !list.find((e) => e.type === "sent")) {
			list.push({
				id: "synth-sent",
				type: "sent",
				createdAt: sentAt,
				metadata: {},
			});
		}

		const bounceEvent = list.find(
			(e) =>
				e.type === "bounced" || e.type === "complaint" || e.type === "failed",
		);

		if (isFailed && bounceEvent && bounceEvent.type !== "failed") {
			list.push({
				...bounceEvent,
				id: `${bounceEvent.id}-as-failed`,
				type: "failed",
			});
		} else if (isFailed && !bounceEvent) {
			list.push({
				id: "synth-failed",
				type: "failed",
				createdAt: failedAt || sentAt || new Date().toISOString(),
				metadata: {},
			});
		}

		if (!isFailed && deliveredAt && !list.find((e) => e.type === "delivered")) {
			list.push({
				id: "synth-delivered",
				type: "delivered",
				createdAt: deliveredAt,
				metadata: {},
			});
		}

		return list;
	}, [events, sentAt, isFailed, failedAt, deliveredAt]);

	const steps = useMemo(() => {
		if (isFailed) {
			return [
				{
					id: "sent",
					stepType: "sent",
					label: "Sent",
					icon: "send-1",
				},
				{
					id: "failed",
					stepType: "failed",
					label: "Failed",
					icon: "cross-circle",
				},
			];
		}
		return [
			{
				id: "sent",
				stepType: "sent",
				label: "Sent",
				icon: "send-1",
			},
			{
				id: "delivered",
				stepType: "delivered",
				label: "Delivered",
				icon: "check-circle",
				onClick: onDeliveredClick,
				isInteractive: !!onDeliveredClick,
			},
			{
				id: "opened",
				stepType: "opened",
				label: "Opened",
				icon: "eye-outline",
			},
			{
				id: "clicked",
				stepType: "clicked",
				label: "Clicked",
				icon: "cursor-click",
			},
		];
	}, [isFailed, onDeliveredClick]);

	return (
		<div className="relative flex h-[128px] w-full items-center justify-start rounded-3xl border border-stroke-soft-100 bg-bg-white-0 px-8 py-4 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5">
			<div
				className={cn(
					"flex items-center",
					isFailed
						? "w-64 justify-between"
						: "w-full max-w-2xl justify-between",
				)}
			>
				{steps.map((step, index) => {
					const event = allEvents.find((e) => e.type === step.stepType);
					const isCompleted = !!event;
					const timestamp = event?.createdAt;
					const formattedTime = formatTimelineDate(timestamp);

					const getIconStyles = () => {
						if (!isCompleted) {
							return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
						}
						switch (step.stepType) {
							case "sent":
								return "border-information-base/20 bg-information-lighter/50 text-information-base";
							case "failed":
							case "bounced":
							case "complaint":
								return "border-error-light bg-error-lighter text-error-base";
							case "delivered":
								return cn(
									"border-success-base/20 bg-success-lighter/50 text-success-base",
									step.isInteractive &&
										"group-hover:border-success-base/40 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]",
								);
							case "opened":
								return "border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
							case "clicked":
								return "border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
							default:
								return "border-information-base/20 bg-information-lighter/50 text-information-base";
						}
					};

					const getBadgeStyles = () => {
						if (!isCompleted) {
							return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900 dark:text-neutral-400";
						}
						switch (step.stepType) {
							case "sent":
								return "bg-information-lighter text-information-base";
							case "failed":
							case "bounced":
							case "complaint":
								return "bg-error-lighter text-error-base";
							case "delivered":
								return cn(
									"bg-success-lighter text-success-base",
									step.isInteractive && "group-hover:underline",
								);
							case "opened":
								return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
							case "clicked":
								return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
							default:
								return "bg-information-lighter text-information-base";
						}
					};

					const nodeBody = (
						<div className="flex flex-col items-center gap-2">
							<div
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-300",
									getIconStyles(),
								)}
							>
								<Icon name={step.icon} className="h-5 w-5" />
							</div>

							<div className="flex flex-col items-center text-center">
								<span
									className={cn(
										"rounded-md px-2 py-1 font-semibold text-xs transition-colors duration-300",
										getBadgeStyles(),
									)}
								>
									{step.label}
								</span>
								{isCompleted && formattedTime && (
									<span className="mt-1 whitespace-nowrap font-medium text-text-soft-400 text-xs">
										{formattedTime}
									</span>
								)}
							</div>
						</div>
					);

					return (
						<Fragment key={step.id}>
							<div className="flex min-w-[90px] flex-col items-center">
								{step.isInteractive && step.onClick ? (
									<button
										type="button"
										onClick={step.onClick}
										className="group flex flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-success-base/40"
										aria-label={`View ${step.label} details`}
									>
										{nodeBody}
									</button>
								) : (
									<div className="group flex flex-col items-center">
										{nodeBody}
									</div>
								)}
							</div>
							{index < steps.length - 1 && (
								<div className="-mt-8 h-0 flex-1 border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800" />
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
