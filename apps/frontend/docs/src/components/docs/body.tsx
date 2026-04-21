"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import type { ReactNode } from "react";

export function DocsBody({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"prose prose-slate dark:prose-invert max-w-none",
				"prose-headings:scroll-mt-20 prose-headings:font-bold",
				"prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
				"prose-pre:rounded-lg prose-pre:border prose-pre:bg-accent/50",
				className,
			)}
		>
			{children}
		</div>
	);
}
