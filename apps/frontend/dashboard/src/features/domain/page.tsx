import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainCommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { DomainErrorState } from "./components/domain-error-state";
import { DomainListHeader } from "./components/domain-list-header";
import { DomainListToolbar } from "./components/domain-list-toolbar";
import { DomainTable } from "./components/domain-table";
import { DOMAIN_LEARN_DOCS_URL } from "./dns-provider";
import { useDomainColumnVisibility } from "./hooks/use-domain-column-visibility";
import { useDomainsQuery } from "./hooks/use-domains-query";

export function DomainPage() {
	const router = useRouter();
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const [statusFilters] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const { columnVisibility, setColumnVisible } = useDomainColumnVisibility();

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "add-domain",
				label: "Add Domain",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => router.push("/domain/add"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "domain" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () => window.open(DOMAIN_LEARN_DOCS_URL, "_blank"),
			},
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("domains:select-all")),
			},
		],
		[router],
	);

	useRegisterCommandActions("domains", "Domains", actions);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "domain" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const canFetch = hasInitialized && !orgPending;
	const { data, error, isPending, isFetching } = useDomainsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		status: statusFilters ?? [],
		q: searchQuery ?? "",
		enabled: canFetch,
	});
	const showLoading = !canFetch || isPending || (isFetching && !data);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<DomainListHeader />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				<div className="lg:col-span-9 xl:col-span-9">
					{error ? (
						<DomainErrorState />
					) : (
						<div className="space-y-4">
							<DomainListToolbar
								columnVisibility={columnVisibility}
								onColumnVisibleChange={setColumnVisible}
							/>
							<DomainTable
								domains={data?.domains || []}
								total={data?.total || 0}
								columnVisibility={columnVisibility}
								isLoading={showLoading}
							/>
						</div>
					)}
				</div>

				<div className="lg:col-span-3 xl:col-span-3">
					<DomainCommonUseCasesSidebar />
				</div>
			</div>
		</div>
	);
}
