import { Elysia,t } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { cron } from '@elysiajs/cron'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { serverTiming } from '@elysiajs/server-timing'
import { swagger } from '@elysiajs/swagger'
import { auth } from "./plugins/auth";
import { createInsertSchema } from 'drizzle-typebox'
import { table } from './db/schema'

const _createUser = createInsertSchema(table.user, {
    // Replace email with Elysia's email type
    email: t.String({ format: 'email' })
})

const app = new Elysia()
    .use(serverTiming())
    .use(bearer())
    .use(
        cron({
            name: 'heartbeat',
            pattern: '*/10 * * * * *',
            run() {
                console.log('Heartbeat')
            }
        })
    )
    .use(
        opentelemetry({
            spanProcessors: [
                new BatchSpanProcessor(
                    new OTLPTraceExporter({
                        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
                    })
                )
            ]
        })
    )
    .use(swagger())
    .mount(auth.handler)
    .get("/auth", ({ bearer }) => bearer, {
        beforeHandle({ bearer, set, status }) {
            if (!bearer) {
                set.headers[
                    'WWW-Authenticate'
                ] = `Bearer realm='sign', error="invalid_request"`

                return status(400, 'Unauthorized')
            }
        }
    })
    .post('/sign-up', ({ body }) => {
        // Create a new user
    }, {
        body: t.Omit(
            _createUser,
            ['id', 'salt', 'createdAt']
        )
    })
    .get("/", () => "Hello, Elysia with Bearer Auth and Cron!")
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);