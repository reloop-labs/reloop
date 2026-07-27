import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { batchThreadsController } from "./batch-threads.controllers";
import { batchThreadsXCodeSamples } from "@reloop/code-samples/inbox";

const batchAction = t.Union([
	t.Literal("archive"),
	t.Literal("trash"),
	t.Literal("restore"),
	t.Literal("star"),
	t.Literal("unstar"),
	t.Literal("read"),
	t.Literal("unread"),
	t.Literal("important"),
	t.Literal("unimportant"),
	t.Literal("spam"),
	t.Literal("unspam"),
	t.Literal("pin"),
	t.Literal("unpin"),
]);

export const batchThreadsRoute = new Elysia().use(authMiddleware).post(
	"/batch",
	async ({ body, organizationId }) => {
		return batchThreadsController(organizationId, body.ids, body.action);
	},
	{
		auth: true,
		body: t.Object({
			ids: t.Array(t.String(), { minItems: 1, maxItems: 100 }),
			action: batchAction,
		}),
		response: {
			200: t.Object({
				success: t.Boolean(),
				ids: t.Array(t.String()),
				action: t.String(),
			}),
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Batch Thread Actions",
			description:
				"Apply archive, trash, restore, star, read, important, or spam actions to multiple threads",
			"x-codeSamples": batchThreadsXCodeSamples,
		},
	},
);
