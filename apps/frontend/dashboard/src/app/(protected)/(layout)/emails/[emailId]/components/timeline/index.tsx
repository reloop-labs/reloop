"use client";

import { cn } from "@reloop/ui/cn";
import { Fragment } from "react";
import {
	SentStep,
	DeliveredStep,
	OpenedStep,
	ClickedStep,
	FailedStep,
} from "./steps";
import type { EmailEvent } from "./types";

export function EmailTimeline({
	events,
	sentAt,
	deliveredAt,
	failedAt,
	errorMessage,
}: {
	events: EmailEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
	failedAt?: string | null;
	errorMessage?: string | null;
}) {
	// Synthesize events for sent, delivered, and failed if they don't exist in the events array
	const allEvents = [...events];

	if (sentAt && !allEvents.find((e) => e.type === "sent")) {
		allEvents.push({
			id: "synth-sent",
			type: "sent",
			createdAt: sentAt,
			metadata: {},
		});
	}

	const isFailed =
		!!errorMessage ||
		!!failedAt ||
		events.some((e) => e.type === "bounced" || e.type === "failed");

	if (isFailed && !allEvents.find((e) => e.type === "failed")) {
		allEvents.push({
			id: "synth-failed",
			type: "failed",
			createdAt: failedAt || sentAt || new Date().toISOString(),
			metadata: {},
		});
	}

	if (!isFailed && deliveredAt && !allEvents.find((e) => e.type === "delivered")) {
		allEvents.push({
			id: "synth-delivered",
			type: "delivered",
			createdAt: deliveredAt,
			metadata: {},
		});
	}

	const steps = isFailed
		? ["sent", "failed", "", ""]
		: ["sent", "delivered", "opened", "clicked"];

	return (
		<div className="relative flex w-full items-start justify-between gap-0 rounded-3xl border border-stroke-soft-100 px-4 pt-10 pb-8 transition-all hover:border-stroke-soft-200">
			{steps.map((type, index: number) => {
				const event = type ? allEvents.find((e) => e.type === type) : undefined;

				return (
					<Fragment key={index}>
						{type === "sent" && <SentStep event={event} />}
						{type === "failed" && <FailedStep event={event} />}
						{type === "delivered" && <DeliveredStep event={event} />}
						{type === "opened" && <OpenedStep event={event} />}
						{type === "clicked" && <ClickedStep event={event} />}
						{!type && <div className="w-10 flex-shrink-0" />}
						{index < steps.length - 1 && (
							<div
								className={cn(
									"mt-5 h-0 flex-1 border-t-[1.5px]",
									index === 0 && isFailed
										? "border-stroke-soft-100 border-dashed"
										: !isFailed
										? "border-stroke-soft-100 border-dashed"
										: "border-transparent",
								)}
							/>
						)}
					</Fragment>
				);
			})}
		</div>
	);
}

