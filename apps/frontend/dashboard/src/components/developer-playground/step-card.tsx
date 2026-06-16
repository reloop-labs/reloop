"use client";

import type React from "react";

export function StepCard({
	number,
	title,
	isLast = false,
	children,
}: {
	number: number;
	title: string;
	isLast?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="flex gap-3">
			<div className="flex flex-col items-center">
				<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-200 dark:bg-bg-weak-50/70 dark:ring-stroke-soft-100/40">
					{number}
				</div>
				{!isLast && (
					<div className="mt-1.5 w-px flex-1 bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />
				)}
			</div>

			<div
				className={`flex min-w-0 flex-1 flex-col gap-3 ${isLast ? "" : "pb-2"}`}
			>
				<p className="mt-[1px] font-medium text-label-sm text-text-strong-950 leading-5">
					{title}
				</p>
				<div>{children}</div>
			</div>
		</div>
	);
}
