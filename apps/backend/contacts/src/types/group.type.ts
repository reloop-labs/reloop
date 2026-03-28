import type { Group } from "@reloop/db/schema";

export type { Group };

export interface GroupResponse
	extends Omit<Group, "organizationId" | "userId" | "deletedAt"> {
	object: "contact_group";
}

export interface GroupListItem extends Omit<GroupResponse, "object"> { }

export interface GroupListResponse {
	object: "contact_group";
	groups: GroupListItem[];
	total: number;
	page: number;
	limit: number;
}
