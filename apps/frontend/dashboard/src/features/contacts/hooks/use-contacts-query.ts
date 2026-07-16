import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type { AudienceStatus } from "../audience";

export type Contact = {
	id: string;
	email: string;
	status: AudienceStatus;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

/** Full contact payload from `/api/contacts/retrieve/:id`. */
export type ContactDetail = Contact & {
	properties?: Record<string, string | number>;
	groups?: { id: string; name: string }[];
	channels?: { id: string; name: string; subscription: "opt_in" | "opt_out" }[];
	suppressionReason?: "hard_bounce" | "spam_complaint" | null;
	suppressedAt?: string | null;
};

export type ContactListResponse = {
	contacts: Contact[];
	total: number;
	page: number;
	limit: number;
	totalContacts: number;
	subscribedContacts: number;
	unsubscribedContacts: number;
};

export type ContactsListParams = {
	page: number;
	limit: number;
	search: string;
	status: string;
	enabled?: boolean;
};

async function fetchContacts(
	params: ContactsListParams,
): Promise<ContactListResponse> {
	const search = new URLSearchParams();
	search.set("limit", String(params.limit));
	search.set("page", String(params.page));
	if (params.search) search.set("search", params.search);
	if (params.status) search.set("status", params.status);
	const res = await fetch(`/api/contacts/list?${search.toString()}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load contacts (${res.status})`);
	return res.json() as Promise<ContactListResponse>;
}

export async function fetchContact(id: string): Promise<ContactDetail> {
	const res = await fetch(`/api/contacts/retrieve/${id}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load contact (${res.status})`);
	return res.json() as Promise<ContactDetail>;
}

export function useContactsQuery(params: ContactsListParams) {
	return useQuery({
		queryKey: queryKeys.contacts.list(params),
		queryFn: () => fetchContacts(params),
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

export function useContactQuery(id: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.contacts.detail(id ?? ""),
		queryFn: () => fetchContact(id as string),
		enabled: !!id,
	});
}

export function useInvalidateContacts() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
}

export type GroupDetail = {
	id: string;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export async function fetchGroup(id: string): Promise<GroupDetail> {
	const res = await fetch(`/api/contacts/v1/groups/${id}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load group (${res.status})`);
	return res.json() as Promise<GroupDetail>;
}

export function useGroupQuery(id: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.contacts.groupDetail(id ?? ""),
		queryFn: () => fetchGroup(id as string),
		enabled: !!id,
	});
}

export type GroupContactsResponse = {
	group: {
		name?: string;
		contacts: Contact[];
	};
	total: number;
	page: number;
	limit: number;
};

export function useGroupContactsQuery(params: {
	groupId: string;
	page: number;
	limit: number;
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: queryKeys.contacts.groupContacts(params),
		queryFn: async () => {
			const res = await fetch(
				`/api/contacts/v1/groups/${params.groupId}/contacts?limit=${params.limit}&page=${params.page}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load group contacts");
			return res.json() as Promise<GroupContactsResponse>;
		},
		enabled: params.enabled !== false && !!params.groupId,
		placeholderData: (prev) => prev,
	});
}

export function useGroupContactsCountQuery(groupId: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.contacts.groupCount(groupId ?? ""),
		queryFn: async () => {
			const res = await fetch(
				`/api/contacts/v1/groups/${groupId}/contacts?limit=1`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load group contact count");
			return res.json() as Promise<{ total: number }>;
		},
		enabled: !!groupId,
	});
}

export function useAllPropertiesQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.contacts.propertiesAll(),
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/properties/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load properties");
			return res.json() as Promise<PropertyListResponse>;
		},
		enabled,
	});
}

// Groups
export type Group = {
	id: string;
	name: string;
	organizationId?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
};

export type GroupListResponse = {
	groups: Group[];
	total: number;
	page: number;
	limit: number;
};

export function useGroupsQuery(params: {
	page: number;
	limit: number;
	search: string;
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: queryKeys.contacts.groups(params),
		queryFn: async () => {
			const search = new URLSearchParams();
			search.set("limit", String(params.limit));
			search.set("page", String(params.page));
			if (params.search) search.set("search", params.search);
			const res = await fetch(
				`/api/contacts/v1/groups/list?${search.toString()}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load groups");
			return res.json() as Promise<GroupListResponse>;
		},
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

// Properties
export type Property = {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type PropertyListResponse = {
	properties: Property[];
	total: number;
	page: number;
	limit: number;
};

export function usePropertiesQuery(params: {
	page: number;
	limit: number;
	search: string;
	type: string;
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: queryKeys.contacts.properties(params),
		queryFn: async () => {
			const search = new URLSearchParams();
			search.set("limit", String(params.limit));
			search.set("page", String(params.page));
			if (params.search) search.set("search", params.search);
			if (params.type) search.set("type", params.type);
			const res = await fetch(
				`/api/contacts/v1/properties/list?${search.toString()}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load properties");
			return res.json() as Promise<PropertyListResponse>;
		},
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

// Channels
export type Channel = {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	subscriberCount?: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type ChannelListResponse = {
	channels: Channel[];
	total: number;
	page: number;
	limit: number;
};

export function useChannelsQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.contacts.channels(),
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/channels/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load channels");
			return res.json() as Promise<ChannelListResponse>;
		},
		enabled,
	});
}
