"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import type { Contact } from "../types";

export const ExistingMembers = ({
	contacts,
	onRemove,
}: {
	contacts: Contact[];
	onRemove: (contact: Contact) => void;
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (contacts.length === 0) return null;

	return (
		<div className="flex flex-col border-stroke-soft-100 border-t dark:border-stroke-soft-100/10">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-bg-strong-200/30"
			>
				<div className="flex items-center gap-2">
					<Icon name="users" className="h-3.5 w-3.5 text-text-soft-400" />
					<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-text-soft-400/80">
						Already in group ({contacts.length})
					</p>
				</div>
				<Icon
					name="chevron-down"
					className={cn(
						"h-3.5 w-3.5 text-text-soft-400 transition-transform duration-200",
						isExpanded ? "rotate-180" : "",
					)}
				/>
			</button>

			{isExpanded && (
				<div className="max-h-[300px] overflow-y-auto bg-bg-weak-50/5 dark:bg-bg-strong-300/5">
					<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/10">
						{contacts.map((contact) => {
							const initials = (
								contact?.firstName?.[0] ||
								contact?.email?.[0] ||
								"?"
							).toUpperCase();
							return (
								<div
									key={contact.id}
									className="group/item flex w-full items-center gap-4 px-5 py-3 text-left transition-all hover:bg-bg-weak-50/20 dark:hover:bg-bg-strong-200/20"
								>
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
										onClick={() => onRemove(contact)}
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-stroke-soft-100 bg-bg-white-0 text-text-soft-400 transition-all hover:border-error-base/30 hover:bg-error-base/5 hover:text-error-base dark:border-stroke-soft-100/10 dark:bg-bg-strong-300 dark:hover:bg-error-base/10"
										title="Remove from group"
									>
										<Icon name="minus" className="h-3.5 w-3.5" />
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
