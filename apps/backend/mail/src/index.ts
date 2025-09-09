import { table } from "@db/schema";
import { bearer } from "@elysiajs/bearer";
import { cron } from "@elysiajs/cron";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { createInsertSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";
import { auth } from "./plugins/auth";
import { domainRouter } from "./routers/domain";
import { mailRouter } from "./routers/mail";

const _createUser = createInsertSchema(table.user, {
	// Replace email with Elysia's email type
	email: t.String({ format: "email" }),
});

const app = new Elysia()
	.use(serverTiming())
	.use(bearer())
	.use(
		cron({
			name: "heartbeat",
			pattern: "*/10 * * * * *",
			run() {
				console.log("Heartbeat");
			},
		}),
	)
	.use(
		opentelemetry({
			spanProcessors: [
				new BatchSpanProcessor(
					new OTLPTraceExporter({
						url:
							process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
							"http://localhost:4318/v1/traces",
					}),
				),
			],
		}),
	)
	.mount("/api/domain", domainRouter)
	.mount("/api/mail", mailRouter)
	.mount("/api/auth", auth.handler)
	.use(
		swagger({
			documentation: {
				info: {
					title: "Reloop Mail Server API",
					version: "1.0.0",
					description:
						"API for managing mail server domains, DKIM keys, and DNS records",
				},
				servers: [
					{
						url: "http://localhost:3000",
						description: "Development server",
					},
				],
				tags: [
					{
						name: "Domain Management",
						description: "Operations for managing mail domains",
					},
					{
						name: "Mail Service",
						description:
							"Operations for sending emails and managing mail functionality",
					},
				],
			},
		}),
	)
	.get("/auth", ({ bearer }) => bearer, {
		beforeHandle({ bearer, set, status }) {
			if (!bearer) {
				set.headers["WWW-Authenticate"] =
					`Bearer realm='sign', error="invalid_request"`;

				return status(400, "Unauthorized");
			}
		},
	})
	.post(
		"/sign-up",
		({ body }) => {
			// Create a new user
		},
		{
			body: t.Omit(_createUser, ["id", "salt", "createdAt"]),
		},
	)
	.get("/", () => "Hello, Elysia with Bearer Auth and Cron!")
	.get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
	.get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(
	`📧 Mail API available at ${app.server?.hostname}:${app.server?.port}/api`,
);
console.log(
	`📚 Swagger docs available at ${app.server?.hostname}:${app.server?.port}/swagger`,
);
console.log(
	`🔗 Domain API endpoint: ${app.server?.hostname}:${app.server?.port}/api/domain/add`,
);
console.log("📮 Mail API endpoint:");
console.log(
	`   - Send email: ${app.server?.hostname}:${app.server?.port}/api/mail/send`,
);
