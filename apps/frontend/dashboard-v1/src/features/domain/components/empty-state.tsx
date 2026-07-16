import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Link } from "@tanstack/react-router";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { getStatusLabel } from "../utils";

export function EmptyState() {
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
		void setStatusFilters(null);
		void setSearchQuery("");
		void setCurrentPage(1);
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
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleClearFilters}
					className="gap-2 rounded-lg"
				>
					<Icon name="refresh-cw" className="h-3.5 w-3.5" />
					Clear filters
				</Button.Root>
			) : (
				<div className="flex items-center gap-3">
					<Link
						to="/domain/add"
						className={`${Button.buttonVariants({ variant: "neutral", mode: "stroke", size: "xsmall" }).root()} gap-2 rounded-lg`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add Domain
					</Link>
					<a
						href="https://reloop.sh/docs/domains"
						target="_blank"
						rel="noopener noreferrer"
						className={`${Button.buttonVariants({ variant: "neutral", mode: "stroke", size: "xsmall" }).root()} gap-2 rounded-lg`}
					>
						<Icon name="book-closed" className="h-3.5 w-3.5" />
						Learn about domains
					</a>
				</div>
			)}
		</div>
	);
}
