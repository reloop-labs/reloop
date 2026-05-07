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
			<div className="flex flex-col items-center justify-between gap-4 border-fd-border border-t pt-12 sm:flex-row">
				<p className="font-medium text-[15px] text-fd-muted-foreground">
					Was this page helpful?
				</p>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setFeedback("yes")}
						className={cn(
							"flex items-center gap-2 rounded-full border border-fd-border px-5 py-2 font-medium text-[14px] transition-all hover:bg-fd-muted/50",
							feedback === "yes" &&
								"border-fd-primary bg-fd-primary/5 text-fd-primary",
						)}
					>
						<ThumbsUp className="h-4 w-4" />
						Yes
					</button>
					<button
						onClick={() => setFeedback("no")}
						className={cn(
							"flex items-center gap-2 rounded-full border border-fd-border px-5 py-2 font-medium text-[14px] transition-all hover:bg-fd-muted/50",
							feedback === "no" &&
								"border-fd-primary bg-fd-primary/5 text-fd-primary",
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
						className="group relative flex flex-col items-start gap-2 rounded-2xl border border-fd-border p-6 transition-all hover:border-fd-primary/50 hover:bg-fd-primary/[0.02]"
					>
						<span className="flex items-center gap-1.5 font-semibold text-[12px] text-fd-muted-foreground uppercase tracking-wider">
							<ChevronLeft className="group-hover:-translate-x-0.5 h-3 w-3 transition-transform" />
							Previous
						</span>
						<span className="font-bold text-[17px] text-fd-foreground tracking-tight">
							{previous.name}
						</span>
					</Link>
				) : (
					<div />
				)}

				{next ? (
					<Link
						href={next.url}
						className="group relative flex flex-col items-end gap-2 rounded-2xl border border-fd-border p-6 text-right transition-all hover:border-fd-primary/50 hover:bg-fd-primary/[0.02]"
					>
						<span className="flex items-center gap-1.5 font-semibold text-[12px] text-fd-muted-foreground uppercase tracking-wider">
							Next
							<ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</span>
						<span className="font-bold text-[17px] text-fd-foreground tracking-tight">
							{next.name}
						</span>
					</Link>
				) : (
					<div />
				)}
			</div>

			{/* Social Footer */}
			<div className="flex items-center gap-6 border-fd-border border-t pt-12 pb-16">
				<Link
					href="https://x.com/reloop"
					className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
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
					className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
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
					className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
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
					className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
				>
					<div className="rounded-full border border-current p-0.5">
						<div className="h-3.5 w-3.5 rounded-full border border-current" />
					</div>
				</Link>
			</div>
		</footer>
	);
}
