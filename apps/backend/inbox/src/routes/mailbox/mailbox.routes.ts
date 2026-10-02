import { Elysia } from "elysia";
import { createMailboxRoute } from "./create-mailbox/create-mailbox.route";
import { deleteMailboxRoute } from "./delete-mailbox/delete-mailbox.route";
import { getMailboxRoute } from "./get-mailbox/get-mailbox.route";
import { listMailboxesRoute } from "./list-mailboxes/list-mailboxes.route";
import {
	getSelectedMailboxRoute,
	saveSelectedMailboxRoute,
} from "./selected-mailbox/selected-mailbox.route";
import { updateMailboxRoute } from "./update-mailbox/update-mailbox.route";

export const mailboxRoutes = new Elysia({
	prefix: "/v1/mailboxes",
	name: "MailboxRoutes",
})
	.use(listMailboxesRoute)
	.use(getSelectedMailboxRoute)
	.use(saveSelectedMailboxRoute)
	.use(getMailboxRoute)
	.use(createMailboxRoute)
	.use(updateMailboxRoute)
	.use(deleteMailboxRoute);
