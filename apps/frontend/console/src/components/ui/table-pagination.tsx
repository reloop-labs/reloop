"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

export interface TablePaginationProps {
	total: number;
	page: number;
	limit: number;
	onPageChange: (page: number) => void;
	onLimitChange?: (limit: number) => void;
	pageSizeOptions?: number[];
	isLoading?: boolean;
	itemName?: string;
	className?: string;
}

export function TablePagination({
	total,
	page,
	limit,
	onPageChange,
	onLimitChange,
	pageSizeOptions = [20, 50, 100],
	isLoading = false,
	itemName = "items",
	className,
}: TablePaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const safePage = Math.min(Math.max(1, page), totalPages);

	const startItem = total === 0 ? 0 : (safePage - 1) * limit + 1;
	const endItem = total === 0 ? 0 : Math.min(safePage * limit, total);

	// Generate page numbers with ellipsis windowing
	const getPageNumbers = () => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

		if (safePage <= 4) {
			for (let i = 1; i <= 5; i++) {
				pages.push(i);
			}
			pages.push("ellipsis-end");
			pages.push(totalPages);
		} else if (safePage >= totalPages - 3) {
			pages.push(1);
			pages.push("ellipsis-start");
			for (let i = totalPages - 4; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);
			pages.push("ellipsis-start");
			pages.push(safePage - 1);
			pages.push(safePage);
			pages.push(safePage + 1);
			pages.push("ellipsis-end");
			pages.push(totalPages);
		}

		return pages;
	};

	const pages = getPageNumbers();

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-4 border-stroke-soft-100 border-t bg-bg-weak-50/40 px-4 py-3 text-[13px] text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
				className,
			)}
		>
			{/* Left side: Count summary & page size selector */}
			<div className="flex flex-wrap items-center gap-4">
				<p className="text-[12px] text-text-sub-600">
					{total === 0 ? (
						<span>No {itemName}</span>
					) : (
						<>
							Showing{" "}
							<span className="font-medium text-text-strong-950 tabular-nums">
								{startItem.toLocaleString()}–{endItem.toLocaleString()}
							</span>{" "}
							of{" "}
							<span className="font-medium text-text-strong-950 tabular-nums">
								{total.toLocaleString()}
							</span>{" "}
							{itemName}
						</>
					)}
				</p>

				{onLimitChange && (
					<div className="flex items-center gap-1.5 text-[12px]">
						<label htmlFor="table-page-size" className="text-text-sub-600">
							Per page:
						</label>
						<select
							id="table-page-size"
							value={limit}
							disabled={isLoading}
							onChange={(e) => onLimitChange(Number(e.target.value))}
							className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 font-medium text-[12px] text-text-strong-950 outline-none transition-colors hover:border-stroke-sub-300 focus:border-primary-base focus:ring-1 focus:ring-primary-base disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05]"
						>
							{pageSizeOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{/* Right side: Page navigation */}
			<div className="flex items-center gap-1">
				{/* First page */}
				<Button.Root
					type="button"
					size="xxsmall"
					variant="neutral"
					mode="stroke"
					disabled={safePage <= 1 || isLoading}
					onClick={() => onPageChange(1)}
					title="First page"
					className="h-7 w-7 rounded-lg p-0"
				>
					<ChevronsLeft className="h-3.5 w-3.5" />
				</Button.Root>

				{/* Previous page */}
				<Button.Root
					type="button"
					size="xxsmall"
					variant="neutral"
					mode="stroke"
					disabled={safePage <= 1 || isLoading}
					onClick={() => onPageChange(safePage - 1)}
					title="Previous page"
					className="h-7 w-7 rounded-lg p-0"
				>
					<ChevronLeft className="h-3.5 w-3.5" />
				</Button.Root>

				{/* Page numbers */}
				<div className="mx-1 flex items-center gap-1">
					{pages.map((p, idx) => {
						if (p === "ellipsis-start" || p === "ellipsis-end") {
							return (
								<span
									key={`${p}-${idx}`}
									className="select-none px-1 text-[11px] text-text-soft-400"
								>
									•••
								</span>
							);
						}

						const isCurrent = p === safePage;
						return (
							<button
								key={p}
								type="button"
								disabled={isLoading}
								onClick={() => onPageChange(p)}
								className={cn(
									"h-7 min-w-7 rounded-lg px-2 font-medium text-[12px] tabular-nums transition-colors",
									isCurrent
										? "bg-text-strong-950 text-bg-white-0 dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.06]",
								)}
							>
								{p}
							</button>
						);
					})}
				</div>

				{/* Next page */}
				<Button.Root
					type="button"
					size="xxsmall"
					variant="neutral"
					mode="stroke"
					disabled={safePage >= totalPages || isLoading}
					onClick={() => onPageChange(safePage + 1)}
					title="Next page"
					className="h-7 w-7 rounded-lg p-0"
				>
					<ChevronRight className="h-3.5 w-3.5" />
				</Button.Root>

				{/* Last page */}
				<Button.Root
					type="button"
					size="xxsmall"
					variant="neutral"
					mode="stroke"
					disabled={safePage >= totalPages || isLoading}
					onClick={() => onPageChange(totalPages)}
					title="Last page"
					className="h-7 w-7 rounded-lg p-0"
				>
					<ChevronsRight className="h-3.5 w-3.5" />
				</Button.Root>
			</div>
		</div>
	);
}
