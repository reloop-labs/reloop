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
			return { path: "/home", search: "" };
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

const navButtonClass =
	"flex size-8 shrink-0 items-center justify-center rounded-full text-[#5f6368] transition-colors duration-150 hover:bg-black/[0.06] hover:text-[#202124] disabled:pointer-events-none disabled:opacity-30 dark:text-[#9aa0a6] dark:hover:bg-white/10 dark:hover:text-white";

export function HeroBrowserUrlBar({
	activeItem = "emails",
}: HeroBrowserUrlBarProps) {
	const [isBookmarked, setIsBookmarked] = useState(false);
	const { path, search } = useMemo(
		() => locationFor(activeItem),
		[activeItem],
	);

	return (
		<div className="flex h-10 shrink-0 items-center gap-1.5 bg-bg-white-0 px-2 text-[#5f6368] select-none dark:bg-[#3c3c3c] dark:text-[#9aa0a6]">
			<div className="flex items-center">
				<button type="button" aria-label="Back" className={navButtonClass}>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-4"
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
					className={navButtonClass}
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
				<button type="button" aria-label="Reload" className={navButtonClass}>
					<Icon name="refresh-cw" className="size-4" />
				</button>
			</div>

			<div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f1f3f4] px-3 dark:bg-[#2b2b2b]">
				<span className="grid size-5 shrink-0 place-items-center rounded-full bg-black/[0.06] text-[#5f6368] dark:bg-white/10 dark:text-[#9aa0a6]">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-3"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20" />
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
					</svg>
				</span>
				<span className="min-w-0 truncate text-[13px] leading-none tracking-[-0.01em] text-[#202124] dark:text-[#e8eaed]">
					<span className="text-[#5f6368] dark:text-[#9aa0a6]">{HOST}</span>
					<span>{path}</span>
					{search ? (
						<span className="text-[#5f6368] dark:text-[#9aa0a6]">
							?{search}
						</span>
					) : null}
				</span>
				<button
					type="button"
					aria-label="Bookmark"
					onClick={() => setIsBookmarked((b) => !b)}
					className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full text-[#5f6368] transition-colors duration-150 hover:text-amber-500 dark:text-[#9aa0a6] dark:hover:text-amber-400"
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

			<button type="button" aria-label="Menu" className={navButtonClass}>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-4"
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
