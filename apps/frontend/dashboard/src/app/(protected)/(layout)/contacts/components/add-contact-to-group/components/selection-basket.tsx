"use client";

import { Icon } from "@reloop/ui/icon";
import type { Contact } from "../types";
import { ExistingMembers } from "./existing-members";
import { SelectedItem } from "./selected-item";

interface SelectionBasketProps {
	selectedContacts: Contact[];
	existingContacts: Contact[];
	onRemove: (id: string) => void;
	onRemoveFromGroup: (contact: Contact) => void;
	onClearAll: () => void;
	isSubmitting: boolean;
}

export const SelectionBasket = ({
	selectedContacts,
	existingContacts,
	onRemove,
	onRemoveFromGroup,
	onClearAll,
	isSubmitting,
}: SelectionBasketProps) => {
	return (
		<div className="flex w-full flex-col bg-bg-weak-50/20 sm:w-[380px] dark:bg-bg-strong-200/10">
			{/* New Selections Section */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-5 py-3 dark:border-stroke-soft-100/20">
					<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-text-soft-400/80">
						To be added ({selectedContacts.length})
					</p>
					{selectedContacts.length > 0 && (
						<button
							type="button"
							onClick={onClearAll}
							className="text-[11px] text-text-soft-400 transition-colors hover:text-error-base"
						>
							Clear all
						</button>
					)}
				</div>

				<div className="flex-1 overflow-y-auto">
					{selectedContacts.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center opacity-50">
							<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-100 border-dashed">
								<Icon name="user-plus" className="h-4 w-4 text-text-soft-400" />
							</div>
							<p className="text-[11px] text-text-soft-400">
								No new selections
							</p>
						</div>
					) : (
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/10">
							{selectedContacts.map((contact) => (
								<SelectedItem
									key={contact.id}
									contact={contact}
									onRemove={() => onRemove(contact.id)}
									disabled={isSubmitting}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Existing Members Section */}
			<ExistingMembers
				contacts={existingContacts}
				onRemove={onRemoveFromGroup}
			/>
		</div>
	);
};
