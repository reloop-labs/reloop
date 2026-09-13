import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkDomainReputationController } from "./domain-reputation.controllers";

async function runCheck(domain?: string) {
	const result = await checkDomainReputationController(domain);
	useLogger().set({
		domain: result.domain,
		score: result.score,
		grade: result.grade,
		verdict: result.verdict,
	});
	log.info("domain-reputation", "Audited domain reputation");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Domain reputation check",
	description:
		"Evaluates sender domain reputation across email authentication (SPF, DKIM, DMARC), real-time DNS blocklists (Spamhaus, URIBL, SURBL), domain age, and DNS health.",
};

export const domainReputationRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/domain-reputation", async ({ body }) => runCheck(body.domain), {
		body: ToolsModel.domainReputationBody,
		response: {
			200: ToolsModel.domainReputationResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail,
	})
	.get("/domain-reputation", async ({ query }) => runCheck(query.domain), {
		query: ToolsModel.domainReputationQuery,
		response: {
			200: ToolsModel.domainReputationResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
			500: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: { ...detail, hide: true },
	});
