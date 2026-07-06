"use client";

import type { PageNode } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ChevronLeft, ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PageFooterProps {
	previous?: PageNode;
	next?: PageNode;
	editUrl?: string;
}

export function PageFooter({ previous, next, editUrl }: PageFooterProps) {
	const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

	return (
		<section className="mt-6 space-y-12">
			{/* Feedback & Edit Section */}
			<div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					<p className="font-medium text-[15px] text-text-sub-600">
						Was this page helpful?
					</p>
					<div className="flex items-center gap-2.5">
						<button
							type="button"
							onClick={() => setFeedback("yes")}
							className={cn(
								"flex items-center gap-1.5 rounded-full border border-stroke-soft-100 px-4 py-1.5 font-medium text-[13.5px] transition-all hover:bg-bg-weak-50/50",
								feedback === "yes" &&
									"border-[#171717] bg-black/5 text-[#171717] dark:border-white dark:bg-white/5 dark:text-white",
							)}
						>
							<ThumbsUp className="h-3.5 w-3.5" />
							Yes
						</button>
						<button
							type="button"
							onClick={() => setFeedback("no")}
							className={cn(
								"flex items-center gap-1.5 rounded-full border border-stroke-soft-100 px-4 py-1.5 font-medium text-[13.5px] transition-all hover:bg-bg-weak-50/50",
								feedback === "no" &&
									"border-[#171717] bg-black/5 text-[#171717] dark:border-white dark:bg-white/5 dark:text-white",
							)}
						>
							<ThumbsDown className="h-3.5 w-3.5" />
							No
						</button>
					</div>
				</div>

				{editUrl && (
					<a
						href={editUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 font-medium text-[14px] text-text-sub-600 transition-colors hover:text-black dark:hover:text-white"
					>
						<Icon className="h-3.5 w-3.5" name="edit" />
						Edit this page
					</a>
				)}
			</div>

			{/* Navigation Cards */}
			<div className="grid gap-4 sm:grid-cols-2">
				{previous ? (
					<Link
						href={previous.url}
						className="group relative flex flex-col items-start gap-2 rounded-2xl border border-stroke-soft-100 p-6 transition-all hover:border-black/50 hover:bg-black/[0.02] dark:hover:border-white/50 dark:hover:bg-white/[0.02]"
					>
						<span className="flex items-center gap-1.5 font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider">
							<ChevronLeft className="group-hover:-translate-x-0.5 h-3 w-3 transition-transform" />
							Previous
						</span>
						<span className="font-bold text-[#171717] text-[17px] tracking-tight dark:text-white">
							{previous.name}
						</span>
					</Link>
				) : (
					<div />
				)}

				{next ? (
					<Link
						href={next.url}
						className="group relative flex flex-col items-end gap-2 rounded-2xl border border-stroke-soft-100 p-6 text-right transition-all hover:border-black/50 hover:bg-black/[0.02] dark:hover:border-white/50 dark:hover:bg-white/[0.02]"
					>
						<span className="flex items-center gap-1.5 font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider">
							Next
							<ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</span>
						<span className="font-bold text-[#171717] text-[17px] tracking-tight dark:text-white">
							{next.name}
						</span>
					</Link>
				) : (
					<div />
				)}
			</div>
		</section>
	);
}
