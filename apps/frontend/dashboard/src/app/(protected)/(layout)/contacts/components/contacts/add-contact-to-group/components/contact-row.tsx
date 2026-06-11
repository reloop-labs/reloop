"use client";

import { cn } from "@reloop/ui/cn";
import type { Contact } from "../types";
import { getDisplayName, getInitial } from "./utils";

export const ContactRow = ({
	contact,
	onToggle,
	disabled,
}: {
	contact: Contact;
	onToggle: () => void;
	disabled?: boolean;
}) => {
	const initial = getInitial(contact);
	const displayName = getDisplayName(contact);
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"group flex w-full items-center gap-4 px-5 py-3 text-left transition-all",
				"hover:bg-bg-weak-50/50 dark:hover:bg-bg-strong-200/50",
			)}
			disabled={disabled}
		>
			{/* Unchecked checkbox — contacts disappear from this list once selected */}
			<div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-stroke-soft-100 bg-bg-white-0 transition-all dark:border-stroke-soft-100/40 dark:bg-bg-strong-200" />

			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-strong-200 dark:text-text-soft-400">
				{initial}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-[13px] text-text-strong-950 dark:text-white">
					{displayName}
				</p>
				<p className="truncate text-[11px] text-text-sub-600 dark:text-text-soft-400">
					{contact.email}
				</p>
			</div>
		</button>
	);
};
