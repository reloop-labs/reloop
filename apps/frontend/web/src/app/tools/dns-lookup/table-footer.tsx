"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

const defaultOptions = [10, 20, 50, 100];

export function PageSizeDropdown({
	value,
	onValueChange,
	options = defaultOptions,
}: {
	value: number;
	onValueChange: (value: number) => void;
	options?: number[];
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const selectedIdx = options.indexOf(value);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;
	const currentTab = buttonRefs.current[activeIdx];

	return (
		<Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					className={cn(
						"flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none transition-colors",
						hoverIdx !== undefined || dropdownOpen
							? "bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white"
							: "hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white",
					)}
				>
					{value}
					<Icon
						name="chevron-down"
						className={cn(
							"h-3 w-3 transition-transform duration-200",
							dropdownOpen && "rotate-180",
						)}
					/>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="start"
				className="w-20 rounded-xl p-1.5 dark:border-white/10 dark:bg-[#121212]"
			>
				<div className="relative">
					{options.map((size, idx) => (
						<button
							key={size}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => {
								onValueChange(size);
								setDropdownOpen(false);
							}}
							className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs dark:text-white"
						>
							{size}
							{value === size && (
								<Icon name="check-circle" className="h-3 w-3" />
							)}
						</button>
					))}
					{currentTab && (
						<div
							className="pointer-events-none absolute top-0 left-0 z-0 rounded-lg bg-neutral-alpha-10 transition-all duration-150 dark:bg-white/10"
							style={{
								top: currentTab.offsetTop,
								left: currentTab.offsetLeft,
								width: currentTab.offsetWidth,
								height: currentTab.offsetHeight,
							}}
						/>
					)}
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}

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
			<span className="px-2 text-text-sub-600 text-xs dark:text-white/60">
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

export function TableFooter({
	total,
	selectedCount = 0,
	pageRowCount = 0,
	currentPage = 1,
	pageSize = 10,
	onPageChange,
	onPageSizeChange,
	isLoading,
	label = "records",
}: {
	total: number;
	selectedCount?: number;
	pageRowCount?: number;
	currentPage: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	isLoading?: boolean;
	label?: string;
}) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	if (total <= 0) return null;

	return (
		<div className="flex items-center justify-between border-stroke-soft-200 border-t px-4 py-2 text-label-xs text-text-sub-600 dark:border-white/10 dark:text-white/60">
			<div className="flex items-center gap-3">
				<span>
					Showing {pageRowCount} of {total} {label}
				</span>
				<PageSizeDropdown
					value={pageSize}
					onValueChange={(value) => {
						onPageSizeChange(value);
						onPageChange(1);
					}}
				/>
			</div>
			<PaginationControls
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={onPageChange}
				isLoading={isLoading}
			/>
		</div>
	);
}
