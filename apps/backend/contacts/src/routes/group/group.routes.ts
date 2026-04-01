import { deleteGroupRoute } from "@be/contacts/routes/group/delete-group/delete-group.route";
import { getGroupRoute } from "@be/contacts/routes/group/get-group/get-group.route";
import { listGroupContactsRoute } from "@be/contacts/routes/group/list-group-contacts/list-group-contacts.route";
import { listGroupsRoute } from "@be/contacts/routes/group/list-groups/list-groups.route";
import { updateGroupRoute } from "@be/contacts/routes/group/update-group/update-group.route";
import { Elysia } from "elysia";
import { createGroupRoute } from "./create-group/create-group.route";

export const groupRoutes = new Elysia({
	prefix: "/v1/groups",
	name: "GroupRoutes",
})
	.use(createGroupRoute)
	.use(getGroupRoute)
	.use(listGroupsRoute)
	.use(updateGroupRoute)
	.use(deleteGroupRoute)
	.use(listGroupContactsRoute);
