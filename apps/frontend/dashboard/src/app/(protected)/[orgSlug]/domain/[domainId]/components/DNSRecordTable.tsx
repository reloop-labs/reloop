"use client";

import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

interface DNSRecord {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	description?: string;
	isVerified: boolean;
}

function getAnimationProps(row: number, column: number) {
	return {
		initial: { opacity: 0, y: "-100%" },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: "100%" },
		transition: {
			duration: 0.5,
			delay: row * 0.07 + column * 0.1,
			ease: [0.65, 0, 0.35, 1] as const,
		},
	};
}

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
				<div className="grid grid-cols-[minmax(80px,auto)_minmax(192px,auto)_1fr_minmax(80px,auto)_minmax(80px,auto)]">
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
										<div className="max-w-36 flex-1">
											<Skeleton className="my-1 h-4 w-24" />
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
											<div className="max-w-36 flex-1 truncate text-left text-label-sm text-text-strong-950">
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
								</div>
							))}
				</div>
			</div>
		</AnimatePresence>
	);
};
