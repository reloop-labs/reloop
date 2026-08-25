import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import {
	checkSpamController,
	rewriteSpamCopyController,
} from "./spam-check.controllers";

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

const rewriteDetail = {
	tags: ["Tools"],
	summary: "AI Email Deliverability Rewrite",
	description:
		"Rewrites email subject and body copy to eliminate spam triggers and maximize inbox placement. Uses Gemini Free tier with local deliverability fallback.",
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
	)
	.post(
		"/spam-check/rewrite",
		async ({ body }) => {
			return await rewriteSpamCopyController(
				body.subject || "",
				body.body || "",
			);
		},
		{
			body: ToolsModel.spamRewriteBody,
			response: {
				200: ToolsModel.spamRewriteResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail: rewriteDetail,
		},
	);
