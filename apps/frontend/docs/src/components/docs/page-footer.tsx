"use client";

import type { PageNode } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { ChevronLeft, ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { siGithub, siX, siYoutube } from "simple-icons";

interface PageFooterProps {
	previous?: PageNode;
	next?: PageNode;
}

export function PageFooter({ previous, next }: PageFooterProps) {
	const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

	return (
		<footer className="mt-16 space-y-12">
			{/* Feedback Section */}
			<div className="flex flex-col items-center justify-between gap-4 border-stroke-soft-100 border-t pt-12 sm:flex-row">
				<p className="font-medium text-[15px] text-text-sub-600">
					Was this page helpful?
				</p>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setFeedback("yes")}
						className={cn(
							"flex items-center gap-2 rounded-full border border-stroke-soft-100 px-5 py-2 font-medium text-[14px] transition-all hover:bg-bg-weak-50/50",
							feedback === "yes" &&
								"border-[#171717] bg-black/5 text-[#171717] dark:border-white dark:bg-white/5 dark:text-white",
						)}
					>
						<ThumbsUp className="h-4 w-4" />
						Yes
					</button>
					<button
						onClick={() => setFeedback("no")}
						className={cn(
							"flex items-center gap-2 rounded-full border border-stroke-soft-100 px-5 py-2 font-medium text-[14px] transition-all hover:bg-bg-weak-50/50",
							feedback === "no" &&
								"border-[#171717] bg-black/5 text-[#171717] dark:border-white dark:bg-white/5 dark:text-white",
						)}
					>
						<ThumbsDown className="h-4 w-4" />
						No
					</button>
				</div>
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

			{/* Social Footer */}
			<div className="flex items-center gap-6 border-stroke-soft-100 border-t pt-12 pb-16">
				<Link
					href="https://x.com/reloop"
					className="text-text-sub-600 transition-colors hover:text-[#171717] dark:hover:text-white"
				>
					<svg
						role="img"
						viewBox="0 0 24 24"
						className="h-5 w-5 fill-current"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d={siX.path} />
					</svg>
				</Link>
				<Link
					href="https://github.com/reloop"
					className="text-text-sub-600 transition-colors hover:text-[#171717] dark:hover:text-white"
				>
					<svg
						role="img"
						viewBox="0 0 24 24"
						className="h-5 w-5 fill-current"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d={siGithub.path} />
					</svg>
				</Link>
				<Link
					href="https://youtube.com/@reloop"
					className="text-text-sub-600 transition-colors hover:text-[#171717] dark:hover:text-white"
				>
					<svg
						role="img"
						viewBox="0 0 24 24"
						className="h-5 w-5 fill-current"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d={siYoutube.path} />
					</svg>
				</Link>
				<Link
					href="https://reloop.dev"
					className="text-text-sub-600 transition-colors hover:text-[#171717] dark:hover:text-white"
				>
					<div className="rounded-full border border-current p-0.5">
						<div className="h-3.5 w-3.5 rounded-full border border-current" />
					</div>
				</Link>
			</div>
		</footer>
	);
}
