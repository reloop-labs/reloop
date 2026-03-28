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

// Namespace re-export for controllers that import via `GroupTypes.X`
export namespace GroupTypes {
	export type GroupResponse = import("./group.type").GroupResponse;
	export type GroupListItem = import("./group.type").GroupListItem;
	export type GroupListResponse = import("./group.type").GroupListResponse;
}
