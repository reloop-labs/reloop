"use client";

import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";

interface WebhookEventInlineSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
}

const categoryIcons: Record<string, string> = {
	domain: "globe",
	"api-key": "key",
	contact: "users",
};

const categoryColors: Record<string, "blue" | "orange" | "green" | "gray"> = {
	domain: "blue",
	"api-key": "orange",
	contact: "green",
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
			<div className="max-h-[320px] overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				{WEBHOOK_EVENTS.map((event, i) => {
					const isChecked = value.includes(event.id);
					return (
						<button
							key={event.id}
							type="button"
							onClick={() => handleToggle(event.id)}
							className={cn(
								"flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-weak-50/50",
								isChecked && "bg-bg-weak-50/60",
								i !== WEBHOOK_EVENTS.length - 1 &&
									"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
							)}
						>
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex h-5 w-5 items-center justify-center rounded border transition-colors",
										isChecked
											? "border-neutral-base bg-neutral-base text-white"
											: "border-stroke-soft-200 bg-bg-white-0",
									)}
								>
									{isChecked && <Icon name="check" className="h-3.5 w-3.5" />}
								</div>
								<span className="font-medium text-label-sm text-text-strong-950">
									{event.name}
								</span>
							</div>
							<Badge.Root
								size="small"
								variant="lighter"
								color={categoryColors[event.category] ?? "gray"}
								className="capitalize"
							>
								<Badge.Icon
									as={Icon}
									name={categoryIcons[event.category] ?? "webhook"}
								/>
								{event.category.replace("-", " ")}
							</Badge.Root>
						</button>
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
