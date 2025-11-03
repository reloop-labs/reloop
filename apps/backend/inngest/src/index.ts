import "dotenv/config";
import { cors } from "@elysiajs/cors";
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

// Create serve handler for Inngest
import { serve } from "inngest/bun";

const handler = serve({
    client: inngest,
    functions,
});

const inngestService = new Elysia({
    prefix: "/api/inngest",
    name: "Inngest Service",
})
    .use(cors())
    .use(landing)
    .all("*", ({ request }) => handler(request))
    .listen(port, () => {
        logger.info(
            `Inngest Service is running on http://localhost:${port}/api/inngest`,
        );
    });

export type InngestService = typeof inngestService;
