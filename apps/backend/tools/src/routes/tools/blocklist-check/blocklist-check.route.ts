import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkBlocklistController } from "./blocklist-check.controllers";

async function runCheck(target: string) {
	const result = await checkBlocklistController(target);
	useLogger().set({
		target: result.target,
		ip: result.resolvedIp,
		listedCount: result.listedCount,
		isClean: result.isClean,
	});
	log.info("blocklist-check", "Scanned domain/IP against DNSBL blocklists");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Check domain or IP against global blocklists",
	description:
		"Performs real-time concurrent DNS lookups across 20+ major anti-spam and malware DNSBL databases (Spamhaus, Barracuda, SpamCop, SORBS, etc.). Public and rate limited per IP.",
};

export const blocklistCheckRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/blocklist-check", async ({ body }) => runCheck(body.target), {
		body: ToolsModel.blocklistCheckBody,
		response: {
			200: ToolsModel.blocklistCheckResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail,
	})
	.get("/blocklist-check", async ({ query }) => runCheck(query.target), {
		query: ToolsModel.blocklistCheckQuery,
		response: {
			200: ToolsModel.blocklistCheckResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail,
	});
