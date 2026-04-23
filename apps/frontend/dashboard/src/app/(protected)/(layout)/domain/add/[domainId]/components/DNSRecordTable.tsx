import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import type { DNSRecord } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";

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
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			{/* Table Header */}
			<div
				className={cn(
					"grid items-center border-stroke-soft-100 border-b px-4 py-3 text-text-sub-600",
					gridCols,
				)}
			>
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
									"group/row grid items-center px-4 py-3 transition-colors",
									"hover:bg-bg-weak-50/50",
									gridCols,
								)}
							>
								{/* Type Column */}
								<div className="flex items-center">
									<span className="ml-2 inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
										{record.recordType}
									</span>
								</div>

								{/* Name Column */}
								<button
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.name, `${tableId}host-${index}`)
									}
									className="group/copy flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden pr-2"
								>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{record.name}
									</span>
									<div className="flex-shrink-0">
										<Icon
											name={
												copiedItems.has(`${tableId}host-${index}`)
													? "check"
													: "copy"
											}
											className={cn(
												"h-3 w-3 transition-colors",
												copiedItems.has(`${tableId}host-${index}`)
													? "text-success-base"
													: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100",
											)}
										/>
									</div>
								</button>

								{/* Value Column */}
								<Tooltip.Provider delayDuration={300}>
									<Tooltip.Root>
										<Tooltip.Trigger asChild>
											<button
												type="button"
												onClick={() =>
													onCopyToClipboard?.(
														record.value,
														`${tableId}value-${index}`,
													)
												}
												className="group/copy flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden pr-2"
											>
												<span className="truncate font-mono text-label-sm text-text-sub-600">
													{record.value}
												</span>
												<div className="flex-shrink-0">
													<Icon
														name={
															copiedItems.has(`${tableId}value-${index}`)
																? "check"
																: "copy"
														}
														className={cn(
															"h-3 w-3 transition-colors",
															copiedItems.has(`${tableId}value-${index}`)
																? "text-success-base"
																: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100",
														)}
													/>
												</div>
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

								{/* Priority Column */}
								{showPriorityColumn && (
									<div className="flex items-center">
										<span className="text-label-sm text-text-sub-600">
											{record.priority || "-"}
										</span>
									</div>
								)}

								{/* TTL Column */}
								<div className="flex items-center">
									<span className="text-label-sm text-text-sub-600">
										{record.ttl}
									</span>
								</div>

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
