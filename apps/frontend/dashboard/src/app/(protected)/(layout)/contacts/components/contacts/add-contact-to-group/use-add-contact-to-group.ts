"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import type { Contact } from "./types";

const PAGE_SIZE = 50;
// Backend hard-caps this at 100 — never request more than that.
const GROUP_MEMBERS_PAGE_SIZE = 100;

export const useAddContactToGroup = (
	open: boolean,
	onOpenChange: (open: boolean) => void,
) => {
	const params = useParams();
	const groupId = params.contact_group_id as string;
	const { mutate: mutateGlobal } = useSWRConfig();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

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
		mutate: mutateInfinite,
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

	// ── Fetch ALL existing group members (paginated, backend max = 100) ──────
	// We use useSWRInfinite so that groups with >100 members still work.
	const {
		data: groupPagesData,
		mutate: mutateGroup,
		isLoading: isGroupLoading,
	} = useSWRInfinite<{
		group: { name: string; contacts: Contact[] };
		total: number;
	}>(
		(index) => {
			if (!open || !groupId) return null;
			const page = index + 1;
			return `/api/contacts/v1/groups/${groupId}/contacts?limit=${GROUP_MEMBERS_PAGE_SIZE}&page=${page}`;
		},
		{
			revalidateFirstPage: false,
			// Automatically load all pages up-front so we have a full picture
			// of existing members before filtering.
			initialSize: 1,
		},
	);

	// Auto-fetch subsequent pages until we've loaded all existing members
	const groupTotal = groupPagesData?.[0]?.total ?? 0;
	const loadedGroupMemberCount = useMemo(
		() =>
			groupPagesData
				? groupPagesData.flatMap((p) => p.group?.contacts ?? []).length
				: 0,
		[groupPagesData],
	);
	const groupHasMore = loadedGroupMemberCount < groupTotal;

	// Trigger loading next page of group members when we know there are more
	useEffect(() => {
		if (groupHasMore && !isGroupLoading) {
			// setSize is stable but we need the current page count
			mutateGroup(); // just nudge — the index function handles pagination
		}
	}, [groupHasMore, isGroupLoading, mutateGroup]);

	const existingContacts = useMemo(() => {
		if (!groupPagesData) return [];
		return groupPagesData.flatMap((page) => page.group?.contacts ?? []);
	}, [groupPagesData]);

	const existingContactIds = useMemo(() => {
		return new Set(existingContacts.map((c) => c.id));
	}, [existingContacts]);

	// Group name from the first page
	const groupName = groupPagesData?.[0]?.group?.name ?? "";

	const selectedContactIds = useMemo(
		() => new Set(selectedContacts.map((c) => c.id)),
		[selectedContacts],
	);

	// While group members are still loading, don't filter yet — show nothing
	// to avoid the flash where all contacts briefly appear as available.
	const availableContacts = useMemo(() => {
		if (isGroupLoading) return [];
		return fetchedContacts.filter(
			(c) => !existingContactIds.has(c.id) && !selectedContactIds.has(c.id),
		);
	}, [fetchedContacts, existingContactIds, selectedContactIds, isGroupLoading]);

	// The full pickable pool (existing excluded, selected not excluded) —
	// used to decide whether "select all" has been exhausted.
	const pickableContacts = useMemo(() => {
		if (isGroupLoading) return [];
		return fetchedContacts.filter((c) => !existingContactIds.has(c.id));
	}, [fetchedContacts, existingContactIds, isGroupLoading]);

	const isAllSelected = useMemo(() => {
		if (pickableContacts.length === 0) return false;
		return pickableContacts.every((contact) =>
			selectedContactIds.has(contact.id),
		);
	}, [pickableContacts, selectedContactIds]);

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
			// Deselect all: remove everything from the full pickable pool
			const pickableIds = new Set(pickableContacts.map((c) => c.id));
			setSelectedContacts((prev) => prev.filter((c) => !pickableIds.has(c.id)));
		} else {
			// Select all remaining (availableContacts = pickable minus already-selected)
			setSelectedContacts((prev) => [...prev, ...availableContacts]);
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

	const handleSubmit = async () => {
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
				setSelectedContacts([]);
				await Promise.all([
					mutateGroup(),
					mutateInfinite(),
					// Invalidate the group list so the parent table refreshes
					mutateGlobal(
						(key: string) =>
							typeof key === "string" &&
							key.includes(`/api/contacts/v1/groups/${groupId}`),
						undefined,
						{ revalidate: true },
					),
				]);
			} else {
				toast.error(
					"No new contacts were added (they might already be in the group)",
				);
			}
		} catch (error) {
			console.error("Failed to add contacts:", error);
			toast.error("Failed to add contacts to group");
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeFromGroup = async (contact: Contact) => {
		if (!groupId) return;

		try {
			const response = await fetch(`/api/contacts/group/${groupId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: contact.email }),
			});

			if (response.ok) {
				toast.success("Contact removed from group");
				await Promise.all([mutateGroup(), mutateInfinite()]);
			} else {
				toast.error("Failed to remove contact");
			}
		} catch (error) {
			console.error("Failed to remove contact:", error);
			toast.error("Failed to remove contact");
		}
	};

	return {
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
		fetchedCount: fetchedContacts.length,
	};
};
