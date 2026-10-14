"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import {
	type CustomEvent,
	listCustomEvents,
} from "../../hooks/use-custom-events-api";
import type { TriggerNodeData } from "../../workflow-types";
import { CreateEventModal } from "../create-event-modal";
import { useNodeEditor } from "../node-editor-context";
import {
	EditorShell,
	MenuAction,
	MenuEmpty,
	MenuFooter,
	MenuItem,
	MenuList,
	useListNav,
} from "./editor-shell";

export const TriggerEditor = ({
	nodeId,
	data,
}: {
	nodeId: string;
	data: TriggerNodeData;
}) => {
	const { updateNode, closeEditor } = useNodeEditor();
	const inputRef = useRef<HTMLInputElement>(null);
	// null until the user types; the input shows the saved event meanwhile.
	const [query, setQuery] = useState<string | null>(null);
	const [createKey, setCreateKey] = useState<string | null>(null);
	const [editing, setEditing] = useState<CustomEvent | null>(null);

	const current =
		(typeof data.eventKey === "string" && data.eventKey) ||
		(typeof data.eventId === "string" ? data.eventId : "");

	const eventsQuery = useQuery({
		queryKey: queryKeys.workflows.events(),
		queryFn: () => listCustomEvents(100),
	});
	const events = eventsQuery.data?.events ?? [];

	// The input is the search: it filters by whatever it shows, prefilled or typed.
	const trimmed = (query ?? current).trim();
	const filtered = useMemo(() => {
		const q = trimmed.toLowerCase();
		if (!q) return events;
		return events.filter(
			(e) =>
				e.key.toLowerCase().includes(q) ||
				e.name.toLowerCase().includes(q) ||
				(e.description?.toLowerCase().includes(q) ?? false),
		);
	}, [events, trimmed]);
	const exact = events.find(
		(e) => e.key.toLowerCase() === trimmed.toLowerCase(),
	);

	const choose = (event: CustomEvent) => {
		// Match the resting box's text so nothing flickers while it closes.
		setQuery(event.key);
		updateNode(nodeId, {
			...data,
			eventKey: event.key,
			eventId: event.id,
			eventName: event.name,
		});
		closeEditor();
	};

	const submit = (index: number) => {
		if (exact) return choose(exact);
		const match = filtered[index];
		if (match) return choose(match);
		if (trimmed) setCreateKey(trimmed);
	};

	const nav = useListNav(filtered.length, submit);

	return (
		<>
			<EditorShell
				title="Trigger"
				onBack={closeEditor}
				icon="zap"
				inputRef={inputRef}
				value={query ?? current}
				caretAtEnd={query === null}
				onChange={(v) => {
					setQuery(v);
					nav.setHighlight(0);
				}}
				placeholder="Search events"
				mono
				onKeyDown={nav.onKeyDown}
				onSubmit={() => submit(nav.highlight)}
				submitDisabled={!trimmed && filtered.length === 0}
			>
				<MenuList label="Events">
					{eventsQuery.isLoading ? (
						<MenuEmpty>Loading events…</MenuEmpty>
					) : filtered.length === 0 ? (
						<MenuEmpty>
							{events.length === 0
								? "No events yet. Create one below."
								: `No events match “${trimmed}”`}
						</MenuEmpty>
					) : (
						filtered.map((event, index) => (
							<MenuItem
								key={event.id}
								icon="zap"
								label={event.key}
								mono
								meta={
									event.properties.length > 0
										? `${event.properties.length} prop${event.properties.length === 1 ? "" : "s"}`
										: undefined
								}
								selected={event.key === current}
								active={index === nav.highlight}
								onHover={() => nav.setHighlight(index)}
								onSelect={() => choose(event)}
								onEdit={() => setEditing(event)}
								editLabel={`Edit ${event.key}`}
							/>
						))
					)}
				</MenuList>
				<MenuFooter>
					<MenuAction
						icon="plus"
						onClick={() => setCreateKey(exact ? "" : trimmed)}
					>
						{trimmed && !exact ? (
							<>
								Create event{" "}
								<span className="font-mono text-text-strong-950">
									{trimmed}
								</span>
							</>
						) : (
							"Create an event"
						)}
					</MenuAction>
				</MenuFooter>
			</EditorShell>

			<CreateEventModal
				open={createKey !== null}
				initialKey={createKey ?? ""}
				onOpenChange={(open) => {
					if (!open) setCreateKey(null);
				}}
				onCreated={choose}
			/>
			<CreateEventModal
				open={editing !== null}
				event={editing}
				onOpenChange={(open) => {
					if (!open) setEditing(null);
				}}
				onUpdated={(event) => {
					// Keep this trigger pointing at its event if that's the one renamed.
					if (editing?.key === current) {
						updateNode(nodeId, {
							...data,
							eventKey: event.key,
							eventId: event.id,
							eventName: event.name,
						});
					}
					toast.success(`Updated "${event.name}"`);
				}}
			/>
		</>
	);
};
