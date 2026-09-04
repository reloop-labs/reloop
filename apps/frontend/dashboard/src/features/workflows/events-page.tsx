import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { AutomationFlowPreview } from "./components/automation-flow-preview";
import { AutomationListHeader } from "./components/automation-list-header";
import { AutomationListToolbar } from "./components/automation-list-toolbar";
import { CreateEventModal } from "./components/create-event-modal";
import { EventsTable } from "./components/events-table";
import { listCustomEvents } from "./hooks/use-custom-events-api";

export function EventsPage() {
	const { activeOrganization } = useActiveOrganization();
	const [createOpen, setCreateOpen] = useState(false);
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
			(event) =>
				event.name.toLowerCase().includes(q) ||
				event.key.toLowerCase().includes(q),
		);
	}, [events, searchQuery]);

	const isLoading = eventsQuery.isLoading;
	const isTotalEmpty =
		!eventsQuery.isLoading && eventsQuery.isSuccess && events.length === 0;
	const isFilteredEmpty =
		!eventsQuery.isLoading && events.length > 0 && filtered.length === 0;

	const handleCreate = () => {
		if (activeOrganization?.slug) setCreateOpen(true);
	};

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
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/workflows", "_blank"),
			},
		],
		[activeOrganization?.slug],
	);

	useRegisterCommandActions("workflow-events", "Events", actions);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			handleCreate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<AutomationListHeader
				onCreate={handleCreate}
				createLabel="Create event"
				title="Events"
				description="Custom events that start automations. Separate from webhooks."
				icon="route"
			/>

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
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

				<AutomationFlowPreview
					className="lg:sticky lg:top-6"
					caption="Events start the path. Create one, then use it as a trigger."
				/>
			</div>

			<CreateEventModal open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
