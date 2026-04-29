"use client";

import * as Modal from "@reloop/ui/modal";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useIntersectionObserver } from "usehooks-ts";

import { DiscoveryPane } from "./components/discovery-pane";
import { ModalFooter } from "./components/modal-footer";
import { ModalHeader } from "./components/modal-header";
import { SelectionBasket } from "./components/selection-basket";
import type { AddContactToGroupModalProps } from "./types";
import { useAddContactToGroup } from "./use-add-contact-to-group";

export const AddContactToGroupModal = ({
	open,
	onOpenChange,
}: AddContactToGroupModalProps) => {
	const {
		groupName,
		isSubmitting,
		searchInput,
		setSearchInput,
		debouncedSearch,
		selectedContacts,
		setSelectedContacts,
		availableContacts,
		existingContacts,
		totalMatching,
		totalInOrg,
		hasMore,
		setSize,
		isValidating,
		isSearching,
		isGroupLoading,
		isAllSelected,
		toggleContact,
		removeContact,
		toggleSelectAll,
		handleOpenChange,
		handleSubmit,
		removeFromGroup,
		fetchedCount,
	} = useAddContactToGroup(open, onOpenChange);

	const inputRef = useRef<HTMLInputElement>(null);
	const { isIntersecting, ref: loadMoreRef } = useIntersectionObserver({
		threshold: 0.1,
	});

	// Load more when the sentinel comes into view — must be in an effect,
	// not in the render body, to avoid setState-during-render warnings.
	useEffect(() => {
		if (isIntersecting && hasMore && !isValidating) {
			setSize((s) => s + 1);
		}
	}, [isIntersecting, hasMore, isValidating, setSize]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && selectedContacts.length > 0 && !isSubmitting) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, selectedContacts, isSubmitting, handleSubmit],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[860px]"
				showClose={true}
			>
				<div className="flex flex-col rounded-20 border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<ModalHeader groupName={groupName} />

					<div className="flex flex-col divide-x divide-stroke-soft-100 sm:flex-row dark:divide-stroke-soft-100/40">
						{/* ── Left Column: Discovery ────────────────────────── */}
						<DiscoveryPane
							searchInput={searchInput}
							onSearchChange={setSearchInput}
							isSearching={isSearching || isGroupLoading}
							isValidating={isValidating}
							isSubmitting={isSubmitting}
							isAllSelected={isAllSelected}
							onToggleSelectAll={toggleSelectAll}
							totalMatching={totalMatching}
							debouncedSearch={debouncedSearch}
							availableContacts={availableContacts}
							onToggleContact={toggleContact}
							hasMore={hasMore}
							loadMoreRef={loadMoreRef}
							inputRef={inputRef}
						/>

						{/* ── Right Column: Selection ────────────────────────── */}
						<SelectionBasket
							selectedContacts={selectedContacts}
							existingContacts={existingContacts}
							onRemove={removeContact}
							onRemoveFromGroup={removeFromGroup}
							onClearAll={() => setSelectedContacts([])}
							isSubmitting={isSubmitting}
						/>
					</div>

					<ModalFooter
						isSubmitting={isSubmitting}
						selectedCount={selectedContacts.length}
						fetchedCount={fetchedCount}
						totalMatching={totalMatching}
						totalInOrg={totalInOrg}
						onCancel={() => handleOpenChange(false)}
						onSubmit={handleSubmit}
					/>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
