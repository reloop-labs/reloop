import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import {
	lookalikeWatchController,
	lookalikeWatchGetController,
} from "./lookalike-watch.controllers";

export const lookalikeWatchRoute = new Elysia()
	.post("/lookalike-watch", lookalikeWatchController, {
		body: ToolsModel.lookalikeWatchBody,
		response: {
			200: ToolsModel.lookalikeWatchResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Lookalike Domain Watch — Phishing Twin & Mail-Ready Scanner",
			description:
				"Generates bounded candidate permutations (TLDs, typos, affixes, homoglyphs) and scans public DNS to detect registered lookalike domains that can send email.",
		},
	})
	.get("/lookalike-watch", lookalikeWatchGetController, {
		query: ToolsModel.lookalikeWatchQuery,
		response: {
			200: ToolsModel.lookalikeWatchResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		detail: {
			tags: ["Tools"],
			summary: "Lookalike Domain Watch (GET)",
			description: "Query lookalike domain scan via HTTP GET parameters.",
		},
	});
