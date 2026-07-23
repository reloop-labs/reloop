import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { createAgentEventStream } from "./agent.controllers";
import type { AgentRequestBody } from "./types";

const ChatMessageSchema = t.Object({
	role: t.Union([
		t.Literal("user"),
		t.Literal("assistant"),
		t.Literal("system"),
	]),
	content: t.String({ minLength: 1 }),
});

const AttachmentSchema = t.Object({
	url: t.String({ minLength: 1 }),
	mime: t.String(),
	name: t.String(),
});

const PlanStepSchema = t.Object({
	id: t.String(),
	title: t.String(),
	detail: t.Optional(t.String()),
});

const PlanSchema = t.Object({
	id: t.String(),
	summary: t.String(),
	steps: t.Array(PlanStepSchema, { minItems: 1 }),
});

export const agentRoute = new Elysia().use(authMiddleware).post(
	"/ai/agent",
	async ({ body }) => {
		return createAgentEventStream({
			...(body as AgentRequestBody),
			mode: body.mode === "plan" ? "plan" : "agent",
		});
	},
	{
		auth: true,
		body: t.Object({
			mode: t.Optional(t.Union([t.Literal("agent"), t.Literal("plan")])),
			messages: t.Array(ChatMessageSchema, { minItems: 1 }),
			templateId: t.Optional(t.String()),
			editorSnapshot: t.Optional(
				t.Object({
					subject: t.Optional(t.Union([t.String(), t.Null()])),
					previewText: t.Optional(t.Union([t.String(), t.Null()])),
					variables: t.Optional(t.Unknown()),
					renderedHtmlSnippet: t.Optional(t.Union([t.String(), t.Null()])),
					contentJson: t.Optional(t.Union([t.String(), t.Null()])),
				}),
			),
			attachments: t.Optional(t.Array(AttachmentSchema)),
			executePlan: t.Optional(PlanSchema),
			model: t.Optional(t.String()),
			system: t.Optional(t.String()),
		}),
		response: {
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates", "AI"],
			summary: "Agentic email template generation (SSE)",
			description:
				"Multi-turn agent/plan harness. Streams step events, plan JSON, and HTML deltas for the template editor AI panel.",
		},
	},
);
