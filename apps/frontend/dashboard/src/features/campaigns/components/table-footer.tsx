import { parseAsInteger, useQueryState } from "nuqs";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";

export function CampaignTableFooter({
	total,
	isLoading,
}: {
	total: number;
	isLoading?: boolean;
}) {
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const limit = pageSize ?? 10;
	const page = currentPage ?? 1;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const startIndex = total > 0 ? (page - 1) * limit + 1 : 0;
	const endIndex = Math.min(page * limit, total);

	if (total <= 0) return null;

	return (
		<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
			<div className="flex items-center gap-3">
				<span>
					Showing {startIndex}–{endIndex} of {total} campaign
					{total !== 1 ? "s" : ""}
				</span>
				<PageSizeDropdown
					value={limit}
					onValueChange={(value) => {
						void setPageSize(value);
						void setCurrentPage(1);
					}}
				/>
			</div>
			<PaginationControls
				currentPage={currentPage ?? 1}
				totalPages={totalPages}
				onPageChange={(p) => void setCurrentPage(p)}
				isLoading={isLoading}
			/>
		</div>
	);
}
