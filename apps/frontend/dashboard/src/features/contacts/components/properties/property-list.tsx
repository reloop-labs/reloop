import { Icon } from "@reloop/ui/icon";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useMemo } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { usePropertiesQuery } from "../../hooks/use-contacts-query";
import { usePropertyColumnVisibility } from "../../hooks/use-property-column-visibility";
import { PropertyListToolbar } from "./property-list-toolbar";
import { PropertyTable } from "./property-table";

export function PropertyList() {
	const { activeOrganization } = useActiveOrganization();
	const [, setModal] = useQueryState("modal");
	const [currentPage] = useQueryState(
		"propertyPage",
		parseAsInteger.withDefault(1),
	);
	const [pageSize] = useQueryState(
		"propertyLimit",
		parseAsInteger.withDefault(10),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [typeFilter, setTypeFilter] = useQueryState(
		"type",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const { columnVisibility, setColumnVisible } = usePropertyColumnVisibility();

	/** Exactly one type applies a filter (same pattern as contacts status). */
	const typeParam = typeFilter.length === 1 ? (typeFilter[0] ?? "") : "";

	const { data, error, isPending, isFetching } = usePropertiesQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		type: typeParam,
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "add-property",
				label: "Add Property",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setModal("add-property"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "contacts/contact-properties" },
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
					window.dispatchEvent(new CustomEvent("properties:select-all")),
			},
		],
		[setModal],
	);

	useRegisterCommandActions("properties", "Properties", actions);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load properties
				</p>
			</div>
		);
	}

	return (
		<div>
			<PropertyListToolbar
				columnVisibility={columnVisibility}
				onColumnVisibleChange={setColumnVisible}
			/>

			<div className="mt-4">
				<PropertyTable
					properties={data?.properties || []}
					total={data?.total || 0}
					columnVisibility={columnVisibility}
					isLoading={isLoading}
					loadingRows={4}
					onAddProperty={() => void setModal("add-property")}
					searchQuery={searchQuery ?? ""}
					typeFilter={typeFilter}
					onClearFilters={() => {
						void setSearchQuery(null);
						void setTypeFilter([]);
					}}
				/>
			</div>
		</div>
	);
}
