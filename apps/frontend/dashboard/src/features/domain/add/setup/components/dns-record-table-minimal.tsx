import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useMemo, useState } from "react";
import { CopyableDnsValue } from "#/features/domain/components/copyable-dns-value";
import type { DNSRecord } from "#/features/domain/types";

interface DNSRecordTableMinimalProps {
	records?: DNSRecord[];
	onCopyToClipboard?: (text: string) => void;
	isLoading?: boolean;
	loadingRows?: number;
	showPriorityColumn?: boolean;
}

const getGridCols = () => {
	// For minimal tables, we use a consistent grid definition to ensure alignment
	// across multiple tables even if some don't have priority.
	return "grid-cols-[80px_1fr_1.5fr_70px_70px]";
};

const RecordSkeleton = ({ showPriority }: { showPriority?: boolean }) => (
	<div className={cn("grid items-center px-4 py-3", getGridCols())}>
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-32" />
		</div>
		<div className="flex items-center">
			{showPriority && <Skeleton className="h-4 w-6" />}
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-8" />
		</div>
	</div>
);

export const DNSRecordTableMinimal = ({
	records,
	onCopyToClipboard,
	isLoading,
	loadingRows = 3,
	showPriorityColumn: showPriorityColumnProp,
}: DNSRecordTableMinimalProps) => {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const hasPriority = useMemo(
		() => records?.some((r) => r.priority !== undefined && r.priority !== null),
		[records],
	);
	const showPriorityColumn = !!(showPriorityColumnProp ?? hasPriority);
	const gridCols = getGridCols();

	const handleCopy = (text: string, id: string) => {
		onCopyToClipboard?.(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

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
				<div className="flex items-center">
					{showPriorityColumn && <span className="text-xs">Priority</span>}
				</div>
			</div>

			{/* Table Body */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
				{isLoading
					? Array.from({ length: loadingRows }).map((_, index) => (
							<RecordSkeleton
								key={`skeleton-${index}`}
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
											copiedId === `type-${index}`
												? "Copied"
												: `Copy ${record.recordType}`
										}
										onClick={() =>
											handleCopy(record.recordType, `type-${index}`)
										}
										className={cn(
											"inline-flex cursor-pointer items-center rounded-md px-2 py-0.5 font-semibold text-xs transition-colors duration-150 ease-out",
											copiedId === `type-${index}`
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
									copied={copiedId === `name-${index}`}
									onCopy={() => handleCopy(record.name, `name-${index}`)}
								/>

								{/* Value Column */}
								<Tooltip.Provider delayDuration={0}>
									<Tooltip.Root>
										<Tooltip.Trigger asChild>
											<CopyableDnsValue
												value={record.value}
												copied={copiedId === `value-${index}`}
												mono
												onCopy={() =>
													handleCopy(record.value, `value-${index}`)
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

								{/* Priority Column - always render slot for alignment */}
								<div className="flex items-center">
									{record.priority ? (
										<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
											{record.priority}
										</span>
									) : showPriorityColumn ? (
										<span className="text-label-sm text-text-sub-600">-</span>
									) : null}
								</div>
							</div>
						))}
			</div>
		</div>
	);
};
