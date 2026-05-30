"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

interface EmptyStateProps {
	onCreateApiKey: () => void;
}

export const EmptyState = ({ onCreateApiKey }: EmptyStateProps) => {
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [creatorFilter, setCreatorFilter] = useQueryState(
		"creator",
		parseAsString.withDefault(""),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	const isFiltered =
		statusFilter !== "" || creatorFilter !== "" || searchQuery.trim() !== "";

	const handleClearFilters = () => {
		setStatusFilter("");
		setCreatorFilter("");
		setSearchQuery("");
		setCurrentPage(1);
	};

	const filterLabels = [];
	if (statusFilter) {
		filterLabels.push(`Status: ${statusFilter}`);
	}
	if (creatorFilter) {
		filterLabels.push("Creator");
	}
	const filtersText =
		filterLabels.length > 0 ? ` (${filterLabels.join(", ")})` : "";

	let title = "No API keys yet";
	let description: React.ReactNode =
		"Use API keys to authenticate requests and connect your apps to Reloop securely.";

	if (isFiltered) {
		title = "No API keys found";
		const hasFilters = statusFilter !== "" || creatorFilter !== "";
		if (searchQuery.trim() !== "") {
			description = (
				<>
					No API keys found for{" "}
					<span className="font-semibold text-text-strong-950">
						"{searchQuery}"
					</span>
					{hasFilters ? ` with the applied filters${filtersText}.` : "."}
				</>
			);
		} else {
			description = `No API keys found for the applied filters${filtersText}. Try adjusting them.`;
		}
	}

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon
					name={isFiltered ? "search" : "key-new"}
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
						onClick={onCreateApiKey}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create API Key
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<a
							href="https://reloop.sh/docs/api-keys"
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

