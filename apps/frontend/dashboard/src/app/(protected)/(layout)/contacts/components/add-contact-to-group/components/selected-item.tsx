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
}) => (
	<div className="group flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-2 dark:border-stroke-soft-100/10 dark:bg-bg-strong-300">
		<div className="min-w-0 flex-1">
			<p className="truncate font-medium text-[11px] text-text-strong-950 dark:text-white">
				{contact.email}
			</p>
		</div>
		<button
			type="button"
			onClick={onRemove}
			className="ml-2 text-text-soft-400 transition-colors hover:text-error-base"
			disabled={disabled}
		>
			<Icon name="cross" className="h-3 w-3" />
		</button>
	</div>
);
