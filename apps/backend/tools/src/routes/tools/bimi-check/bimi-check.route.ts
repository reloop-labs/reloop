import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkBimiController } from "./bimi-check.controllers";

async function runCheck(domain: string) {
	const result = await checkBimiController(domain);
	useLogger().set({
		domain: result.domain,
		verdict: result.verdict,
		dmarcEnforced: result.dmarcEnforced,
	});
	log.info("bimi-check", "Looked up BIMI and DMARC");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Check a domain's BIMI record",
	description:
		"Looks up default._bimi.{domain} TXT, validates v=BIMI1 / l= / a=, and checks that DMARC is at enforcement (p=quarantine or p=reject, pct=100). Optionally fetches the logo over HTTPS and applies SVG Tiny PS heuristics. Public and rate limited per IP.",
};

export const bimiCheckRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/bimi-check", async ({ body }) => runCheck(body.domain), {
		body: ToolsModel.bimiCheckBody,
		response: {
			200: ToolsModel.bimiCheckResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail,
	})
	.get("/bimi-check", async ({ query }) => runCheck(query.domain), {
		query: ToolsModel.bimiCheckQuery,
		response: {
			200: ToolsModel.bimiCheckResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail,
	});
