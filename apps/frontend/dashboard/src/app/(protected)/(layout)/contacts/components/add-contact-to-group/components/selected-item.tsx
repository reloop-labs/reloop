"use client";

import { Icon } from "@reloop/ui/icon";
import type { Contact } from "../types";

export const SelectedItem = ({
	contact,
	onRemove,
	disabled,
}: {
	contact: Contact;
	onRemove: () => void;
	disabled?: boolean;
}) => {
	const initials = (
		contact?.firstName?.[0] ||
		contact?.email?.[0] ||
		"?"
	).toUpperCase();

	return (
		<div className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-all hover:bg-bg-weak-50/50 dark:hover:bg-bg-strong-200/50">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-strong-200 dark:text-text-soft-400">
				{initials}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-[13px] text-text-strong-950 dark:text-white">
					{contact.firstName || contact.lastName
						? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
						: contact.email.split("@")[0]}
				</p>
				<p className="truncate text-[11px] text-text-sub-600 dark:text-text-soft-400">
					{contact.email}
				</p>
			</div>

			<button
				type="button"
				onClick={onRemove}
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-stroke-soft-100 bg-bg-white-0 text-text-soft-400 transition-all hover:border-error-base/30 hover:bg-error-base/5 hover:text-error-base dark:border-stroke-soft-100/10 dark:bg-bg-strong-300 dark:hover:bg-error-base/10"
				disabled={disabled}
			>
				<Icon name="cross" className="h-3.5 w-3.5" />
			</button>
		</div>
	);
};
