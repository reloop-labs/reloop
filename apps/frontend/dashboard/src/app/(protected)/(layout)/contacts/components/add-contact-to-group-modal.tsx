"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { useIntersectionObserver } from "usehooks-ts";

interface Contact {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
}

interface AddContactToGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const PAGE_SIZE = 50;

export const AddContactToGroupModal = ({
	open,
	onOpenChange,
}: AddContactToGroupModalProps) => {
	const params = useParams();
	const groupId = params.contact_group_id as string;
	const { mutate } = useSWRConfig();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const { isIntersecting, ref: loadMoreRef } = useIntersectionObserver({
		threshold: 0.1,
	});

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);

	// Fetch contacts matching the search with infinite scroll
	const {
		data: infiniteData,
		size,
		setSize,
		isValidating,
		isLoading: isSearching,
	} = useSWRInfinite<{
		contacts: Contact[];
		total: number;
		totalContacts: number;
	}>(
		(index) => {
			if (!open) return null;
			const page = index + 1;
			return `/api/contacts/list?page=${page}&limit=${PAGE_SIZE}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`;
		},
		{ revalidateFirstPage: false },
	);

	const fetchedContacts = useMemo(() => {
		return infiniteData ? infiniteData.flatMap((page) => page.contacts) : [];
	}, [infiniteData]);

	const totalMatching = infiniteData?.[0]?.total || 0;
	const totalInOrg = infiniteData?.[0]?.totalContacts || 0;
	const hasMore = fetchedContacts.length < totalMatching;

	// Load more when intersecting
	useEffect(() => {
		if (isIntersecting && hasMore && !isValidating) {
			setSize(size + 1);
		}
	}, [isIntersecting, hasMore, isValidating, setSize, size]);

	// Fetch current group's contacts to prevent adding duplicates
	const { data: groupData } = useSWR<{
		group: { name: string; contacts: Contact[] };
	}>(
		open && groupId
			? `/api/contacts/v1/groups/${groupId}/contacts?limit=100`
			: null,
	);

	const existingContactIds = useMemo(() => {
		return new Set(groupData?.group?.contacts?.map((c) => c.id) || []);
	}, [groupData]);

	const availableContacts = useMemo(() => {
		return fetchedContacts.filter((c) => !existingContactIds.has(c.id));
	}, [fetchedContacts, existingContactIds]);

	const isAllSelected = useMemo(() => {
		if (availableContacts.length === 0) return false;
		return availableContacts.every((contact) =>
			selectedContacts.some((c) => c.id === contact.id),
		);
	}, [availableContacts, selectedContacts]);

	const toggleContact = (contact: Contact) => {
		setSelectedContacts((prev) => {
			const isSelected = prev.some((c) => c.id === contact.id);
			if (isSelected) {
				return prev.filter((c) => c.id !== contact.id);
			}
			return [...prev, contact];
		});
	};

	const removeContact = (contactId: string) => {
		setSelectedContacts((prev) => prev.filter((c) => c.id !== contactId));
	};

	const toggleSelectAll = () => {
		if (isAllSelected) {
			const availableIds = new Set(availableContacts.map((c) => c.id));
			setSelectedContacts((prev) =>
				prev.filter((c) => !availableIds.has(c.id)),
			);
		} else {
			const newSelections = [...selectedContacts];
			availableContacts.forEach((contact) => {
				if (!newSelections.some((c) => c.id === contact.id)) {
					newSelections.push(contact);
				}
			});
			setSelectedContacts(newSelections);
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setTimeout(() => {
				setSelectedContacts([]);
				setSearchInput("");
				setSize(1);
			}, 300);
		}
		onOpenChange(isOpen);
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && selectedContacts.length > 0 && !isSubmitting) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, selectedContacts, isSubmitting],
	);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!groupId) {
			toast.error("Group ID not found");
			return;
		}

		if (selectedContacts.length === 0) {
			toast.error("Please select at least one contact");
			return;
		}

		setIsSubmitting(true);
		try {
			let added = 0;
			const promises = selectedContacts.map(async (contact) => {
				const response = await fetch(`/api/contacts/group/${groupId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: contact.email }),
				});
				if (response.ok) added++;
			});

			await Promise.all(promises);

			if (added > 0) {
				toast.success(
					`${added} contact${added !== 1 ? "s" : ""} added to group`,
				);
			} else {
				toast.error("Failed to add contacts to group");
			}

			handleOpenChange(false);

			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes(`/api/contacts/v1/groups/${groupId}/contacts`),
			);
		} catch (error) {
			console.error("Failed to add contacts:", error);
			toast.error("Failed to add contacts to group");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[860px]"
				showClose={true}
			>
				<div className="flex flex-col rounded-20 border border-stroke-soft-100/50 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#101010]">
					{/* Main Header */}
					<div className="border-stroke-soft-100 border-b p-5 dark:border-stroke-soft-100/20">
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 dark:bg-primary-base/20">
								<Icon name="user-plus" className="h-5 w-5 text-primary-base" />
							</div>
							<div>
								<Modal.Title className="font-medium text-text-strong-950 text-title-h5 dark:text-white">
									Add contacts to{" "}
									<span className="text-primary-base">
										{groupData?.group?.name || "group"}
									</span>
								</Modal.Title>
							</div>
						</div>
					</div>

					<div className="flex flex-col divide-x divide-stroke-soft-100 sm:flex-row dark:divide-stroke-soft-100/20">
						{/* ── Left Column: Search & List ─────────────────────── */}
						<div className="flex flex-1 flex-col overflow-hidden">
							<div className="p-5 pb-3">
								<Input.Root size="small" className="rounded-lg">
									<Input.Wrapper className="pl-9 dark:bg-bg-strong-300/50">
										<div className="-translate-y-1/2 absolute top-1/2 left-3">
											{isSearching || isValidating ? (
												<Spinner size={14} className="text-text-soft-400" />
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

							{/* Select All Bar - Image Inspired */}
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
								{!debouncedSearch &&
								!isSearching &&
								fetchedContacts.length === 0 ? (
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
										{availableContacts.map((contact) => {
											const isSelected = selectedContacts.some(
												(c) => c.id === contact.id,
											);
											const initials = (
												contact.firstName?.[0] || contact.email[0]
											).toUpperCase();
											return (
												<button
													key={contact.id}
													type="button"
													onClick={() => toggleContact(contact)}
													className={cn(
														"group flex w-full items-center gap-4 px-5 py-3 text-left transition-all",
														isSelected
															? "bg-primary-base/5 dark:bg-primary-base/10"
															: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-strong-200/50",
													)}
													disabled={isSubmitting}
												>
													<div
														className={cn(
															"flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
															isSelected
																? "border-primary-base bg-primary-base text-white"
																: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-strong-200",
														)}
													>
														{isSelected && (
															<Icon name="check" className="h-3 w-3" />
														)}
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
										})}
										{hasMore && (
											<div
												ref={loadMoreRef}
												className="flex items-center justify-center py-4"
											>
												<Spinner size={16} className="text-text-soft-400" />
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* ── Right Column: Selected Items ───────────────────── */}
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
											<div
												key={contact.id}
												className="group flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-2 dark:border-stroke-soft-100/10 dark:bg-bg-strong-300"
											>
												<div className="min-w-0 flex-1">
													<p className="truncate font-medium text-[11px] text-text-strong-950 dark:text-white">
														{contact.email}
													</p>
												</div>
												<button
													type="button"
													onClick={() => removeContact(contact.id)}
													className="ml-2 text-text-soft-400 transition-colors hover:text-error-base"
													disabled={isSubmitting}
												>
													<Icon name="cross" className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Global Footer */}
					<div className="flex flex-col-reverse justify-end gap-2 border-stroke-soft-100/50 border-t px-6 py-4 sm:flex-row sm:items-center dark:border-stroke-soft-100/20">
						<div className="mr-auto hidden items-center gap-2 text-text-soft-400 text-xs sm:flex">
							{totalMatching > 0 && (
								<>
									<span>
										Showing {fetchedContacts.length} of{" "}
										{totalMatching.toLocaleString()} records
									</span>
									<span className="h-1 w-1 rounded-full bg-stroke-soft-200 dark:bg-stroke-soft-100/20" />
									<div className="flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 dark:border-stroke-soft-100/10 dark:bg-bg-strong-200/50 dark:text-text-soft-400">
										<span className="h-1 w-1 rounded-full bg-success-base" />
										{totalInOrg.toLocaleString()} total
									</div>
								</>
							)}
						</div>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
							className="h-9 gap-1.5 px-4 text-sm"
						>
							Cancel
							<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px] dark:border-stroke-soft-100/20 dark:bg-bg-strong-200/50">
								Esc
							</span>
						</Button.Root>
						<Button.Root
							type="button"
							onClick={() => handleSubmit()}
							disabled={isSubmitting || selectedContacts.length === 0}
							className="h-9 gap-1.5 px-4 text-sm"
						>
							{isSubmitting ? (
								<>
									<Spinner size={14} color="currentColor" />
									Adding...
								</>
							) : (
								<>
									Add {selectedContacts.length.toLocaleString()} contact
									{selectedContacts.length !== 1 ? "s" : ""}
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
									</span>
								</>
							)}
						</Button.Root>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
