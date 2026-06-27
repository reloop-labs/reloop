"use client";
import { getStatusLabel } from "@fe/dashboard/utils/domain";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import Link from "next/link";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";

export const EmptyState = () => {
	const getBackToUrl = useGetBackToUrl();
	const [statusFilters, setStatusFilters] = useQueryState(
		"status",
		parseAsStringLiteral([
			"pending",
			"verifying",
			"active",
			"suspended",
			"failed",
		] as const),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	const isFiltered = statusFilters !== null || searchQuery.trim() !== "";

	const handleClearFilters = () => {
		setStatusFilters(null);
		setSearchQuery("");
		setCurrentPage(1);
	};

	let title = "No domains yet";
	let description =
		"Add a custom domain to send emails and improve your deliverability.";

	if (isFiltered) {
		const statusLabel = statusFilters ? getStatusLabel(statusFilters) : "";
		if (searchQuery.trim() !== "" && statusFilters !== null) {
			title = "No matching domains";
			description = `No domains with status "${statusLabel}" matching "${searchQuery}" were found.`;
		} else if (searchQuery.trim() !== "") {
			title = `No domains found for "${searchQuery}"`;
			description =
				"We couldn't find any domains matching your search query. Try checking for typos.";
		} else if (statusFilters !== null) {
			title = `No ${statusLabel} domains`;
			description = `We couldn't find any domains with the status "${statusLabel}".`;
		}
	}

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon
					name={isFiltered ? "search" : "globe"}
					className="h-5 w-5 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title}
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				{description}
			</p>
			{isFiltered ? (
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={handleClearFilters}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="refresh-cw" className="h-3.5 w-3.5" />
						Clear filters
					</Button.Root>
				</div>
			) : (
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href={getBackToUrl("/domain/add")}>
							<Icon name="plus" className="h-4 w-4" />
							Add Domain
							<span className="inline-flex items-center gap-0.5">
								<Icon
									name="command"
									className="h-4 w-4 rounded-sm border border-stroke-soft-200 p-px"
								/>
								<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
									A
								</span>
							</span>
						</Link>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<a
							href="https://reloop.sh/docs/domains"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-closed" className="h-3.5 w-3.5" />
							Learn about domains{" "}
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
								D
							</span>
						</a>
					</Button.Root>
				</div>
			)}
		</div>
	);
};
