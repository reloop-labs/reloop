import { Elysia } from "elysia";

export const landing = new Elysia({ name: "Landing" }).get(
    "/",
    () => {
        return {
            status: "ok",
            service: "Template Service",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
        };
    },
    {
        detail: {
            tags: ["Health"],
            summary: "Health check",
            description: "Returns the health status of the Template Service",
        },
    },
);
