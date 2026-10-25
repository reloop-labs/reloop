import {
	assertLabelAllowed,
	assertMailboxAllowed,
	assertThreadAllowed,
	resolveMailboxScope,
	scopeAllowsMailbox,
} from "@reloop/be-inbox/lib/api-key-mailbox-scope";
import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import {
	assignLabelController,
	createLabelController,
	deleteLabelController,
	listLabelsController,
	listLabelThreadIdsController,
	listThreadLabelsController,
	unassignLabelController,
	updateLabelController,
} from "./labels.controllers";

export const labelsRoutes = new Elysia({
	prefix: "/v1/labels",
	name: "LabelsRoutes",
})
	.use(authMiddleware)
	.get(
		"/",
		async ({ query, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			if (query.mailboxId) assertMailboxAllowed(scope, query.mailboxId);
			const labels = await listLabelsController(
				organizationId,
				query.mailboxId,
			);
			return labels.filter((l) => scopeAllowsMailbox(scope, l.mailboxId));
		},
		{
			auth: true,
			query: t.Object({
				mailboxId: t.Optional(t.String()),
			}),
			response: {
				200: MailModel.labelListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "List Labels",
				description: "List email labels for the organization or mailbox",
			},
		},
	)
	.post(
		"/",
		async ({ body, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			assertMailboxAllowed(scope, body.mailboxId);
			return createLabelController(organizationId, body);
		},
		{
			auth: true,
			body: t.Object({
				mailboxId: t.String(),
				name: t.String({ minLength: 1, maxLength: 100 }),
				color: t.Optional(t.String({ maxLength: 32 })),
			}),
			response: {
				200: MailModel.labelItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "Create Label",
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertLabelAllowed(scope, organizationId, id);
			return updateLabelController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
				color: t.Optional(t.String({ maxLength: 32 })),
			}),
			response: {
				200: MailModel.labelItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "Update Label",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertLabelAllowed(scope, organizationId, id);
			return deleteLabelController(id, organizationId);
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
				tags: ["Labels"],
				summary: "Delete Label",
			},
		},
	)
	.get(
		"/:id/threads",
		async ({ params: { id }, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertLabelAllowed(scope, organizationId, id);
			return listLabelThreadIdsController(organizationId, id);
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ threadIds: t.Array(t.String()) }),
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "List Thread IDs for Label",
			},
		},
	)
	.get(
		"/threads/:threadId",
		async ({ params: { threadId }, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertThreadAllowed(scope, organizationId, threadId);
			return listThreadLabelsController(organizationId, threadId);
		},
		{
			auth: true,
			params: t.Object({ threadId: t.String() }),
			response: {
				200: MailModel.labelListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "List Thread Labels",
			},
		},
	)
	.post(
		"/threads/:threadId/assign",
		async ({ params: { threadId }, body, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertThreadAllowed(scope, organizationId, threadId);
			await assertLabelAllowed(scope, organizationId, body.labelId);
			return assignLabelController(organizationId, threadId, body.labelId);
		},
		{
			auth: true,
			params: t.Object({ threadId: t.String() }),
			body: t.Object({ labelId: t.String() }),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "Assign Label to Thread",
			},
		},
	)
	.post(
		"/threads/:threadId/unassign",
		async ({ params: { threadId }, body, organizationId, apiKeyId }) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertThreadAllowed(scope, organizationId, threadId);
			return unassignLabelController(organizationId, threadId, body.labelId);
		},
		{
			auth: true,
			params: t.Object({ threadId: t.String() }),
			body: t.Object({ labelId: t.String() }),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Labels"],
				summary: "Unassign Label from Thread",
			},
		},
	);
