import {
	assertThreadAllowed,
	resolveMailboxScope,
} from "@reloop/be-inbox/lib/api-key-mailbox-scope";
import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { trashThreadXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { trashThreadController } from "./trash-thread.controllers";

export const trashThreadRoute = new Elysia().use(authMiddleware).post(
	"/:id/trash",
	async ({ params: { id }, organizationId, apiKeyId }) => {
		const scope = await resolveMailboxScope(organizationId, apiKeyId);
		await assertThreadAllowed(scope, organizationId, id);
		return trashThreadController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		response: {
			200: MailModel.successResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Move Thread to Trash",
			description: "Soft-delete a thread by moving it to the trash folder",
			"x-codeSamples": trashThreadXCodeSamples,
		},
	},
);
