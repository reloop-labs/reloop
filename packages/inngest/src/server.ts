import { serve as serveBun } from "inngest/bun";
import { serve as serveElysia } from "inngest/elysia";
import { inngest } from "./client";

/**
 * Create an Inngest serve handler for Bun
 * @param functions - Array of Inngest functions to serve
 * @returns Bun-compatible request handler
 */
export function createBunHandler(functions: Parameters<typeof serveBun>[0]["functions"]) {
    return serveBun({
        client: inngest,
        functions,
    });
}

/**
 * Create an Inngest serve handler for Elysia
 * @param functions - Array of Inngest functions to serve
 * @returns Elysia plugin handler
 */
export function createElysiaHandler(functions: Parameters<typeof serveElysia>[0]["functions"]) {
    return serveElysia({
        client: inngest,
        functions,
    });
}

/**
 * Re-export serve functions for direct use if needed
 */
export { serveBun, serveElysia };
