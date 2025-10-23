import { Elysia } from "elysia";

export const landing = new Elysia({ prefix: "/" }).get(
    "/",
    () => ({
        message: "Webhook Service is running",
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    }),
    {
        detail: {
            tags: ["Health"],
            summary: "Health check",
            description: "Returns the health status of the webhook service",
        },
    },
);
