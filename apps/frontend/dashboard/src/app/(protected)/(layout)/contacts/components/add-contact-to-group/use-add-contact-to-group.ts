"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import type { Contact } from "./types";

const PAGE_SIZE = 50;

export const useAddContactToGroup = (
	open: boolean,
	onOpenChange: (open: boolean) => void,
) => {
	const params = useParams();
	const groupId = params.contact_group_id as string;
	const { mutate } = useSWRConfig();

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

	// Fetch current group's contacts
	const { data: groupData } = useSWR<{
		group: { name: string; contacts: Contact[] };
	}>(
		open && groupId
			? `/api/contacts/v1/groups/${groupId}/contacts?limit=1000`
			: null,
	);

	const existingContacts = useMemo(() => {
		return groupData?.group?.contacts || [];
	}, [groupData]);

	const existingContactIds = useMemo(() => {
		return new Set(existingContacts.map((c) => c.id));
	}, [existingContacts]);

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
				handleOpenChange(false);
			} else {
				toast.error("No new contacts were added (they might already be in the group)");
			}

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
				await mutate(
					(key: string) =>
						typeof key === "string" &&
						key.includes(`/api/contacts/v1/groups/${groupId}/contacts`),
				);
			} else {
				toast.error("Failed to remove contact");
			}
		} catch (error) {
			console.error("Failed to remove contact:", error);
			toast.error("Failed to remove contact");
		}
	};

	return {
		groupId,
		groupName: groupData?.group?.name || "",
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
		size,
		setSize,
		isValidating,
		isSearching,
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
