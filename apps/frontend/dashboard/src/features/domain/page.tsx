import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "@tanstack/react-router";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DeleteDomainModal } from "./components/delete-domain";
import { DomainErrorState } from "./components/domain-error-state";
import { DomainListHeader } from "./components/domain-list-header";
import { DomainListToolbar } from "./components/domain-list-toolbar";
import { DomainTable } from "./components/domain-table";
import { useDomainsQuery } from "./hooks/use-domains-query";

export function DomainPage() {
	const navigate = useNavigate();
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const [statusFilters] = useQueryState("status", parseAsString.withDefault(""));
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const canFetch = hasInitialized && !orgPending;
	const { data, error, isPending, isFetching } = useDomainsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		status: statusFilters ?? "",
		q: searchQuery ?? "",
		enabled: canFetch,
	});
	const showLoading = !canFetch || isPending || (isFetching && !data);

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		void navigate({ to: "/domain/add" });
	});

	return (
		<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
			<DomainListHeader />
			<div className="space-y-4">
				<DomainListToolbar />
				<div>
					{error ? (
						<DomainErrorState />
					) : (
						<DomainTable
							domains={data?.domains || []}
							total={data?.total || 0}
							isLoading={showLoading}
						/>
					)}
				</div>
			</div>
			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
}
