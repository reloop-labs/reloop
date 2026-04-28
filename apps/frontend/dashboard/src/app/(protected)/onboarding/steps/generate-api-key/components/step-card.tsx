"use client";

import type React from "react";

export function StepCard({
	number,
	title,
	subtitle,
	children,
}: {
	number: number;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2.5">
				<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-200">
					{number}
				</div>
				<div>
					<p className="font-medium text-label-sm text-text-strong-950">
						{title}
					</p>
					{subtitle && (
						<p className="text-paragraph-xs text-text-soft-400">{subtitle}</p>
					)}
				</div>
			</div>
			<div className="pl-[30px]">{children}</div>
		</div>
	);
}
