"use client";

import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { CampaignsListHeader } from "./campaigns-list-header";
import { CampaignsProvider, useCampaigns } from "./campaigns-provider";
import { CampaignTable } from "./components/campaign-table";

function CampaignsPageContent() {
	const router = useRouter();
	const { campaigns, isLoading, isHydrated } = useCampaigns();
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
		router.push("/campaigns/create");
	};

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-campaign",
				label: "Create Campaign",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => router.push("/campaigns/create"),
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
		[router],
	);

	useRegisterCommandActions("campaigns", "Campaigns", actions);

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
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			{/* Page Header */}
			<CampaignsListHeader onCreate={handleCreate} />

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
									className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-xs transition-colors ${
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
													? "bg-bg-weak-50 font-semibold text-text-strong-950"
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
							className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-sub-600"
						/>
						<input
							type="search"
							placeholder="Search campaigns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 py-1.5 pr-3 pl-9 text-text-strong-950 text-xs outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
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
