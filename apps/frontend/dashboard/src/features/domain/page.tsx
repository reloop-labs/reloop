import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainCommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { DeleteDomainModal } from "./components/delete-domain";
import { DomainErrorState } from "./components/domain-error-state";
import { DomainListHeader } from "./components/domain-list-header";
import { DomainListToolbar } from "./components/domain-list-toolbar";
import { DomainTable } from "./components/domain-table";
import { useDomainsQuery } from "./hooks/use-domains-query";

export function DomainPage() {
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const [statusFilters] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [deletedName, setDeletedName] = useState<string | null>(null);

	useEffect(() => {
		if (deletedName) {
			const timer = setTimeout(() => setDeletedName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedName]);

	const canFetch = hasInitialized && !orgPending;
	const { data, error, isPending, isFetching } = useDomainsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		status: statusFilters ?? "",
		q: searchQuery ?? "",
		enabled: canFetch,
	});
	const showLoading = !canFetch || isPending || (isFetching && !data);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<DomainListHeader />

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<div className="lg:col-span-8 xl:col-span-8">
					<AnimatePresence>
						{deletedName && (
							<motion.div
								key="deleted-banner"
								initial={{ opacity: 0, y: -8, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto" }}
								exit={{ opacity: 0, y: -8, height: 0 }}
								transition={{ duration: 0.2 }}
								className="mb-4 overflow-hidden"
							>
								<div className="flex items-center justify-between rounded-xl border border-[#B7F1D0] bg-[#E8FAF0] px-4 py-3 text-sm text-[#0F5C34] dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
									<span>
										Domain &quot;
										<span className="font-semibold">{deletedName}</span>&quot;
										has been successfully deleted.
									</span>
									<button
										type="button"
										onClick={() => setDeletedName(null)}
										className="p-1 text-[#0F5C34]/70 transition-colors hover:text-[#0F5C34] dark:text-emerald-200/70 dark:hover:text-emerald-200"
									>
										<Icon name="close" className="h-4 w-4" />
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{error ? (
						<DomainErrorState />
					) : (
						<div className="space-y-4">
							<DomainListToolbar />
							<DomainTable
								domains={data?.domains || []}
								total={data?.total || 0}
								isLoading={showLoading}
							/>
						</div>
					)}
				</div>

				<div className="lg:col-span-4 xl:col-span-4">
					<DomainCommonUseCasesSidebar />
				</div>
			</div>

			<DeleteDomainModal
				domains={data?.domains || []}
				onDeleteSuccess={(name) => setDeletedName(name)}
			/>
		</div>
	);
}
