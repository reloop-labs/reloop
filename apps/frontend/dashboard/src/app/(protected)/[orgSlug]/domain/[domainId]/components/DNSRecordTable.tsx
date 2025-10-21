"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";

interface DNSRecord {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	description?: string;
	isVerified: boolean;
}

interface DNSRecordTableProps {
	records: DNSRecord[];
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
}

export const DNSRecordTable = ({
	records,
	onCopyToClipboard,
	copiedItems = new Set(),
}: DNSRecordTableProps) => {
	return (
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
				{records.map((record, index) => (
					<div key={index} className="group/row contents">
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
							<span className="inline-flex items-center py-0.5 pl-5 font-medium text-sm">
								{record.recordType}
							</span>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
							<div className="flex items-center gap-2">
								<code className="text-label-sm text-text-strong-950">
									{record.name}
								</code>
								<button
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.name, `host-${index}`)
									}
									className="opacity-0 transition-opacity group-hover/row:opacity-100"
									title="Copy host name"
								>
									<motion.div
										animate={
											copiedItems.has(`host-${index}`) ? "copied" : "default"
										}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									>
										<Icon
											name={copiedItems.has(`host-${index}`) ? "check" : "copy"}
											className={`h-3 w-3 transition-colors ${
												copiedItems.has(`host-${index}`)
													? "text-green-600"
													: "text-text-sub-600 hover:text-text-strong-950"
											}`}
										/>
									</motion.div>
								</button>
							</div>
						</div>
						<div className="flex min-w-0 items-center border-stroke-soft-200 border-t py-2.5">
							<div className="flex w-full min-w-0 items-center gap-2">
								<button
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.value, `value-${index}`)
									}
									className="flex-1 cursor-pointer truncate text-left text-label-sm text-text-strong-950"
								>
									{record.value}
								</button>
								<button
									type="button"
									onClick={() =>
										onCopyToClipboard?.(record.value, `value-${index}`)
									}
									className="flex-shrink-0 cursor-pointer opacity-0 transition-opacity group-hover/row:opacity-100"
									title="Copy value"
								>
									<motion.div
										animate={
											copiedItems.has(`value-${index}`) ? "copied" : "default"
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
								</button>
							</div>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
							<span className="text-label-sm text-text-strong-950">
								{record.priority || ""}
							</span>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5.5">
							<span className="text-label-sm text-text-strong-950">
								{record.ttl}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
