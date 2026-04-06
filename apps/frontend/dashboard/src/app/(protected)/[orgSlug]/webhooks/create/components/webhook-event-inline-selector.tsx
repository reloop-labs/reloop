/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
"use client";

import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { memo, useCallback } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

interface WebhookEventInlineSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
}

const categoryBadgeColors: Record<string, { light: string; dark: string }> = {
	domain: { light: "bg-[#0A438A]", dark: "dark:bg-[#1E57A8]" },
	"api-key": { light: "bg-[#8A5A0A]", dark: "dark:bg-[#A87A1E]" },
	contact: { light: "bg-[#0A6B3A]", dark: "dark:bg-[#1E8A4E]" },
};

const categoryCheckboxColors: Record<string, string> = {
	domain:
		"[&>[data-state=checked]]:![&>[data-state=checked]>svg>rect:first-of-type]:fill-[#0A438A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#1E57A8]",
	"api-key":
		"[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#8A5A0A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#A87A1E]",
	contact:
		"[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#0A6B3A] dark:[&>[data-state=checked]>svg>rect:first-of-type]:fill-[#1E8A4E]",
};

interface WebhookEventRowProps {
	event: (typeof WEBHOOK_EVENTS)[number];
	isChecked: boolean;
	isLast: boolean;
	onToggle: (id: string) => void;
}

const WebhookEventRow = memo<WebhookEventRowProps>(
	({ event, isChecked, isLast, onToggle }) => (
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
				!isLast &&
					"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
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
	error,
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

	return (
		<LayoutGroup>
			<div className="space-y-3">
				<div className="h-96 overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					{WEBHOOK_EVENTS.map((event, i) => (
						<WebhookEventRow
							key={event.id}
							event={event}
							isChecked={value.includes(event.id)}
							isLast={i === WEBHOOK_EVENTS.length - 1}
							onToggle={handleToggle}
						/>
					))}
				</div>

				<AnimatePresence initial={false}>
					{value.length > 0 && (
						<motion.div
							key="selected-events"
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{
								type: "spring",
								stiffness: 500,
								damping: 30,
								mass: 0.5,
							}}
							className="rounded-xl border border-stroke-soft-100 bg-bg-soft-50 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-soft-50/50"
						>
							<div className="mb-2 flex items-center gap-1.5">
								<Icon
									name="check-circle"
									className="h-3.5 w-3.5 text-green-600"
								/>
								<span className="font-medium text-label-xs text-text-strong-950">
									{value.length} event{value.length > 1 ? "s" : ""} selected
								</span>
							</div>
							<motion.div className="flex flex-wrap gap-1.5" layout>
								<AnimatePresence mode="popLayout" initial={false}>
									{value.map((eventId) => {
										const event = WEBHOOK_EVENTS.find((e) => e.id === eventId);
										if (!event) return null;
										return (
											<motion.button
												key={event.id}
												type="button"
												onClick={() => handleToggle(event.id)}
												layout
												initial={{ opacity: 0, scale: 0.8, y: 4 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.8, y: 4 }}
												transition={{
													type: "spring",
													stiffness: 500,
													damping: 35,
													mass: 0.4,
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
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				{error && (
					<div className="flex items-center gap-2">
						<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
						<p className="text-red-600 text-xs">{error}</p>
					</div>
				)}
			</div>
		</LayoutGroup>
	);
};
