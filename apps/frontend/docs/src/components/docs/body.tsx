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
				"prose prose-neutral dark:prose-invert max-w-none",
				"prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
				"prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-fd-border prose-h2:pb-2",
				"prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3",
				"prose-p:text-[15px] prose-p:leading-7 prose-p:text-fd-foreground/80",
				"prose-a:text-fd-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline",
				"prose-code:rounded prose-code:bg-fd-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
				"prose-pre:rounded-xl prose-pre:border prose-pre:border-fd-border prose-pre:bg-[#fafafa] dark:prose-pre:bg-[#0a0a0a]",
				"prose-strong:text-fd-foreground prose-strong:font-semibold",
				"prose-ul:my-4 prose-li:text-[15px] prose-li:leading-7",
				"prose-table:text-[14px]",
				className,
			)}
		>
			{children}
		</div>
	);
}
