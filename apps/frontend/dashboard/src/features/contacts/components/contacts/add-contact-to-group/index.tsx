import * as Modal from "@reloop/ui/modal";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useIntersectionObserver } from "usehooks-ts";

import { DiscoveryPane } from "./components/discovery-pane";
import { ModalFooter } from "./components/modal-footer";
import { ModalHeader } from "./components/modal-header";
import type { AddContactToGroupModalProps } from "./types";
import { useAddContactToGroup } from "./use-add-contact-to-group";

export const AddContactToGroupModal = ({
	open,
	onOpenChange,
}: AddContactToGroupModalProps) => {
	const {
		groupName,
		memberCount,
		isSubmitting,
		searchInput,
		setSearchInput,
		debouncedSearch,
		selectedContacts,
		selectedContactIds,
		existingContactIds,
		listContacts,
		pickableCount,
		totalMatching,
		hasMore,
		loadMore,
		isValidating,
		isSearching,
		isAllVisibleSelected,
		toggleContact,
		removeContact,
		clearSelection,
		toggleSelectAllVisible,
		handleOpenChange,
		handleSubmit,
		fetchedCount,
	} = useAddContactToGroup(open, onOpenChange);

	const inputRef = useRef<HTMLInputElement>(null);
	const { isIntersecting, ref: loadMoreRef } = useIntersectionObserver({
		threshold: 0.1,
	});

	useEffect(() => {
		if (isIntersecting && hasMore && !isValidating) {
			loadMore();
		}
	}, [isIntersecting, hasMore, isValidating, loadMore]);

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && selectedContacts.length > 0 && !isSubmitting) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, selectedContacts, isSubmitting, handleSubmit],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && !isSubmitting) {
				handleOpenChange(false);
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, isSubmitting, handleOpenChange],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-0 sm:max-w-[520px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div className="flex max-h-[min(720px,85vh)] flex-col">
					<ModalHeader groupName={groupName} memberCount={memberCount} />

					<DiscoveryPane
						searchInput={searchInput}
						onSearchChange={setSearchInput}
						isSearching={isSearching}
						isValidating={isValidating}
						isSubmitting={isSubmitting}
						isAllVisibleSelected={isAllVisibleSelected}
						onToggleSelectAllVisible={toggleSelectAllVisible}
						pickableCount={pickableCount}
						selectedContacts={selectedContacts}
						selectedContactIds={selectedContactIds}
						existingContactIds={existingContactIds}
						onRemoveSelected={removeContact}
						onClearSelection={clearSelection}
						debouncedSearch={debouncedSearch}
						listContacts={listContacts}
						onToggleContact={toggleContact}
						hasMore={hasMore}
						loadMoreRef={loadMoreRef}
						inputRef={inputRef}
						fetchedCount={fetchedCount}
						totalMatching={totalMatching}
					/>

					<ModalFooter
						isSubmitting={isSubmitting}
						selectedCount={selectedContacts.length}
						onCancel={() => handleOpenChange(false)}
						onSubmit={() => void handleSubmit()}
					/>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
