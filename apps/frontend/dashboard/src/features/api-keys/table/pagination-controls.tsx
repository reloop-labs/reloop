import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export function PaginationControls({
	currentPage,
	totalPages,
	onPageChange,
	isLoading = false,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
}) {
	const showButtons = totalPages > 1;

	return (
		<div className="flex items-center gap-1">
			{showButtons && (
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1 || isLoading}
					className="h-5 w-5 rounded-md! p-1"
				>
					<Icon name="chevron-left" className="h-3.5 w-3.5" />
				</Button.Root>
			)}
			<span className="px-2 text-text-sub-600 text-xs">
				Page {currentPage} of {Math.max(1, totalPages)}
			</span>
			{showButtons && (
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages || isLoading}
					className="h-5 w-5 rounded-md! p-1"
				>
					<Icon name="chevron-right" className="h-3.5 w-3.5" />
				</Button.Root>
			)}
		</div>
	);
}
