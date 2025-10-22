"use client";

import {
	getAnimationProps,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@dashboard/utils/domain";
import type { DNSRecord } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

interface DNSRecordTableProps {
	records: DNSRecord[];
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
	isLoading?: boolean;
	loadingRows?: number;
}

export const DNSRecordTable = ({
	records,
	onCopyToClipboard,
	copiedItems = new Set(),
	isLoading,
	loadingRows = 3,
}: DNSRecordTableProps) => {
	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[minmax(80px,auto)_minmax(120px,auto)_1fr_minmax(80px,auto)_minmax(80px,auto)_minmax(100px,auto)]">
					<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
						<div className="py-2.5">Type</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Host / Name</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Value</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Priority</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">TTL</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Status</div>
					</div>
					{isLoading
						? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="pl-5">
											<Skeleton className="h-4 w-12" />
										</div>
									</div>
									<div className="flex min-w-0 items-center border-stroke-soft-200 border-t py-2.5 pr-4">
										<div className="max-w-24 flex-1">
											<Skeleton className="my-1 h-4 w-20" />
										</div>
									</div>
									<div className="flex min-w-0 items-center border-stroke-soft-200 border-t py-2.5 pr-4">
										<div className="flex-1">
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-8" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-12" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							))
						: records.map((record, index) => (
								<div key={`record-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 0)}
											className="inline-flex items-center py-0.5 pl-5 font-medium text-sm"
										>
											{record.recordType}
										</motion.span>
									</div>
									<div className="flex min-w-0 items-center border-stroke-soft-200 border-t py-2.5 pr-4 group-hover/row:bg-bg-weak-50">
										<motion.button
											{...getAnimationProps(index + 1, 1)}
											type="button"
											onClick={() =>
												onCopyToClipboard?.(record.name, `host-${index}`)
											}
											className="flex w-full min-w-0 cursor-pointer items-center gap-2"
										>
											<div className="max-w-24 flex-1 truncate text-left text-label-sm text-text-strong-950">
												{record.name}
											</div>

											<motion.div
												animate={
													copiedItems.has(`host-${index}`)
														? "copied"
														: "default"
												}
												variants={{
													default: { scale: 1 },
													copied: { scale: 1.1 },
												}}
												transition={{ duration: 0.2, ease: "easeInOut" }}
											>
												<Icon
													name={
														copiedItems.has(`host-${index}`) ? "check" : "copy"
													}
													className={`h-3 w-3 transition-colors ${
														copiedItems.has(`host-${index}`)
															? "text-green-600"
															: "text-text-sub-600 hover:text-text-strong-950"
													}`}
												/>
											</motion.div>
										</motion.button>
									</div>
									<div className="flex min-w-0 items-center border-stroke-soft-200 border-t py-2.5 pr-4 group-hover/row:bg-bg-weak-50">
										<motion.button
											{...getAnimationProps(index + 1, 2)}
											type="button"
											onClick={() =>
												onCopyToClipboard?.(record.value, `value-${index}`)
											}
											className="flex w-full min-w-0 cursor-pointer items-center gap-2"
										>
											<div className="flex-1 truncate text-left text-label-sm text-text-strong-950">
												{record.value}
											</div>

											<motion.div
												animate={
													copiedItems.has(`value-${index}`)
														? "copied"
														: "default"
												}
												variants={{
													default: { scale: 1 },
													copied: { scale: 1.1 },
												}}
												transition={{ duration: 0.2, ease: "easeInOut" }}
											>
												<Icon
													name={
														copiedItems.has(`value-${index}`) ? "check" : "copy"
													}
													className={`h-3 w-3 transition-colors ${
														copiedItems.has(`value-${index}`)
															? "text-green-600"
															: "text-text-sub-600 hover:text-text-strong-950"
													}`}
												/>
											</motion.div>
										</motion.button>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 3)}
											className="text-label-sm text-text-strong-950"
										>
											{record.priority || ""}
										</motion.span>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 4)}
											className="text-label-sm text-text-strong-950"
										>
											{record.ttl}
										</motion.span>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 5)}
											className="flex items-center"
										>
											<div
												className={cn(
													"flex items-center gap-2.5 rounded-lg py-0.5 pr-3 font-medium text-label-xs capitalize",
													getStatusColorClass(record.status),
												)}
											>
												<Icon
													name={getStatusIcon(record.status)}
													className="h-3.5 w-3.5"
												/>
												{getStatusLabel(record.status)}
											</div>
										</motion.div>
									</div>
								</div>
							))}
				</div>
			</div>
		</AnimatePresence>
	);
};
