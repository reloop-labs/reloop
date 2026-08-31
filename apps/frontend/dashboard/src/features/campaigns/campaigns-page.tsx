"use client";

import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useEffect, useMemo } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { CampaignsListHeader } from "./campaigns-list-header";
import { CampaignsProvider, useCampaigns } from "./campaigns-provider";
import { CampaignErrorState } from "./components/campaign-error-state";
import { CampaignListToolbar } from "./components/campaign-list-toolbar";
import { CampaignTable } from "./components/campaign-table";
import { useCampaignColumnVisibility } from "./hooks/use-campaign-column-visibility";

function CampaignsPageContent() {
	const router = useRouter();
	const { campaigns, isLoading, isHydrated, isError } = useCampaigns();
	const [statusFilters] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const { columnVisibility, setColumnVisible } = useCampaignColumnVisibility();

	const filtered = useMemo(() => {
		let list = campaigns;
		if (statusFilters.length > 0) {
			const allowed = new Set(statusFilters);
			list = list.filter((campaign) => allowed.has(campaign.status));
		}
		const q = searchQuery.toLowerCase().trim();
		if (!q) return list;
		return list.filter(
			(campaign) =>
				campaign.name.toLowerCase().includes(q) ||
				campaign.subject.toLowerCase().includes(q) ||
				(campaign.audienceTargetName?.toLowerCase().includes(q) ?? false),
		);
	}, [campaigns, statusFilters, searchQuery]);

	const limit = pageSize ?? 10;
	const page = currentPage ?? 1;
	const paged = useMemo(() => {
		const start = (page - 1) * limit;
		return filtered.slice(start, start + limit);
	}, [filtered, page, limit]);

	useEffect(() => {
		const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
		if (page > totalPages) {
			void setCurrentPage(totalPages);
		}
	}, [filtered.length, limit, page, setCurrentPage]);

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
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("campaigns:select-all")),
			},
		],
		[router],
	);

	useRegisterCommandActions("campaigns", "Campaigns", actions);

	const showLoading = !isHydrated || isLoading;

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<CampaignsListHeader />

			{isError ? (
				<CampaignErrorState />
			) : (
				<div className="space-y-4">
					<CampaignListToolbar
						columnVisibility={columnVisibility}
						onColumnVisibleChange={setColumnVisible}
					/>
					<CampaignTable
						campaigns={paged}
						total={filtered.length}
						columnVisibility={columnVisibility}
						isLoading={showLoading}
					/>
				</div>
			)}
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
