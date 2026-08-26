import { rateLimitPlugin } from "@be/tools/middleware/rate-limit";
import { ToolsModel } from "@be/tools/model/tools.model";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import { evlog, useLogger } from "evlog/elysia";
import {
	createBatchHealthCheckController,
	pollBatchHealthCheckController,
	singleEmailHealthCheckController,
} from "./email-health-check.controllers";

function extractClientIp(
	headers: Record<string, string | undefined>,
	server?: { requestIP?: (req: Request) => { address: string } | null },
	request?: Request,
): string {
	const forwardedFor = headers["x-forwarded-for"];
	const realIp = headers["x-real-ip"];
	if (typeof forwardedFor === "string") {
		const parts = forwardedFor.split(",");
		if (parts[0]) return parts[0].trim();
	}
	if (typeof realIp === "string") {
		return realIp.trim();
	}
	if (server && request) {
		const ip = server.requestIP?.(request)?.address;
		if (ip) return ip;
	}
	return "127.0.0.1";
}

const singleDetail = {
	tags: ["Tools"],
	summary: "Evaluate single email health & deliverability",
	description:
		"Evaluates syntax, disposable provider presence, role mailbox status, free provider classification, and active DNS MX records. Public and unauthenticated. Nothing is stored.",
};

const batchDetail = {
	tags: ["Tools"],
	summary: "Submit batch email health check job (up to 1,000 addresses)",
	description:
		"Accepts an array of email strings or a multipart CSV file (max 1,000 unique addresses). Returns an async job token to poll.",
};

const pollDetail = {
	tags: ["Tools"],
	summary: "Poll batch email health check job results",
	description:
		"Returns job status (queued, running, done, failed) and complete per-address evaluation results with list health summary once completed.",
};

export const emailHealthCheckRoute = new Elysia()
	.use(evlog())
	.use(rateLimitPlugin)
	.post(
		"/email-health-check",
		async ({ body }) => {
			const result = await singleEmailHealthCheckController(body.email);
			useLogger().set({
				domain: result.domain,
				verdict: result.verdict,
				healthStatus: result.health.status,
			});
			log.info("email-health-check", "Evaluated single address");
			return result;
		},
		{
			body: ToolsModel.emailHealthCheckBody,
			response: {
				200: ToolsModel.emailHealthCheckResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail: singleDetail,
		},
	)
	.get(
		"/email-health-check",
		async ({ query }) => {
			const result = await singleEmailHealthCheckController(query.email);
			useLogger().set({
				domain: result.domain,
				verdict: result.verdict,
				healthStatus: result.health.status,
			});
			log.info("email-health-check", "Evaluated single address");
			return result;
		},
		{
			query: ToolsModel.emailHealthCheckQuery,
			response: {
				200: ToolsModel.emailHealthCheckResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			rateLimit: true,
			detail: singleDetail,
		},
	)
	.post(
		"/email-health-check/batch",
		async ({ body, headers, server, request }) => {
			const clientIp = extractClientIp(
				headers as Record<string, string | undefined>,
				server as unknown as {
					requestIP?: (req: Request) => { address: string } | null;
				},
				request,
			);
			return await createBatchHealthCheckController({
				body: body as { emails?: string[]; file?: unknown },
				clientIp,
			});
		},
		{
			body: ToolsModel.batchCreateBody,
			response: {
				200: ToolsModel.batchCreateResponse,
				400: ToolsModel.errorResponse,
				429: ToolsModel.errorResponse,
			},
			detail: batchDetail,
		},
	)
	.get(
		"/email-health-check/batch/:token",
		async ({ params: { token } }) => {
			return await pollBatchHealthCheckController(token);
		},
		{
			params: t.Object({
				token: t.String({
					description: "The unique batch job token returned from /batch.",
				}),
			}),
			response: {
				200: ToolsModel.batchPollResponse,
				400: ToolsModel.errorResponse,
				404: ToolsModel.errorResponse,
			},
			detail: pollDetail,
		},
	);
