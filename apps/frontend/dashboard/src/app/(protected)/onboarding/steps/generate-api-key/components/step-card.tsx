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
			{/* Left: badge + connector line */}
			<div className="flex flex-col items-center">
				<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-200">
					{number}
				</div>
				{!isLast && (
					<div className="mt-1.5 w-px flex-1 bg-stroke-soft-200" />
				)}
			</div>

			{/* Right: title + content */}
			<div className={`flex flex-1 min-w-0 flex-col gap-3 ${isLast ? "" : "pb-2"}`}>
				<p className="mt-[1px] font-medium text-label-sm text-text-strong-950 leading-5">{title}</p>
				<div>{children}</div>
			</div>
		</div>
	);
}
