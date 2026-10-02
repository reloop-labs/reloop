import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import {
	getSelectedMailboxController,
	saveSelectedMailboxController,
} from "./selected-mailbox.controllers";

export const getSelectedMailboxRoute = new Elysia().use(authMiddleware).get(
	"/selected",
	async ({ userId, organizationId }) => {
		return getSelectedMailboxController(
			userId as string,
			organizationId as string,
		);
	},
	{
		auth: true,
		response: {
			200: MailModel.selectedMailboxResponse,
			401: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "Get selected mailbox",
			description:
				"Returns the last mailbox (and folder) this user selected in the active organization. Null when nothing was saved yet.",
		},
	},
);

export const saveSelectedMailboxRoute = new Elysia().use(authMiddleware).put(
	"/selected",
	async ({ userId, organizationId, body }) => {
		return saveSelectedMailboxController(
			userId as string,
			organizationId as string,
			body.mailboxId,
			body.folder,
		);
	},
	{
		auth: true,
		body: t.Object({
			mailboxId: t.String({ description: "Selected mailbox ID" }),
			folder: t.Optional(
				t.String({ description: "Selected folder, e.g. inbox, starred" }),
			),
		}),
		response: {
			200: MailModel.selectedMailboxResponse,
			401: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "Save selected mailbox",
			description:
				"Persists the user's selected mailbox (and folder) scoped to the user + active organization.",
		},
	},
);
