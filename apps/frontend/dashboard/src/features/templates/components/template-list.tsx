import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import {
	useCreateTemplate,
	useInvalidateTemplates,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import { TemplatesListHeader } from "../templates-list-header";
import { EmptyState } from "./empty-state";
import { TemplateGrid } from "./template-grid";
import { TemplateListToolbar } from "./template-list-toolbar";

const DOCS_URL = "https://reloop.sh/docs/learn/templates";

export function TemplateList() {
	const { create } = useCreateTemplate();
	const invalidate = useInvalidateTemplates();
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [statusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [deletedName, setDeletedName] = useState<string | null>(null);

	const { data, error, isPending, isFetching, refetch } = useTemplatesQuery();
	const isLoading = isPending || (isFetching && !data);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-template",
				label: "Create Template",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void create(),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () => window.open(DOCS_URL, "_blank"),
			},
		],
		[create],
	);

	useRegisterCommandActions("templates", "Templates", actions);

	useEffect(() => {
		if (deletedName) {
			const timer = setTimeout(() => setDeletedName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedName]);

	const filteredTemplates = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		const statuses = statusFilter;
		return (
			data?.templates?.filter((template) => {
				if (statuses.length > 0 && !statuses.includes(template.status)) {
					return false;
				}
				if (!q) return true;
				return (
					template.name.toLowerCase().includes(q) ||
					template.description?.toLowerCase().includes(q)
				);
			}) || []
		);
	}, [data?.templates, searchQuery, statusFilter]);

	const hasAnyTemplates = (data?.templates?.length ?? 0) > 0;

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
						<div className="flex items-center justify-between rounded-xl border border-[#B7F1D0] bg-[#E8FAF0] px-4 py-3 text-[#0F5C34] text-sm dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
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
					<TemplateListToolbar />

					<div className="mt-4">
						{!isLoading && filteredTemplates.length === 0 ? (
							<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
								<EmptyState />
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
