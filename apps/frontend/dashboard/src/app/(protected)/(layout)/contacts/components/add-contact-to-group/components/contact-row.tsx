"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { Contact } from "../types";

export const ContactRow = ({
	contact,
	isSelected,
	onToggle,
	disabled,
}: {
	contact: Contact;
	isSelected: boolean;
	onToggle: () => void;
	disabled?: boolean;
}) => {
	const initials = (
		contact?.firstName?.[0] ||
		contact?.email?.[0] ||
		"?"
	).toUpperCase();
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"group flex w-full items-center gap-4 px-5 py-3 text-left transition-all",
				isSelected
					? "bg-primary-base/5 dark:bg-primary-base/10"
					: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-strong-200/50",
			)}
			disabled={disabled}
		>
			<div
				className={cn(
					"flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
					isSelected
						? "border-primary-base bg-primary-base text-white"
						: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-strong-200",
				)}
			>
				{isSelected && <Icon name="check" className="h-3 w-3" />}
			</div>

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
		</button>
	);
};
