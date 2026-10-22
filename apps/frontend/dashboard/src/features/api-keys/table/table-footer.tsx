import { cn } from "@reloop/ui/cn";
import { parseAsInteger, useQueryState } from "nuqs";
import { PageSizeDropdown } from "./page-size-dropdown";
import { PaginationControls } from "./pagination-controls";

export function TableFooter({
	total,
	selectedCount = 0,
	pageRowCount = 0,
	isLoading,
	className,
}: {
	total: number;
	selectedCount?: number;
	pageRowCount?: number;
	isLoading?: boolean;
	className?: string;
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

	if (total <= 0) return null;

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 px-4 py-2 text-label-xs text-text-sub-600",
				className,
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<span className="hidden truncate sm:inline">
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
