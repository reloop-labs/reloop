import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	createMailboxController,
	deleteMailboxController,
	getMailboxController,
	getMailboxesController,
	updateMailboxController,
} from "./mailbox.controllers";

export const mailboxRoute = new Elysia({ prefix: "/v1/mailboxes", name: "MailboxesRoute" })
	.use(evlog())
	.use(authMiddleware)
	.get(
		"/list",
		async ({ organizationId }) => {
			return getMailboxesController(organizationId);
		},
		{
			auth: true,
			response: {
				200: MailModel.mailboxListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "List Mailboxes",
				description: "Retrieve all mailboxes associated with the active organization",
			},
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
				id: t.String({ description: "Mailbox ID" }),
			}),
			response: {
				200: MailModel.mailboxDetailResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "Get Mailbox",
				description: "Retrieve details of a specific mailbox by ID",
			},
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
				domainId: t.String({ description: "Associated verified Domain ID" }),
				email: t.String({ description: "Full email address for the mailbox" }),
				password: t.Optional(t.String({ description: "Mailbox password" })),
				quota: t.Optional(t.String({ description: "Storage quota, defaults to 5 GB" })),
				displayName: t.Optional(t.String({ description: "Friendly name of the mailbox sender" })),
				description: t.Optional(t.String({ description: "Description of the mailbox" })),
			}),
			response: {
				200: MailModel.createMailboxResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				409: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "Create Mailbox",
				description: "Register a new email mailbox for the active organization under a verified domain",
			},
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
				id: t.String({ description: "Mailbox ID" }),
			}),
			body: t.Object({
				displayName: t.Optional(t.String({ description: "Friendly name of the mailbox sender" })),
				description: t.Optional(t.String({ description: "Description of the mailbox" })),
				status: t.Optional(
					t.Union([t.Literal("active"), t.Literal("disabled")], { description: "Mailbox status" }),
				),
				quota: t.Optional(t.String({ description: "Storage quota limit" })),
			}),
			response: {
				200: MailModel.successResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "Update Mailbox",
				description: "Update settings or status of an existing mailbox",
			},
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
				id: t.String({ description: "Mailbox ID" }),
			}),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "Delete Mailbox",
				description: "Permanently delete a mailbox and its associated emails",
			},
		},
	);
