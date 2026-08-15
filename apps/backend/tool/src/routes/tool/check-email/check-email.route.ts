import { rateLimitPlugin } from "@be/tool/middleware/rate-limit";
import { ToolModel } from "@be/tool/model/tool.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkEmailController } from "./check-email.controllers";

// Domain and verdict only — never the local part. The tool page promises
// addresses are checked and discarded.
function check(input: string) {
	const result = checkEmailController(input);
	useLogger().set({ domain: result.domain, verdict: result.verdict });
	log.info("check", "Evaluated address");
	return result;
}

const detail = {
	tags: ["Tool"],
	summary: "Check an email address",
	description:
		"Reports whether an email address or bare domain is disposable, a role address, or from a free consumer provider. Public and unauthenticated; rate limited per IP. Nothing is stored.",
};

export const checkEmailRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/check", ({ body }) => check(body.email), {
		body: ToolModel.checkBody,
		response: {
			200: ToolModel.checkResponse,
			400: ToolModel.errorResponse,
			429: ToolModel.errorResponse,
		},
		rateLimit: true,
		detail,
	})
	.get("/check", ({ query }) => check(query.email), {
		query: ToolModel.checkQuery,
		response: {
			200: ToolModel.checkResponse,
			400: ToolModel.errorResponse,
			429: ToolModel.errorResponse,
		},
		rateLimit: true,
		detail,
	});
