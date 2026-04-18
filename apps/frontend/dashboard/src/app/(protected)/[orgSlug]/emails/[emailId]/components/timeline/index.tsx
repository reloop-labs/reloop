"use client";

import { TIMELINE_COMPONENTS } from "./steps";
import type { EmailEvent } from "./types";

export function EmailTimeline({ events }: { events: EmailEvent[] }) {
	if (!events || events.length === 0) return null;

	const getIsNextToComplete = (index: number) => {
		// Mapping of steps to their event types
		const eventTypes = ["sent", "delivered", "opened", "clicked"];
		const currentType = eventTypes[index];
		const nextType = eventTypes[index + 1];

		const isCompleted = events.some((e) => e.type === currentType);
		const nextCompleted = nextType
			? events.some((e) => e.type === nextType)
			: true;

		return !isCompleted || !nextCompleted;
	};

	return (
		<div className="relative flex w-full items-start justify-between gap-0 rounded-xl border border-stroke-soft-100 px-4 pt-10 pb-8 transition-all hover:border-stroke-soft-200">
			{TIMELINE_COMPONENTS.map((StepComponent, index: number) => {
				const eventType = ["sent", "delivered", "opened", "clicked"][index];
				const event = events.find((e) => e.type === eventType);

				return (
					<StepComponent
						key={index}
						event={event}
						isLast={index === TIMELINE_COMPONENTS.length - 1}
						isNextToComplete={getIsNextToComplete(index)}
					/>
				);
			})}
		</div>
	);
}
