import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

export function BlogBody({
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
				"prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-stroke-soft-100 prose-h2:border-b prose-h2:pb-2 prose-h2:text-xl",
				"prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg",
				"prose-p:text-[#171717]/80 prose-p:text-[15px] prose-p:leading-7 dark:prose-p:text-white/80",
				"prose-a:font-medium prose-a:text-[#171717] prose-a:no-underline dark:prose-a:text-white",
				"prose-code:rounded prose-code:bg-bg-weak-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none",
				"prose-pre:rounded-xl prose-pre:border prose-pre:border-stroke-soft-100 prose-pre:bg-bg-weak-50",
				"prose-strong:font-semibold prose-strong:text-[#171717] dark:prose-strong:text-white",
				"prose-ul:my-4 prose-li:text-[15px] prose-li:leading-7",
				"prose-table:text-[14px]",
				className,
			)}
		>
			{children}
		</div>
	);
}
