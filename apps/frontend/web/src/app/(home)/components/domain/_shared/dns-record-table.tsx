"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { CopyableDnsValue } from "./copyable-dns-value";
import type { DemoDnsRecord } from "./data";
import { FlowCell } from "./flow-cell";
import { getStatusColorClass, getStatusIcon, getStatusLabel } from "./status";

function getGridCols(hideStatus: boolean, showPriority: boolean) {
	if (!hideStatus) {
		return "grid-cols-[80px_1fr_1.5fr_70px_70px_110px]";
	}
	if (showPriority) {
		return "grid-cols-[80px_1fr_1.5fr_70px_70px]";
	}
	return "grid-cols-[80px_1fr_1.5fr_70px]";
}

export function DnsRecordTable({
	records,
	hideStatus = false,
	showPriorityColumn = false,
	flow = false,
}: {
	records: DemoDnsRecord[];
	hideStatus?: boolean;
	showPriorityColumn?: boolean;
	flow?: boolean;
}) {
	const hasPriority =
		showPriorityColumn || records.some((record) => record.priority != null);
	const gridCols = getGridCols(hideStatus, hasPriority);
	const colCount = hideStatus ? (hasPriority ? 5 : 4) : hasPriority ? 6 : 5;

	return (
		<div className="w-full text-paragraph-sm">
			<div
				className={cn(
					"grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
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
				{(!hideStatus || hasPriority) && (
					<div className="flex items-center">
						{hasPriority && <span className="text-xs">Priority</span>}
					</div>
				)}
				{!hideStatus && (
					<div className="flex items-center">
						<span className="text-xs">Status</span>
					</div>
				)}
			</div>

			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
				{records.map((record, rowIndex) => {
					const base = rowIndex * colCount;
					return (
						<div
							key={record.id}
							className={cn(
								"group/row grid items-center px-4 py-3 transition-colors hover:bg-bg-weak-50/50",
								gridCols,
							)}
						>
							<FlowCell index={base} enabled={flow}>
								<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
									{record.recordType}
								</span>
							</FlowCell>
							<FlowCell index={base + 1} enabled={flow}>
								<CopyableDnsValue value={record.name} />
							</FlowCell>
							<FlowCell index={base + 2} enabled={flow}>
								<CopyableDnsValue value={record.value} mono />
							</FlowCell>
							<FlowCell index={base + 3} enabled={flow}>
								<span className="text-label-sm text-text-sub-600">
									{record.ttl}
								</span>
							</FlowCell>
							{(!hideStatus || hasPriority) && (
								<FlowCell index={base + 4} enabled={flow}>
									{record.priority != null ? (
										<span className="inline-flex items-center rounded-md bg-neutral-alpha-10 px-2 py-0.5 font-semibold text-text-strong-950 text-xs dark:bg-neutral-alpha-16">
											{record.priority}
										</span>
									) : hasPriority ? (
										<span className="text-label-sm text-text-sub-600">-</span>
									) : null}
								</FlowCell>
							)}
							{!hideStatus && (
								<FlowCell
									index={base + (hasPriority ? 5 : 4)}
									enabled={flow}
								>
									<div
										className={cn(
											"flex items-center gap-1.5 font-medium text-[12px]",
											getStatusColorClass(record.status),
										)}
									>
										<Icon
											name={getStatusIcon(record.status)}
											className="h-3.5 w-3.5"
										/>
										{getStatusLabel(record.status)}
									</div>
								</FlowCell>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
