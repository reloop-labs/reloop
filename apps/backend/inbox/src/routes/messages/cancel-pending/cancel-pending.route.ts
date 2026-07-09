import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { cancelPendingController } from "./cancel-pending.controllers";

export const cancelPendingRoute = new Elysia().use(authMiddleware).post(
	"/pending/:id/cancel",
	async ({ params: { id }, organizationId }) => {
		return cancelPendingController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({ id: t.String() }),
		response: {
			200: MailModel.successResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Messages"],
			summary: "Cancel Pending Send",
			description:
				"Cancel a scheduled or undo-window pending outbound email before it is sent",
		},
	},
);
