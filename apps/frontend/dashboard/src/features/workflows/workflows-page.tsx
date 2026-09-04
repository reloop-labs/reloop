"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { AutomationListToolbar } from "./components/automation-list-toolbar";
import { WorkflowTable } from "./components/workflow-table";
import { useWorkflows } from "./components/workflows-provider";
import type { WorkflowStatus } from "./workflow-types";

export function WorkflowsPage() {
	const {
		workflows,
		isHydrated,
		isLoading: listLoading,
		refetch,
	} = useWorkflows();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const filtered = useMemo(() => {
		const allowed = statusFilter.length > 0 ? new Set(statusFilter) : null;
		const q = searchQuery.toLowerCase().trim();
		return workflows.filter((w) => {
			if (allowed && !allowed.has(w.status as WorkflowStatus)) return false;
			if (!q) return true;
			return (
				w.name.toLowerCase().includes(q) ||
				(w.description?.toLowerCase().includes(q) ?? false)
			);
		});
	}, [workflows, searchQuery, statusFilter]);

	const isLoading = !isHydrated || listLoading;
	const isTotalEmpty = isHydrated && !listLoading && workflows.length === 0;
	const isFilteredEmpty =
		isHydrated && !listLoading && workflows.length > 0 && filtered.length === 0;

	const handleCreate = useCallback(() => {
		void setModal("create-workflow");
	}, [setModal]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setStatusFilter([]);
	};

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-workflow",
				label: "Create Automation",
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
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("workflows:select-all")),
			},
		],
		[handleCreate],
	);

	useRegisterCommandActions("workflows", "Automation", actions);

	return (
		<div className="space-y-4">
			<AutomationListToolbar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				onRefresh={() => refetch()}
				columnVisibility={columnVisibility}
				onColumnVisibleChange={(id, visible) =>
					setColumnVisibility((prev) => ({ ...prev, [id]: visible }))
				}
			/>

			<WorkflowTable
				workflows={filtered}
				columnVisibility={columnVisibility}
				isLoading={isLoading}
				isTotalEmpty={isTotalEmpty}
				isFilteredEmpty={isFilteredEmpty}
				onCreate={handleCreate}
				onClearFilters={handleClearFilters}
			/>
		</div>
	);
}
