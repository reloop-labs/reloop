"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import type { Ref } from "react";
import type { Contact } from "../types";
import { ContactRow } from "./contact-row";

interface DiscoveryPaneProps {
	searchInput: string;
	onSearchChange: (value: string) => void;
	isSearching: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
	isAllSelected: boolean;
	onToggleSelectAll: () => void;
	totalMatching: number;
	debouncedSearch: string;
	availableContacts: Contact[];
	selectedContacts: Contact[];
	onToggleContact: (contact: Contact) => void;
	hasMore: boolean;
	loadMoreRef: Ref<HTMLDivElement>;
	inputRef: Ref<HTMLInputElement>;
}

export const DiscoveryPane = ({
	searchInput,
	onSearchChange,
	isSearching,
	isValidating,
	isSubmitting,
	isAllSelected,
	onToggleSelectAll,
	totalMatching,
	debouncedSearch,
	availableContacts,
	selectedContacts,
	onToggleContact,
	hasMore,
	loadMoreRef,
	inputRef,
}: DiscoveryPaneProps) => {
	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<div className="p-3">
				<Input.Root size="small" className="rounded-lg">
					<Input.Wrapper className="pl-9 dark:bg-bg-strong-300/50">
						<div className="-translate-y-1/2 absolute top-1/2 left-3">
							{isSearching || isValidating ? (
								<Spinner size={14} />
							) : (
								<Icon name="search" className="h-4 w-4 text-text-soft-400" />
							)}
						</div>
						<Input.Input
							ref={inputRef}
							type="text"
							value={searchInput}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Search by email..."
							autoFocus
							disabled={isSubmitting}
							className="dark:text-white"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Select All Bar */}
			<div className="border-stroke-soft-100 border-t border-b px-5 py-2.5 dark:border-stroke-soft-100/10">
				<button
					type="button"
					onClick={onToggleSelectAll}
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
						Select all visible ({availableContacts.length.toLocaleString()})
					</span>
				</button>
			</div>

			<div className="max-h-[380px] min-h-[300px] overflow-y-auto">
				{isSearching ? (
					// Initial loading skeleton
					<div className="flex h-64 flex-col items-center justify-center">
						<Spinner size={20} />
					</div>
				) : availableContacts.length === 0 && debouncedSearch ? (
					// Search returned no results
					<div className="flex h-64 flex-col items-center justify-center text-center">
						<Icon name="search" className="mb-3 h-8 w-8 text-text-soft-400" />
						<p className="font-medium text-sm text-text-strong-950 dark:text-white">
							No results found
						</p>
						<p className="mt-1 text-text-sub-600 text-xs dark:text-text-soft-400">
							No contacts match &ldquo;{debouncedSearch}&rdquo;.
						</p>
					</div>
				) : availableContacts.length === 0 && !debouncedSearch ? (
					// Org has no contacts at all
					<div className="flex h-64 flex-col items-center justify-center text-center">
						<Icon name="users" className="mb-3 h-8 w-8 text-text-soft-400" />
						<p className="font-medium text-sm text-text-strong-950 dark:text-white">
							No contacts available
						</p>
						<p className="mt-1 text-text-sub-600 text-xs dark:text-text-soft-400">
							All contacts in your organization are already in this group.
						</p>
					</div>
				) : (
					<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/10">
						{availableContacts.map((contact) => (
							<ContactRow
								key={contact.id}
								contact={contact}
								isSelected={selectedContacts.some((c) => c.id === contact.id)}
								onToggle={() => onToggleContact(contact)}
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
	);
};
