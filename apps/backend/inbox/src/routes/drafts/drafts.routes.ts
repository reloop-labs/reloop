import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import {
	createDraftController,
	deleteDraftController,
	getDraftController,
	listDraftsController,
	updateDraftController,
} from "./drafts.controllers";

const draftAttachmentSchema = t.Object({
	id: t.Optional(t.String()),
	filename: t.Optional(t.String()),
	path: t.Optional(t.String()),
	url: t.Optional(t.String()),
	content_type: t.Optional(t.String()),
	size: t.Optional(t.String()),
});

export const draftsRoutes = new Elysia({
	prefix: "/v1/drafts",
	name: "DraftsRoutes",
})
	.use(authMiddleware)
	.get(
		"/",
		async ({ query, organizationId }) => {
			return listDraftsController(organizationId, query.mailboxId);
		},
		{
			auth: true,
			query: t.Object({
				mailboxId: t.Optional(t.String()),
			}),
			response: {
				200: MailModel.draftListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Drafts"],
				summary: "List Drafts",
				description: "List compose drafts for the organization or mailbox",
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getDraftController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: {
				200: MailModel.draftItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Drafts"],
				summary: "Get Draft",
			},
		},
	)
	.post(
		"/",
		async ({ body, organizationId }) => {
			return createDraftController(organizationId, body);
		},
		{
			auth: true,
			body: t.Object({
				mailboxId: t.String(),
				to: t.Optional(t.Array(t.String())),
				cc: t.Optional(t.Array(t.String())),
				bcc: t.Optional(t.Array(t.String())),
				subject: t.Optional(t.String()),
				html: t.Optional(t.String()),
				text: t.Optional(t.String()),
				attachments: t.Optional(t.Array(draftAttachmentSchema)),
			}),
			response: {
				200: MailModel.draftItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Drafts"],
				summary: "Create Draft",
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId }) => {
			return updateDraftController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				mailboxId: t.Optional(t.String()),
				to: t.Optional(t.Array(t.String())),
				cc: t.Optional(t.Array(t.String())),
				bcc: t.Optional(t.Array(t.String())),
				subject: t.Optional(t.String()),
				html: t.Optional(t.String()),
				text: t.Optional(t.String()),
				attachments: t.Optional(t.Array(draftAttachmentSchema)),
			}),
			response: {
				200: MailModel.draftItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Drafts"],
				summary: "Update Draft",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteDraftController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Drafts"],
				summary: "Delete Draft",
			},
		},
	);
