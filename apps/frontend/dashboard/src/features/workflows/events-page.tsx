"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { AutomationFlowPreview } from "./components/automation-flow-preview";
import { AutomationListToolbar } from "./components/automation-list-toolbar";
import { EventsTable } from "./components/events-table";
import { listCustomEvents } from "./hooks/use-custom-events-api";

export function EventsPage() {
	const { activeOrganization } = useActiveOrganization();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [searchQuery, setSearchQuery] = useState("");

	const eventsQuery = useQuery({
		queryKey: queryKeys.workflows.events(),
		queryFn: () => listCustomEvents(100),
		enabled: !!activeOrganization?.slug,
	});

	const events = eventsQuery.data?.events ?? [];

	const filtered = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return events;
		return events.filter(
			(ev) =>
				ev.name.toLowerCase().includes(q) ||
				(ev.key?.toLowerCase().includes(q) ?? false),
		);
	}, [events, searchQuery]);

	const isLoading = eventsQuery.isLoading;
	const isTotalEmpty = !eventsQuery.isLoading && events.length === 0;
	const isFilteredEmpty =
		!eventsQuery.isLoading && events.length > 0 && filtered.length === 0;

	const handleCreate = useCallback(() => {
		void setModal("create-event");
	}, [setModal]);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-event",
				label: "Create Event",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => handleCreate(),
			},
			{
				id: "open-docs",
				label: "Open Events Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/workflows", "_blank"),
			},
		],
		[handleCreate],
	);

	useRegisterCommandActions("workflow-events", "Events", actions);

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div className="min-w-0 space-y-4">
				<AutomationListToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					statusFilter={[]}
					onStatusChange={() => {}}
					onRefresh={() => void eventsQuery.refetch()}
					searchPlaceholder="Search events..."
					searchLabel="Search events"
					showStatusFilter={false}
				/>

				<EventsTable
					events={filtered}
					isLoading={isLoading}
					isTotalEmpty={isTotalEmpty}
					isFilteredEmpty={isFilteredEmpty}
					onCreate={handleCreate}
					onClearFilters={() => setSearchQuery("")}
				/>
			</div>

			<AutomationFlowPreview variant="events" className="lg:sticky lg:top-6" />
		</div>
	);
}
