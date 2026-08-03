import { Icon } from "@reloop/ui/icon";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useGroupsQuery } from "../../hooks/use-contacts-query";
import { useGroupColumnVisibility } from "../../hooks/use-group-column-visibility";
import { GroupListToolbar } from "./group-list-toolbar";
import { GroupTable } from "./group-table";

export function GroupList() {
	const { activeOrganization } = useActiveOrganization();
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [, setModal] = useQueryState("modal");
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const { columnVisibility, setColumnVisible } = useGroupColumnVisibility();

	const { data, error, isPending, isFetching } = useGroupsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-group",
				label: "Create Group",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setModal("create-group"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "contacts/groups" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/contacts", "_blank"),
			},
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("groups:select-all")),
			},
		],
		[setModal],
	);

	useRegisterCommandActions("groups", "Groups", actions);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load groups
				</p>
			</div>
		);
	}

	const groups = (data?.groups || []).map((g) => ({
		...g,
		organizationId: g.organizationId || "",
		createdAt: g.createdAt || "",
		updatedAt: g.updatedAt || "",
		deletedAt: g.deletedAt ?? null,
	}));

	return (
		<div>
			<GroupListToolbar
				columnVisibility={columnVisibility}
				onColumnVisibleChange={setColumnVisible}
			/>

			<div className="mt-4">
				<GroupTable
					groups={groups}
					total={data?.total || 0}
					columnVisibility={columnVisibility}
					isLoading={isLoading}
					loadingRows={6}
					onAddGroup={() => void setModal("create-group")}
					searchQuery={searchQuery ?? ""}
					onClearSearch={() => void setSearchQuery(null)}
				/>
			</div>
		</div>
	);
}
