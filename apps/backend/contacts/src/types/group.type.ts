import type { GroupModel } from "@be/contacts/model/group.model";
import type { Group } from "@reloop/db/schema";

export type { Group };

export namespace GroupTypes {
	export type GroupResponse = typeof GroupModel.groupResponse.static;
	export type GroupListResponse = typeof GroupModel.groupListResponse.static;
	export type GroupListItem = typeof GroupModel.groupListItem.static;
}

export interface GroupResponse
	extends Omit<Group, "organizationId" | "userId" | "deletedAt"> {
	object: "contact_group";
	event: string;
}

export interface GroupListItem
	extends Omit<GroupResponse, "object" | "event"> {}

export interface GroupListResponse {
	object: "contact_group";
	groups: GroupListItem[];
	total: number;
	page: number;
	limit: number;
	event: string;
}
