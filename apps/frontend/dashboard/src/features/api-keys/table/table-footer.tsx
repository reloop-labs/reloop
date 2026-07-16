import { parseAsInteger, useQueryState } from "nuqs";
import { PageSizeDropdown } from "./page-size-dropdown";
import { PaginationControls } from "./pagination-controls";

export function TableFooter({
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

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));
	const startIndex =
		total === 0 ? 0 : ((currentPage ?? 1) - 1) * (pageSize ?? 10) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 10), total);

	if (total <= 0) return null;

	return (
		<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
			<div className="flex items-center">
				<span>
					Showing {startIndex}–{endIndex} of {total} API key
					{total !== 1 ? "s" : ""}
				</span>
				<PageSizeDropdown
					value={pageSize ?? 10}
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
