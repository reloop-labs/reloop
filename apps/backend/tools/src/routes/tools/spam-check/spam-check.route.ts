import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkSpamController } from "./spam-check.controllers";

function check(subject: string, body: string) {
	const result = checkSpamController(subject, body);
	useLogger().set({ score: result.score, verdict: result.verdict });
	log.info("spam-check", "Evaluated email content spam score");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Check email spam score",
	description:
		"Evaluates an email subject line and body copy against deterministic spam rules, trigger words, URL shorteners, and caps ratios. Public and unauthenticated; rate limited per IP. Nothing is stored.",
};

export const spamCheckRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post(
		"/spam-check",
		({ body }) => check(body.subject || "", body.body || ""),
		{
			body: ToolsModel.spamCheckBody,
			response: {
				200: ToolsModel.spamCheckResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail,
		},
	)
	.get(
		"/spam-check",
		({ query }) => check(query.subject || "", query.body || ""),
		{
			query: ToolsModel.spamCheckQuery,
			response: {
				200: ToolsModel.spamCheckResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail,
		},
	);
