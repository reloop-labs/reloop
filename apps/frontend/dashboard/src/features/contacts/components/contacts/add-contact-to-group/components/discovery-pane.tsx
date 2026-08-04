import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import type { Ref } from "react";
import type { Contact } from "../types";
import { ContactRow } from "./contact-row";
import { getDisplayName } from "./utils";

interface DiscoveryPaneProps {
	searchInput: string;
	onSearchChange: (value: string) => void;
	isSearching: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
	isAllVisibleSelected: boolean;
	onToggleSelectAllVisible: () => void;
	pickableCount: number;
	selectedContacts: Contact[];
	selectedContactIds: Set<string>;
	existingContactIds: Set<string>;
	onRemoveSelected: (id: string) => void;
	onClearSelection: () => void;
	debouncedSearch: string;
	listContacts: Contact[];
	onToggleContact: (contact: Contact) => void;
	hasMore: boolean;
	loadMoreRef: Ref<HTMLDivElement>;
	inputRef: Ref<HTMLInputElement>;
	fetchedCount: number;
	totalMatching: number;
}

export const DiscoveryPane = ({
	searchInput,
	onSearchChange,
	isSearching,
	isValidating,
	isSubmitting,
	isAllVisibleSelected,
	onToggleSelectAllVisible,
	pickableCount,
	selectedContacts,
	selectedContactIds,
	existingContactIds,
	onRemoveSelected,
	onClearSelection,
	debouncedSearch,
	listContacts,
	onToggleContact,
	hasMore,
	loadMoreRef,
	inputRef,
	fetchedCount,
	totalMatching,
}: DiscoveryPaneProps) => {
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* Search */}
			<div className="px-6 pt-4 pb-3">
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" />
						<Input.Input
							ref={inputRef}
							type="text"
							value={searchInput}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Search by name or email…"
							autoFocus
							disabled={isSubmitting}
						/>
						{(isSearching || isValidating) && (
							<div className="pr-1">
								<Spinner size={14} />
							</div>
						)}
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Selected chips */}
			{selectedContacts.length > 0 ? (
				<div className="border-stroke-soft-100 border-b px-6 pb-3 dark:border-stroke-soft-100/40">
					<div className="mb-2 flex items-center justify-between">
						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							Selected ({selectedContacts.length})
						</p>
						<button
							type="button"
							onClick={onClearSelection}
							disabled={isSubmitting}
							className="font-medium text-[11px] text-text-sub-600 transition-colors hover:text-error-base"
						>
							Clear
						</button>
					</div>
					<div className="flex max-h-[72px] flex-wrap gap-1.5 overflow-y-auto">
						{selectedContacts.map((contact) => (
							<span
								key={contact.id}
								className="inline-flex max-w-full items-center gap-1 rounded-lg border border-stroke-soft-100 bg-bg-weak-50 py-1 pr-1 pl-2 text-[12px] text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
							>
								<span className="truncate">{getDisplayName(contact)}</span>
								<button
									type="button"
									onClick={() => onRemoveSelected(contact.id)}
									disabled={isSubmitting}
									className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-error-base"
									aria-label={`Remove ${getDisplayName(contact)}`}
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							</span>
						))}
					</div>
				</div>
			) : null}

			{/* Select all + count */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-2 dark:border-stroke-soft-100/40">
				<button
					type="button"
					onClick={onToggleSelectAllVisible}
					disabled={isSubmitting || pickableCount === 0}
					className={cn(
						"flex items-center gap-2 font-medium text-[12px] text-text-sub-600 transition-colors",
						pickableCount > 0 && "hover:text-text-strong-950",
						pickableCount === 0 && "cursor-not-allowed opacity-50",
					)}
				>
					<div
						className={cn(
							"flex h-4 w-4 items-center justify-center rounded border transition-colors",
							isAllVisibleSelected && pickableCount > 0
								? "border-primary-base bg-primary-base text-white"
								: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40",
						)}
					>
						{isAllVisibleSelected && pickableCount > 0 ? (
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
								<path
									d="M2 5.2L4.1 7.2L8 2.8"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						) : null}
					</div>
					Select all loaded
					{pickableCount > 0 ? ` (${pickableCount})` : ""}
				</button>
				{totalMatching > 0 ? (
					<p className="text-[11px] text-text-soft-400">
						{fetchedCount.toLocaleString()} of {totalMatching.toLocaleString()}
					</p>
				) : null}
			</div>

			{/* List */}
			<div className="max-h-[360px] min-h-[280px] flex-1 overflow-y-auto">
				{isSearching ? (
					<div className="flex h-64 flex-col items-center justify-center gap-2">
						<Spinner size={20} />
						<p className="text-[12px] text-text-sub-600">Loading contacts…</p>
					</div>
				) : listContacts.length === 0 && debouncedSearch ? (
					<div className="flex h-64 flex-col items-center justify-center px-6 text-center">
						<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-bg-weak-50/30">
							<Icon name="search" className="h-5 w-5 text-text-soft-400" />
						</div>
						<p className="font-medium text-sm text-text-strong-950">
							No matches
						</p>
						<p className="mt-1 max-w-[240px] text-[12px] text-text-sub-600">
							Nothing matched &ldquo;{debouncedSearch}&rdquo;. Try a different
							email or name.
						</p>
					</div>
				) : listContacts.length === 0 ? (
					<div className="flex h-64 flex-col items-center justify-center px-6 text-center">
						<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-bg-weak-50/30">
							<Icon name="users" className="h-5 w-5 text-text-soft-400" />
						</div>
						<p className="font-medium text-sm text-text-strong-950">
							No contacts yet
						</p>
						<p className="mt-1 max-w-[240px] text-[12px] text-text-sub-600">
							Create contacts first, then add them to this group.
						</p>
					</div>
				) : (
					<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
						{listContacts.map((contact) => (
							<ContactRow
								key={contact.id}
								contact={contact}
								selected={selectedContactIds.has(contact.id)}
								inGroup={existingContactIds.has(contact.id)}
								onToggle={() => onToggleContact(contact)}
								disabled={isSubmitting}
							/>
						))}
						{hasMore ? (
							<div
								ref={loadMoreRef}
								className="flex items-center justify-center py-4"
							>
								<Spinner size={16} />
							</div>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
};
