"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button.Root
        variant="neutral"
        mode="stroke"
        size="xxsmall"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
      >
        <Icon name="chevron-left" className="h-4 w-4" />
      </Button.Root>
      <span className="px-2 text-paragraph-sm text-text-sub-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button.Root
        variant="neutral"
        mode="stroke"
        size="xxsmall"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
        className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
      >
        <Icon name="chevron-right" className="h-4 w-4" />
      </Button.Root>
    </div>
  );
};
