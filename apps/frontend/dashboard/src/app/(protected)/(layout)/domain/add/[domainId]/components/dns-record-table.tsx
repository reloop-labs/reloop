import type { DNSRecord } from "@fe/dashboard/types/api.types";
import {
	getStatusColorClass,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";

interface DNSRecordTableProps {
	records?: DNSRecord[];
	onCopyToClipboard?: (text: string) => void;
	isLoading?: boolean;
	loadingRows?: number;
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
		{/* Priority Column - always render slot if status is shown for alignment */}
		{(!hideStatus || showPriority) && (
			<div className="flex items-center">
				{showPriority && <Skeleton className="h-4 w-6" />}
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
	isLoading,
	loadingRows = 3,
	hideStatus = false,
	showPriorityColumn = false,
}: DNSRecordTableProps) => {
	const gridCols = getGridCols(hideStatus, showPriorityColumn);

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			{/* Table Header */}
			<div
				className={cn(
					"grid items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
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
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
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
									"group/row grid items-center px-4 py-2 transition-colors",
									"hover:bg-bg-weak-50/50",
									gridCols,
								)}
							>
								{/* Type Column */}
								<div className="flex items-center">
									<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
										{record.recordType}
									</span>
								</div>

								{/* Name Column */}
								<button
									type="button"
									onClick={() => onCopyToClipboard?.(record.name)}
									className="group/copy flex min-w-0 max-w-full cursor-pointer items-center overflow-hidden pr-2 text-left"
								>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{record.name}
									</span>
								</button>

								{/* Value Column */}
								<Tooltip.Provider delayDuration={300}>
									<Tooltip.Root>
										<Tooltip.Trigger asChild>
											<button
												type="button"
												onClick={() => onCopyToClipboard?.(record.value)}
												className="group/copy flex min-w-0 max-w-full cursor-pointer items-center overflow-hidden pr-2 text-left"
											>
												<span className="truncate font-mono text-label-sm text-text-sub-600">
													{record.value}
												</span>
											</button>
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
										{record.priority ? (
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
												"inline-flex items-center rounded-md py-0.5 pr-2 font-medium text-[13px] capitalize",
												getStatusColorClass(record.status),
											)}
										>
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
