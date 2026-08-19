"use client";

import { Icon } from "@reloop/ui/icon";
import { useMemo, useState } from "react";

export interface HeroBrowserUrlBarProps {
	activeItem?: string;
}

type BrowserLocation = {
	path: string;
	search: string;
};

const HOST = "local.reloop.sh";

function locationFor(activeItem: string): BrowserLocation {
	switch (activeItem) {
		case "emails":
		case "overview":
			return { path: "/", search: "" };
		case "inbox":
			return { path: "/inbox", search: "" };
		case "contacts":
			return { path: "/contacts", search: "" };
		case "templates":
			return { path: "/templates", search: "" };
		case "workflow":
			return { path: "/workflows", search: "" };
		case "metrics":
		case "analytics":
			return { path: "/metrics", search: "preset=15d" };
		case "logs":
			return { path: "/logs", search: "preset=15d" };
		case "api-keys":
			return { path: "/api-keys", search: "" };
		case "domain":
			return { path: "/domain", search: "" };
		case "webhooks":
			return { path: "/webhooks", search: "" };
		case "integrations":
			return { path: "/integrations", search: "" };
		case "smtp":
			return { path: "/smtp", search: "" };
		case "settings":
			return { path: "/settings", search: "" };
		default:
			return { path: `/${activeItem}`, search: "" };
	}
}

export function HeroBrowserUrlBar({
	activeItem = "emails",
}: HeroBrowserUrlBarProps) {
	const [isBookmarked, setIsBookmarked] = useState(false);
	const { path, search } = useMemo(
		() => locationFor(activeItem),
		[activeItem],
	);

	return (
		<div className="flex h-11 shrink-0 items-center gap-2 border-stroke-soft-200 border-b bg-bg-white-0 px-2.5 text-[12px] text-text-sub-600 select-none dark:border-white/10 dark:text-white/60">
			<div className="flex items-center gap-0.5">
				<button
					type="button"
					aria-label="Back"
					className="flex size-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-black/5 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-3.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<button
					type="button"
					aria-label="Forward"
					disabled
					className="flex size-6 items-center justify-center rounded-md text-text-sub-600/40 dark:text-white/20"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-3.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
				<button
					type="button"
					aria-label="Reload"
					className="flex size-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-black/5 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
				>
					<Icon name="refresh-cw" className="size-3.5" />
				</button>
			</div>

			<div className="flex h-8 min-w-0 flex-1 items-center justify-between rounded-full border border-black/5 bg-black/[0.04] px-3 dark:border-white/5 dark:bg-white/[0.06]">
				<div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-3.5 shrink-0 text-text-sub-600/70 dark:text-white/40"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
					<span className="truncate font-mono text-[11.5px] tracking-tight text-text-strong-950 dark:text-white/90">
						<span className="text-text-sub-600/75 dark:text-white/50">
							{HOST}
						</span>
						<span>{path === "/" ? "" : path}</span>
						{search ? (
							<span className="text-text-sub-600 dark:text-white/45">
								?{search}
							</span>
						) : null}
					</span>
				</div>

				<button
					type="button"
					aria-label="Bookmark"
					onClick={() => setIsBookmarked((b) => !b)}
					className="flex size-4 shrink-0 items-center justify-center text-text-sub-600/50 transition-colors hover:text-amber-500 dark:text-white/35 dark:hover:text-amber-400"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-3.5"
						fill={isBookmarked ? "currentColor" : "none"}
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
				</button>
			</div>

			<button
				type="button"
				aria-label="Menu"
				className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-sub-600/70 transition-colors hover:bg-black/5 hover:text-text-strong-950 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-3.5"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="1" />
					<circle cx="12" cy="5" r="1" />
					<circle cx="12" cy="19" r="1" />
				</svg>
			</button>
		</div>
	);
}
