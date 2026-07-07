"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CreateWorkflowModal } from "./components/create-workflow-modal";
import { WorkflowTable } from "./components/workflow-table";
import { useWorkflows } from "./components/workflows-provider";

const WorkflowsPage = () => {
	const { activeOrganization } = useUserOrganization();
	const { workflows, isHydrated } = useWorkflows();
	const [createOpen, setCreateOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return workflows;
		return workflows.filter(
			(w) =>
				w.name.toLowerCase().includes(q) ||
				w.description?.toLowerCase().includes(q),
		);
	}, [workflows, searchQuery]);

	const isTotalEmpty = isHydrated && workflows.length === 0;
	const isLoading = !isHydrated;

	const handleCreate = () => {
		if (activeOrganization?.slug) setCreateOpen(true);
	};

	useHotkeys(
		"mod+a",
		(event) => {
			event.preventDefault();
			handleCreate();
		},
		{ enabled: Boolean(activeOrganization?.slug) },
	);

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
			<div className="flex items-center justify-between pb-6">
				<h1 className="font-medium text-2xl">Workflows</h1>
				<div className="flex items-center gap-2 self-end">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2"
					>
						<a
							href="https://reloop.sh/docs/learn/automations"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-open" className="h-3.5 w-3.5" />
							Docs
						</a>
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={handleCreate}
						className="gap-2"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create workflow
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
				</div>
			</div>

			{!isTotalEmpty && (
				<div className="mb-4">
					<div className="relative">
						<Icon
							name="search"
							className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-text-sub-600"
						/>
						<input
							type="search"
							placeholder="Search workflows..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 py-2 pr-3 pl-9 text-sm outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
						/>
					</div>
				</div>
			)}

			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
				<WorkflowTable
					workflows={filtered}
					isLoading={isLoading}
					isTotalEmpty={isTotalEmpty}
					onCreate={handleCreate}
				/>
			</div>

			<CreateWorkflowModal open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
};

export default WorkflowsPage;
