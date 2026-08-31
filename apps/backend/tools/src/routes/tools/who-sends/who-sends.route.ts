import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import {
	whoSendsController,
	whoSendsGetController,
} from "./who-sends.controllers";

export const whoSendsRoute = new Elysia()
	.post("/who-sends", whoSendsController, {
		body: ToolsModel.whoSendsBody,
		response: {
			200: ToolsModel.whoSendsResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Who Sends Email From This Domain? — ESP & Sending Stack Fingerprint",
			description:
				"Inspects which third-party email service providers (e.g. Google, Amazon SES, SendGrid, Mailchimp) are authorized to send email for a domain, and who owns the inbound mailbox.",
		},
	})
	.get("/who-sends", whoSendsGetController, {
		query: ToolsModel.whoSendsQuery,
		response: {
			200: ToolsModel.whoSendsResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "ESP & Sending Stack Fingerprint (GET)",
			description: "Query authorized email senders via HTTP GET query parameters.",
		},
	});
