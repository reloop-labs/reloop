import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import {
	generateComposeController,
	generateReplyController,
	generateSubjectController,
} from "./ai.controllers";

export const aiRoutes = new Elysia({
	prefix: "/v1/ai",
	name: "AiRoutes",
})
	.use(authMiddleware)
	.post(
		"/subject",
		async ({ body }) => {
			return generateSubjectController(body);
		},
		{
			auth: true,
			body: t.Object({
				text: t.String({ minLength: 1 }),
			}),
			response: {
				200: MailModel.aiSubjectResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["AI"],
				summary: "Generate Subject",
				description: "Generate an email subject line from body text",
			},
		},
	)
	.post(
		"/compose",
		async ({ body }) => {
			return generateComposeController(body);
		},
		{
			auth: true,
			body: t.Object({
				prompt: t.String({ minLength: 1 }),
				subject: t.Optional(t.String()),
				to: t.Optional(t.Array(t.String())),
			}),
			// Streaming text/plain Response — no JSON 200 schema.
			response: {
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["AI"],
				summary: "Generate Compose (stream)",
				description:
					"Stream a plain-text email body draft from a prompt (text/plain)",
			},
		},
	)
	.post(
		"/reply",
		async ({ body, organizationId }) => {
			return generateReplyController({
				...body,
				organizationId,
			});
		},
		{
			auth: true,
			body: t.Object({
				threadId: t.String({ minLength: 1 }),
				tone: t.Optional(t.String()),
				instruction: t.Optional(t.String()),
			}),
			// Streaming text/plain Response — no JSON 200 schema.
			response: {
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["AI"],
				summary: "Generate Reply (stream)",
				description:
					"Stream a plain-text reply draft from thread context (text/plain)",
			},
		},
	);
