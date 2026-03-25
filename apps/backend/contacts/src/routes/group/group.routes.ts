import { createGroupRoute } from "@be/contacts/routes/group/routes/create-group.route";
import { deleteGroupRoute } from "@be/contacts/routes/group/routes/delete-group.route";
import { getGroupRoute } from "@be/contacts/routes/group/routes/get-group.route";
import { listGroupContactsRoute } from "@be/contacts/routes/group/routes/list-group-contacts.route";
import { listGroupsRoute } from "@be/contacts/routes/group/routes/list-groups.route";
import { updateGroupRoute } from "@be/contacts/routes/group/routes/update-group.route";
import { Elysia } from "elysia";

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
