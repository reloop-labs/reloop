"use client";

import type { DNSRecord } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";

interface DNSRecordListProps {
	records?: DNSRecord[];
	onCopyToClipboard?: (text: string) => void;
	isLoading?: boolean;
	loadingRows?: number;
}

const RecordSkeleton = () => (
	<div className="flex flex-col gap-4 rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-12" />
			<Skeleton className="h-6 w-24" />
		</div>
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-12" />
			<Skeleton className="h-6 w-48" />
		</div>
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-12" />
			<Skeleton className="h-20 w-full" />
		</div>
	</div>
);

export const DNSRecordList = ({
	records,
	onCopyToClipboard,
	isLoading,
	loadingRows = 3,
}: DNSRecordListProps) => {
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopy = (text: string, id: string) => {
		onCopyToClipboard?.(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				{Array.from({ length: loadingRows }).map((_, index) => (
					<RecordSkeleton key={`skeleton-${index}`} />
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{records?.map((record, index) => (
				<div
					key={`record-${index}`}
					className="group/record flex flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/20 p-3 text-paragraph-sm transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/10"
				>
					{/* Type */}
					<div className="grid grid-cols-[80px_1fr] items-center gap-4">
						<span className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
							Type
						</span>
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2.5 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
								{record.recordType}
							</span>
						</div>
					</div>

					{/* Name */}
					<div className="grid grid-cols-[80px_1fr] items-center gap-4">
						<span className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
							Name
						</span>
						<button
							type="button"
							onClick={() => handleCopy(record.name, `name-${index}`)}
							className="group/copy flex items-center justify-between gap-2 rounded-lg border border-stroke-soft-100 bg-white/50 px-3 py-1 transition-colors hover:border-stroke-soft-200 hover:bg-white dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/20 dark:hover:border-stroke-soft-200/50"
						>
							<span className="truncate font-medium text-label-sm text-text-strong-950">
								{copiedId === `name-${index}` ? "Copied" : record.name}
							</span>
							<Icon
								name={copiedId === `name-${index}` ? "check" : "copy"}
								className={cn(
									"size-3.5 shrink-0 transition-colors",
									copiedId === `name-${index}`
										? "text-success-dark"
										: "text-text-sub-600/50 group-hover/copy:text-text-strong-950",
								)}
							/>
						</button>
					</div>

					{/* Value */}
					<div className="grid grid-cols-[80px_1fr] items-start gap-4">
						<span className="mt-1.5 font-medium text-text-sub-600 text-xs uppercase tracking-wider">
							Value
						</span>
						<button
							type="button"
							onClick={() => handleCopy(record.value, `value-${index}`)}
							className="group/copy flex items-start justify-between gap-2 rounded-lg border border-stroke-soft-100 bg-white/50 px-3 py-1.5 text-left transition-colors hover:border-stroke-soft-200 hover:bg-white dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/20 dark:hover:border-stroke-soft-200/50"
						>
							<span className="break-all font-mono text-label-sm text-text-sub-600">
								{copiedId === `value-${index}` ? "Copied" : record.value}
							</span>
							<Icon
								name={copiedId === `value-${index}` ? "check" : "copy"}
								className={cn(
									"mt-0.5 size-3.5 shrink-0 transition-colors",
									copiedId === `value-${index}`
										? "text-success-dark"
										: "text-text-sub-600/50 group-hover/copy:text-text-strong-950",
								)}
							/>
						</button>
					</div>

					{/* TTL */}
					{record.ttl && (
						<div className="grid grid-cols-[80px_1fr] items-center gap-4">
							<span className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
								TTL
							</span>
							<span className="px-1 text-label-sm text-text-strong-950">
								{record.ttl}
							</span>
						</div>
					)}

					{/* Priority */}
					{record.priority && (
						<div className="grid grid-cols-[80px_1fr] items-center gap-4">
							<span className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
								Priority
							</span>
							<span className="px-1 text-label-sm text-text-strong-950">
								{record.priority}
							</span>
						</div>
					)}
				</div>
			))}
		</div>
	);
};
