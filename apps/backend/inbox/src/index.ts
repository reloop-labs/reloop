import "dotenv/config";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { createOTLPDrain } from "evlog/otlp";
import { inboxConfig } from "./inbox.config";
import { healthRoute } from "./routes/landing/health.route";
import { landingRoute } from "./routes/landing/landing.route";
import { mailboxRoutes } from "./routes/mailbox/mailbox.routes";
import { messagesRoutes } from "./routes/messages/messages.routes";
import { threadsRoutes } from "./routes/threads/threads.routes";
import { loader } from "./utils/loader";

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
	env: { service: "inbox" },
	drain: inboxConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: inboxConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(inboxConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

// Initialize connections (Redis, Postgres, NATS)
await loader();

const port = inboxConfig.port;
const inboxService = new Elysia({
	prefix: "/api/inbox",
	name: "Inbox Service",
})
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Inbox Service",
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
	.use(evlog())
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
	.use(mailboxRoutes)
	.use(messagesRoutes)
	.use(threadsRoutes)
	.listen(port, () => {
		log.info(
			"Inbox Service",
			`Running on:\n  - Local: http://localhost:${port}/api/inbox\n  - Base:  ${inboxConfig.BASE_URL}/api/inbox`,
		);
	});

export type InboxService = typeof inboxService;
