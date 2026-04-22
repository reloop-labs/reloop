"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { useMemo, useState } from "react";

interface WebhookEventSelectorProps {
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

export const WebhookEventSelector = ({
	value,
	onChange,
	error,
}: WebhookEventSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const groupedEvents = useMemo(() => {
		const groups: Record<string, (typeof WEBHOOK_EVENTS)[number][]> = {};
		for (const event of WEBHOOK_EVENTS) {
			const group = groups[event.category] ?? [];
			group.push(event);
			groups[event.category] = group;
		}
		return groups;
	}, []);

	const handleToggle = (eventId: string) => {
		if (value.includes(eventId)) {
			onChange(value.filter((id) => id !== eventId));
		} else {
			onChange([...value, eventId]);
		}
	};

	const selectedCount = value.length;

	const selectedEvents = useMemo(() => {
		return value
			.map((id) => WEBHOOK_EVENTS.find((e) => e.id === id))
			.filter((e): e is (typeof WEBHOOK_EVENTS)[number] => !!e);
	}, [value]);

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					className={cn(
						"w-full justify-between px-3 font-normal",
						error && "ring-error-base focus:ring-error-base",
						selectedCount === 0 && "text-text-soft-400",
					)}
				>
					<div className="flex min-w-0 flex-1 items-center gap-1">
						{selectedCount === 0 ? (
							<span className="truncate">Select events...</span>
						) : (
							<>
								{selectedEvents.slice(0, 2).map((event) => (
									<Badge.Root
										key={event.id}
										size="small"
										variant="lighter"
										color={categoryColors[event.category] ?? "gray"}
										className="max-w-[120px]"
									>
										<Badge.Icon
											as={Icon}
											name={categoryIcons[event.category] ?? "webhook"}
										/>
										<span className="truncate">{event.name}</span>
									</Badge.Root>
								))}
								{selectedCount > 2 && (
									<span className="shrink-0 font-medium text-text-sub-600 text-xs">
										+{selectedCount - 2}
									</span>
								)}
							</>
						)}
					</div>
					<Icon
						name="chevron-down"
						className={cn(
							"h-4 w-4 shrink-0 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
					/>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="start"
				className="max-h-80 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto p-1"
			>
				{Object.entries(groupedEvents).map(([category, events]) => (
					<div key={category} className="mb-2 last:mb-0">
						<div className="px-2 py-1.5 font-medium text-text-sub-600 text-xs uppercase tracking-wider">
							{category}
						</div>
						<div className="space-y-0.5">
							{events.map((event) => {
								const isChecked = value.includes(event.id);
								return (
									<button
										key={event.id}
										type="button"
										onClick={() => handleToggle(event.id)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
											"hover:bg-bg-weak-50",
											isChecked && "bg-bg-weak-50",
										)}
									>
										<div className="flex min-w-0 items-center gap-2">
											<Icon
												name={categoryIcons[event.category] ?? "webhook"}
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<span className="truncate font-medium text-text-strong-950">
												{event.name}
											</span>
										</div>
										{isChecked && (
											<Icon
												name="check"
												className="h-3.5 w-3.5 shrink-0 text-brand-base-600"
											/>
										)}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
