import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import {
	authCheckerController,
	authCheckerGetController,
} from "./auth-checker.controllers";

export const authCheckerRoute = new Elysia()
	.post("/auth-checker", authCheckerController, {
		body: ToolsModel.authCheckerBody,
		response: {
			200: ToolsModel.authCheckerResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "SPF, DKIM, DMARC & MX Email Authentication Checker",
			description:
				"Audit sending domain authentication records against RFC standards. Evaluates SPF mechanism limits, DKIM cryptographic public keys, DMARC alignment policies, and MX server reachability.",
		},
	})
	.get("/auth-checker", authCheckerGetController, {
		query: ToolsModel.authCheckerQuery,
		response: {
			200: ToolsModel.authCheckerResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "SPF, DKIM, DMARC & MX Email Authentication Checker (GET)",
			description: "Query email authentication status via HTTP GET query parameters.",
		},
	});
