import { Logo } from "@reloop/ui/logo";
import type React from "react";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

export type CompareSideTableRow = {
	label: string;
	reloop: React.ReactNode;
	competitor: React.ReactNode;
};

/**
 * Shared 3-column comparison table with Reloop column highlight.
 * Used for webhooks, pricing, and other deep-dive side-by-sides.
 */
export function CompareSideTable({
	topicLabel = "Topic",
	competitorName,
	competitorIcon,
	rows,
}: {
	topicLabel?: string;
	competitorName: string;
	competitorIcon?: Pick<SimpleIcon, "hex" | "path">;
	rows: CompareSideTableRow[];
}) {
	return (
		<div className="overflow-x-auto pb-2">
			<div className="grid min-w-[560px] grid-cols-[minmax(140px,1.1fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
				{/* Header */}
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="p-4 font-medium text-[15px] text-text-strong-950 dark:text-white">
						{topicLabel}
					</div>
				</div>
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 rounded-t-2xl border-stroke-soft-200 border-x border-t bg-bg-weak-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
						<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
							<Logo className="size-full text-text-strong-950" />
						</span>
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							Reloop
						</span>
					</div>
				</div>
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 p-4">
						{competitorIcon ? (
							<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-white">
								<BrandIcon icon={competitorIcon} className="size-4" />
							</span>
						) : null}
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							{competitorName}
						</span>
					</div>
				</div>

				{/* Rows */}
				{rows.map((row) => (
					<div key={row.label} className="contents">
						<div className="flex items-center border-stroke-soft-200 border-b py-3.5 pr-4 dark:border-white/10">
							<span className="text-[14px] text-text-sub-600 dark:text-white/50">
								{row.label}
							</span>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 px-4 py-3.5 text-[14px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
							{row.reloop}
						</div>
						<div className="flex items-center border-stroke-soft-200 border-b px-4 py-3.5 text-[14px] text-text-strong-950 dark:border-white/10 dark:text-white">
							{row.competitor}
						</div>
					</div>
				))}

				{/* Column footers */}
				<div />
				<div className="h-6 rounded-b-2xl border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
				<div />
			</div>
		</div>
	);
}
