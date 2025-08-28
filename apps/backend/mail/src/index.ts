import { bearer } from "@elysiajs/bearer";
import { cron } from "@elysiajs/cron";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { createInsertSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";
import { table } from "./db/schema";
import { auth } from "./plugins/auth";
import {
	sendMail,
	addDomain,
	removeDomain,
	addUser,
	removeUser,
	getMailsFromMaildir,
	getMailsViaIMAP,
} from "./services/mail";

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
	.use(swagger())
	.mount(auth.handler)
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
	// Mail endpoints
	.post(
		"/send",
		async ({ body }) => {
			try {
				return await sendMail(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				user: t.String(),
				passwd: t.String(),
				from: t.String(),
				to: t.String(),
				subject: t.String(),
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
			}),
		},
	)
	.post(
		"/add-domain",
		async ({ body }) => {
			try {
				return await addDomain(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				domain: t.String(),
				mail: t.String(),
				password: t.String(),
			}),
		},
	)
	.post(
		"/remove-domain",
		async ({ body }) => {
			try {
				return await removeDomain(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				domain: t.String(),
			}),
		},
	)
	.post(
		"/add-user",
		async ({ body }) => {
			try {
				return await addUser(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				domain: t.String(),
				username: t.String(),
				password: t.String(),
				aliases: t.Optional(t.Array(t.String())),
			}),
		},
	)
	.post(
		"/remove-user",
		async ({ body }) => {
			try {
				return await removeUser(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				domain: t.String(),
				username: t.String(),
			}),
		},
	)
	.post(
		"/mails",
		async ({ body }) => {
			try {
				return await getMailsFromMaildir(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				email: t.String(),
			}),
		},
	)
	.post(
		"/get-mails",
		async ({ body }) => {
			try {
				return await getMailsViaIMAP(body);
			} catch (error) {
				return { success: false, error: (error as Error).message };
			}
		},
		{
			body: t.Object({
				user: t.String(),
				password: t.String(),
				count: t.Optional(t.Number()),
				mailbox: t.Optional(t.String()),
			}),
		},
	)
	.get("/", () => "Hello, Elysia Mail API with Bearer Auth and Cron!")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
