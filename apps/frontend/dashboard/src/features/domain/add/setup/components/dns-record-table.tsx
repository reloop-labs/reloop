import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import * as React from "react";
import { CopyableDnsValue } from "#/features/domain/components/copyable-dns-value";
import { useClipboard } from "#/features/domain/detail/hooks/use-clipboard";
import type { DNSRecord } from "#/features/domain/types";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "#/features/domain/utils";

interface DNSRecordTableProps {
	records?: DNSRecord[];
	isLoading?: boolean;
	loadingRows?: number;
	tableId?: string;
	hideStatus?: boolean;
	showPriorityColumn?: boolean;
}

const getGridCols = (hideStatus: boolean, showPriority: boolean) => {
	// For tables with status (dashboard view), we use a consistent 6-column grid to ensure alignment
	// across multiple tables (DKIM, SPF, DMARC), even if some don't have priority.
	if (!hideStatus) {
		return "grid-cols-[80px_1fr_1.5fr_70px_70px_110px]";
	}

	// For tables without status (e.g. Add Domain flow)
	if (showPriority) {
		return "grid-cols-[80px_1fr_1.5fr_70px_70px]";
	}
	return "grid-cols-[80px_1fr_1.5fr_70px]";
};

const RecordSkeleton = ({
	hideStatus,
	showPriority,
}: {
	hideStatus?: boolean;
	showPriority?: boolean;
}) => (
	<div
		className={cn(
			"grid items-center px-4 py-3",
			getGridCols(hideStatus ?? false, showPriority ?? false),
		)}
	>
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-32" />
		</div>
		{/* TTL Column */}
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
		{/* Priority Column - always render slot if status is shown for alignment */}
		{(!hideStatus || showPriority) && (
			<div className="flex items-center">
				{showPriority && <Skeleton className="h-4 w-6" />}
			</div>
		)}
		{!hideStatus && (
			<div className="flex items-center">
				<Skeleton className="h-5 w-16 rounded-md" />
			</div>
		)}
	</div>
);

export const DNSRecordTable = ({
	records,
	isLoading,
	loadingRows = 3,
	tableId = "",
	hideStatus = false,
	showPriorityColumn: showPriorityColumnProp,
}: DNSRecordTableProps) => {
	const { copiedItems, copyToClipboard: onCopyToClipboard } = useClipboard();
	const hasPriority = React.useMemo(
		() => records?.some((r) => r.priority !== undefined && r.priority !== null),
		[records],
	);
	const showPriorityColumn = !!(showPriorityColumnProp ?? hasPriority);
	const gridCols = getGridCols(hideStatus, showPriorityColumn);

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div
				className={cn(
					"grid items-center gap-x-3 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
					gridCols,
				)}
			>
				<div className="flex items-center">
					<span className="text-xs">Type</span>
				</div>
				<div className="flex items-center">
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center">
					<span className="text-xs">Value</span>
				</div>
				<div className="flex items-center">
					<span className="text-xs">TTL</span>
				</div>
				{/* Priority Column - always render slot if status is shown for alignment */}
				{(!hideStatus || showPriorityColumn) && (
					<div className="flex items-center">
						{showPriorityColumn && <span className="text-xs">Priority</span>}
					</div>
				)}
				{!hideStatus && (
					<div className="flex items-center">
						<span className="text-xs">Status</span>
					</div>
				)}
			</div>

			{/* Table Body */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
				{isLoading
					? Array.from({ length: loadingRows }).map((_, index) => (
							<RecordSkeleton
								key={`skeleton-${index}`}
								hideStatus={hideStatus}
								showPriority={showPriorityColumn}
							/>
						))
					: records?.map((record, index) => (
							<div
								key={`record-${index}`}
								className={cn(
									"group/row grid items-center gap-x-3 px-4 py-2.5 transition-colors",
									"hover:bg-bg-weak-50/50",
									gridCols,
								)}
							>
								{/* Type Column */}
								<div className="flex items-center">
									<button
										type="button"
										aria-label={
											copiedItems.has(`${tableId}type-${index}`)
												? "Copied"
												: `Copy ${record.recordType}`
										}
										onClick={() =>
											onCopyToClipboard?.(
												record.recordType,
												`${tableId}type-${index}`,
											)
										}
										className={cn(
											"inline-flex cursor-pointer items-center rounded-md px-2 py-0.5 font-semibold text-xs transition-colors duration-150 ease-out",
											copiedItems.has(`${tableId}type-${index}`)
												? "bg-success-alpha-10 text-success-dark dark:bg-success-alpha-20"
												: "bg-neutral-alpha-10 text-text-strong-950 hover:bg-neutral-alpha-20 dark:bg-neutral-alpha-16 hover:dark:bg-neutral-alpha-24",
										)}
									>
										{record.recordType}
									</button>
								</div>

								{/* Name Column */}
								<CopyableDnsValue
									value={record.name}
									copied={copiedItems.has(`${tableId}host-${index}`)}
									onCopy={() =>
										onCopyToClipboard?.(record.name, `${tableId}host-${index}`)
									}
								/>

								{/* Value Column */}
								<Tooltip.Provider delayDuration={0}>
									<Tooltip.Root>
										<Tooltip.Trigger asChild>
											<CopyableDnsValue
												value={record.value}
												copied={copiedItems.has(`${tableId}value-${index}`)}
												mono
												onCopy={() =>
													onCopyToClipboard?.(
														record.value,
														`${tableId}value-${index}`,
													)
												}
											/>
										</Tooltip.Trigger>
										<Tooltip.Content
											side="top"
											variant="light"
											className="max-w-sm break-all font-mono text-xs"
										>
											{record.value}
										</Tooltip.Content>
									</Tooltip.Root>
								</Tooltip.Provider>

								{/* TTL Column */}
								<div className="flex items-center">
									<span className="text-label-sm text-text-sub-600">
										{record.ttl}
									</span>
								</div>

								{/* Priority Column - always render slot if status is shown for alignment */}
								{(!hideStatus || showPriorityColumn) && (
									<div className="flex items-center">
										{record.priority !== undefined &&
										record.priority !== null ? (
											<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
												{record.priority}
											</span>
										) : showPriorityColumn ? (
											<span className="text-label-sm text-text-sub-600">-</span>
										) : null}
									</div>
								)}

								{/* Status Column */}
								{!hideStatus && (
									<div className="flex items-center">
										<div
											className={cn(
												"inline-flex items-center gap-1.5 rounded-md py-0.5 pr-2 font-medium text-[13px] capitalize",
												getStatusColorClass(record.status),
											)}
										>
											<Icon
												name={getStatusIcon(record.status)}
												className="h-3.5 w-3.5"
											/>
											{getStatusLabel(record.status)}
										</div>
									</div>
								)}
							</div>
						))}
			</div>
		</div>
	);
};
