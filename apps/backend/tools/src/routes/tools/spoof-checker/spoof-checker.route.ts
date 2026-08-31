import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import {
	spoofCheckerController,
	spoofCheckerGetController,
} from "./spoof-checker.controllers";

export const spoofCheckerRoute = new Elysia()
	.post("/spoof-checker", spoofCheckerController, {
		body: ToolsModel.spoofCheckerBody,
		response: {
			200: ToolsModel.spoofCheckerResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Can Anyone Spoof My Domain? — Email Spoofing Vulnerability Checker",
			description:
				"Answers whether attackers can forge email from your domain without permission. Analyzes DMARC enforcement policies, SPF '+all' loopholes, and subdomain vulnerabilities.",
		},
	})
	.get("/spoof-checker", spoofCheckerGetController, {
		query: ToolsModel.spoofCheckerQuery,
		response: {
			200: ToolsModel.spoofCheckerResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Email Spoofing Vulnerability Checker (GET)",
			description: "Query email spoofing status via HTTP GET query parameters.",
		},
	});
