"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { Fragment, useMemo } from "react";
import { formatTimelineDate } from "./timeline-flow-node";
import type { EmailEvent } from "./types";

type TimelineStep = {
	id: string;
	stepType: string;
	label: string;
	icon: string;
	onClick?: () => void;
	isInteractive?: boolean;
};

export function EmailTimeline({
	events,
	sentAt,
	deliveredAt,
	failedAt,
	errorMessage,
	isLoading = false,
	onSentClick,
	onDeliveredClick,
	onOpenedClick,
	onClickedClick,
}: {
	events: EmailEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
	failedAt?: string | null;
	errorMessage?: string | null;
	isLoading?: boolean;
	/** Open the reception (SMTP) details when the Sent step is clicked */
	onSentClick?: () => void;
	/** Open delivered details sidebar when the completed Delivered step is clicked */
	onDeliveredClick?: () => void;
	/** Open the opens drawer when the completed Opened step is clicked */
	onOpenedClick?: () => void;
	/** Open the clicks drawer when the completed Clicked step is clicked */
	onClickedClick?: () => void;
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

	const steps = useMemo<TimelineStep[]>(() => {
		if (isFailed) {
			return [
				{
					id: "sent",
					stepType: "sent",
					label: "Sent",
					icon: "send-1",
					onClick: onSentClick,
					isInteractive: !!onSentClick,
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
				onClick: onSentClick,
				isInteractive: !!onSentClick,
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
				icon: "mail-open",
				onClick: onOpenedClick,
				isInteractive: !!onOpenedClick,
			},
			{
				id: "clicked",
				stepType: "clicked",
				label: "Clicked",
				icon: "cursor-click",
				onClick: onClickedClick,
				isInteractive: !!onClickedClick,
			},
		];
	}, [isFailed, onSentClick, onDeliveredClick, onOpenedClick, onClickedClick]);

	const rows = steps.map((step) => {
		// Apple Mail Privacy Protection and link scanners aren't a person
		// reading: the Opened/Clicked steps use the first human event.
		const event = allEvents.find(
			(e) =>
				e.type === step.stepType &&
				(e.metadata as { machine?: boolean } | null)?.machine !== true,
		);
		return {
			...step,
			isCompleted: !!event,
			formattedTime: formatTimelineDate(event?.createdAt),
		};
	});

	return (
		<div className="relative flex w-full items-center justify-start transition-all sm:h-[176px] sm:rounded-3xl sm:border sm:border-stroke-soft-100 sm:bg-bg-white-0 sm:px-8 sm:pt-6 sm:pb-5 sm:hover:border-stroke-soft-200 sm:dark:bg-bg-white-0/5">
			{/* Mobile: vertical list — icon, label, timestamp per row */}
			<ol className="flex w-full flex-col sm:hidden">
				{rows.map((row, index) => {
					const rowBody = (
						<>
							<div
								className={cn(
									"flex size-9 shrink-0 items-center justify-center rounded-[10px] border transition-all duration-300",
									getIconStyles(
										row.stepType,
										row.isCompleted,
										row.isInteractive,
									),
								)}
							>
								<Icon name={row.icon} className="size-[18px]" />
							</div>
							<span
								className={cn(
									"flex min-w-0 flex-1 items-center gap-1 font-medium text-paragraph-sm",
									row.isCompleted
										? "text-text-strong-950"
										: "text-text-soft-400",
								)}
							>
								{row.label}
								{row.isInteractive && (
									<Icon
										name="chevron-right"
										className="size-4 text-text-soft-400"
									/>
								)}
							</span>
							{isLoading ? (
								<Skeleton className="h-3 w-20 rounded-md" />
							) : (
								<span className="whitespace-nowrap font-medium text-paragraph-xs text-text-soft-400">
									{row.isCompleted && row.formattedTime
										? row.formattedTime
										: "—"}
								</span>
							)}
						</>
					);

					return (
						<li key={row.id}>
							{row.isInteractive && row.onClick ? (
								<button
									type="button"
									onClick={row.onClick}
									className="group flex w-full cursor-pointer items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950/30"
									aria-label={`View ${row.label} details`}
								>
									{rowBody}
								</button>
							) : (
								<div className="group flex w-full items-center gap-3">
									{rowBody}
								</div>
							)}
							{index < rows.length - 1 && (
								<div
									className="ml-[17px] h-3 border-stroke-soft-100 border-l-[1.5px] border-dashed dark:border-neutral-800"
									aria-hidden="true"
								/>
							)}
						</li>
					);
				})}
			</ol>

			{/* Desktop: horizontal flow */}
			<div
				className={cn(
					"hidden items-start sm:flex",
					isFailed
						? "w-64 justify-between"
						: "w-full max-w-2xl justify-between",
				)}
			>
				{rows.map((row, index) => {
					const nodeBody = (
						<div className="flex flex-col items-center gap-2">
							<div
								className={cn(
									"flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border transition-all duration-300",
									getIconStyles(
										row.stepType,
										row.isCompleted,
										row.isInteractive,
									),
								)}
							>
								<Icon name={row.icon} className="h-5 w-5" />
							</div>

							<div className="flex flex-col items-center gap-1 text-center">
								<span
									className={cn(
										"rounded-md px-2 py-1 font-semibold text-xs transition-colors duration-300",
										getBadgeStyles(
											row.stepType,
											row.isCompleted,
											row.isInteractive,
										),
									)}
								>
									{row.label}
								</span>
								<div className="flex h-4 items-center justify-center">
									{isLoading ? (
										<Skeleton className="h-3 w-16 rounded-md" />
									) : row.isCompleted && row.formattedTime ? (
										<span className="whitespace-nowrap font-medium text-text-soft-400 text-xs">
											{row.formattedTime}
										</span>
									) : (
										<span className="h-4 w-16 opacity-0" aria-hidden="true" />
									)}
								</div>
							</div>
						</div>
					);

					return (
						<Fragment key={row.id}>
							<div className="flex min-w-[90px] flex-col items-center">
								{row.isInteractive && row.onClick ? (
									<button
										type="button"
										onClick={row.onClick}
										className="group flex cursor-pointer flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950/30"
										aria-label={`View ${row.label} details`}
									>
										{nodeBody}
									</button>
								) : (
									<div className="group flex flex-col items-center">
										{nodeBody}
									</div>
								)}
							</div>
							{index < rows.length - 1 && (
								<div className="mt-5 h-0 flex-1 border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800" />
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}

/** Per-step hover: stronger border, soft ring and a 1px lift, in the step's colour. */
const HOVER_ICON: Record<string, string> = {
	sent: "group-hover:border-information-base/40 group-hover:shadow-[0_0_0_3px_rgba(51,92,255,0.12)]",
	delivered:
		"group-hover:border-success-base/40 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]",
	opened:
		"group-hover:border-orange-500/40 group-hover:shadow-[0_0_0_3px_rgba(234,88,12,0.12)]",
	clicked:
		"group-hover:border-purple-500/40 group-hover:shadow-[0_0_0_3px_rgba(147,51,234,0.12)]",
	failed:
		"group-hover:border-error-base/40 group-hover:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
};

function getIconStyles(
	stepType: string,
	isCompleted: boolean,
	isInteractive?: boolean,
) {
	if (!isCompleted) {
		return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
	}
	const hover = isInteractive
		? cn(HOVER_ICON[stepType] ?? HOVER_ICON.sent, "group-hover:-translate-y-px")
		: undefined;
	switch (stepType) {
		case "sent":
			return cn(
				"border-information-base/20 bg-information-lighter/50 text-information-base",
				hover,
			);
		case "failed":
		case "bounced":
		case "complaint":
			return cn("border-error-light bg-error-lighter text-error-base", hover);
		case "delivered":
			return cn(
				"border-success-base/20 bg-success-lighter/50 text-success-base",
				hover,
			);
		case "opened":
			return cn(
				"border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
				hover,
			);
		case "clicked":
			return cn(
				"border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
				hover,
			);
		default:
			return cn(
				"border-information-base/20 bg-information-lighter/50 text-information-base",
				hover,
			);
	}
}

function getBadgeStyles(
	stepType: string,
	isCompleted: boolean,
	isInteractive?: boolean,
) {
	if (!isCompleted) {
		return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900 dark:text-neutral-400";
	}
	const hover = isInteractive && "group-hover:underline underline-offset-2";
	switch (stepType) {
		case "sent":
			return cn("bg-information-lighter text-information-base", hover);
		case "failed":
		case "bounced":
		case "complaint":
			return cn("bg-error-lighter text-error-base", hover);
		case "delivered":
			return cn("bg-success-lighter text-success-base", hover);
		case "opened":
			return cn(
				"bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
				hover,
			);
		case "clicked":
			return cn(
				"bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
				hover,
			);
		default:
			return cn("bg-information-lighter text-information-base", hover);
	}
}
