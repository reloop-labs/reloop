import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import type { Contact } from "./types";

const PAGE_SIZE = 50;
const GROUP_MEMBERS_PAGE_SIZE = 100;

type ContactListPage = {
	contacts: Contact[];
	total: number;
	totalContacts: number;
};

type GroupMembersPage = {
	group: { name: string; contacts: Contact[] };
	total: number;
};

export const useAddContactToGroup = (
	open: boolean,
	onOpenChange: (open: boolean) => void,
) => {
	const { groupId } = useParams() as { groupId?: string };
	const invalidate = useInvalidateContacts();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 250);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const contactsQuery = useInfiniteQuery({
		queryKey: ["contacts", "add-to-group", "list", debouncedSearch],
		queryFn: async ({ pageParam }) => {
			const page = pageParam as number;
			const search = debouncedSearch
				? `&search=${encodeURIComponent(debouncedSearch)}`
				: "";
			const res = await fetch(
				`/api/contacts/list?page=${page}&limit=${PAGE_SIZE}${search}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load contacts");
			return res.json() as Promise<ContactListPage>;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((n, p) => n + p.contacts.length, 0);
			if (loaded < lastPage.total) return allPages.length + 1;
			return undefined;
		},
		enabled: open,
	});

	const groupQuery = useInfiniteQuery({
		queryKey: ["contacts", "add-to-group", "members", groupId],
		queryFn: async ({ pageParam }) => {
			const page = pageParam as number;
			const res = await fetch(
				`/api/contacts/v1/groups/${groupId}/contacts?limit=${GROUP_MEMBERS_PAGE_SIZE}&page=${page}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load group members");
			return res.json() as Promise<GroupMembersPage>;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce(
				(n, p) => n + (p.group?.contacts?.length ?? 0),
				0,
			);
			if (loaded < lastPage.total) return allPages.length + 1;
			return undefined;
		},
		enabled: open && !!groupId,
	});

	// Background-fetch remaining member pages so we can mark "In group"
	useEffect(() => {
		if (
			groupQuery.hasNextPage &&
			!groupQuery.isFetchingNextPage &&
			!groupQuery.isPending
		) {
			void groupQuery.fetchNextPage();
		}
	}, [
		groupQuery.hasNextPage,
		groupQuery.isFetchingNextPage,
		groupQuery.isPending,
		groupQuery.fetchNextPage,
	]);

	const fetchedContacts = useMemo(() => {
		return contactsQuery.data
			? contactsQuery.data.pages.flatMap((page) => page.contacts)
			: [];
	}, [contactsQuery.data]);

	const totalMatching = contactsQuery.data?.pages[0]?.total || 0;
	const hasMore = contactsQuery.hasNextPage ?? false;

	const existingContactIds = useMemo(() => {
		if (!groupQuery.data) return new Set<string>();
		return new Set(
			groupQuery.data.pages.flatMap((page) =>
				(page.group?.contacts ?? []).map((c) => c.id),
			),
		);
	}, [groupQuery.data]);

	const groupName = groupQuery.data?.pages[0]?.group?.name ?? "";
	const memberCount = groupQuery.data?.pages[0]?.total ?? existingContactIds.size;

	const selectedContactIds = useMemo(
		() => new Set(selectedContacts.map((c) => c.id)),
		[selectedContacts],
	);

	/** Contacts shown in the list (selected stay visible; already-in-group stay visible). */
	const listContacts = useMemo(() => fetchedContacts, [fetchedContacts]);

	const pickableContacts = useMemo(() => {
		return listContacts.filter((c) => !existingContactIds.has(c.id));
	}, [listContacts, existingContactIds]);

	const isAllVisibleSelected = useMemo(() => {
		if (pickableContacts.length === 0) return false;
		return pickableContacts.every((c) => selectedContactIds.has(c.id));
	}, [pickableContacts, selectedContactIds]);

	const toggleContact = (contact: Contact) => {
		if (existingContactIds.has(contact.id)) return;
		setSelectedContacts((prev) => {
			const isSelected = prev.some((c) => c.id === contact.id);
			if (isSelected) return prev.filter((c) => c.id !== contact.id);
			return [...prev, contact];
		});
	};

	const removeContact = (contactId: string) => {
		setSelectedContacts((prev) => prev.filter((c) => c.id !== contactId));
	};

	const clearSelection = () => setSelectedContacts([]);

	const toggleSelectAllVisible = () => {
		if (isAllVisibleSelected) {
			const pickableIds = new Set(pickableContacts.map((c) => c.id));
			setSelectedContacts((prev) => prev.filter((c) => !pickableIds.has(c.id)));
		} else {
			setSelectedContacts((prev) => {
				const next = [...prev];
				const existing = new Set(prev.map((c) => c.id));
				for (const c of pickableContacts) {
					if (!existing.has(c.id)) next.push(c);
				}
				return next;
			});
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setTimeout(() => {
				setSelectedContacts([]);
				setSearchInput("");
				setDebouncedSearch("");
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
			const results = await Promise.all(
				selectedContacts.map(async (contact) => {
					const response = await fetch(`/api/contacts/group/${groupId}`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ contact_id: contact.id }),
					});
					return response.ok;
				}),
			);
			added = results.filter(Boolean).length;

			if (added > 0) {
				toast.success(
					`${added} contact${added !== 1 ? "s" : ""} added to group`,
				);
				setSelectedContacts([]);
				await Promise.all([
					groupQuery.refetch(),
					contactsQuery.refetch(),
					invalidate(),
				]);
				onOpenChange(false);
			} else {
				toast.error(
					"No contacts were added — they may already be in this group",
				);
			}
		} catch (error) {
			console.error("Failed to add contacts:", error);
			toast.error("Failed to add contacts to group");
		} finally {
			setIsSubmitting(false);
		}
	};

	const loadMore = useCallback(() => {
		if (contactsQuery.hasNextPage && !contactsQuery.isFetchingNextPage) {
			void contactsQuery.fetchNextPage();
		}
	}, [
		contactsQuery.hasNextPage,
		contactsQuery.isFetchingNextPage,
		contactsQuery.fetchNextPage,
	]);

	return {
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
		pickableCount: pickableContacts.length,
		totalMatching,
		hasMore,
		loadMore,
		isValidating:
			(contactsQuery.isFetching && !contactsQuery.isPending) ||
			contactsQuery.isFetchingNextPage,
		isSearching: contactsQuery.isPending,
		isAllVisibleSelected,
		toggleContact,
		removeContact,
		clearSelection,
		toggleSelectAllVisible,
		handleOpenChange,
		handleSubmit,
		fetchedCount: fetchedContacts.length,
	};
};
