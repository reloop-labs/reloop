import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import {
	domainAgeController,
	domainAgeGetController,
} from "./domain-age.controllers";

export const domainAgeRoute = new Elysia()
	.post("/domain-age", domainAgeController, {
		body: ToolsModel.domainAgeBody,
		response: {
			200: ToolsModel.domainAgeResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Domain Age & Email Warmup Checker",
			description:
				"Inspects domain registration age via RDAP and combines it with SPF/DKIM/DMARC status to evaluate mailbox filter cold-domain risk.",
		},
	})
	.get("/domain-age", domainAgeGetController, {
		query: ToolsModel.domainAgeQuery,
		response: {
			200: ToolsModel.domainAgeResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Domain Age & Warmup Checker (GET)",
			description: "Check domain registration age and warmup guidance via GET query parameters.",
		},
	});
