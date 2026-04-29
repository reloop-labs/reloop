"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import type { Contact } from "../types";

export const ExistingMembers = ({
	contacts,
}: {
	contacts: Contact[];
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
				<div className="max-h-[200px] overflow-y-auto bg-bg-weak-50/10 px-4 pb-4 pt-1 dark:bg-bg-strong-300/5">
					<div className="space-y-1.5">
						{contacts.map((contact) => (
							<div
								key={contact.id}
								className="flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-2 dark:border-stroke-soft-100/10 dark:bg-bg-strong-300"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-[11px] text-text-strong-950 dark:text-white">
										{contact.email}
									</p>
								</div>
								<div className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-success-base/10 text-success-base">
									<Icon name="check" className="h-2.5 w-2.5" />
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
