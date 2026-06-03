import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	createMailboxController,
	deleteMailboxController,
	getMailboxesController,
} from "./mailbox.controllers";

export const mailboxRoute = new Elysia({ prefix: "/v1/mailboxes" })
	.use(evlog())
	.use(authMiddleware)
	.get(
		"/list",
		async ({ organizationId }) => {
			return getMailboxesController(organizationId);
		},
		{
			auth: true,
		},
	)
	.post(
		"/create",
		async ({ body, organizationId }) => {
			return createMailboxController({
				...body,
				organizationId,
			});
		},
		{
			auth: true,
			body: t.Object({
				domainId: t.String(),
				email: t.String(),
				password: t.Optional(t.String()),
				quota: t.Optional(t.String()),
				displayName: t.Optional(t.String()),
				description: t.Optional(t.String()),
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteMailboxController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
		},
	);
