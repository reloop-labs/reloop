"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useIntersectionObserver } from "usehooks-ts";

import { ContactRow } from "./components/contact-row";
import { ModalFooter } from "./components/modal-footer";
import { ModalHeader } from "./components/modal-header";
import { SelectedItem } from "./components/selected-item";
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
		totalMatching,
		totalInOrg,
		hasMore,
		setSize,
		size,
		isValidating,
		isSearching,
		isAllSelected,
		toggleContact,
		removeContact,
		toggleSelectAll,
		handleOpenChange,
		handleSubmit,
		fetchedCount,
	} = useAddContactToGroup(open, onOpenChange);

	const inputRef = useRef<HTMLInputElement>(null);
	const { isIntersecting, ref: loadMoreRef } = useIntersectionObserver({
		threshold: 0.1,
	});

	// Load more when intersecting
	if (isIntersecting && hasMore && !isValidating) {
		setSize(size + 1);
	}

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
				<div className="flex flex-col rounded-20 border border-stroke-soft-100/50 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#101010]">
					<ModalHeader groupName={groupName} />

					<div className="flex flex-col divide-x divide-stroke-soft-100 sm:flex-row dark:divide-stroke-soft-100/20">
						{/* ── Left Column: Discovery ────────────────────────── */}
						<div className="flex flex-1 flex-col overflow-hidden">
							<div className="p-5 pb-3">
								<Input.Root size="small" className="rounded-lg">
									<Input.Wrapper className="pl-9 dark:bg-bg-strong-300/50">
										<div className="-translate-y-1/2 absolute top-1/2 left-3">
											{isSearching || isValidating ? (
												<Spinner size={14} />
											) : (
												<Icon
													name="search"
													className="h-4 w-4 text-text-soft-400"
												/>
											)}
										</div>
										<Input.Input
											ref={inputRef}
											type="text"
											value={searchInput}
											onChange={(e) => setSearchInput(e.target.value)}
											placeholder="Search by email..."
											autoFocus
											disabled={isSubmitting}
											className="dark:text-white"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							<div className="border-stroke-soft-100 border-b px-5 py-2.5 dark:border-stroke-soft-100/10">
								<button
									type="button"
									onClick={toggleSelectAll}
									className="flex items-center gap-3 transition-colors hover:opacity-80"
								>
									<div
										className={cn(
											"flex h-4 w-4 items-center justify-center rounded border transition-all",
											isAllSelected
												? "border-primary-base bg-primary-base text-white"
												: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-strong-200",
										)}
									>
										{isAllSelected && <Icon name="check" className="h-3 w-3" />}
									</div>
									<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
										Select all visible ({totalMatching.toLocaleString()})
									</span>
								</button>
							</div>

							<div className="max-h-[380px] min-h-[300px] overflow-y-auto">
								{!debouncedSearch && !isSearching && fetchedCount === 0 ? (
									<div className="flex h-64 flex-col items-center justify-center text-center">
										<Icon
											name="search"
											className="mb-3 h-8 w-8 text-text-soft-400"
										/>
										<p className="font-medium text-sm text-text-strong-950 dark:text-white">
											Start searching
										</p>
										<p className="mt-1 text-text-sub-600 text-xs dark:text-text-soft-400">
											Type an email address to find records.
										</p>
									</div>
								) : (
									<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/10">
										{availableContacts.map((contact) => (
											<ContactRow
												key={contact.id}
												contact={contact}
												isSelected={selectedContacts.some(
													(c) => c.id === contact.id,
												)}
												onToggle={() => toggleContact(contact)}
												disabled={isSubmitting}
											/>
										))}
										{hasMore && (
											<div
												ref={loadMoreRef}
												className="flex items-center justify-center py-4"
											>
												<Spinner size={16} />
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* ── Right Column: Selection ────────────────────────── */}
						<div className="flex w-full flex-col bg-bg-weak-50/20 sm:w-[280px] dark:bg-bg-strong-200/10">
							<div className="flex items-center justify-between border-stroke-soft-100 border-b px-5 py-3 dark:border-stroke-soft-100/20">
								<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-text-soft-400/80">
									Selected ({selectedContacts.length})
								</p>
								{selectedContacts.length > 0 && (
									<button
										type="button"
										onClick={() => setSelectedContacts([])}
										className="text-[11px] text-text-soft-400 transition-colors hover:text-error-base"
									>
										Clear all
									</button>
								)}
							</div>

							<div className="max-h-[480px] flex-1 overflow-y-auto p-4">
								{selectedContacts.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center text-center opacity-50">
										<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-100 border-dashed">
											<Icon
												name="user-plus"
												className="h-4 w-4 text-text-soft-400"
											/>
										</div>
										<p className="text-[11px] text-text-soft-400">
											No selections
										</p>
									</div>
								) : (
									<div className="space-y-1.5">
										{selectedContacts.map((contact) => (
											<SelectedItem
												key={contact.id}
												contact={contact}
												onRemove={() => removeContact(contact.id)}
												disabled={isSubmitting}
											/>
										))}
									</div>
								)}
							</div>
						</div>
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
