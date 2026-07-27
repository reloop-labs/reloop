import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "#/lib/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
	const { groupId } = useParams({ strict: false }) as { groupId?: string };
	const invalidate = useInvalidateContacts();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
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

	// Auto-fetch remaining group member pages
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
	const totalInOrg = contactsQuery.data?.pages[0]?.totalContacts || 0;
	const hasMore = contactsQuery.hasNextPage ?? false;

	const existingContacts = useMemo(() => {
		if (!groupQuery.data) return [];
		return groupQuery.data.pages.flatMap((page) => page.group?.contacts ?? []);
	}, [groupQuery.data]);

	const existingContactIds = useMemo(() => {
		return new Set(existingContacts.map((c) => c.id));
	}, [existingContacts]);

	const groupName = groupQuery.data?.pages[0]?.group?.name ?? "";

	const selectedContactIds = useMemo(
		() => new Set(selectedContacts.map((c) => c.id)),
		[selectedContacts],
	);

	const isGroupLoading = groupQuery.isPending || groupQuery.hasNextPage;

	const availableContacts = useMemo(() => {
		if (isGroupLoading) return [];
		return fetchedContacts.filter(
			(c) => !existingContactIds.has(c.id) && !selectedContactIds.has(c.id),
		);
	}, [fetchedContacts, existingContactIds, selectedContactIds, isGroupLoading]);

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
			const pickableIds = new Set(pickableContacts.map((c) => c.id));
			setSelectedContacts((prev) => prev.filter((c) => !pickableIds.has(c.id)));
		} else {
			setSelectedContacts((prev) => [...prev, ...availableContacts]);
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setTimeout(() => {
				setSelectedContacts([]);
				setSearchInput("");
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
					credentials: "include",
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
					groupQuery.refetch(),
					contactsQuery.refetch(),
					invalidate(),
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
				credentials: "include",
				body: JSON.stringify({ email: contact.email }),
			});

			if (response.ok) {
				toast.success("Contact removed from group");
				await Promise.all([
					groupQuery.refetch(),
					contactsQuery.refetch(),
					invalidate(),
				]);
			} else {
				toast.error("Failed to remove contact");
			}
		} catch (error) {
			console.error("Failed to remove contact:", error);
			toast.error("Failed to remove contact");
		}
	};

	const setSize = (updater: number | ((s: number) => number)) => {
		if (typeof updater === "function") {
			// Infinite query uses fetchNextPage rather than size
			void contactsQuery.fetchNextPage();
		} else if (updater > (contactsQuery.data?.pages.length ?? 1)) {
			void contactsQuery.fetchNextPage();
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
		isValidating:
			contactsQuery.isFetching && !contactsQuery.isPending,
		isSearching: contactsQuery.isPending,
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
