import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { checkBlocklistController } from "./blocklist-check.controllers";
import {
	DNSBL_COUNT,
	DOMAIN_DNSBL_COUNT,
	IP_DNSBL_COUNT,
} from "./dnsbl-providers";

async function runCheck(target: string) {
	const result = await checkBlocklistController(target);
	useLogger().set({
		target: result.target,
		ip: result.resolvedIp,
		listedCount: result.listedCount,
		isClean: result.isClean,
	});
	log.info("blocklist-check", "Queried public DNSBL zones");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Check an IP or domain name against public DNSBLs",
	description: `Queries ${IP_DNSBL_COUNT} IP DNSBLs and ${DOMAIN_DNSBL_COUNT} domain URI lists (${DNSBL_COUNT} public DNS zones). These are DNS blocklists, not websites. Failed or refused queries are errors, not clean. Public and rate limited per IP. The target is logged; results are not stored.`,
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
