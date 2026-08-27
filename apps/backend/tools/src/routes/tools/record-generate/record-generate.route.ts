import { lookupTxt } from "@be/tools/lib/dns-txt";
import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import { generateDkimRecord } from "./dkim-generate";
import { generateDmarcRecord } from "./dmarc-generate";
import { attachExistingSpf, generateSpfRecord } from "./spf-generate";

async function runSpf(body: ToolsModel.SpfGenerateBody) {
	const generated = generateSpfRecord(body);
	const result = await attachExistingSpf(generated, lookupTxt);
	useLogger().set({
		domain: result.domain,
		lookupCount: result.lookupCount,
		warningCount: result.warnings.length,
	});
	log.info("spf-generate", "Built SPF record");
	return result;
}

async function runDkim(body: ToolsModel.DkimGenerateBody) {
	const result = await generateDkimRecord(body);
	useLogger().set({
		domain: result.domain,
		selector: result.selector,
	});
	log.info("dkim-generate", "Generated DKIM key pair");
	return result;
}

function runDmarc(body: ToolsModel.DmarcGenerateBody) {
	const result = generateDmarcRecord(body);
	useLogger().set({
		domain: result.domain,
		policy: result.policy,
		warningCount: result.warnings.length,
	});
	log.info("dmarc-generate", "Built DMARC record");
	return result;
}

export const recordGenerateRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post("/spf-generate", async ({ body }) => runSpf(body), {
		body: ToolsModel.spfGenerateBody,
		response: {
			200: ToolsModel.spfGenerateResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: {
			tags: ["Tools"],
			summary: "Generate an SPF TXT record",
			description:
				"Builds a copy-pasteable v=spf1 record from IPs, includes, a/mx, and a terminal policy. Warns about the 10-lookup limit and an existing SPF record. Public and rate limited per IP.",
		},
	})
	.post("/dkim-generate", async ({ body }) => runDkim(body), {
		body: ToolsModel.dkimGenerateBody,
		response: {
			200: ToolsModel.dkimGenerateResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: {
			tags: ["Tools"],
			summary: "Generate a DKIM key pair and TXT record",
			description:
				"Creates a 2048-bit RSA DKIM key pair. Returns {selector}._domainkey.{domain} and the public TXT value. The private key is returned once and is not stored or logged.",
		},
	})
	.post("/dmarc-generate", ({ body }) => runDmarc(body), {
		body: ToolsModel.dmarcGenerateBody,
		response: {
			200: ToolsModel.dmarcGenerateResponse,
			400: ToolsModel.errorResponse,
			429: ToolsModel.errorResponse,
		},
		rateLimit: true,
		detail: {
			tags: ["Tools"],
			summary: "Generate a DMARC TXT record",
			description:
				"Builds a _dmarc.{domain} TXT record from policy, rua/ruf, alignment, pct, and subdomain policy.",
		},
	});
