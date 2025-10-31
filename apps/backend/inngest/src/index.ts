import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import {
    cronDNSVerification,
    cronDomainVerification,
    cronHealthChecks,
    cronWebhookCleanup,
    logEvent,
    verifyDNSRecord,
    verifyDomain,
    webhookDeliver,
} from "./functions";
import { inngest } from "./lib/inngest-client";

const port = 8014;

const functions = [
    webhookDeliver,
    cronDomainVerification,
    cronDNSVerification,
    cronWebhookCleanup,
    cronHealthChecks,
    verifyDomain,
    verifyDNSRecord,
    logEvent,
];

// Create serve handler for Inngest
let serveHandler: any;
try {
    const { serve } = await import("inngest");
    serveHandler = serve({
        client: inngest,
        functions,
    });
} catch (error) {
    logger.warn("Inngest serve not available, using fallback");
}

const inngestService = new Elysia({
    prefix: "/api/inngest",
    name: "Inngest Service",
})
    .use(cors())
    .all("/*", async (request) => {
        if (serveHandler) {
            return serveHandler(request);
        }
        // Fallback for development - return function list
        return {
            name: "reloop",
            functions: functions.map((fn) => ({
                id: fn.id,
                name: fn.name,
            })),
        };
    })
    .listen(port, () => {
        logger.info(
            `Inngest Service is running on http://localhost:${port}/api/inngest`,
        );
    });

export type InngestService = typeof inngestService;
