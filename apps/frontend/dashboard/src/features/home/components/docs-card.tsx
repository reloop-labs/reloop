import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";

export function DocsCard() {
	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<a
				href="https://reloop.sh/docs"
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-5 dark:border-white/5 dark:bg-white/[0.02]"
			>
				<span className="flex items-center gap-2 font-medium text-sm text-text-sub-600 dark:text-white/60">
					<Icon name="file-text" className="h-4 w-4 shrink-0" />
					Docs
				</span>
				<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
			</a>

			{/* Body */}
			<div className="-mt-2.5 flex h-[200px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				{/* Icon outline without pill wrapper */}
				<Icon
					name="file-text"
					className="h-6 w-6 text-text-sub-600 dark:text-white/40"
				/>

				{/* Heading */}
				<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
					Learn integration without the overhead
				</h4>

				{/* Description */}
				<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
					Explore tutorials, SDK documentation, and API guides to build faster.
				</p>

				{/* Button */}
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					asChild
					className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
				>
					<a href="https://reloop.sh/docs" target="_blank" rel="noopener noreferrer">Read documentation</a>
				</Button.Root>
			</div>
		</div>
	);
}
