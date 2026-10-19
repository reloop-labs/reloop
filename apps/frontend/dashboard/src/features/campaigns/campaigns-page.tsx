"use client";

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
import { CampaignsProvider, useCampaignsListQuery } from "./campaigns-provider";
import { CampaignErrorState } from "./components/campaign-error-state";
import { CampaignListToolbar } from "./components/campaign-list-toolbar";
import { CampaignTable } from "./components/campaign-table";
import { CreateCampaignModal } from "./components/create-campaign-modal";
import { useCampaignColumnVisibility } from "./hooks/use-campaign-column-visibility";

function CampaignsPageContent() {
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
	const [modal, setModal] = useQueryState("modal");
	const { columnVisibility, setColumnVisible } = useCampaignColumnVisibility();

	const limit = pageSize ?? 10;
	const page = currentPage ?? 1;
	// Sorted so the same selection in a different order shares a cache entry.
	const statuses = useMemo(() => [...statusFilters].sort(), [statusFilters]);
	const listQuery = useCampaignsListQuery({
		page,
		limit,
		search: searchQuery,
		statuses,
	});
	const campaigns = listQuery.data?.campaigns ?? [];
	const total = listQuery.data?.total ?? 0;

	// Clamp to the last page when the result set shrinks (e.g. after a delete).
	useEffect(() => {
		if (!listQuery.data || listQuery.isPlaceholderData) return;
		const totalPages = Math.max(1, Math.ceil(total / limit));
		if (page > totalPages) {
			void setCurrentPage(totalPages);
		}
	}, [
		listQuery.data,
		listQuery.isPlaceholderData,
		total,
		limit,
		page,
		setCurrentPage,
	]);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-campaign",
				label: "Create Campaign",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setModal("create-campaign"),
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
		[setModal],
	);

	useRegisterCommandActions("campaigns", "Campaigns", actions);

	const showLoading = listQuery.isPending;

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
			<CampaignsListHeader />

			{listQuery.isError ? (
				<CampaignErrorState />
			) : (
				<div className="space-y-4">
					<CampaignListToolbar
						columnVisibility={columnVisibility}
						onColumnVisibleChange={setColumnVisible}
					/>
					<CampaignTable
						campaigns={campaigns}
						total={total}
						columnVisibility={columnVisibility}
						isLoading={showLoading}
					/>
				</div>
			)}
			<CreateCampaignModal
				open={modal === "create-campaign"}
				onOpenChange={(open) => {
					void setModal(open ? "create-campaign" : null);
				}}
			/>
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
