import type { DNSRecord } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useMemo, useState } from "react";

interface DNSRecordTableMinimalProps {
	records?: DNSRecord[];
	onCopyToClipboard?: (text: string) => void;
	isLoading?: boolean;
	loadingRows?: number;
	showPriorityColumn?: boolean;
}

const getGridCols = (showPriority: boolean) => {
	if (showPriority) {
		return "grid-cols-[70px_1.5fr_2fr_80px_60px]";
	}
	return "grid-cols-[70px_1.5fr_2fr_80px]";
};

const RecordSkeleton = ({ showPriority }: { showPriority?: boolean }) => (
	<div
		className={cn(
			"grid items-center px-4 py-3",
			getGridCols(showPriority ?? false),
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
	const gridCols = getGridCols(showPriorityColumn);

	const handleCopy = (text: string, id: string) => {
		onCopyToClipboard?.(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

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
				{showPriorityColumn && (
					<div className="flex items-center justify-center">
						<span className="text-center text-xs">Priority</span>
					</div>
				)}
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
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
									"group/row grid items-center px-4 py-2 transition-colors",
									"hover:bg-bg-weak-50/50",
									gridCols,
								)}
							>
								{/* Type Column */}
								<div className="flex items-center">
									<button
										type="button"
										onClick={() =>
											handleCopy(record.recordType, `type-${index}`)
										}
										className={cn(
											"inline-flex cursor-pointer items-center rounded-md px-2 py-0.5 font-semibold text-xs transition-colors",
											copiedId === `type-${index}`
												? "bg-success-alpha-10 text-success-dark dark:bg-success-alpha-20"
												: "bg-neutral-alpha-10 text-text-strong-950 hover:bg-neutral-alpha-20 dark:bg-neutral-alpha-16 hover:dark:bg-neutral-alpha-24",
										)}
									>
										{copiedId === `type-${index}`
											? "Copied"
											: record.recordType}
									</button>
								</div>

								{/* Name Column */}
								<button
									type="button"
									onClick={() => handleCopy(record.name, `name-${index}`)}
									className="group/copy flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden pr-2 text-left"
								>
									<span
										className={cn(
											"truncate font-medium text-label-sm",
											copiedId === `name-${index}`
												? "text-text-strong-950"
												: "text-text-strong-950",
										)}
									>
										{copiedId === `name-${index}` ? "Copied" : record.name}
									</span>
									<Icon
										name="copy"
										className="size-3.5 shrink-0 text-text-sub-600/50 transition-colors group-hover/copy:text-text-strong-950"
									/>
								</button>

								{/* Value Column */}
								<Tooltip.Provider delayDuration={0}>
									<Tooltip.Root>
										<Tooltip.Trigger asChild>
											<button
												type="button"
												onClick={() =>
													handleCopy(record.value, `value-${index}`)
												}
												className="group/copy flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden pr-2 text-left"
											>
												<span
													className={cn(
														"truncate font-mono text-label-sm",
														copiedId === `value-${index}`
															? "font-medium text-text-strong-950"
															: "text-text-sub-600",
													)}
												>
													{copiedId === `value-${index}`
														? "Copied"
														: record.value}
												</span>
												<Icon
													name="copy"
													className="size-3.5 shrink-0 text-text-sub-600/50 transition-colors group-hover/copy:text-text-strong-950"
												/>
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

								{/* Priority Column */}
								{showPriorityColumn && (
									<div className="flex items-center justify-center">
										{record.priority ? (
											<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
												{record.priority}
											</span>
										) : (
											<span className="text-label-sm text-text-sub-600">-</span>
										)}
									</div>
								)}
							</div>
						))}
			</div>
		</div>
	);
};
