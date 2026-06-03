import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	createMailboxController,
	deleteMailboxController,
	getMailboxController,
	getMailboxesController,
	updateMailboxController,
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
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getMailboxController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
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
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId }) => {
			return updateMailboxController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				displayName: t.Optional(t.String()),
				description: t.Optional(t.String()),
				status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
				quota: t.Optional(t.String()),
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
