import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { authMiddleware } from "../../middleware/auth";
import {
	createMailboxController,
	deleteMailboxController,
	getMailboxesController,
} from "./mailbox.controllers";

export const mailboxRoute = new Elysia({ prefix: "/v1/mailboxes" })
	.use(evlog())
	.use(authMiddleware)
	.get(
		"/",
		async ({ activeOrganizationId }) => {
			return getMailboxesController(activeOrganizationId);
		},
		{
			auth: true,
		},
	)
	.post(
		"/",
		async ({ body, activeOrganizationId }) => {
			return createMailboxController({
				...body,
				organizationId: activeOrganizationId,
			});
		},
		{
			auth: true,
			body: t.Object({
				domainId: t.String(),
				email: t.String(),
				password: t.Optional(t.String()),
				quota: t.Optional(t.String()),
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, activeOrganizationId }) => {
			return deleteMailboxController(id, activeOrganizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
		},
	);
