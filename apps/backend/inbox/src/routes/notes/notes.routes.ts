import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import {
	createNoteController,
	deleteNoteController,
	listNotesController,
	reorderNotesController,
	updateNoteController,
} from "./notes.controllers";

export const notesRoutes = new Elysia({
	prefix: "/v1/notes",
	name: "NotesRoutes",
})
	.use(authMiddleware)
	.get(
		"/",
		async ({ query, organizationId }) => {
			return listNotesController(organizationId, query.threadId);
		},
		{
			auth: true,
			query: t.Object({
				threadId: t.String(),
			}),
			response: {
				200: MailModel.noteListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Notes"],
				summary: "List Thread Notes",
			},
		},
	)
	.post(
		"/",
		async ({ body, organizationId }) => {
			return createNoteController(organizationId, body);
		},
		{
			auth: true,
			body: t.Object({
				threadId: t.String(),
				content: t.String({ minLength: 1 }),
				color: t.Optional(t.String({ maxLength: 32 })),
				isPinned: t.Optional(t.Boolean()),
			}),
			response: {
				200: MailModel.noteItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Notes"],
				summary: "Create Note",
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId }) => {
			return updateNoteController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				content: t.Optional(t.String({ minLength: 1 })),
				color: t.Optional(t.String({ maxLength: 32 })),
				isPinned: t.Optional(t.Boolean()),
				order: t.Optional(t.Number()),
			}),
			response: {
				200: MailModel.noteItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Notes"],
				summary: "Update Note",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteNoteController(id, organizationId);
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
				tags: ["Notes"],
				summary: "Delete Note",
			},
		},
	)
	.post(
		"/reorder",
		async ({ body, organizationId }) => {
			return reorderNotesController(
				organizationId,
				body.threadId,
				body.orderedIds,
			);
		},
		{
			auth: true,
			body: t.Object({
				threadId: t.String(),
				orderedIds: t.Array(t.String(), { minItems: 1 }),
			}),
			response: {
				200: MailModel.noteListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Notes"],
				summary: "Reorder Notes",
			},
		},
	);
