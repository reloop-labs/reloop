import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { dnsLookupController } from "./dns-lookup.controllers";
import type { DnsRecordType } from "./dns-lookup.service";

async function runLookup(domain: string, recordType?: DnsRecordType) {
	const result = await dnsLookupController(domain, recordType);
	useLogger().set({
		query: result.query,
		domain: result.domain,
		recordType: result.recordType,
		recordsFound: result.records.length,
		provider: result.provider?.name || "unknown",
		responseTimeMs: result.responseTimeMs,
	});
	log.info("dns-lookup", "Resolved DNS records");
	return result;
}

const detail = {
	tags: ["Tools"],
	summary: "Look up DNS records & check email deliverability diagnostics",
	description:
		"Performs comprehensive DNS queries (A, AAAA, MX, TXT, CNAME, NS, SOA, CAA, PTR, SRV), detects authoritative nameserver hosting providers (e.g. Cloudflare, AWS Route 53), and runs automated SPF/DMARC email health checks. Public and rate-limited per IP. Nothing is stored.",
};

export const dnsLookupRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post(
		"/dns-lookup",
		async ({ body }) => runLookup(body.domain, body.recordType as DnsRecordType | undefined),
		{
			body: ToolsModel.dnsLookupBody,
			response: {
				200: ToolsModel.dnsLookupResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail,
		},
	)
	.get(
		"/dns-lookup",
		async ({ query }) => runLookup(query.domain, query.recordType as DnsRecordType | undefined),
		{
			query: ToolsModel.dnsLookupQuery,
			response: {
				200: ToolsModel.dnsLookupResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail,
		},
	);
