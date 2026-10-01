"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
	const [createInitialKey, setCreateInitialKey] = useState("");
	const [editOpen, setEditOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const blurTimer = useRef<number | null>(null);
	const copyTimer = useRef<number | null>(null);

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

	const trimmedQuery = searchQuery.trim();
	const exactMatch = trimmedQuery
		? events.find((e) => e.key.toLowerCase() === trimmedQuery.toLowerCase())
		: undefined;
	const showCreateOption = isOpen && trimmedQuery.length > 0 && !exactMatch;

	const handleSelect = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
		setSearchQuery("");
		setIsOpen(false);
		inputRef.current?.blur();
	};

	const openCreateWithKey = (key?: string) => {
		setCreateInitialKey(key?.trim() ?? "");
		setIsOpen(false);
		setSearchQuery("");
		inputRef.current?.blur();
		setCreateOpen(true);
	};

	const handleCreated = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
	};

	const handleUpdated = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
		toast.success(`Updated "${event.name}"`);
	};

	const handleEditClick = () => {
		if (!selected) return;
		setIsOpen(false);
		setSearchQuery("");
		inputRef.current?.blur();
		setEditOpen(true);
	};

	const handleFocus = () => {
		if (blurTimer.current) {
			window.clearTimeout(blurTimer.current);
			blurTimer.current = null;
		}
		setSearchQuery(selected ? selected.key : (value ?? ""));
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

	const handleCopy = async () => {
		if (!selectedLabel) return;
		try {
			await navigator.clipboard.writeText(selectedLabel);
		} catch {
			return;
		}
		setCopied(true);
		if (copyTimer.current) window.clearTimeout(copyTimer.current);
		copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="relative">
				<div className="relative">
					<input
						ref={inputRef}
						type="text"
						placeholder={
							isOpen ? "Type to search or create..." : "Enter event key..."
						}
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
							if (e.key === "Enter") {
								e.preventDefault();
								if (exactMatch) {
									handleSelect(exactMatch);
								} else if (trimmedQuery && filteredEvents.length > 0) {
									const exact = filteredEvents.find(
										(ev) => ev.key.toLowerCase() === trimmedQuery.toLowerCase(),
									);
									if (exact) handleSelect(exact);
									else openCreateWithKey(trimmedQuery);
								} else if (trimmedQuery) {
									openCreateWithKey(trimmedQuery);
								} else if (filteredEvents.length > 0) {
									const first = filteredEvents[0];
									if (first) handleSelect(first);
								}
							}
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setIsOpen(true);
							}
						}}
						aria-label="Trigger event key"
						className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-[72px] pl-3 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500"
					/>
					<div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-0.5">
						<button
							type="button"
							tabIndex={-1}
							aria-label="Edit trigger properties"
							title={
								selected ? "Edit trigger properties" : "Select an event to edit"
							}
							disabled={!selected}
							onMouseDown={(e) => {
								e.preventDefault();
								handleEditClick();
							}}
							className="flex h-6 w-6 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-soft-400"
						>
							<Icon name="edit" className="h-4 w-4" />
						</button>
						<button
							type="button"
							tabIndex={-1}
							aria-label={copied ? "Copied" : "Copy event key"}
							title={copied ? "Copied" : "Copy event key"}
							disabled={!selectedLabel}
							onMouseDown={(e) => {
								e.preventDefault();
								void handleCopy();
							}}
							className="flex h-6 w-6 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-soft-400"
						>
							<Icon
								name={copied ? "check" : "copy"}
								className={cn("h-4 w-4", copied && "text-success-base")}
							/>
						</button>
					</div>
				</div>
				{isOpen ? (
					<div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-regular-md dark:border-stroke-soft-100/40">
						<div className="nowheel max-h-56 space-y-0.5 overflow-y-auto overscroll-contain p-1">
							{eventsQuery.isLoading ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									Loading…
								</div>
							) : filteredEvents.length === 0 && !showCreateOption ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									No workflow events yet
								</div>
							) : (
								filteredEvents.map((event) => {
									const isExact =
										trimmedQuery.length > 0 &&
										event.key.toLowerCase() === trimmedQuery.toLowerCase();
									const isSelected = value === event.key || isExact;
									return (
										<button
											key={event.id}
											type="button"
											onMouseDown={(e) => {
												e.preventDefault();
												handleSelect(event);
											}}
											className={cn(
												"flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-bg-weak-50",
												isSelected && "bg-bg-weak-50/80",
											)}
										>
											<span className="truncate font-mono text-[13px] text-text-strong-950">
												{event.key}
											</span>
											{isSelected ? (
												<Icon
													name="check"
													className="h-4 w-4 shrink-0 text-text-strong-950"
												/>
											) : event.properties.length > 0 ? (
												<span className="shrink-0 font-mono text-text-sub-600 text-xs">
													{event.properties.length} prop
													{event.properties.length === 1 ? "" : "s"}
												</span>
											) : null}
										</button>
									);
								})
							)}
						</div>
						{showCreateOption ? (
							<div className="border-stroke-soft-100 border-t p-1">
								<button
									type="button"
									onMouseDown={(e) => {
										e.preventDefault();
										openCreateWithKey(trimmedQuery);
									}}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-strong-950 hover:bg-bg-weak-50"
								>
									<Icon name="plus" className="h-4 w-4 shrink-0" />
									<span className="truncate">
										<span className="text-text-sub-600">Create event </span>
										<span className="font-semibold">{trimmedQuery}</span>
									</span>
								</button>
							</div>
						) : null}
					</div>
				) : null}
			</div>

			<CreateEventModal
				open={createOpen}
				initialKey={createInitialKey}
				onOpenChange={(open) => {
					setCreateOpen(open);
					if (!open) setCreateInitialKey("");
				}}
				onCreated={handleCreated}
			/>
			<CreateEventModal
				open={editOpen}
				event={selected ?? null}
				onOpenChange={setEditOpen}
				onUpdated={handleUpdated}
			/>
		</div>
	);
};
