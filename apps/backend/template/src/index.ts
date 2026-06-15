import "dotenv/config";
import { agentCardRoute } from "@be/template/routes/landing/agent-card.route";
import { healthRoute } from "@be/template/routes/landing/health.route";
import { landingRoute } from "@be/template/routes/landing/landing.route";
import { roomRoutes } from "@be/template/routes/room/room.routes";
import { collaborationRoute } from "@be/template/routes/template/collaboration/collaboration.route";
import { templateRoutes } from "@be/template/routes/template/template.routes";
import { templateConfig } from "@be/template/template.config";
import { loader } from "@be/template/utils/loader";
import { persistencePlugin } from "@be/template/utils/persistence";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";

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
	env: { service: "template" },
	drain: templateConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: templateConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(templateConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = templateConfig.port;
const templateService = new Elysia({
	prefix: "/api/template",
	name: "Template Service",
})
	.use(evlog({ exclude: ["**/health"] }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Template Service",
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
	.use(templateRoutes)
	.use(roomRoutes)
	.use(persistencePlugin)
	.use(collaborationRoute)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Template Service",
			`Running on:\n  - Local: http://localhost:${port}/api/template\n  - Base:  ${templateConfig.BASE_URL}/api/template`,
		);
	});

export type TemplateService = typeof templateService;
