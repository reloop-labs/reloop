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
	email: "mail",
};

const categoryColors: Record<
	string,
	"blue" | "orange" | "green" | "gray" | "purple"
> = {
	domain: "blue",
	"api-key": "orange",
	contact: "green",
	email: "purple",
};

const categoryLabels: Record<string, string> = {
	domain: "Domains",
	"api-key": "API Keys",
	contact: "Contacts",
	email: "Email",
};

export const WebhookEventSelector = ({
	value,
	onChange,
	error,
}: WebhookEventSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredEvents = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return WEBHOOK_EVENTS;
		return WEBHOOK_EVENTS.filter(
			(event) =>
				event.name.toLowerCase().includes(query) ||
				event.id.toLowerCase().includes(query) ||
				event.description.toLowerCase().includes(query),
		);
	}, [searchQuery]);

	const groupedEvents = useMemo(() => {
		const groups: Record<string, (typeof WEBHOOK_EVENTS)[number][]> = {};
		for (const event of filteredEvents) {
			const group = groups[event.category] ?? [];
			group.push(event);
			groups[event.category] = group;
		}
		return groups;
	}, [filteredEvents]);

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
						"w-full justify-between bg-bg-white-0 px-3 font-normal hover:bg-bg-weak-50/50 dark:bg-bg-white-0/5",
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
				className="max-h-85 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-0 shadow-regular-md dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5"
			>
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-3 py-2 dark:border-stroke-soft-100/40">
					<Icon name="search" className="h-4 w-4 shrink-0 text-text-soft-400" />
					<input
						type="text"
						placeholder="Search events..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							// Prevent Radix dropdown from hijacking keyboard input
							e.stopPropagation();
						}}
						className="w-full border-none bg-transparent py-0.5 text-sm text-text-strong-950 outline-none ring-0 placeholder:text-text-soft-400 focus:outline-none focus:ring-0"
					/>
				</div>

				<div className="space-y-2 p-1">
					{Object.keys(groupedEvents).length === 0 ? (
						<div className="px-3 py-6 text-center text-sm text-text-soft-400">
							No events found
						</div>
					) : (
						Object.entries(groupedEvents).map(([category, events]) => (
							<div key={category} className="space-y-0.5">
								<div className="px-3 pt-2 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
									{categoryLabels[category] ?? category}
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
													"flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
													"hover:bg-bg-weak-50",
													isChecked && "bg-bg-weak-50/60",
												)}
											>
												<div className="flex min-w-0 items-center gap-2.5">
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
														className="h-3.5 w-3.5 shrink-0 text-text-strong-950 dark:text-white"
													/>
												)}
											</button>
										);
									})}
								</div>
							</div>
						))
					)}
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
