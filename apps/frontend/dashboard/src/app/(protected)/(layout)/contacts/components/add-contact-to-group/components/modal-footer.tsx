"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";

interface ModalFooterProps {
	isSubmitting: boolean;
	selectedCount: number;
	fetchedCount: number;
	totalMatching: number;
	totalInOrg: number;
	onCancel: () => void;
	onSubmit: () => void;
}

export const ModalFooter = ({
	isSubmitting,
	selectedCount,
	fetchedCount,
	totalMatching,
	totalInOrg,
	onCancel,
	onSubmit,
}: ModalFooterProps) => {
	return (
		<div className="flex flex-col-reverse justify-end gap-2 border-stroke-soft-100 border-t px-6 py-4 sm:flex-row sm:items-center dark:border-stroke-soft-100/40">
			<div className="mr-auto hidden items-center gap-2 text-text-soft-400 text-xs sm:flex">
				{totalMatching > 0 && (
					<>
						<span>
							Showing {fetchedCount} of {totalMatching.toLocaleString()} records
						</span>
						<span className="h-1 w-1 rounded-full bg-stroke-soft-200 dark:bg-stroke-soft-100/20" />
						<div className="flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 dark:border-stroke-soft-100/10 dark:bg-bg-strong-200/50 dark:text-text-soft-400">
							<span className="h-1 w-1 rounded-full bg-success-base" />
							{totalInOrg.toLocaleString()} total
						</div>
					</>
				)}
			</div>
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				onClick={onCancel}
				disabled={isSubmitting}
				className="h-9 gap-1.5 px-4 text-sm"
			>
				Cancel
				<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px] dark:border-stroke-soft-100/20 dark:bg-bg-strong-200/50">
					Esc
				</span>
			</Button.Root>
			<Button.Root
				type="button"
				onClick={onSubmit}
				variant="neutral"
				disabled={isSubmitting || selectedCount === 0}
				className="h-9 gap-1.5 px-4 text-sm"
			>
				{isSubmitting ? (
					<>
						<Spinner size={14} color="currentColor" />
						Adding...
					</>
				) : (
					<>
						Add {selectedCount.toLocaleString()} contact
						{selectedCount !== 1 ? "s" : ""}
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<Icon
								name="enter"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
						</span>
					</>
				)}
			</Button.Root>
		</div>
	);
};
