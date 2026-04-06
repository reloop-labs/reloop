"use client";

import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";

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

export const WebhookEventInlineSelector = ({
	value,
	onChange,
	error,
}: WebhookEventInlineSelectorProps) => {
	const handleToggle = (eventId: string) => {
		if (value.includes(eventId)) {
			onChange(value.filter((id) => id !== eventId));
		} else {
			onChange([...value, eventId]);
		}
	};

	return (
		<div className="space-y-3">
			<div className="h-96 overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				{WEBHOOK_EVENTS.map((event, i) => {
					const isChecked = value.includes(event.id);
					return (
						<div
							key={event.id}
							className={cn(
								"flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-weak-50/50",
								isChecked && "bg-bg-weak-50/60",
								i !== WEBHOOK_EVENTS.length - 1 &&
									"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
							)}
						>
							<div className="flex min-w-0 flex-1 items-center gap-3">
								<div
									className={cn(
										"shrink-0",
										categoryCheckboxColors[event.category],
									)}
								>
									<Checkbox.Root
										checked={isChecked}
										onCheckedChange={() => handleToggle(event.id)}
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
					);
				})}
			</div>
			{error && (
				<div className="flex items-center gap-2">
					<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
					<p className="text-red-600 text-xs">{error}</p>
				</div>
			)}
		</div>
	);
};
