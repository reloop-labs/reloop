"use client";

import { cn } from "@reloop/ui/cn";
import { Fragment } from "react";
import { TIMELINE_COMPONENTS } from "./steps";
import type { EmailEvent } from "./types";

export function EmailTimeline({
	events,
	sentAt,
	deliveredAt,
}: {
	events: EmailEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
}) {
	// Synthesize events for sent and delivered if they don't exist in the events array
	const allEvents = [...events];

	if (sentAt && !allEvents.find((e) => e.type === "sent")) {
		allEvents.push({
			id: "synth-sent",
			type: "sent",
			createdAt: sentAt,
			metadata: {},
		});
	}

	if (deliveredAt && !allEvents.find((e) => e.type === "delivered")) {
		allEvents.push({
			id: "synth-delivered",
			type: "delivered",
			createdAt: deliveredAt,
			metadata: {},
		});
	}

	return (
		<div className="relative flex w-full items-start justify-between gap-0 rounded-xl border border-stroke-soft-100 px-4 pt-10 pb-8 transition-all hover:border-stroke-soft-200">
			{TIMELINE_COMPONENTS.map((StepComponent, index: number) => {
				const eventTypes = ["sent", "delivered", "opened", "clicked"];
				const eventType = eventTypes[index];
				const event = allEvents.find((e) => e.type === eventType);

				const nextEventType = eventTypes[index + 1];
				const isCompleted = !!event;
				const isNextCompleted = !!allEvents.find(
					(e) => e.type === nextEventType,
				);

				return (
					<Fragment key={index}>
						<StepComponent event={event} />
						{index < TIMELINE_COMPONENTS.length - 1 && (
							<div
								className={cn(
									"mt-5 h-0 flex-1 border-t-[1.5px] border-dashed",
									isCompleted && isNextCompleted
										? "border-success-base"
										: "border-stroke-soft-100",
								)}
							/>
						)}
					</Fragment>
				);
			})}
		</div>
	);
}
