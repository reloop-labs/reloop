import { parseAsInteger, useQueryState } from "nuqs";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";

export function PropertyTableFooter({
	total,
	selectedCount = 0,
	pageRowCount = 0,
	isLoading,
}: {
	total: number;
	selectedCount?: number;
	pageRowCount?: number;
	isLoading?: boolean;
}) {
	const [currentPage, setCurrentPage] = useQueryState(
		"propertyPage",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"propertyLimit",
		parseAsInteger.withDefault(10),
	);

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	if (total <= 0) return null;

	return (
		<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
			<div className="flex items-center gap-3">
				<span>
					{selectedCount} of {pageRowCount} row(s) selected.
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
