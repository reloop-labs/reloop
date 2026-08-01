import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { updateThreadXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { updateThreadController } from "./update-thread.controllers";

export const updateThreadRoute = new Elysia().use(authMiddleware).patch(
	"/:id",
	async ({ params: { id }, body, organizationId }) => {
		return updateThreadController(id, organizationId, body);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		body: t.Object({
			isRead: t.Optional(
				t.Boolean({ description: "Read/unread status of the thread" }),
			),
			isStarred: t.Optional(
				t.Boolean({ description: "Starred/unstarred status of the thread" }),
			),
			isImportant: t.Optional(
				t.Boolean({ description: "Important flag for the thread" }),
			),
			isPinned: t.Optional(
				t.Boolean({ description: "Pinned status of the thread" }),
			),
			status: t.Optional(
				t.Union(
					[
						t.Literal("active"),
						t.Literal("archived"),
						t.Literal("closed"),
						t.Literal("trash"),
					],
					{ description: "Thread status" },
				),
			),
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
			tags: ["Threads"],
			summary: "Update Thread",
			description:
				"Update thread-wide attributes like read/starred/important status or workflow state",
			"x-codeSamples": updateThreadXCodeSamples,
		},
	},
);
