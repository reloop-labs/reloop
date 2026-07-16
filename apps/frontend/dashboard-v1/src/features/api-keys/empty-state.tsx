import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function EmptyState({ onCreateApiKey }: { onCreateApiKey: () => void }) {
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
		void setStatusFilter("");
		void setCreatorFilter("");
		void setSearchQuery("");
		void setCurrentPage(1);
	};

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon
					name={isFiltered ? "search" : "key-new"}
					className="h-5 w-5 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered ? "No API keys found" : "No API keys yet"}
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? "Try adjusting your search or filters."
					: "Use API keys to authenticate requests and connect your apps to Reloop securely."}
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
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onCreateApiKey}
						className="gap-2 rounded-lg"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create API Key
					</Button.Root>
					<a
						href="https://reloop.sh/docs/learn/api-keys"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex h-8 items-center gap-2 rounded-lg border border-stroke-soft-100 px-2.5 font-medium text-[12px] text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="book-closed" className="h-3.5 w-3.5" />
						Learn about API keys
					</a>
				</div>
			)}
		</div>
	);
}
