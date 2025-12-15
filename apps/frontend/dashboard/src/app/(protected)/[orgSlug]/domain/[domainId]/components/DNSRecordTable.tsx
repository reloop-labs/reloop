"use client";

import {
	getAnimationProps,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import type { DNSRecord } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

interface DNSRecordTableProps {
	records?: DNSRecord[];
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
	isLoading?: boolean;
	loadingRows?: number;
	tableId?: string;
	hideStatus?: boolean;
	showPriorityColumn?: boolean;
}

const getGridCols = (hideStatus: boolean, showPriority: boolean) => {
	if (hideStatus && showPriority) {
		return "grid-cols-[70px_1.5fr_2fr_60px_80px]";
	}
	if (hideStatus && !showPriority) {
		return "grid-cols-[70px_1.5fr_2fr_80px]";
	}
	if (!hideStatus && showPriority) {
		return "grid-cols-[70px_1.5fr_2fr_60px_80px_120px]";
	}
	return "grid-cols-[70px_1.5fr_2fr_80px_120px]";
};

const RecordSkeleton = ({ hideStatus, showPriority }: { hideStatus?: boolean; showPriority?: boolean }) => (
	<div className={cn(
		"grid items-center py-3 px-4",
		getGridCols(hideStatus ?? false, showPriority ?? false)
	)}>
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-32" />
		</div>
		{showPriority && (
			<div className="flex items-center">
				<Skeleton className="h-4 w-6" />
			</div>
		)}
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
		{!hideStatus && (
			<div className="flex items-center">
				<Skeleton className="h-5 w-16 rounded-md" />
			</div>
		)}
	</div>
);

export const DNSRecordTable = ({
	records,
	onCopyToClipboard,
	copiedItems = new Set(),
	isLoading,
	loadingRows = 3,
	tableId = "",
	hideStatus = false,
	showPriorityColumn = false,
}: DNSRecordTableProps) => {
	const gridCols = getGridCols(hideStatus, showPriorityColumn);

	return (
		<AnimatePresence mode="wait">
			<div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
				{/* Table Header */}
				<div className={cn("grid items-center py-3 px-4 text-text-sub-600 border-b border-stroke-soft-100", gridCols)}>
					<div className="flex items-center gap-2">
						<Icon name="file-text" className="h-3.5 w-3.5" />
						<span className="text-xs">Type</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="link" className="h-3.5 w-3.5" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="code" className="h-3.5 w-3.5" />
						<span className="text-xs">Value</span>
					</div>
					{showPriorityColumn && (
						<div className="flex items-center gap-2">
							<Icon name="star" className="h-3.5 w-3.5" />
							<span className="text-xs">Pri</span>
						</div>
					)}
					<div className="flex items-center gap-2">
						<Icon name="time" className="h-3.5 w-3.5" />
						<span className="text-xs">TTL</span>
					</div>
					{!hideStatus && (
						<div className="flex items-center gap-2">
							<Icon name="check-circle" className="h-3.5 w-3.5" />
							<span className="text-xs">Status</span>
						</div>
					)}
				</div>

				{/* Table Body */}
				<div className="divide-y divide-stroke-soft-100">
					{isLoading
						? Array.from({ length: loadingRows }).map((_, index) => (
							<RecordSkeleton key={`skeleton-${index}`} hideStatus={hideStatus} showPriority={showPriorityColumn} />
						))
						: records?.map((record, index) => (
							<div
								key={`record-${index}`}
								className={cn(
									"group/row grid items-center py-3 px-4 transition-colors",
									"hover:bg-bg-weak-50/50",
									gridCols
								)}
							>
								{/* Type Column */}
								<motion.div
									{...getAnimationProps(index + 1, 0)}
									className="flex items-center"
								>
									<span className="inline-flex items-center rounded-md dark:bg-neutral-alpha-16 bg-neutral-alpha-10 px-2 py-0.5 text-xs font-semibold text-text-strong-950 ml-2">
										{record.recordType}
									</span>
								</motion.div>

								{/* Name Column */}
								<motion.button
									{...getAnimationProps(index + 1, 1)}
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.name, `${tableId}host-${index}`)
									}
									className="flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 group/copy overflow-hidden pr-2"
								>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{record.name}
									</span>
									<motion.div
										animate={copiedItems.has(`${tableId}host-${index}`) ? "copied" : "default"}
										variants={{
											default: { scale: 1 },
											copied: { scale: 1.1 },
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
										className="flex-shrink-0"
									>
										<Icon
											name={copiedItems.has(`${tableId}host-${index}`) ? "check" : "copy"}
											className={cn(
												"h-3 w-3 transition-colors",
												copiedItems.has(`${tableId}host-${index}`)
													? "text-success-base"
													: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100"
											)}
										/>
									</motion.div>
								</motion.button>

								{/* Value Column */}
								<motion.button
									{...getAnimationProps(index + 1, 2)}
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.value, `${tableId}value-${index}`)
									}
									className="flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 group/copy overflow-hidden pr-2"
								>
									<span className="truncate font-mono text-label-sm text-text-sub-600">
										{record.value}
									</span>
									<motion.div
										animate={copiedItems.has(`${tableId}value-${index}`) ? "copied" : "default"}
										variants={{
											default: { scale: 1 },
											copied: { scale: 1.1 },
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
										className="flex-shrink-0"
									>
										<Icon
											name={copiedItems.has(`${tableId}value-${index}`) ? "check" : "copy"}
											className={cn(
												"h-3 w-3 transition-colors",
												copiedItems.has(`${tableId}value-${index}`)
													? "text-success-base"
													: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100"
											)}
										/>
									</motion.div>
								</motion.button>

								{/* Priority Column */}
								{showPriorityColumn && (
									<motion.div
										{...getAnimationProps(index + 1, 3)}
										className="flex items-center"
									>
										<span className="text-label-sm text-text-sub-600">
											{record.priority || "-"}
										</span>
									</motion.div>
								)}

								{/* TTL Column */}
								<motion.div
									{...getAnimationProps(index + 1, showPriorityColumn ? 4 : 3)}
									className="flex items-center"
								>
									<span className="text-label-sm text-text-sub-600">
										{record.ttl}
									</span>
								</motion.div>

								{/* Status Column */}
								{!hideStatus && (
									<motion.div
										{...getAnimationProps(index + 1, showPriorityColumn ? 5 : 4)}
										className="flex items-center"
									>
										<div
											className={cn(
												"inline-flex items-center gap-1.5 rounded-md pr-2 py-0.5 text-[13px] font-medium capitalize",
												getStatusColorClass(record.status)
											)}
										>
											<Icon
												name={getStatusIcon(record.status)}
												className="h-3.5 w-3.5"
											/>
											{getStatusLabel(record.status)}
										</div>
									</motion.div>
								)}
							</div>
						))}
				</div>
			</div>
		</AnimatePresence>
	);
};
