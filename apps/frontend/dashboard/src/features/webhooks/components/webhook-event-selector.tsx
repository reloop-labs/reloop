import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { ACTIVE_WEBHOOK_EVENTS, WEBHOOK_EVENTS } from "@reloop/webhook-events";
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

const SUPPORTED_CATEGORIES = new Set(["email", "contact"]);
const SUPPORTED_WEBHOOK_EVENTS = ACTIVE_WEBHOOK_EVENTS.filter((e) =>
	SUPPORTED_CATEGORIES.has(e.category),
);

export const WebhookEventSelector = ({
	value,
	onChange,
	error,
}: WebhookEventSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredEvents = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return SUPPORTED_WEBHOOK_EVENTS;
		return SUPPORTED_WEBHOOK_EVENTS.filter(
			(event) =>
				event.name.toLowerCase().includes(query) ||
				event.id.toLowerCase().includes(query) ||
				event.description.toLowerCase().includes(query) ||
				event.category.toLowerCase().includes(query),
		);
	}, [searchQuery]);

	const groupedEvents = useMemo(() => {
		const groups: Record<string, (typeof SUPPORTED_WEBHOOK_EVENTS)[number][]> =
			{};
		// Stable category order matching product priority
		const order = ["email", "contact"];
		for (const key of order) {
			groups[key] = [];
		}
		for (const event of filteredEvents) {
			const group = groups[event.category] ?? [];
			group.push(event);
			groups[event.category] = group;
		}
		// Drop empty categories
		for (const key of Object.keys(groups)) {
			if (groups[key]?.length === 0) delete groups[key];
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

	const handleToggleCategory = (events: { id: string }[]) => {
		const ids = events.map((e) => e.id);
		const allSelected = ids.every((id) => value.includes(id));
		if (allSelected) {
			onChange(value.filter((id) => !ids.includes(id)));
		} else {
			const next = new Set(value);
			for (const id of ids) next.add(id);
			onChange([...next]);
		}
	};

	const selectedCount = value.length;

	// Resolve display names from full catalog so inactive/legacy IDs still show.
	const selectedEvents = useMemo(() => {
		return value.map((id) => {
			const fromActive = ACTIVE_WEBHOOK_EVENTS.find((e) => e.id === id);
			if (fromActive) return fromActive;
			const fromAll = WEBHOOK_EVENTS.find((e) => e.id === id);
			if (fromAll) return fromAll;
			return {
				id,
				name: id,
				category: "other",
				description: id,
				isActive: false,
			};
		});
	}, [value]);

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					className={cn(
						"h-auto min-h-9 w-full justify-between bg-bg-white-0 px-3 py-1.5 font-normal hover:bg-bg-weak-50/50 dark:bg-bg-white-0/5",
						error && "ring-error-base focus:ring-error-base",
						selectedCount === 0 && "text-text-soft-400",
					)}
				>
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
						{selectedCount === 0 ? (
							<span className="truncate">Select events...</span>
						) : (
							<>
								{selectedEvents.slice(0, 3).map((event) => (
									<Badge.Root
										key={event.id}
										size="small"
										variant="lighter"
										color={categoryColors[event.category] ?? "gray"}
										className="max-w-[140px]"
									>
										<Badge.Icon
											as={Icon}
											name={categoryIcons[event.category] ?? "webhook"}
										/>
										<span className="truncate font-mono text-[11px] uppercase">
											{event.name}
										</span>
									</Badge.Root>
								))}
								{selectedCount > 3 && (
									<span className="shrink-0 font-medium text-text-sub-600 text-xs">
										+{selectedCount - 3}
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
						Object.entries(groupedEvents).map(([category, events]) => {
							const allSelected = events.every((e) => value.includes(e.id));
							const someSelected =
								!allSelected && events.some((e) => value.includes(e.id));
							return (
								<div key={category} className="space-y-0.5">
									<div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1">
										<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
											{categoryLabels[category] ?? category}
										</span>
										<button
											type="button"
											onClick={() => handleToggleCategory(events)}
											className="font-medium text-[10px] text-text-sub-600 transition-colors hover:text-text-strong-950"
										>
											{allSelected
												? "Deselect all"
												: someSelected
													? "Select rest"
													: "Select all"}
										</button>
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
														"flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
														"hover:bg-bg-weak-50",
														isChecked && "bg-bg-weak-50/60",
													)}
												>
													<span
														className={cn(
															"mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
															isChecked
																? "border-text-strong-950 bg-text-strong-950 text-white dark:border-white dark:bg-white dark:text-black"
																: "border-stroke-soft-200 bg-bg-white-0",
														)}
													>
														{isChecked ? (
															<Icon name="check" className="h-2.5 w-2.5" />
														) : null}
													</span>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<Icon
																name={
																	categoryIcons[event.category] ?? "webhook"
																}
																className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
															/>
															<span className="truncate font-medium font-mono text-[13px] text-text-strong-950">
																{event.name}
															</span>
														</div>
														<p className="mt-0.5 text-[11px] text-text-sub-600 leading-snug">
															{event.description}
														</p>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							);
						})
					)}
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
