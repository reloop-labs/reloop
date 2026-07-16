"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { EMAIL_WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { useMemo, useState } from "react";

interface TriggerConfigFormProps {
	value: string | undefined;
	onChange: (eventId: string) => void;
}

export const TriggerConfigForm = ({
	value,
	onChange,
}: TriggerConfigFormProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredEvents = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return EMAIL_WEBHOOK_EVENTS;
		return EMAIL_WEBHOOK_EVENTS.filter(
			(event) =>
				event.name.toLowerCase().includes(query) ||
				event.id.toLowerCase().includes(query) ||
				event.description.toLowerCase().includes(query),
		);
	}, [searchQuery]);

	const selected = EMAIL_WEBHOOK_EVENTS.find((e) => e.id === value);

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-1 font-medium text-sm text-text-strong-950">
					Email event
				</p>
				<p className="mb-3 text-text-sub-600 text-xs">
					The workflow runs when this event fires for your organization.
				</p>
				<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
					<Dropdown.Trigger asChild>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							className={cn(
								"w-full justify-between bg-bg-white-0 px-3 font-normal hover:bg-bg-weak-50/50",
								!value && "text-text-soft-400",
							)}
						>
							<span className="truncate">
								{selected?.name ?? "Select email event..."}
							</span>
							<Icon
								name="chevron-down"
								className={cn(
									"h-4 w-4 shrink-0 transition-transform",
									isOpen && "rotate-180",
								)}
							/>
						</Button.Root>
					</Dropdown.Trigger>
					<Dropdown.Content
						align="start"
						className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-0 shadow-regular-md dark:border-stroke-soft-100/40"
					>
						<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-3 py-2">
							<Icon name="search" className="h-4 w-4 text-text-soft-400" />
							<input
								type="text"
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.stopPropagation()}
								className="w-full border-none bg-transparent text-sm outline-none placeholder:text-text-soft-400"
							/>
						</div>
						<div className="space-y-0.5 p-1">
							{filteredEvents.length === 0 ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									No events found
								</div>
							) : (
								filteredEvents.map((event) => (
									<button
										key={event.id}
										type="button"
										onClick={() => {
											onChange(event.id);
											setIsOpen(false);
										}}
										className={cn(
											"flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-bg-weak-50",
											value === event.id && "bg-bg-weak-50/80",
										)}
									>
										<span className="font-medium text-text-strong-950">
											{event.name}
										</span>
										<span className="text-text-sub-600 text-xs">
											{event.description}
										</span>
									</button>
								))
							)}
						</div>
					</Dropdown.Content>
				</Dropdown.Root>
			</div>
		</div>
	);
};
