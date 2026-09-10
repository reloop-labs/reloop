import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { checkTempEmailXCodeSamples } from "@reloop/code-samples/tools";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { tempEmailCheckerController } from "./temp-email-checker.controllers";

// Domain and verdict only — never the local part. The tool page promises
// addresses are checked and discarded.
async function check(input: string) {
	const result = await tempEmailCheckerController(input);
	useLogger().set({
		domain: result.domain,
		verdict: result.verdict,
		mxCount: result.mxRecords.length,
	});
	log.info("check", "Evaluated address");
	return result;
}

const baseDetail = {
	tags: ["Tools"],
	description:
		"Reports whether an email address or bare domain is disposable, a role address, or from a free consumer provider. Public and unauthenticated; rate limited per IP. Nothing is stored.",
} as const;

const postDetail = {
	...baseDetail,
	summary: "Check an email address",
	"x-codeSamples": checkTempEmailXCodeSamples,
};

const getDetail = {
	...baseDetail,
	summary: "Check an email address via query",
};

const aliasPostDetail = {
	...baseDetail,
	summary: "Check an email address (alias)",
};

const aliasGetDetail = {
	...baseDetail,
	summary: "Check an email address via query (alias)",
};

export const tempEmailCheckerRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/temp-email-checker", ({ body }) => check(body.email), {
		body: ToolsModel.checkBody,
		response: {
			200: ToolsModel.checkResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: postDetail,
	})
	.get("/temp-email-checker", ({ query }) => check(query.email), {
		query: ToolsModel.checkQuery,
		response: {
			200: ToolsModel.checkResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: getDetail,
	})
	.post("/check", ({ body }) => check(body.email), {
		body: ToolsModel.checkBody,
		response: {
			200: ToolsModel.checkResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: aliasPostDetail,
	})
	.get("/check", ({ query }) => check(query.email), {
		query: ToolsModel.checkQuery,
		response: {
			200: ToolsModel.checkResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: aliasGetDetail,
	});
