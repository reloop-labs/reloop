import "dotenv/config";
import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { campaignRoutes } from "@be/campaigns/routes/campaign/campaign.routes";
import { agentCardRoute } from "@be/campaigns/routes/landing/agent-card.route";
import { healthRoute } from "@be/campaigns/routes/landing/health.route";
import { landingRoute } from "@be/campaigns/routes/landing/landing.route";
import { loader } from "@be/campaigns/utils/loader";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import {
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { createOTLPDrain } from "evlog/otlp";

const parseOtlpHeaders = (
	headersStr?: string,
): Record<string, string> | undefined => {
	if (!headersStr) return undefined;
	const headers: Record<string, string> = {};
	const decoded = decodeURIComponent(headersStr);
	for (const pair of decoded.split(",")) {
		const eqIndex = pair.indexOf("=");
		if (eqIndex > 0) {
			const key = pair.slice(0, eqIndex).trim();
			const value = pair.slice(eqIndex + 1).trim();
			if (key && value) headers[key] = value;
		}
	}
	return Object.keys(headers).length > 0 ? headers : undefined;
};

initLogger({
	env: { service: "campaigns" },
	drain: campaignsConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: campaignsConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(campaignsConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = campaignsConfig.port;
const campaignsService = new Elysia({
	prefix: "/api/campaigns",
	name: "Campaigns Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(requireUserAgentPlugin())
	.use(evlog({ exclude: ["/", "/api/*", "/api/*/", "**/health"] }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Campaigns Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-api-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(serverTiming())
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.use(campaignRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Campaigns Service",
			`Running on:\n  - Local: http://localhost:${port}/api/campaigns\n  - Base:  ${campaignsConfig.BASE_URL}/api/campaigns`,
		);
	});

export type CampaignsService = typeof campaignsService;
