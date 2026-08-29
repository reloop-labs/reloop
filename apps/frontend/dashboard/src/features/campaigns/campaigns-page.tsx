"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type { CampaignStatus } from "./campaign-types";
import { CampaignsProvider, useCampaigns } from "./campaigns-provider";
import { CampaignStatsCards } from "./components/campaign-stats";
import { CampaignTable } from "./components/campaign-table";
import { CreateCampaignModal } from "./components/create-campaign-modal";

function CampaignsPageContent() {
	const { activeOrganization } = useActiveOrganization();
	const { campaigns, stats, isLoading, isHydrated } = useCampaigns();
	const [createOpen, setCreateOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");

	const filtered = useMemo(() => {
		let list = campaigns;
		if (selectedStatus !== "all") {
			list = list.filter((c) => c.status === selectedStatus);
		}
		const q = searchQuery.toLowerCase().trim();
		if (!q) return list;
		return list.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.subject.toLowerCase().includes(q) ||
				(c.audienceTargetName?.toLowerCase().includes(q) ?? false),
		);
	}, [campaigns, selectedStatus, searchQuery]);

	const isTotalEmpty = isHydrated && !isLoading && campaigns.length === 0;

	const handleCreate = () => {
		setCreateOpen(true);
	};

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-campaign",
				label: "Create Campaign",
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
					window.open("https://reloop.sh/docs/learn/emails", "_blank"),
			},
		],
		[],
	);

	useRegisterCommandActions("campaigns", "Campaigns", actions);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			handleCreate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/learn/emails", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const statusTabs: { id: string; label: string; count?: number }[] = [
		{ id: "all", label: "All Campaigns", count: campaigns.length },
		{
			id: "sent",
			label: "Sent",
			count: campaigns.filter((c) => c.status === "sent").length,
		},
		{
			id: "scheduled",
			label: "Scheduled",
			count: campaigns.filter((c) => c.status === "scheduled").length,
		},
		{
			id: "draft",
			label: "Drafts",
			count: campaigns.filter((c) => c.status === "draft").length,
		},
	];

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
			{/* Page Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-semibold text-2xl text-text-strong-950">Campaigns</h1>
					<p className="mt-1 text-text-sub-600 text-sm">
						Broadcast newsletters and email updates directly to all your contacts.
					</p>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-center">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2"
					>
						<a
							href="https://reloop.sh/docs/learn/emails"
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
						Create campaign
						<span className="inline-flex items-center gap-0.5">
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/30 p-px font-medium text-[10px] uppercase">
								C
							</span>
						</span>
					</Button.Root>
				</div>
			</div>

			{/* Top Metric Cards */}
			<CampaignStatsCards stats={stats} isLoading={!isHydrated || isLoading} />

			{/* Filters & Search Toolbar */}
			{!isTotalEmpty && (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Status Tabs */}
					<div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-stroke-soft-100 p-1 dark:border-stroke-soft-100/50">
						{statusTabs.map((tab) => {
							const active = selectedStatus === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setSelectedStatus(tab.id)}
									className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
										active
											? "bg-bg-white-0 text-text-strong-950 shadow-xs dark:bg-bg-weak-100"
											: "text-text-sub-600 hover:text-text-strong-950"
									}`}
								>
									<span>{tab.label}</span>
									{tab.count !== undefined && (
										<span
											className={`rounded-full px-1.5 py-0.2 text-[10px] ${
												active
													? "bg-bg-weak-50 text-text-strong-950 font-semibold"
													: "bg-bg-weak-50/60 text-text-sub-600"
											}`}
										>
											{tab.count}
										</span>
									)}
								</button>
							);
						})}
					</div>

					{/* Search input */}
					<div className="relative w-full sm:w-64">
						<Icon
							name="search"
							className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-text-sub-600"
						/>
						<input
							type="search"
							placeholder="Search campaigns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 py-1.5 pr-3 pl-9 text-xs text-text-strong-950 outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
						/>
					</div>
				</div>
			)}

			{/* Main Table Container */}
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-xs dark:border-stroke-soft-100/50">
				<CampaignTable
					campaigns={filtered}
					isLoading={!isHydrated || isLoading}
					isTotalEmpty={isTotalEmpty}
					onCreate={handleCreate}
				/>
			</div>

			{/* Composer Modal */}
			<CreateCampaignModal open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}

export function CampaignsPage() {
	return (
		<CampaignsProvider>
			<CampaignsPageContent />
		</CampaignsProvider>
	);
}
