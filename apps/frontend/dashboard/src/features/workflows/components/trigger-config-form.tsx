"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import {
	type CustomEvent,
	listCustomEvents,
} from "../hooks/use-custom-events-api";
import { CreateEventModal } from "./create-event-modal";

interface TriggerConfigFormProps {
	/** Custom event key stored on the trigger node */
	value: string | undefined;
	onChange: (
		eventKey: string,
		meta?: { eventId: string; name: string },
	) => void;
}

export const TriggerConfigForm = ({
	value,
	onChange,
}: TriggerConfigFormProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [createOpen, setCreateOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const blurTimer = useRef<number | null>(null);

	const eventsQuery = useQuery({
		queryKey: queryKeys.workflows.events(),
		queryFn: () => listCustomEvents(100),
	});

	const events = eventsQuery.data?.events ?? [];

	const filteredEvents = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return events;
		return events.filter(
			(event) =>
				event.name.toLowerCase().includes(query) ||
				event.key.toLowerCase().includes(query) ||
				(event.description?.toLowerCase().includes(query) ?? false),
		);
	}, [events, searchQuery]);

	const selected = events.find((e) => e.key === value);

	const handleSelect = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
		setSearchQuery("");
		setIsOpen(false);
		inputRef.current?.blur();
	};

	const handleCreated = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
	};

	const handleFocus = () => {
		if (blurTimer.current) {
			window.clearTimeout(blurTimer.current);
			blurTimer.current = null;
		}
		setSearchQuery("");
		setIsOpen(true);
	};

	const handleBlur = () => {
		// Delay close so option mousedown fires first
		blurTimer.current = window.setTimeout(() => {
			setIsOpen(false);
			setSearchQuery("");
		}, 120);
	};

	const selectedLabel = selected ? selected.key : (value ?? "");

	return (
		<div className="flex flex-col gap-4">
			<div className="relative">
				<div className="relative">
					<Icon
						name="search"
						className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-soft-400"
					/>
					<input
						ref={inputRef}
						type="text"
						placeholder="Search events..."
						value={isOpen ? searchQuery : selectedLabel}
						onFocus={handleFocus}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setIsOpen(true);
						}}
						onBlur={handleBlur}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key === "Escape") {
								setIsOpen(false);
								setSearchQuery("");
								inputRef.current?.blur();
							}
							if (e.key === "Enter" && filteredEvents.length > 0) {
								e.preventDefault();
								const exact = filteredEvents.find(
									(ev) =>
										ev.key.toLowerCase() ===
										searchQuery.toLowerCase().trim(),
								);
								handleSelect(exact ?? filteredEvents[0]!);
							}
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setIsOpen(true);
							}
						}}
						aria-label="Search trigger event"
						className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-9 pl-9 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500"
					/>
					<button
						type="button"
						tabIndex={-1}
						aria-label={isOpen ? "Close events" : "Open events"}
						onMouseDown={(e) => {
							e.preventDefault();
							if (isOpen) {
								setIsOpen(false);
								setSearchQuery("");
								inputRef.current?.blur();
							} else {
								inputRef.current?.focus();
							}
						}}
						className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"h-4 w-4 transition-transform",
								isOpen && "rotate-180",
							)}
						/>
					</button>
				</div>
				{isOpen ? (
					<div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-regular-md dark:border-stroke-soft-100/40">
						<div className="max-h-56 space-y-0.5 overflow-y-auto p-1">
							{eventsQuery.isLoading ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									Loading…
								</div>
							) : filteredEvents.length === 0 ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									No workflow events yet
								</div>
							) : (
								filteredEvents.map((event) => (
									<button
										key={event.id}
										type="button"
										onMouseDown={(e) => {
											e.preventDefault();
											handleSelect(event);
										}}
										className={cn(
											"flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-bg-weak-50",
											value === event.key && "bg-bg-weak-50/80",
										)}
									>
										<span className="truncate font-mono text-[13px] text-text-strong-950">
											{event.key}
										</span>
										{event.properties.length > 0 ? (
											<span className="shrink-0 font-mono text-text-sub-600 text-xs">
												{event.properties.length} prop
												{event.properties.length === 1 ? "" : "s"}
											</span>
										) : null}
									</button>
								))
							)}
						</div>
						<div className="border-stroke-soft-100 border-t p-1">
							<button
								type="button"
								onMouseDown={(e) => {
									e.preventDefault();
									setIsOpen(false);
									setSearchQuery("");
									setCreateOpen(true);
								}}
								className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-strong-950 hover:bg-bg-weak-50"
							>
								<Icon name="plus" className="h-4 w-4" />
								Create event
							</button>
						</div>
					</div>
				) : null}
			</div>

			<CreateEventModal
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreated={handleCreated}
			/>
		</div>
	);
};
