import "dotenv/config";
import { agentConfig } from "@be/agent/agent.config";
import { findRouteSchema } from "@be/agent/lib/schema-registry";
import { authRoutes } from "@be/agent/routes/auth/auth.routes";
import { automationRoutes } from "@be/agent/routes/automation/automation.routes";
import { contactRoutes } from "@be/agent/routes/contact/contact.routes";
import { domainRoutes } from "@be/agent/routes/domain/domain.routes";
import { emailRoutes } from "@be/agent/routes/email/email.routes";
import { inboxRoutes } from "@be/agent/routes/inbox/inbox.routes";
import { intelligenceRoutes } from "@be/agent/routes/intelligence/intelligence.routes";
import { templateRoutes } from "@be/agent/routes/template/template.routes";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import {
	apiErrorsPlugin,
	createAuthPlugin,
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { initLogger, log } from "evlog";

initLogger({
	env: { service: "agent" },
});

const port = agentConfig.port;

const authPlugin = createAuthPlugin({
	baseUrl: agentConfig.BASE_URL,
	redisUrl: agentConfig.REDIS_URL,
	internalSecret: agentConfig.RELOOP_INTERNAL_SECRET,
});

export const agentApp = new Elysia({
	prefix: "/api/agents",
	name: "Agent Gateway Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(requireUserAgentPlugin())
	.use(cors())
	.use(serverTiming())
	.use(apiErrorsPlugin())
	.use(authPlugin)
	.use(
		openapi({
			path: "/openapi",
			documentation: {
				info: {
					title: "Reloop Agent API Gateway",
					version: "1.0.0",
					description:
						"Dedicated REST API gateway for autonomous AI agents authenticated via AgentOnboard. Supports progressive disclosure and dual-contract errors.",
				},
				tags: [
					{ name: "Auth", description: "Autonomous onboarding & identity" },
					{
						name: "Email",
						description: "Transactional email sending & analytics",
					},
					{
						name: "Inbox",
						description: "Incoming mailboxes, threads & messages",
					},
					{ name: "Domain", description: "Sending domain DNS & verification" },
					{
						name: "Intelligence",
						description: "Email & domain deliverability checks",
					},
					{ name: "Contact", description: "Audience contacts & segments" },
					{
						name: "Template",
						description: "Email template rendering & testing",
					},
					{
						name: "Automation",
						description: "Automated workflows & sequence enrollments",
					},
				],
			},
		}),
	)
	.onError(({ code, error, set }) => {
		if (code === "VALIDATION") {
			set.status = 422;
			const errObj = error as unknown as Record<string, unknown>;
			const validatorObj = errObj.validator as { schema?: unknown } | undefined;
			return {
				code: "VALIDATION_ERROR",
				message: "Invalid request payload",
				why: error.message,
				fix: "Verify your request parameters against the schema for this endpoint (request schema via OPTIONS).",
				expectedSchema: errObj.all || validatorObj?.schema,
				link: "https://reloop.sh/docs/errors",
			};
		}
	})
	// Health routes
	.get("/health", () => ({ status: "ok", service: "agent" }))
	.get("/v1/health", () => ({
		status: "ok",
		service: "agent",
		version: "1.0.0",
	}))
	// Progressive disclosure: OPTIONS handler for single-endpoint schema inspection
	.options("/v1/*", ({ request }) => {
		const url = new URL(request.url);
		const targetMethod =
			request.headers.get("access-control-request-method") || "POST";
		const schema = findRouteSchema(url.pathname, targetMethod);
		if (schema) {
			return Response.json(schema, {
				headers: {
					"content-type": "application/json",
					"access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
					"access-control-allow-headers": "*",
				},
			});
		}
		return new Response(null, {
			headers: {
				"access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
				"access-control-allow-headers": "*",
			},
		});
	})
	// Domain-prefixed subrouters under /v1
	.group("/v1", (app) =>
		app
			.use(authRoutes)
			.use(emailRoutes)
			.use(inboxRoutes)
			.use(domainRoutes)
			.use(intelligenceRoutes)
			.use(contactRoutes)
			.use(templateRoutes)
			.use(automationRoutes),
	)
	.listen(port, () => {
		log.info(
			"Agent Gateway Service",
			`Running on:\n  - Local: http://localhost:${port}/api/agents\n  - Base:  ${agentConfig.BASE_URL}/api/agents`,
		);
	});

export type AgentApp = typeof agentApp;
