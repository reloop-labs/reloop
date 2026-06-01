/** biome-ignore-all lint/a11y/useSemanticElements: custom checkbox list item elements */
"use client";

import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { memo, useCallback, useMemo } from "react";

interface WebhookEventInlineSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
}

const categoryBadgeColors: Record<string, { light: string; dark: string }> = {
	domain: { light: "bg-[#0A438A]", dark: "dark:bg-[#1E57A8]" },
	"api-key": { light: "bg-[#8A5A0A]", dark: "dark:bg-[#A87A1E]" },
	contact: { light: "bg-[#0A6B3A]", dark: "dark:bg-[#1E8A4E]" },
	email: { light: "bg-[#7C3AED]", dark: "dark:bg-[#8B5CF6]" },
};

const categoryCheckboxColors: Record<string, string> = {
	domain:
		"[&>[data-state=checked]]:![&>[data-state=checked]>svg>rect:first-of-type]:fill-[#0A438A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#1E57A8]",
	"api-key":
		"[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#8A5A0A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#A87A1E]",
	contact:
		"[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#0A6B3A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#1E8A4E]",
	email:
		"[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#7C3AED] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#8B5CF6]",
};

interface WebhookEventRowProps {
	event: (typeof WEBHOOK_EVENTS)[number];
	isChecked: boolean;
	onToggle: (id: string) => void;
}

const WebhookEventRow = memo<WebhookEventRowProps>(
	({ event, isChecked, onToggle }) => (
		<div
			tabIndex={0}
			role="button"
			aria-pressed={isChecked}
			onClick={() => onToggle(event.id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle(event.id);
				}
			}}
			className={cn(
				"flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-weak-50/50",
				isChecked && "bg-bg-weak-50/60",
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<div
					className={cn("shrink-0", categoryCheckboxColors[event.category])}
					onClick={(e) => e.stopPropagation()}
				>
					<Checkbox.Root
						checked={isChecked}
						onCheckedChange={() => onToggle(event.id)}
					/>
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
		</div>
	),
);

WebhookEventRow.displayName = "WebhookEventRow";

export const WebhookEventInlineSelector = ({
	value,
	onChange,
}: WebhookEventInlineSelectorProps) => {
	const handleToggle = useCallback(
		(eventId: string) => {
			onChange(
				value.includes(eventId)
					? value.filter((id) => id !== eventId)
					: [...value, eventId],
			);
		},
		[value, onChange],
	);

	const eventsMap = new Map<string, (typeof WEBHOOK_EVENTS)[number]>(
		WEBHOOK_EVENTS.map((e) => [e.id, e]),
	);

	const categoryLabels: Record<string, string> = {
		domain: "Domains",
		"api-key": "API Keys",
		contact: "Contacts",
		email: "Email",
	};

	const groupedEvents = useMemo(() => {
		const groups: {
			category: string;
			events: (typeof WEBHOOK_EVENTS)[number][];
		}[] = [];
		const seen = new Map<string, number>();

		for (const event of WEBHOOK_EVENTS) {
			const existingIdx = seen.get(event.category);
			if (existingIdx !== undefined) {
				groups[existingIdx]?.events.push(event);
			} else {
				seen.set(event.category, groups.length);
				groups.push({
					category: event.category,
					events: [event],
				});
			}
		}
		return groups;
	}, []);

	return (
		<LayoutGroup>
			<div className="space-y-3">
				<div className="h-96 divide-y divide-stroke-soft-100 overflow-y-auto rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
					{groupedEvents.map((group) => (
						<div key={group.category}>
							{/* Category separator / header */}
							<div className="sticky top-0 z-10 flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/90">
								<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-widest">
									{categoryLabels[group.category] ?? group.category}
								</span>
							</div>

							{/* Event rows */}
							<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
								{group.events.map((event) => (
									<WebhookEventRow
										key={event.id}
										event={event}
										isChecked={value.includes(event.id)}
										onToggle={handleToggle}
									/>
								))}
							</div>
						</div>
					))}
				</div>

				<AnimatePresence initial={false}>
					{value.length > 0 && (
						<motion.div
							key="selected-events"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 40,
							}}
							className="overflow-hidden"
						>
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-50 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-soft-50/50">
								<div className="mb-2 flex items-center gap-1.5">
									<Icon
										name="check-circle"
										className="h-3.5 w-3.5 text-green-600"
									/>
									<span className="font-medium text-label-xs text-text-strong-950">
										{value.length} event{value.length > 1 ? "s" : ""} selected
									</span>
								</div>
								<div className="flex flex-wrap gap-1.5">
									<AnimatePresence initial={false}>
										{value.map((eventId) => {
											const event = eventsMap.get(eventId);
											if (!event) return null;
											return (
												<motion.button
													key={event.id}
													type="button"
													onClick={() => handleToggle(event.id)}
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.8 }}
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 40,
													}}
													className={cn(
														"flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[11px] text-white transition-opacity hover:opacity-80",
														categoryBadgeColors[event.category]?.light,
														categoryBadgeColors[event.category]?.dark,
													)}
												>
													{event.name}
													<Icon name="plus" className="h-3 w-3 rotate-45" />
												</motion.button>
											);
										})}
									</AnimatePresence>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</LayoutGroup>
	);
};
