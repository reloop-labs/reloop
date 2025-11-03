import "dotenv/config";
import { inngest } from "@reloop/inngest/client";
import {
    cronActiveDomainMonitoring,
    cronDNSVerification,
    cronDomainVerification,
    cronHealthChecks,
    cronWebhookCleanup,
    logEvent,
    verifyDNSRecord,
    verifyDomain,
    webhookDeliver,
} from "@reloop/inngest/functions";
import { landing } from "@reloop/inngest/routes/landing/landing.index";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { serve } from "inngest/bun";

const port = 8017;

const functions = [
    webhookDeliver,
    cronDomainVerification,
    cronDNSVerification,
    cronActiveDomainMonitoring,
    cronWebhookCleanup,
    cronHealthChecks,
    verifyDomain,
    verifyDNSRecord,
    logEvent,
];


const handler = serve({
    client: inngest,
    functions,
});

const inngestHandler = new Elysia().all("/v1", ({ request }) =>
    handler(request)
);


const inngestService = new Elysia({
    prefix: "/api/inngest",
    name: "Inngest Service",
})
    //.use(cors())
    .use(landing)
    .use(inngestHandler)
    .listen(port, () => {
        logger.info(
            `Inngest Service is running on http://localhost:${port}/api/inngest`,
        );
    });

export type InngestService = typeof inngestService;
