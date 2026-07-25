import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import {
	useInvalidateTemplates,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import { TemplatesListHeader } from "../templates-list-header";
import { EmptyState } from "./empty-state";
import {
	TemplateStatusFilterDropdown,
	type TemplateStatusFilter,
} from "./status-filter-dropdown";
import { TemplateGrid } from "./template-grid";

export function TemplateList() {
	const invalidate = useInvalidateTemplates();
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsStringLiteral(["draft", "published", "archived"] as const),
	);
	const [deletedName, setDeletedName] = useState<string | null>(null);

	const { data, error, isPending, isFetching, refetch } = useTemplatesQuery();
	const isLoading = isPending || (isFetching && !data);

	useEffect(() => {
		if (deletedName) {
			const timer = setTimeout(() => setDeletedName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedName]);

	const filteredTemplates = useMemo(() => {
		const q = (searchQuery ?? "").trim().toLowerCase();
		return (
			data?.templates?.filter((template) => {
				if (statusFilter && template.status !== statusFilter) return false;
				if (!q) return true;
				return (
					template.name.toLowerCase().includes(q) ||
					template.description?.toLowerCase().includes(q)
				);
			}) || []
		);
	}, [data?.templates, searchQuery, statusFilter]);

	const hasAnyTemplates = (data?.templates?.length ?? 0) > 0;
	const isFiltered =
		!!statusFilter || (searchQuery ?? "").trim() !== "";

	const clearFilters = () => {
		void setSearchQuery("");
		void setStatusFilter(null);
	};

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<TemplatesListHeader />

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
								Template &quot;
								<span className="font-semibold">{deletedName}</span>&quot; has
								been successfully deleted.
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
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load templates
					</p>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => void refetch()}
						className="rounded-xl"
					>
						Retry
					</Button.Root>
				</div>
			) : !isLoading && !hasAnyTemplates ? (
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<EmptyState />
				</div>
			) : (
				<div className="pb-8">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<Input.Root size="small" className="rounded-xl">
								<Input.Wrapper>
									<Input.Icon as={Icon} name="search" size="small" />
									<Input.Input
										type="text"
										placeholder="Search templates..."
										value={searchQuery ?? ""}
										onChange={(e) => void setSearchQuery(e.target.value)}
									/>
									{(searchQuery ?? "") && (
										<button
											type="button"
											onMouseDown={(e) => e.preventDefault()}
											onClick={() => void setSearchQuery("")}
											className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
										>
											<Icon name="cross" className="h-3 w-3" />
										</button>
									)}
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div className="flex items-center gap-2">
							<TemplateStatusFilterDropdown
								value={(statusFilter as TemplateStatusFilter) ?? null}
								onChange={(status) => void setStatusFilter(status)}
							/>
							<button
								type="button"
								onClick={() => void invalidate()}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
								title="Refresh templates"
							>
								<Icon name="rotate-cw" className="h-4 w-4" />
							</button>
						</div>
					</div>

					<div className="mt-4">
						{!isLoading && filteredTemplates.length === 0 ? (
							<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
								<EmptyState
									isFiltered={isFiltered}
									onClearFilters={clearFilters}
								/>
							</div>
						) : (
							<TemplateGrid
								templates={filteredTemplates}
								isLoading={isLoading}
								loadingRows={6}
								onMutate={() => void invalidate()}
								onDeleteSuccess={(name) => setDeletedName(name)}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
